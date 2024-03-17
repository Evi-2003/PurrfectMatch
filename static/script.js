// ---------------NAVIGATIE-----------------
function sidemenu() {
  let menu = document.getElementById("sidemenu");
  menu.classList.toggle("sidemenu");
} 


// ---------------FORMS-----------------
function showpassword(x) {
  x.classList.toggle("fa-regular");
  x.classList.toggle("fa-solid");
  x.classList.toggle("fa-eye");
  x.classList.toggle("fa-eye-slash");

  let inputElement = document.getElementById("wachtwoord");

  if (inputElement.type === "password") {
      inputElement.type = "text";
    } else {
      inputElement.type = "password";
    }
}