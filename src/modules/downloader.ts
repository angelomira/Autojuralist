/* Thanks @Albee for the codebase.
*/

const mergeFiles = require('merge-files');
import * as fs from 'fs-extra';
import request from 'request';
import logger from 'electron-log';
const log = logger.create({logId: 'downloader'});
log.variables.label = 'downloader';
log.transports.console.format = '{h}:{i}:{s} > [{label}] {text}';
log.transports.file.format = '{h}:{i}:{s} > [{label}] {text}';

export interface progress {
    percent: number,
    total_size: number,
    received_size: number,
    status: string,
}

/**
 * Downloader class for handling file downloads with progress tracking.
 * @class Downloader
 */
export class Downloader {
  // Define properties
  downloading = false;
  path = '';
  threads = -1;
  paused = false;
  progress: progress = {
      percent: -1,
      total_size: -1,
      received_size: -1,
      status: 'idle',
  }
  requests: any[] = [];
  progress_interval: NodeJS.Timeout | undefined = undefined;

  /**
   * Clears the temporary files created for download threads.
   * @param {string} path - The path where the temporary files are located.
   * @param {number} threads - The number of threads used for downloading.
   */
  public clearThreadFiles(path: string, threads: number) {
      // Loop through threads and delete corresponding files
      for (let i = 0; i < threads; i++) {
          if (fs.pathExistsSync(path + `\\downloadingthread${i}.thread`)) fs.unlinkSync(path + `\\downloadingthread${i}.thread`);
      }
  }

  /**
   * Cancels the ongoing download process.
   * @returns {Promise<boolean>} A promise that resolves when cancellation is complete.
   */
  public cancel() {
      // Stop downloading and clean up resources
      this.downloading = false;
      this.paused = false;
      return new Promise((resolve, reject) => {
          // Clear progress interval if exists
          if (this.progress_interval != undefined) {
              clearInterval(this.progress_interval);
              this.progress_interval = undefined;
          }

          // Abort ongoing requests
          for (let req of this.requests) {
              req.abort();
          }

          // Clear thread files if multiple threads were used
          if (this.requests.length > 1) {
              this.clearThreadFiles(this.path, this.threads);
          }

          // Delete the main downloaded file if exists
          if (fs.pathExistsSync(`${this.path}\\modpack.zip`)) fs.unlinkSync(`${this.path}\\modpack.zip`);

          // Reset properties
          this.downloading = false;
          this.path = '';
          this.threads = -1;
          this.progress = {
              percent: -1,
              total_size: -1,
              received_size: -1,
              status: 'idle',
          }
          this.requests = [];
          resolve(true);
      }).catch(err => {
          log.error(err)
      });
  }

  /**
   * Pauses the ongoing download process.
   */
  public pause() {
      // Pause ongoing requests
      this.paused = true;
      log.info('download paused')
      for (let req of this.requests) {
          req.pause();
      }
  }

  /**
   * Resumes the paused download process.
   */
  public resume() {
      // Resume paused requests
      this.paused = false;
      log.info('download resumed')
      for (let req of this.requests) {
          req.resume();
      }
  }

  /**
   * Retrieves the size of the file to be downloaded.
   * @param {string} url - The URL of the file to get size from.
   * @returns {Promise<{total_bytes: number} | null>} A promise resolving to the total size of the file, or null if unsuccessful.
   */
  //@ts-expect-error
  public async getInfo(url: string): {total_bytes: number} {
      // Attempt to retrieve file size
      let actual_attempts = 0;
      while (actual_attempts < 20) {
          actual_attempts++;
          let attempts = 0;
          while (attempts <= 5) {
              attempts++;
              let res: {total_bytes: number} = await new Promise((resolve, reject) => {
                  // Send request to get file size
                  log.info(`attempting to get file size. [${attempts}]`);

                  let req = request({
                      method: "GET",
                      url: url,
                  })

                  req.on('response', (data) => {
                      req.abort();
                      if (data.headers['content-length']) {
                          let total_bytes = data.headers['content-length'];
                          resolve({total_bytes});
                      }
                      //@ts-expect-error
                      resolve(null);
                  })
              })
              if (res != null) {
                  log.info(`file size: ${res.total_bytes}`);
                  return res;
              } else {
                  continue;
              }
          }

          // If unsuccessful, try fooling GitHub into thinking it's a good person
          await this.foolGithubIntoThinkingIAmAGoodPerson(url);
      }

      //@ts-expect-error
      return null;
  }

  /**
   * Fools GitHub into thinking it's a good person to bypass restrictions.
   * @param {string} url - The URL to fake download from.
   * @returns {Promise<void>} A promise that resolves when the faking is done.
   */
  private foolGithubIntoThinkingIAmAGoodPerson(url: string) {
      // Fake download request
      return new Promise((resolve, reject) => {
          log.info(`Faking download from: ${url}`);

          let req = request({
              method: "GET",
              uri: url,
          });

          let fooling = setTimeout(() => {
              req.abort();
              resolve('');
          }, 3000);
      });
  }

  /**
   * Creates a download thread for a portion of the file.
   * @param {number} start_bytes - The start position of the portion to download.
   * @param {number} finish_bytes - The end position of the portion to download.
   * @param {string} url - The URL of the file to download.
   * @param {string} path - The path to save the downloaded portion.
   * @param {number} thread_num - The number of the thread.
   * @param {Function} onData - A function to call with the downloaded data.
   * @returns {Promise<string>} A promise that resolves when the thread is successfully created.
   */
  public async createDownloadThread(start_bytes: number, finish_bytes: number, url: string, path: string, thread_num: number, onData: Function) {
      let thread_created_successfully = false;
      let thread_attempts = 0;
      while (!thread_created_successfully) {
          thread_attempts++;
          log.info(`[DOWNLOAD THREAD] <${thread_num}> attempting to create thread from: ${start_bytes} to: ${finish_bytes}. [${thread_attempts}]`);

          if (thread_attempts > 7) {
              thread_attempts = 0;
              await this.foolGithubIntoThinkingIAmAGoodPerson(url);
          }

          let received_bytes = 0;
          let total_bytes = 0;

          await new Promise(async (resolve, reject) => {
              let req = request({
                  headers: {
                      Range: `bytes=${start_bytes}-${finish_bytes}`,
                  },
                  method: "GET",
                  url: url,
              })

              await fs.ensureFile(path + "\\" + `downloadingthread${thread_num}.thread`);
              let out = fs.createWriteStream(path + "\\" + `downloadingthread${thread_num}.thread`);
              req.pipe(out);

              req.on('response', (data) => {
                  total_bytes = parseInt(data.headers["content-length"]);
                  log.info(`[DOWNLOAD THREAD] <${thread_num}> Got response. Size: ${data.headers["content-length"]}`);
                  if (total_bytes != undefined && total_bytes > (finish_bytes - start_bytes) / 2) {
                      this.requests.push(req);
                      thread_created_successfully = true;
                  } else {
                      reject("broken thread");
                      req.abort();
                      out.end();
                  }
              })

              req.on("data", function (chunk) {
                  // Update the received bytes
                  onData(chunk.length);
              });

              req.on("end", function (data) {
                  req.abort();
                  resolve('success');
              });

          }).then((res) => {
              return 'test';
          })
          .catch((err) => {
              log.info(`[DOWNLOAD THREAD] <${thread_num}> broken thread`);
          });
      }
  }

  /**
   * Initiates a multi-threaded download process.
   * @param {string} folder - The destination folder for the downloaded file.
   * @param {string} url - The URL of the file to download.
   * @param {string} file_name - The name of the downloaded file.
   * @param {number} threads - The number of threads to use for downloading (default is 1).
   * @param {(progress: any) => void} onProgress - A callback function to track download progress.
   * @returns {Promise<string>} A promise resolving to the path of the downloaded file.
   */
  public download(folder: string, url: string, file_name: string, threads: number = 1, onProgress: (progress: any) => void): Promise<string> {
      return new Promise(async (resolve, reject) => {
          // Check if download is in progress
          if (this.downloading) {
              log.info(`download in progress.`)
              reject();
          }
          this.downloading = true;
          this.path = folder;
          this.threads = threads;
          log.info(`initiating threaded download with '${threads}' threads from '${url}' to ${folder}`)

          // Get file info (size)
          let file_info = await this.getInfo(url);

          // Handle case when file info is not obtained
          if (file_info == null) {
              log.info(`something went wrong while getting size... aborting download`);
              resolve('');
          }

          let received_bytes = 0;
          let total_bytes = file_info.total_bytes;
          let threads_done = 0;

          // Set up progress tracking interval
          this.progress_interval = setInterval(() => {
              if (this.paused) return;
              this.progress = {
                  percent: received_bytes / total_bytes,
                  received_size: received_bytes,
                  total_size: total_bytes,
                  status: 'downloading',
              }
              onProgress(this.progress);
          }, 1000)

          // Start download threads
          for (let i = 0; i < threads; i++) {
              let chunk_start = Math.floor((total_bytes / threads) * i);
              if (i > 0) chunk_start++;
              let chunk_finish = Math.floor((total_bytes / threads) * (i + 1));

              this.createDownloadThread(chunk_start, chunk_finish, url, folder, i, (chunk_length: any) => {
                  received_bytes += chunk_length;
              }).then(async res => {
                  log.info(`[DOWNLOAD THREAD] <${i}> thread done`);
                  threads_done++;

                  // Check if all threads are finished
                  if (threads_done == threads) {
                      if (this.downloading) {
                          log.info(`merging threads...`);

                          // Clear progress interval
                          if (this.progress_interval != undefined) {
                              clearInterval(this.progress_interval);
                              this.progress_interval = undefined;
                          }

                          // Update progress status
                          this.progress = {
                              percent: 1,
                              received_size: total_bytes,
                              total_size: total_bytes,
                              status: 'merging',
                          }
                          onProgress(this.progress);

                          // Merge downloaded portions
                          const outputPath = folder + `\\${file_name}`;
                          let inputPathList: string[] = [];
                          for (let i = 0; i < threads; i++) {
                              inputPathList.push(folder + `\\downloadingthread${i}.thread`);
                          }
                          const status = await mergeFiles(inputPathList, outputPath);
                          log.info(`files merged: ${status}`);

                          // Update progress status
                          this.progress = {
                              percent: 1,
                              received_size: total_bytes,
                              total_size: total_bytes,
                              status: 'finished',
                          }
                          onProgress(this.progress);

                          // Clean up thread files
                          this.clearThreadFiles(folder, threads);
                          log.info(`completed`);
                          this.downloading = false;
                          resolve(outputPath);
                      } else {
                          log.info(`canceled`);
                          resolve('');
                      }
                  }
              });
          }
      })
  }
}
