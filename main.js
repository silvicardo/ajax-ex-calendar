/**********************************************/
/**********************************************/
/*** PROGETTO: ajax-ex-calendar - main.js ***/
/**********************************************/
/**********************************************/

/* Creare un calendario dinamico con le festività di una nazione, selezionabile da un menu a tendina. Partiamo dal gennaio 2017 dando la possibilità di cambiare mese, gestendo il caso in cui l’API non possa ritornare festività. */

/*
LIbreria Date: https://momentjs.com/ (js base: https://momentjs.com/downloads/moment.min.js)
Holiday API: https://holidayapi.com/ (required params: key, country, year, month)
*/

// API KEY : 08c8428e-02cd-43c9-bd37-680414486a2d
// TEST URL : https://holidayapi.com/v1/holidays?key=08c8428e-02cd-43c9-bd37-680414486a2d&country=US&year=2017&month=12
//required params: key, country, year, month

$(document).ready(function(){
console.log('welcome to ajax-ex-calendar');
})
