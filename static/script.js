// ---------------NAVIGATIE-----------------
function sidemenu() {
  let menu = document.getElementById("sidemenu");
  menu.classList.toggle("sidemenu");
} 


// ---------------FORMS PASSWORD-----------------
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

function showrepassword(x) {
  x.classList.toggle("fa-regular");
  x.classList.toggle("fa-solid");
  x.classList.toggle("fa-eye");
  x.classList.toggle("fa-eye-slash");

  let inputElement = document.getElementById("repassword");

  if (inputElement.type === "password") {
      inputElement.type = "text";
    } else {
      inputElement.type = "password";
    }
}

document.addEventListener("DOMContentLoaded", function() {
  const passwordField = document.getElementById("wachtwoord");
  const repasswordField = document.getElementById("repassword");
  const errorSpan = document.getElementById("pass");
  const form = document.querySelector(".registreerform");

  repasswordField.addEventListener("input", function() {
    if (passwordField.value !== repasswordField.value) {
      errorSpan.textContent = "De wachtwoorden komen niet overeen";
    } else {
      errorSpan.textContent = "";
    }
  });

  form.addEventListener("submit", function(event) {
  if (passwordField.value !== repasswordField.value) {
    errorSpan.textContent = "De wachtwoorden komen niet overeen";
    event.preventDefault(); // Voorkom dat het formulier wordt ingediend
  }
});
});
