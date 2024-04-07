# Blok Tech 2324

#### Welkom bij de ReadMe van team4 (Evi, Senna, Elton en Joni)

## Ons Idee

Onze app heet Purrfect Match. Ons idee is dat je kan matchen/adopteren met
katten en katachtige dieren. Door een account aan te maken kun je kijken naar
alle dieren en de dieren liken die je leuk vindt. Je kunt ook afstand doen van
een dier als dat nodig is door bepaalde redenen.

## Features

Onze uiteindelijke features zijn:

1. Inloggen
2. Registreren
3. Adopteren
4. Verzoeken sturen
5. Matchen
6. Dieren toevoegen
7. Persoonlijke informatie kun je veranderen
8. Dieren liken en unliken
9. Foto swiper en sliders
10. Filteren
11. Sorteren

## Hoe moet je de applicatie gebruiken

We hebben de applicatie ontworpen voor telefoonformaat, maar we hebben ook
gekeken naar responsiviteit, dus het is ook te bekijken op een laptop. We raden
aan om het op de telefoonversie te bekijken. Je kunt de telefoonweergave op de
laptop bekijken door met de rechtermuisknop te klikken en vervolgens
'Inspecteren' te selecteren.

### Gebouwd met

-   HTML/CSS
-   Javascript
-   Ejs
-   Express
-   Express Sessions
-   Bcrypt
-   MongoDB
-   Multer
-   Node Mailer
-   Uglify JS
-   Eslint
-   Dotenv
-   Smtp service MailSend
-   Hosting Render.com

## Installeren

Voer het commando `npm install` uit in de terminal op het moment dat je in het
project zit. Dit zal elk benodigd pakket installeren.

Maak ook het bestand `.env` aan. Vul dit aan met de volgende gegevens:

     PORT=
     DB_COLLECTION=
     DB_HOST=
     DB_NAME=
     DB_USERNAME=
     DB_PASS=
     SMTP_PASSWORD=

## Applicatie gebruiken

Tijdens development kun je de website opstarten door in de terminal het commando
`npm run dev` uit te voeren. Nu kun je met de poort die je in het `.env`-bestand
hebt ingevuld de website lokaal bezoeken. Op `localhost:port`.

## Database

Onze database is gebouwd met MongoDB. Deze heeft 4 collecties:

-   Dieren
-   Users
-   Verzoeken
-   Contactformulieren

## License

MIT License

Copyright (c) 2024 Team 04, HVA

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
