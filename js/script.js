"use strict";

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
  var matLeaveBeginMin; // äitiysvapaan aloitus aikaisintaan eli 50 arkipäivää ennen laskettua aikaa (päivämäärä)
  var matLeaveBeginMax; // äitiysvapaan aloitus aikaisintaan eli 50 arkipäivää ennen laskettua aikaa (päivämäärä)

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

  var formMaternity1; // muuttuja äitysvapaan lomakkeelle 1, johon tiedot syötetään
  var formMaternity2; // muuttuja äitysvapaan lomakkeelle 2, johon tiedot syötetään
  var formParent; // muuttuja vanhempainvapaan lomakkeelle, johon tiedot syötetään
  var formPaternity; // muuttuja isyysvapaan lomakkeelle, johon tiedot syötetään

  // muuttujien määrittely päättyy

  // Tähän alle omat funktiot ja metodit

  // Pyhäpäivän tarkistamisen funktio
  var isHoliday = function(date) {
    return (date.isoWeekday() === 7 || $.inArray(date.format("YYYY-MM-DD"), finnishHolidaysArr) !== -1)
  };

  // Arkipäivien laskeminen eteenpäin
  var countForward = function(fromDate, days) {
    var i = days;
    var calculatedDate = fromDate.clone();
    while (i > 0) {
      if (isHoliday(calculatedDate)) { // tarkista onko päivä sunnuntai tai pyhäpäivä
        calculatedDate.add(1, "days"); // lisää loppupäivään yksi päivä
      } else {
        calculatedDate.add(1, "days"); // lisää loppupäivään yksi päivä ja vähennä laskuria
        i--;
      }
    }
    return calculatedDate.subtract(1, "days");
  };

  // Arkipäivien laskeminen taakepäin
  var countBackward = function(fromDate, days) {
    var i = days;
    var calculatedDate = fromDate.clone();
    while (i > 0) {
      if (isHoliday(calculatedDate)) { // tarkista onko päivä sunnuntai tai pyhäpäivä
        calculatedDate.subtract(1, "days"); // vähennä loppupäivästä yksi päivä
      } else {
        calculatedDate.subtract(1, "days"); // vähennä loppupäivästä yksi päivä ja vähennä laskuria
        i--;
      }
    }
    return calculatedDate;
  };

  // Arkipäivien laskeminen kahden päivämäärän välillä
  var countWeekdays = function(beginDate, endDate) { // molemmat argumentit ovat moment-objekteja
    var weekdays = 0; // arkipäivien määrä
    var holidays = 0; // pyhäpäivien määrä
    var day1 = beginDate.clone(); // luodaan alkupäivästä moment-klooni
    var day2 = endDate.clone(); // luodaan loppupäivästä moment-klooni
    var totalDays = Math.abs(day1.diff(day2, "days")) + 1; // lasketaan päiven erotus, otetaan siitä itseisarvo ja lisätään 1, jotta saadaan päiven määrä

    for (var i = 0; i < totalDays; i++) { // käydään läpi kaikki päivät ja lasketaan montako pyhäpäivä ja sunnuntaita on välissä
      if (isHoliday(day1)) { // tarkista onko päivä sunnuntai tai pyhäpäivä
        holidays++;
      }
      day1.add(1, "days"); // mennään seuraavaan päivään
    }
    weekdays = totalDays - holidays;
    return weekdays;
  };

  // Moment-objektin päivämäärän näyttäminen muodossa päivä.kuukausi.vuosi
  var displayDate = function(date) {
    return date.format("D.M.Y");
  };

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


  // lomakkeen tieton käsittely ja päivämäärien laskenta alkaa
  formMaternity1 = $("#aitiysvapaaLomake1");
  formMaternity2 = $("#aitiysvapaaLomake2");
  formParent = $("#vanhempainvapaaLomake");
  formPaternity = $("#isyysvapaaLomake");

  formMaternity1.submit(function(event) { // Tämän alle kaikki, mitä tapahtuu Laske-napista
    formMaternity1[0].classList.add("was-validated"); // lisätään lomakkeeseen Bootstrapin CSS-luokka "on validoitu"
    if (formMaternity1[0].checkValidity() === false) {

      event.preventDefault(); // estetään sivun uudellen lataus
    } else {

      event.preventDefault(); // estetään sivun uudellen lataus

      dueDate = moment($("#laskettuAika").val(), "YYYY-MM-DD"); // haetaan laskettu aika ja luodaan uusi moment-objekti
      // äitiysvapaan laskenta
      matLeaveBeginMin = moment(countBackward(dueDate, 50));
      matLeaveBeginMax = moment(countBackward(dueDate, 30));

      $("#aitysvapaanAloitusMin").text(displayDate(matLeaveBeginMin)); // tulostetaan äitiysvapaan aloituksen aikaisin mahdollinen päivä
      $("#aitysvapaanAloitusMax").text(displayDate(matLeaveBeginMax)); // tulostetaan äitiysvapaan aloituksen myöhäisin mahdollinen päivä
      $("#aitysvapaanAloitusPvm").attr({
        min: matLeaveBeginMin.format("YYYY-MM-DD"),
        max: matLeaveBeginMax.format("YYYY-MM-DD")
      }); // asetetaan seuraavan lomakkeeseen rajat äitysvapaan aloituksen syötölle, eli annetaan min- ja max-attribuutit lomakkeen kentälle
      $("#aitysvapaanAloitusPvm").removeAttr("disabled"); // poistetaan seuraavan lomakkeen syöttökentän disabled-attribuutti
      $("#laskentaNappiMat2").removeAttr("disabled"); // poistetaan seuraavan lomakkeen syöttökentän disabled-attribuutti
    } // else:n sulku

  });

  formMaternity2.submit(function(event) { // Tämän alle kaikki, mitä tapahtuu Laske-napista
    formMaternity2[0].classList.add("was-validated"); // lisätään lomakkeeseen Bootstrapin CSS-luokka "on validoitu" TODO: Lisää äitiysvapaan aloituksen tarkistus (osuu oikealle aikavälille)
    if (formMaternity2[0].checkValidity() === false) {

      event.preventDefault(); // estetään sivun uudellen lataus
    } else {

      event.preventDefault(); // estetään sivun uudellen lataus

      matLeaveBegin = moment($("#aitysvapaanAloitusPvm").val(), "YYYY-MM-DD"); // haetaan äitysvapaan aloituspäivä  ja luodaan uusi moment-objekti
      matLeaveStartDays = countWeekdays(matLeaveBegin, dueDate) - 1; // Lasketaan ennen laskettua aikaa käytettävien äitiyslomapäivien määrä FIXME: Keksi ja korjaa, minkä takia tosta pitää vähentää 1.
      matLeaveDays = matLeaveTotDays - matLeaveStartDays; // laske lasketun ajan jälkeen jäävät äitiyvvapaan päivät
      matLeaveEnd = moment(countForward(dueDate, matLeaveDays)); // Laske syntymän jälkeen jäljellä olevat päivät ja äitiyvvapaan lopetus

      $("#aitysvapaanAlku").text(displayDate(matLeaveBegin));
      $("#aitysvapaanLoppu").text(displayDate(matLeaveEnd));

      $("#yhteisenOsanJako").removeAttr("disabled"); // poistetaan seuraavan lomakkeen syöttökentän disabled-attribuutti
      $("#laskentaNappiParent").removeAttr("disabled"); // poistetaan seuraavan lomakkeen syöttökentän disabled-attribuutti

    } // else:n sulku

  });


  // Vanhempainvapaan laskenta

  formParent.submit(function(event) { // Tämän alle kaikki, mitä tapahtuu Laske-napista
    formParent[0].classList.add("was-validated"); // lisätään lomakkeeseen Bootstrapin CSS-luokka "on validoitu"
    if (formParent[0].checkValidity() === false) {

      event.preventDefault(); // estetään sivun uudellen lataus
    } else {

      event.preventDefault(); // estetään sivun uudellen lataus

      // Laske äidin vanhempainvavpaan osuus sekä aloitus- ja päättymispäivä
      parLeaveMotherDays = parseInt($("#yhteisenOsanJako").val(), 10); // haetaan äidin vanhempainvapaapäivien määrä ja muutetaan se kokonaisluvuksi (10-kanta)
      parLeaveMotherBegin = moment(countForward(matLeaveEnd, 2)); // määrittele äidin vanhempainvapaan alku äitysvapaan päättymispäivän perusteella ja laske seuraava arkipäivä. Kaksi päivää, koska laskentafunktio vähentää loppupäivästä yhden päivän.
      parLeaveMotherEnd = moment(countForward(parLeaveMotherBegin, parLeaveMotherDays)); // lasken äidin vanhempainvavpaan loppupäivä
      if (parLeaveMotherDays === 0) { // if-lauseke, jolla otetaan huomioon nollan vanhempainvapaapäivän laskenta, jossa aloituspäivä on lopetuspäivän jälkeen FIXME: Keksi parempi tapa hoitaa tämä
        $("#aidinVanhempainvapaanAlku").text("");
        $("#aidinVanhempainvapaanLoppu").text("");
      } else {
        $("#aidinVanhempainvapaanAlku").text(displayDate(parLeaveMotherBegin));
        $("#aidinVanhempainvapaanLoppu").text(displayDate(parLeaveMotherEnd));
      }


      //  Laske isön vanhempainvavpaan osuus sekä aloitus- ja päättymispäivä
      parLeaveFatherDays = parLeaveTotDays - parLeaveMotherDays; // lasketaan isän vanhempainvapaapäivien määrä
      parLeaveFatherBegin = moment(countForward(parLeaveMotherEnd, 2)); // määrittele isän vanhempainvapaan alku äidin vanhempainvapaan päättymispäivän perusteella ja laske seuraava arkipäivä. Kaksi päivää, koska laskentafunktio vähentää loppupäivästä yhden päivän.
      parLeaveFatherEnd = moment(countForward(parLeaveFatherBegin, parLeaveFatherDays)); // lasken isän vanhempainvavpaan loppupäivä
      if (parLeaveFatherDays === 0) { // if-lauseke, jolla otetaan huomioon nollan vanhempainvapaapäivän laskenta, jossa aloituspäivä on lopetuspäivän jälkeen FIXME: Keksi parempi tapa hoitaa tämä
        $("#isanVanhempainvapaanAlku").text("");
        $("#isanVanhempainvapaanLoppu").text("");
      } else {
        $("#isanVanhempainvapaanAlku").text(displayDate(parLeaveFatherBegin));
        $("#isanVanhempainvapaanLoppu").text(displayDate(parLeaveFatherEnd));
      }
    } // else:n sulku
  });
});
