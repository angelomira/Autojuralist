import shell from 'shelljs';

/**
 * Clones a Git repository into the specified directory.
 * @param {string} exec_path - The path to execute the Git clone command.
 * @param {string} repo_link - The URL of the Git repository to clone.
 * @param {string} [clone_path='.'] - The path to clone the repository into.
 */
function gitClone(exec_path, repo_link, clone_path = '.') {
    shell.cd(exec_path);
    shell.exec(`git clone ${repo_link} ${clone_path}`);
}

/**
 * Pushes changes from the local repository to the remote repository.
 * @param {string} exec_path - The path to execute the Git push command.
 */
function gitPush(exec_path) {
    shell.cd(exec_path);
    shell.exec('git push');
}

/**
 * Pulls changes from the remote repository to the local repository.
 * @param {string} exec_path - The path to execute the Git pull command.
 */
function gitPull(exec_path) {
    shell.cd(exec_path);
    shell.exec('git pull');
}
