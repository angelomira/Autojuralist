import * as fs from 'fs';
import * as path from 'path';
import * as extract from 'extract-zip'; // You need to install this package via npm or yarn

/**
 * Extracts the given archive from the given path to the given destination.
 * @param archivePath The path to the archive file.
 * @param destinationPath The destination path where the archive will be extracted.
 */
async function extractArchive(archivePath: string, destinationPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        extract(archivePath, { dir: destinationPath })
            .then(() => {
                console.log('Archive extracted successfully!');
                resolve();
            })
            .catch((err) => {
                console.error('Error extracting archive:', err);
                reject(err);
            });
    });
}
