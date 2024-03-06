import shell from 'shelljs';

function gitClone(repo_link: string, exec_path: string, clone_path: string = '.') {
    shell.cd(exec_path);
    shell.exec(`git clone ${repo_link} ${clone_path}`);
}

function gitPush(exec_path) {
    shell.cd(exec_path);
    shell.exec('git push');
}

function gitPull(exec_path) {
    shell.cd(exec_path);
    shell.exec('git pull')
}
