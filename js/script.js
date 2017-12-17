"use strict";

// TODO: Päätä määritelläänkö eri vapaiden jakson muuttujina vai objekteina

// TODO: Bootstrap Form Control States

// Tästä alkaa jQuery

// TEMP jQuery kommentoitu väliaikaiseti

// $(document).ready(function() {

// jQuery methods go here...

// Tähän alle määrittele muuttujat

var dueDate; // laskettu aika (päivämäärä)
var birthDate; // syntymäaika (päivämäärä)
var matLeaveStartDays; // äitiysvapaan aloitus ennen laskettua aikaa (arkipäivää)

var matLeaveDays = 105; // äitiysvapaan päivät (arkipäivää)
var patLeaveDays = 54; // isyysvapaan päivät (arkipäivää)
var parLeaveTotDays = 158; // vanhempainvapaan kaikki päivät (arkipäivää)

var patLeaveDaysWithMother; // äidin kanssa samaan aikaa vietettävä isyysvapaan päivät (arkipäivää)
var patLeaveDaysAlone; // ilman äitiä vietettävät isyysvapaan päivät (arkipäivää)

var parLeaveMotherDays; // äidin vanhempainvapaan päivät (arkipäivää)
var parLeaveFatherDays; // isän vanhempainvapaan päivät (arkipäivää)

var matLeaveBegin; // äitiysvapaan aloitus (päivämäärä)
var matLeaveEnd; // äitiyvvapaan lopeteus (päivämäärä)

var parLeaveMotherBegin; // äidin vanhempainvapaan aloitus (päivämäärä)
var parLeaveMotherEnd; // äidin vanhempainvapaan lopetus (päivämäärä)

var parLeaveFatherBegin; // isön vanhempainvapaan aloitus (päivämäärä)
var parLeaveFatherEnd; // äidin vanhempainvapaan lopetus (päivämäärä)

var patLeaveOneBegin; // isyysvapaan ensimmäisen osuuden aloitus (päivämäärä)
var patLeaveOneEnd; // isyysvapaan ensimmäisen osuuden lopetus (päivämäärä)
var patLeaveTwoBegin; // isyysvapaan toisen osuuden aloitus (päivämäärä)
var patLeaveTwoEnd; // isyysvapaan toisen osuuden lopetus (päivämäärä)

var form; // muuttuja lomakkeelle, johon tiedot syötetään

/*  JSON-tietojen lukeminen objektiksi palvelilmelta
var xmlhttp = new XMLHttpRequest(); //
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var finnishHolidays = JSON.parse(this.responseText);
        alert("OK!");
    }
};
xmlhttp.open("GET", "./files/Pyhat_2018_2022.json", true);
xmlhttp.send();
*/

// Funktio vapaan päättymispäivän laskemisesta käyttäen moment.js:ää

var countEndDate = function(beginDate, days) { // beginDate on moment-objekti, days on arkipäivien määrä
  var calculatedDate = beginDate.clone(); // kloonataan aloituspäivästä uusi moment-objekti
  var i = Math.abs(days); // muutetaan päivät itseisarvoksi, sillä äitysvapaan aloitus määritellään negatiivisena lukuna
  if (days >= 0) { // jos päivien määrä positiivnen, niin lasketaan päivämääriä eteenpäin (äitysvapaan aloitus on määritelty negatiivisena)
    while (i > 0) {
      if (calculatedDate.isoWeekday() === 7) { // tarkista onko päivä sunnuntai
        calculatedDate.add(1, "days"); // lisää loppupäivään yksi päivä
      } else {
        calculatedDate.add(1, "days"); // lisää loppupäivään yksi päivä ja vähennä laskuria
        i--;
      }
    }
  } else { // jos päivien määrä negatiivinen, niin lasketaan päivämääriä taaksepäin
    while (i > 0) {
      if (calculatedDate.isoWeekday() === 7) { // tarkista onko päivä sunnuntai
        calculatedDate.subtract(1, "days"); // vähennä loppupäivästä yksi päivä
      } else {
        calculatedDate.subtract(1, "days"); // vähennä loppupäivästä yksi päivä ja vähennä laskuria
        i--;
      }
    }
  }

  return calculatedDate; // palauttaa lasketun päivämäärän;
  // TODO: Ota huomioon myös arkipyhät
};


form = $("#lomakeTiedot");

form.submit(function(event) { // Tämän alle kaikki, mitä tapahtuu Laske-napista
  form[0].classList.add("was-validated"); // lisätään lomakkeeseen CSS-luokka
  if (form[0].checkValidity() === false) {

    event.preventDefault(); // estetään sivun uudellen lataus
  } else {

    event.preventDefault(); // estetään sivun uudellen lataus
    //  form[0].classList.add("was-validated");

    dueDate = moment($("#laskettuAika").val(), "YYYY-MM-DD"); // haetaan laskettu aika ja luodaan uusi moment-objekti
    birthDate = moment($("#syntymaAika").val(), "YYYY-MM-DD"); // haetaan syntymäaika ja luodaan uusi moment-objekti

    // äitiysvapaan laskenta
    matLeaveStartDays = -(parseInt($("#aitysvapaanAloitusPaivat").val(), 10)); // haetaan ennen laskettua aikaa aloitettavan äitiysvapaan arkipäivien määrä ja muutetaan se negatiiviseksi kokonaisluvuksi
    matLeaveBegin = moment(countEndDate(dueDate, matLeaveStartDays)); // Laske äitiyvvapaan aloituspäivä
    matLeaveEnd = moment(countEndDate(dueDate, (matLeaveDays - matLeaveStartDays))); // Laske syntymän jälkeen jäljellä olevat päivät ja äitiyvvapaan lopetus

    // Laske äidin vanhempainvavpaan osuus sekä aloitus- ja päättymispäivä
    parLeaveMotherDays = parseInt($("#yhteisenOsanJako").val(), 10); // haetaan äidin vanhempainvapaapäivien määrä ja muutetaan se kokonaisluvuksi
    parLeaveMotherBegin = moment(countEndDate(matLeaveEnd, 1)); // määrittele äidin vanhempainvapaan alku äitysvapaan päättymispäivän perusteella ja laske seuraava arkipäivä
    parLeaveMotherEnd = moment(countEndDate(parLeaveMotherBegin, parLeaveMotherDays)); // lasken äidin vanhempainvavpaan loppupäivä

    //  Laske ensimmäisen isyysvapaan osuus sekä aloitus- ja päättymispäivä
    patLeaveDaysWithMother = parseInt($("#isyysvapaaPaivatAidinkanssa").val(), 10); // haetaan äidin kanssa samaan aikaa vietettävien päivien määrä ja muutetaan se kokonaisluvuksi
    patLeaveOneBegin = moment(birthDate); // määritellään isyysvapaan ensimmäinen osan aloitus alkamaan syntymästä ja luodaan moment-objekti
    patLeaveOneEnd = moment(countEndDate(birthDate, patLeaveDaysWithMother));

    //  Laske isön vanhempainvavpaan osuus sekä aloitus- ja päättymispäivä
    parLeaveFatherDays = parLeaveTotDays - parLeaveMotherDays; // lasketaan isän vanhempainvapaapäivien määrä
    parLeaveFatherBegin = moment(countEndDate(parLeaveMotherEnd, 1)); // määrittele isän vanhempainvapaan alku äidin vanhempainvapaan päättymispäivän perusteella ja laske seuraava arkipäivä
    parLeaveFatherEnd = moment(countEndDate(parLeaveFatherBegin, parLeaveFatherDays)); // lasken isän vanhempainvavpaan loppupäivä

    //  Laske toisen isyysvapaan osuus sekä aloitus- ja päättymispäivä
    patLeaveDaysAlone = patLeaveDays - patLeaveDaysWithMother; // laske jäljellä olevien isyysvapaapäivienmäärä;
    patLeaveTwoBegin = moment(countEndDate(parLeaveFatherEnd, 1)); // lasketaan  isyysvapaan toisen osan aloitus alkamaan isän vanhempainvapaapäivien jälkeen
    patLeaveTwoEnd = moment(countEndDate(patLeaveTwoBegin, patLeaveDaysAlone)); // lasketaan isyysvapaan toisen osan päättymispäivä

    // Tämän alle tekstien tulostus HTML:ään

    $("#aitysvapaanAlku").text(matLeaveBegin.format("D.M.Y")); // äitiysvapaan alky
    $("#aitysvapaanLoppu").text(parLeaveMotherEnd.format("D.M.Y")); // äidin vanhempainvapaan loppu

    $("#isyyvapaanEnsimmainenAlku").text(patLeaveOneBegin.format("D.M.Y")); // isyysvapaan ensimmäinen alku
    $("#isyyvapaanEnsimmainenLoppu").text(patLeaveOneEnd.format("D.M.Y")); // isyysvapaan ensimmäinen loppu

    $("#isyyvapaanToinenAlku").text(parLeaveFatherBegin.format("D.M.Y")); // isän vanhempainvapaan alku
    $("#isyyvapaanToinenLoppu").text(patLeaveTwoEnd.format("D.M.Y")); // isyysvapaan toinen loppu

  } // else:n sulku
  // TODO Laske kotona vietetyt päivät ja lapsen kanssa vietety päivät

  // TODO: Lasken lapsen ikä eri vapaiden aikana


});

// });

// TODO Lisää tähän lista pyhäpäivistä joko tiedosto, array tai API (lisää WebCal Linkki). Ensimmäisenä ratkaisuna on pyhäpäivien hakeminen erilliseen tiedostoon ja niide
