// ---------------NAVIGATIE-----------------
function sidemenu () {
  const menu = document.getElementById('sidemenu')
  menu.classList.toggle('sidemenu')
}
// --------------PROFIEL-----------
document.addEventListener('DOMContentLoaded', function () {
  const listItems = document.querySelectorAll('.profieldropdown ul li')
  const textvakken = document.querySelectorAll('main > div[class^="textvak"]')

  listItems.forEach(function (item, index) {
    item.addEventListener('click', function () {
      // Verplaats de 'profielactive'-klasse van het huidige actieve lijstitem naar het geselecteerde lijstitem
      document
        .querySelector('.profielactive')
        .classList.remove('profielactive')
      this.classList.add('profielactive')

      // Verberg alle tekstvakken
      textvakken.forEach(function (textvak) {
        textvak.style.display = 'none'
      })
      // Toon alleen het tekstvak met dezelfde index als het geselecteerde lijstitem
      textvakken[index].style.display = 'block'
    })
  })
})

// ---------------FILTER-----------------
const filterBtn = document.getElementById('filterBtn')

if (filterBtn) {
  filterBtn.addEventListener('click', () => {
    const filterSection = document.querySelector('.filter')

    // Controleer of de filtersectie verborgen is
    if (filterSection.style.display === 'none') {
      // Als het verborgen is, maak het zichtbaar
      filterSection.style.display = 'block'
    } else {
      // Als het zichtbaar is, verberg het
      filterSection.style.display = 'none'
    }
  })
}

// -------------PROFIEL VERZOEKEN-------------
function laadVerzoeken (verzoeken) {
  // Controleren of het element met het id "verzoekenList" aanwezig is op de pagina
  const list = document.getElementById('verzoekenList')
  if (!list) {
    console.error("Element met id 'verzoekenList' niet gevonden op de pagina.")
    return // Stop de functie als het element niet gevonden is
  }

  // Element is gevonden, voeg verzoeken toe aan de lijst
  verzoeken.forEach((verzoek) => {
    const verzoekItem = document.createElement('li')
    verzoekItem.innerHTML =
      ` <img src="/uploads/${verzoek.dierFoto}" alt=""> 
      <div>
        <h2>${verzoek.dierNaam}</h2>
        <p>${verzoek.zoekerNaam}</p>
        <p>${verzoek.status}</p>
      </div>
      <form action="/accepteren" method="post">
        <input type="hidden" name="verzoekId" value="${verzoek._id}">
        <button type="submit" name="accepteren" value="accepteren">✓</button>
        <button type="submit" name="accepteren" value="weigeren">𐤕</button>
      </form> `
    list.appendChild(verzoekItem)
  })
}

// --------------PROFIEL-----------
document.addEventListener('DOMContentLoaded', function () {
  const listItems = document.querySelectorAll('.profieldropdown ul li')
  const textvakken = document.querySelectorAll('main > div[class^="textvak"]')

  if (listItems) {
    listItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
      // Verplaats de 'profielactive'-klasse van het huidige actieve lijstitem naar het geselecteerde lijstitem
        document.querySelector('.profielactive').classList.remove('profielactive')
        this.classList.add('profielactive')

        // Verberg alle tekstvakken
        textvakken.forEach(function (textvak) {
          textvak.style.display = 'none'
        })
        // Toon alleen het tekstvak met dezelfde index als het geselecteerde lijstitem
        textvakken[index].style.display = 'block'
      })
    })
  }
})

// ---------------FORMS PASSWORD-----------------
function showpassword (x) {
  x.classList.toggle('fa-regular')
  x.classList.toggle('fa-solid')
  x.classList.toggle('fa-eye')
  x.classList.toggle('fa-eye-slash')

  const inputElement = document.getElementById('wachtwoord')

  if (inputElement.type === 'password') {
    inputElement.type = 'text'
  } else {
    inputElement.type = 'password'
  }
}

function showrepassword (x) {
  x.classList.toggle('fa-regular')
  x.classList.toggle('fa-solid')
  x.classList.toggle('fa-eye')
  x.classList.toggle('fa-eye-slash')

  const inputElement = document.getElementById('repassword')

  if (inputElement.type === 'password') {
    inputElement.type = 'text'
  } else {
    inputElement.type = 'password'
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const passwordField = document.getElementById('wachtwoord')
  const repasswordField = document.getElementById('repassword')
  const errorSpan = document.getElementById('pass')
  const form = document.querySelector('.registreerform')

  if (repasswordField) {
    repasswordField.addEventListener('input', function () {
      if (passwordField.value !== repasswordField.value) {
        errorSpan.textContent = 'De wachtwoorden komen niet overeen'
      } else {
        errorSpan.textContent = ''
      }
    })
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      if (passwordField.value !== repasswordField.value) {
        errorSpan.textContent = 'De wachtwoorden komen niet overeen'
        event.preventDefault() // Voorkom dat het formulier wordt ingediend
      }
    })
  }
})

// ---------------VRAGENLIJST CARD SLIDER-----------------
document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.slider .item')
  let active = -1
  const next = document.getElementById('next')
  const prev = document.getElementById('prev')
  const submitButton = document.querySelector('.vragenlijstbtn')

  // Functie om de slider-items te laten zien op basis van de actieve index
  function loadShow () {
    items[active].style.transform = 'none'
    items[active].style.zIndex = 1
    items[active].style.filter = 'none'
    items[active].style.opacity = 1

    let stt = 0
    for (var i = active + 1; i < items.length; i++) {
      stt++
      items[i].style.transform = `translateX(${120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`
      items[i].style.zIndex = -stt
      items[i].style.filter = 'blur(5px)'
      items[i].style.opacity = stt > 2 ? 0 : 0.6
    }

    stt = 0
    for (var i = (active - 1); i >= 0; i--) {
      stt++
      items[i].style.transform = `translateX(${-120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`
      items[i].style.zIndex = -stt
      items[i].style.filter = 'blur(5px)'
      items[i].style.opacity = stt > 2 ? 0 : 0.6
    }
  }

  // Functie om de zichtbaarheid van knoppen te controleren op basis van de actieve index
  function toggleButtonsVisibility () {
    if (active === 0) {
      prev.style.display = 'none' // Verberg de vorige knop als op de eerste vraag bent
    } else {
      prev.style.display = 'block' // Toon de vorige knop als niet op de eerste vraag bent
    }

    if (active === items.length - 1) {
      next.style.display = 'none' // Verberg de volgende knop als op de laatste vraag bent
      submitButton.style.display = 'block' // Toon de verzendknop als op de laatste vraag bent
    } else {
      next.style.display = 'block' // Toon de volgende knop als niet op de laatste vraag bent
      submitButton.style.display = 'none' // Verberg de verzendknop als niet op de laatste vraag bent
    }
  }

  // Controleer de zichtbaarheid van knoppen bij het laden van de pagina
  if (prev && next && submitButton) {
    toggleButtonsVisibility()
  }

  // Voeg klikgebeurtenissen toe aan de knoppen om door de vragen te navigeren
  if (next) {
    next.onclick = function () {
      active = active + 1 < items.length ? active + 1 : active
      loadShow()
      toggleButtonsVisibility() // Controleer de zichtbaarheid van knoppen na het veranderen van de actieve index
    }
  }

  if (prev) {
    prev.onclick = function () {
      active = active - 1 >= 0 ? active - 1 : active
      loadShow()
      toggleButtonsVisibility() // Controleer de zichtbaarheid van knoppen na het veranderen van de actieve index
    }
  }
})

// ---------------SLIDER-----------------
// Controleer of het element met de klasse "swiper" aanwezig is op de pagina

const swiperElement = document.querySelector('.swiper')
if (swiperElement) {
  // Initialiseer de Swiper alleen als het element aanwezig is
  const swiper = new Swiper(swiperElement, {
    // Optionele parameters

    // Als we paginering nodig hebben
    pagination: {
      el: '.swiper-pagination'
    },

    // Navigatieknoppen
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },

    // En als we een scrollbar nodig hebben
    scrollbar: {
      el: '.swiper-scrollbar'
    }
  })
}

// ---------------POPUP-----------------
const createPopup = (id) => {
  const popupNode = document.querySelector(id)

  if (!popupNode) {
    console.error(`Element met id '${id}' niet gevonden op de pagina.`)
    return
  }

  const overlay = popupNode.querySelector('.overlay')
  const closeBtn = popupNode.querySelector('.close-btn')

  const openPopup = () => {
    popupNode.classList.add('active')
  }

  const closePopup = () => {
    popupNode.classList.remove('active')
  }

  overlay.addEventListener('click', closePopup)
  closeBtn.addEventListener('click', closePopup)

  return openPopup
}

document.addEventListener('DOMContentLoaded', () => {
  const popupOpener = createPopup('#popup')
  if (popupOpener) {
    document.querySelector('#open-popup').addEventListener('click', popupOpener)
  }
})
