/* Thanks @Albee for the codebase.
*/

const mergeFiles = require('merge-files');
import * as fs from 'fs-extra';
import request from 'request';
import logger from 'electron-log';
const log = logger.create('downloader');
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
                            //@ts-expect-error
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
        
                req.on('
