import './index.css';
const el = document.getElementById('container');
const el_menu = document.getElementById('container_menu');
const el_record = document.getElementById('container_record');
const el_project = document.getElementById('project');
const el_log = document.getElementById('container_login');
const el_account = document.getElementById('container_account');
const el_projects_list = document.getElementById('container-projects');
const btn = document.getElementById('btn');
const btn_tpPojects = document.getElementById('btn_tpPojects');
const btn_tpAccount = document.getElementById('btn_tpAccount');
const btn_login = document.getElementById('btn_login');
const btn_login_2 = document.getElementById('btn_login_2');
const btn_record = document.getElementById('btn_record');

if (el != null && btn != null && el_log != null && btn_login != null && el_menu != null && el_account != null && el_projects_list != null && btn_login_2 != null && btn_record != null && btn_tpAccount != null && btn_tpPojects != null) {

  btn_tpPojects.addEventListener('click', function(){
    el_menu.style.display = 'none';
    el_projects_list.style.display = 'block';
  });

  btn.addEventListener('click', function() {
    el.style.display = 'none';
    el_log.style.display = 'block';
  });

  btn_tpAccount.addEventListener('click', function() {
    el_menu.style.display = 'none';
    el_account.style.display = 'block';
  });

  btn_record.addEventListener('click', function() {
    el_log.style.display = 'none';
    el_record.style.display = 'block';
  });


  btn_login.addEventListener('click', function() {
    el_log.style.display = 'none';
    el_menu.style.display = 'block';
  });

  btn_login_2.addEventListener('click', function() {
    el_record.style.display = 'none';
    el_menu.style.display = 'block';
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      if (el_menu.style.display === 'block') {
        el_menu.style.display = 'none';
        el_log.style.display = 'block';
      } 
      else if (el_project.style.display === 'block'){
        el_project.style.display = 'none';
        el_projects_list.style.display = 'block';
      }
      else if (el_projects_list.style.display === 'block') {
        el_projects_list.style.display = 'none';
        el_menu.style.display = 'block';
      }
      else if (el_record.style.display === 'block') {
        el_record.style.display = 'none';
        el_log.style.display = 'block';
      }
      else if (el_account.style.display === 'block') {
        el_account.style.display = 'none';
        el_menu.style.display = 'block';
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const originalDiv = document.getElementById("div-project") as HTMLElement;
  const containerProjectsDiv = document.getElementById("container-projects") as HTMLElement;
  const projectDiv = document.getElementById("project") as HTMLElement;
  const plus = originalDiv.querySelector("#plus") as HTMLElement;
  let copyCounter = 0;
  let id_num = 0;

  originalDiv.addEventListener("click", function() {
    if (copyCounter < 5) {
      const divCopy = originalDiv.cloneNode(true) as HTMLElement;
      let newId = `div-copy-${id_num++}`;
      divCopy.id = newId;
      copyCounter++;

      const plus = divCopy.querySelector("#plus") as HTMLElement;
      plus.remove();

      const projectNameElement = document.createElement("h3");
      projectNameElement.innerHTML = `Project_${id_num}`;
      divCopy.appendChild(projectNameElement);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "DEL";
      deleteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        divCopy.remove();
        copyCounter--;
      });
      divCopy.appendChild(deleteButton);

      const openButton = document.createElement("button");
      openButton.textContent = "OPEN";
      openButton.addEventListener("click", function(event) {
        if (containerProjectsDiv instanceof HTMLElement && projectDiv instanceof HTMLElement) {
          containerProjectsDiv.style.display = "none";
          projectDiv.style.display = "block";
        }
      });
      divCopy.appendChild(openButton);

      // Добавляем новый блок слева от оригинального
      if (originalDiv.parentNode) {
        originalDiv.parentNode.insertBefore(divCopy, originalDiv);
      }
    }
  });
});


const name: string = "Admin";
const surname: string = "Admin";
const email: string = "admin@gmail.com";
const phone: string = "8-800-555-35-35";
const github: string = "https://github.com/admin";
const password: string = "*****";

const htmlContentName: string = `<a>${name}</a>`; // так можно будет подтягивать разную информацию из базы данных
const htmlContentSurname: string = `<a>${surname}</a>`;
const htmlContentEmail: string = `<a>${email}</a>`;
const htmlContentPhone: string = `<a>${phone}</a>`;
const htmlContentGitHubLink: string = `<a>${github}</a>`;
const htmlContentPassword: string = `<a>${password}</a>`;

document.getElementById("Name").innerHTML = htmlContentName;
document.getElementById("Surname").innerHTML = htmlContentSurname;
document.getElementById("Email").innerHTML = htmlContentEmail;
document.getElementById("Phone").innerHTML = htmlContentPhone;
document.getElementById("GitHub").innerHTML = htmlContentGitHubLink;
document.getElementById("Password").innerHTML = htmlContentPassword;
