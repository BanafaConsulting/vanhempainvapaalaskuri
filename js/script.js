"use strict";

// TODO Laske kotona vietetyt päivät ja lapsen kanssa vietety päivät
// TODO: Lasken lapsen ikä eri vapaiden aikana

$(document).ready(function() {

  // muuttujien määrittelu alkaa
  var dueDate; // laskettu aika (päivämäärä)
  var birthDate; // syntymäaika (päivämäärä)
  var matLeaveStartDays; // äitiysvapaan aloitus ennen laskettua aikaa (arkipäivää)

  var matLeaveTotDays = 105; // äitiysvapaan kaikki päivät (arkipäivää)
  var matLeaveDays; // äitiysvapaan päivät synnytyksenjälkeen (arkipäivää)
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

  var finnishHolidaysObj; // objekti, johon pyhäpäivät tallennetaan
  var finnishHolidaysArr = new Array(); // tyhjä array, johon kopioidaan pelkät pyhäpäivien päivämäärät
  var holidaysURL = 'https://raw.githubusercontent.com/mcbalsam/vanhempainvapaalaskuri/master/files/finnishHolidaysList.json'; // Muuta tähän pyhäpäivien sijainti

  var form; // muuttuja lomakkeelle, johon tiedot syötetään
  // muuttujien määrittely päättyy

  // CORS-pyynnön alku ja JSON-tietojen lukeminen objektiksi palvelilmelta. Koodin pätkä haettu alunperin osoitteesta https://test-cors.org/
  var createCORSRequest = function(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // Most browsers.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // IE8 & IE9
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  };

  var url = holidaysURL;
  var method = 'GET';
  var xhr = createCORSRequest(method, url);

  xhr.onload = function() {
    // Success code goes here.
    var jsonResponse = JSON.parse(xhr.responseText); // muuta JSON objektiksi
    finnishHolidaysObj = jsonResponse; // tallenntaa toiseen objektiin
    finnishHolidaysObj.forEach(function(holiday) { // tallennta päivämäärät arrayhin
      finnishHolidaysArr.push(holiday.date);
    });
  };

  xhr.onerror = function() {
    // Error code goes here.
    alert("Pyhapäivien hakeminen sivuilta ei onnistunut!")
  };

  xhr.send();
  // CORS-pyyntö loppuu

  // Funktio vapaan päättymispäivän laskemisesta käyttäen moment.js:ää TODO: korjaa lopetuspäivämäärä pyhän tai viikonlopun loppuun TODO: keksi parempi tapa huomioda taaksepäin laskenta, 0-päivät
  // FIXME: Korjaa yhden päivän isyysloman virhe äidin kanssa yhdessä pidettävässä osuudessa
  var countEndDate = function(beginDate, days) { // beginDate on moment-objekti, days on arkipäivien määrä
    var calculatedDate = beginDate.clone(); // kloonataan aloituspäivästä uusi moment-objekti
    var i = Math.abs(days); // muutetaan päivät itseisarvoksi, sillä äitysvapaan aloitus määritellään negatiivisena lukuna
    if (days > 0) { // jos päivien määrä positiivnen, niin lasketaan päivämääriä eteenpäin (äitysvapaan aloitus on määritelty negatiivisena)
      while (i > 0) {
        if (calculatedDate.isoWeekday() === 7 || $.inArray(calculatedDate.format("YYYY-MM-DD"), finnishHolidaysArr) !== -1) { // tarkista onko päivä sunnuntai tai pyhäpäivä
          calculatedDate.add(1, "days"); // lisää loppupäivään yksi päivä
        } else {
          calculatedDate.add(1, "days"); // lisää loppupäivään yksi päivä ja vähennä laskuria
          i--;
        }
      }
      return calculatedDate.subtract(1, "days");
    } else if (days < 0) { // jos päivien määrä negatiivinen, niin lasketaan päivämääriä taaksepäin
      while (i > 0) {
        if (calculatedDate.isoWeekday() === 7 || $.inArray(calculatedDate.format("YYYY-MM-DD"), finnishHolidaysArr) !== -1) { // tarkista onko päivä sunnuntai
          calculatedDate.subtract(1, "days"); // vähennä loppupäivästä yksi päivä
        } else {
          calculatedDate.subtract(1, "days"); // vähennä loppupäivästä yksi päivä ja vähennä laskuria
          i--;
        }
      }
      return calculatedDate;
    } else if (days === 0) { // jos päivien määrä on nolla. FIXME: parempi tapa huomioida 0-päivät
      return beginDate;
    } else {
      return null;
      alert("VIRHE!");
    }
  };
  // Funkio päättyy

  // lomakkeen tieton käsittely ja päivämäärien laskenta alkaa
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
      matLeaveStartDays = -(parseInt($("#aitysvapaanAloitusPaivat").val(), 10)); // haetaan ennen laskettua aikaa aloitettavan äitiysvapaan arkipäivien määrä ja muutetaan se negatiiviseksi kokonaisluvuksi (10-kanta)
      matLeaveBegin = moment(countEndDate(dueDate, matLeaveStartDays)); // Laske äitiyvvapaan aloituspäivä
      matLeaveDays = matLeaveTotDays + matLeaveStartDays; // laske lasketun ajan jälkeen jäävät äitiyvvapaan päivät (HUOM! negatiivinen matLeaveStartDays)
      matLeaveEnd = moment(countEndDate(dueDate, matLeaveDays)); // Laske syntymän jälkeen jäljellä olevat päivät ja äitiyvvapaan lopetus

      // Laske äidin vanhempainvavpaan osuus sekä aloitus- ja päättymispäivä
      parLeaveMotherDays = parseInt($("#yhteisenOsanJako").val(), 10); // haetaan äidin vanhempainvapaapäivien määrä ja muutetaan se kokonaisluvuksi (10-kanta)
      parLeaveMotherBegin = moment(countEndDate(matLeaveEnd, 2)); // määrittele äidin vanhempainvapaan alku äitysvapaan päättymispäivän perusteella ja laske seuraava arkipäivä. Kaksi päivää, koska laskentafunktio vähentää loppupäivästä yhden päivän.
      parLeaveMotherEnd = moment(countEndDate(parLeaveMotherBegin, parLeaveMotherDays)); // lasken äidin vanhempainvavpaan loppupäivä

      //  Laske ensimmäisen isyysvapaan osuus sekä aloitus- ja päättymispäivä
      patLeaveDaysWithMother = parseInt($("#isyysvapaaPaivatAidinkanssa").val(), 10); // haetaan äidin kanssa samaan aikaa vietettävien päivien määrä ja muutetaan se kokonaisluvuksi (10-kanta)
      patLeaveOneBegin = moment(birthDate); // määritellään isyysvapaan ensimmäinen osan aloitus alkamaan syntymästä ja luodaan moment-objekti
      patLeaveOneEnd = moment(countEndDate(birthDate, patLeaveDaysWithMother));

      //  Laske isön vanhempainvavpaan osuus sekä aloitus- ja päättymispäivä
      parLeaveFatherDays = parLeaveTotDays - parLeaveMotherDays; // lasketaan isän vanhempainvapaapäivien määrä
      parLeaveFatherBegin = moment(countEndDate(parLeaveMotherEnd, 2)); // määrittele isän vanhempainvapaan alku äidin vanhempainvapaan päättymispäivän perusteella ja laske seuraava arkipäivä. Kaksi päivää, koska laskentafunktio vähentää loppupäivästä yhden päivän.
      parLeaveFatherEnd = moment(countEndDate(parLeaveFatherBegin, parLeaveFatherDays)); // lasken isän vanhempainvavpaan loppupäivä

      //  Laske toisen isyysvapaan osuus sekä aloitus- ja päättymispäivä
      patLeaveDaysAlone = patLeaveDays - patLeaveDaysWithMother; // laske jäljellä olevien isyysvapaapäivienmäärä;
      patLeaveTwoBegin = moment(countEndDate(parLeaveFatherEnd, 2)); // lasketaan  isyysvapaan toisen osan aloitus alkamaan isän vanhempainvapaapäivien jälkeen. Kaksi päivää, koska laskentafunktio vähentää loppupäivästä yhden päivän.
      patLeaveTwoEnd = moment(countEndDate(patLeaveTwoBegin, patLeaveDaysAlone)); // lasketaan isyysvapaan toisen osan päättymispäivä
      // lomakkeen tieton käsittely ja päivämäärien laskenta päättyy

      // laskettujen päivämäärien tulostus HTML:ään alkaa
      $("#aitysvapaanAlku").text(matLeaveBegin.format("D.M.Y")); // äitiysvapaan alky
      $("#aitysvapaanLoppu").text(parLeaveMotherEnd.format("D.M.Y")); // äidin vanhempainvapaan loppu

      if (patLeaveDaysWithMother === 0) { // tarkistetaan onko ensimmäisen isyysvapaan pituus nolla
        $("#isyyvapaanEnsimmainenAlku").text("-");
        $("#isyyvapaanEnsimmainenLoppu").text("-"); //
      } else {
        $("#isyyvapaanEnsimmainenAlku").text(patLeaveOneBegin.format("D.M.Y")); // isyysvapaan ensimmäinen alku
        $("#isyyvapaanEnsimmainenLoppu").text(patLeaveOneEnd.format("D.M.Y")); // isyysvapaan ensimmäinen loppu
      }

      $("#isyyvapaanToinenAlku").text(parLeaveFatherBegin.format("D.M.Y")); // isän vanhempainvapaan alku
      $("#isyyvapaanToinenLoppu").text(patLeaveTwoEnd.format("D.M.Y")); // isyysvapaan toinen loppu
      // laskettujen päivämäärien tulostus HTML:ään päättyy


    } // else:n sulku

  });

});
