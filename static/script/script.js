// ---------------NAVIGATIE-----------------
function sidemenu() {
  let menu = document.getElementById("sidemenu");
  menu.classList.toggle("sidemenu");
}
// --------------PROFIEL-----------
document.addEventListener("DOMContentLoaded", function () {
  let listItems = document.querySelectorAll(".profieldropdown ul li");
  let textvakken = document.querySelectorAll('main > div[class^="textvak"]');

  listItems.forEach(function (item, index) {
    item.addEventListener("click", function () {
      // Verplaats de 'profielactive'-klasse van het huidige actieve lijstitem naar het geselecteerde lijstitem
      document
        .querySelector(".profielactive")
        .classList.remove("profielactive");
      this.classList.add("profielactive");

      // Verberg alle tekstvakken
      textvakken.forEach(function (textvak) {
        textvak.style.display = "none";
      });
      // Toon alleen het tekstvak met dezelfde index als het geselecteerde lijstitem
      textvakken[index].style.display = "block";
    });
  });
});

// ---------------FILTER-----------------
let filterBtn = document.getElementById("filterBtn")
if(filterBtn) {
  filterBtn.addEventListener("click", function() {
    let filterSection = document.querySelector(".filter");
    // Controleer of de filtersectie verborgen is
    if (filterSection.style.display === "none") {
      // Als het verborgen is, maak het zichtbaar
      filterSection.style.display = "block";
  } else {
    // Als het zichtbaar is, verberg het
    filterSection.style.display = "none";
  }
  });
}
// -------------PROFIEL VERZOEKEN-------------
function laadVerzoeken(verzoeken) {
  // Controleren of het element met het id "verzoekenList" aanwezig is op de pagina
  const list = document.getElementById("verzoekenList"); 
  if (!list) {
    console.error("Element met id 'verzoekenList' niet gevonden op de pagina.");
    return; // Stop de functie als het element niet gevonden is
  }

  // Element is gevonden, voeg verzoeken toe aan de lijst
  verzoeken.forEach((verzoek) => {
    const verzoekItem = document.createElement("li");
    verzoekItem.innerHTML = 
      ` <img src="img/bedreigde-sneeuwluipaard-die-in-de-aardhabitat-rust-wilde-dieren-in-gevangenschap-mooie-aziatische-katachtige-en-carnivoor-uncia-uncia kopie.jpg" alt="">
      <div>
        <h2>${verzoek.dierNaam}</h2>
        <p>${verzoek.zoekerNaam}</p>
        <p>${verzoek.status}</p>
      </div>
      <form action="/accepteren" method="post">
        <input type="hidden" name="verzoekId" value="${verzoek._id}">
        <button type="submit" name="accepteren" value="accepteren">✓</button>
        <button type="submit" name="accepteren" value="weigeren">𐤕</button>
      </form> `;
    list.appendChild(verzoekItem);
  });
}

// --------------PROFIEL-----------
document.addEventListener('DOMContentLoaded', function() {
  let listItems = document.querySelectorAll('.profieldropdown ul li');
  let textvakken = document.querySelectorAll('main > div[class^="textvak"]');

 if(listItems){
  listItems.forEach(function(item, index) {
    item.addEventListener('click', function() {
      // Verplaats de 'profielactive'-klasse van het huidige actieve lijstitem naar het geselecteerde lijstitem
      document.querySelector('.profielactive').classList.remove('profielactive');
      this.classList.add('profielactive');

      // Verberg alle tekstvakken
      textvakken.forEach(function(textvak) {
        textvak.style.display = 'none';
      });
      // Toon alleen het tekstvak met dezelfde index als het geselecteerde lijstitem
      textvakken[index].style.display = 'block';
    });
  });
 }
});


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

document.addEventListener("DOMContentLoaded", function () {
  let passwordField = document.getElementById("wachtwoord");
  let repasswordField = document.getElementById("repassword");
  let errorSpan = document.getElementById("pass");
  let form = document.querySelector(".registreerform");

  if (repasswordField){
    repasswordField.addEventListener("input", function() {
      if (passwordField.value !== repasswordField.value) {
        errorSpan.textContent = "De wachtwoorden komen niet overeen";
      } else {
        errorSpan.textContent = "";
      }
    });
  }

  if (form){
    form.addEventListener("submit", function(event) {
      if (passwordField.value !== repasswordField.value) {
        errorSpan.textContent = "De wachtwoorden komen niet overeen";
        event.preventDefault(); // Voorkom dat het formulier wordt ingediend
      }
    });
  }
  

});

// ---------------VRAGENLIJST CARD SLIDER-----------------

let items = document.querySelectorAll(".slider .item");
let active = 0;
let next = document.getElementById('next');
let prev = document.getElementById('prev');
let submitButton = document.querySelector('.vragenlijstbtn');
console.log(items)
if(items > 0) {
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
}


// Functie om de knoppen te tonen/verbergen op basis van de actieve vraag
function toggleButtonsVisibility() {
  if (active === 0) {
    prev.style.display = "none"; // Verberg de vorige knop als op de eerste vraag bent
  } else {
    prev.style.display = "block"; // Toon de vorige knop als niet op de eerste vraag bent
  }

  if (active === items.length - 1) {
    next.style.display = "none"; // Verberg de volgende knop als op de laatste vraag bent
    submitButton.style.display = "block"; // Toon de verzendknop als op de laatste vraag bent
  } else {
    next.style.display = "block"; // Toon de volgende knop als niet op de laatste vraag bent
    submitButton.style.display = "none"; // Verberg de verzendknop als niet op de laatste vraag bent
  }
}

// Controleer de zichtbaarheid van de knoppen bij het laden van de pagina
if (prev && next && submitButton) {
toggleButtonsVisibility();
}

// Voeg klikgebeurtenissen toe aan de knoppen om door de vragen te navigeren
if(next) {
  next.onclick = function(){
    active = active + 1 < items.length ?  active + 1 : active;
    loadShow();
    toggleButtonsVisibility(); // Controleer de zichtbaarheid van de knoppen na het veranderen van de actieve vraag
}
}

if(prev)
{prev.onclick = function(){
  active = active - 1 >= 0 ? active -1 : active;
  loadShow();
  toggleButtonsVisibility(); // Controleer de zichtbaarheid van de knoppen na het veranderen van de actieve vraag
}}


// ---------------SLIDER-----------------
// Controleer of het element met de klasse "swiper" aanwezig is op de pagina
const swiperElement = document.querySelector(".swiper");
if (swiperElement) {
    // Initialiseer de Swiper alleen als het element aanwezig is
    const swiper = new Swiper(swiperElement, {
        // Optionele parameters

        // Als we paginering nodig hebben
        pagination: {
            el: ".swiper-pagination",
        },

        // Navigatieknoppen
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },

        // En als we een scrollbar nodig hebben
        scrollbar: {
            el: ".swiper-scrollbar",
        },
    });
}


// ---------------POPUP-----------------
function createPopup(id) {
  const popupNode = document.querySelector(id);
  
  if (!popupNode) {
    console.error(`Element met id '${id}' niet gevonden op de pagina.`);
    return;
  }

  const overlay = popupNode.querySelector(".overlay");
  const closeBtn = popupNode.querySelector(".close-btn");

  function openPopup() {
    popupNode.classList.add("active");
  }

  function closePopup() {
    popupNode.classList.remove("active");
  }

  overlay.addEventListener("click", closePopup);
  closeBtn.addEventListener("click", closePopup);

  return openPopup;
}

const popupOpener = createPopup("#popup");
if (popupOpener) {
  document.querySelector("#open-popup").addEventListener("click", popupOpener);
}
