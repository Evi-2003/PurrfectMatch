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
  let passwordField = document.getElementById("wachtwoord");
  let repasswordField = document.getElementById("repassword");
  let errorSpan = document.getElementById("pass");
  let form = document.querySelector(".registreerform");

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


// ---------------VRAGENLIJST CARD SLIDER-----------------

let items = document.querySelectorAll('.slider .item');
let active = 0;
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let submitButton = document.querySelector('.vragenlijstbtn');

function loadShow(){
    items[active].style.transform = `none`;
    items[active].style.zIndex = 1;
    items[active].style.filter = 'none';
    items[active].style.opacity = 1;
    // show after
    let stt = 0;
    for(var i = active + 1; i < items.length; i ++){
        stt++;
        items[i].style.transform = `translateX(${120*stt}px) scale(${1 - 0.2*stt}) perspective(16px) rotateY(-1deg)`;
        items[i].style.zIndex = -stt;
        items[i].style.filter = 'blur(5px)';
        items[i].style.opacity = stt > 2 ? 0 : 0.6;
    }
    stt = 0;
    for(var i = (active - 1); i >= 0; i --){
        stt++;
        items[i].style.transform = `translateX(${-120*stt}px) scale(${1 - 0.2*stt}) perspective(16px) rotateY(1deg)`;
        items[i].style.zIndex = -stt;
        items[i].style.filter = 'blur(5px)';
        items[i].style.opacity = stt > 2 ? 0 : 0.6;
    }
}

loadShow();

// Functie om de knoppen te tonen/verbergen op basis van de actieve vraag
function toggleButtonsVisibility() {
    if (active === 0) {
        prev.style.display = 'none'; // Verberg de vorige knop als op de eerste vraag bent
    } else {
        prev.style.display = 'block'; // Toon de vorige knop als niet op de eerste vraag bent
    }

    if (active === items.length - 1) {
        next.style.display = 'none'; // Verberg de volgende knop als op de laatste vraag bent
        submitButton.style.display = 'block'; // Toon de verzendknop als op de laatste vraag bent
    } else {
        next.style.display = 'block'; // Toon de volgende knop als niet op de laatste vraag bent
        submitButton.style.display = 'none'; // Verberg de verzendknop als niet op de laatste vraag bent
    }
}

// Controleer de zichtbaarheid van de knoppen bij het laden van de pagina
toggleButtonsVisibility();

// Voeg klikgebeurtenissen toe aan de knoppen om door de vragen te navigeren
next.onclick = function(){
    active = active + 1 < items.length ?  active + 1 : active;
    loadShow();
    toggleButtonsVisibility(); // Controleer de zichtbaarheid van de knoppen na het veranderen van de actieve vraag
}

prev.onclick = function(){
    active = active - 1 >= 0 ? active -1 : active;
    loadShow();
    toggleButtonsVisibility(); // Controleer de zichtbaarheid van de knoppen na het veranderen van de actieve vraag
}

