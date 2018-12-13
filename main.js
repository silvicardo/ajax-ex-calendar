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

//PROGRAMMA STATICO CON GENNAIO 2017

$(document).ready(function () {
  console.log('welcome to ajax-ex-calendar');

  caricaLingueSupportatePoiAvviaCalendario();


});

//FUNZIONI

//FUNZIONE PRINCIPALE

function caricaLingueSupportatePoiAvviaCalendario() {
  $.get('https://holidayapi.com/', function( data ) {

    var lingueApi = ottieniElencoLingueSupportateDa($.parseHTML(data));

    var lingueMomentJS = moment.locales();
    
    var lingueSupportateProgramma = generaListaLingueProgrammaDa(lingueApi, lingueMomentJS);

    var urlBaseApi = 'https://holidayapi.com/v1/holidays';
    var chiaveApi = '08c8428e-02cd-43c9-bd37-680414486a2d';


    $('#inputMese').change(function () {

      var meseAnno = $(this).val().split('-');

      var apiParameters = {
        key: chiaveApi,
        country: 'IT',
        year: meseAnno[0],
        month : meseAnno[1],
      };
        moment.locale('it');
        console.log(moment.locale());
        console.log(moment.locale());

      $.ajax({
        url: urlBaseApi,
        method: 'GET',
        data: apiParameters,
        success: function (apiData) {

          var meseScelto = creaMeseDa(apiParameters.year,apiParameters.month);

          meseScelto.settimane = completaDati(meseScelto, apiData.holidays);

          console.log(meseScelto);

          //produci h1 .selected_month
          mostraTitoloPer(meseScelto);

          //produci gli li per il mese corrente
          mostraListaGiorniPer(meseScelto);

        },
        error: function(error){
          console.log(error);
        }
      });
    });

  });
}

//LOGICA(MOMENT.JS)
function ottieniElencoLingueSupportateDa(htmlApi) {
  var lingueApi = [];
  $(htmlApi).find('.well-countries a').each(function() {
   var compHref = $(this).attr('href').split('/');
   if (compHref[2].length <= 6){
     lingueApi.push(compHref[2]);
   }
 });

 return lingueApi;
}

function generaListaLingueProgrammaDa(lingueApi, lingueMoment) {
  var lingueProgramma = [];
  for (var i = 0; i < lingueApi.length; i++) {
    if (lingueMoment.includes(lingueApi[i])) {
      lingueProgramma.push(lingueApi[i]);
    }
  }
  return lingueProgramma;
}

function creaMeseDa(anno, nrMese) {

  var mese = moment().year(anno).month(nrMese - 1);

  var meseScelto = {
          nome: moment.months(nrMese - 1),
          numeroMeseNellAnno: parseInt(mese.format('MM')),
          anno: anno,
          numeroDiGiorni: mese.daysInMonth(),
        };

  return meseScelto;
}

function creaGiorniDel(mese) {
  var giorni = [];

  for (var i = 1; i <= mese.numeroDiGiorni; i++) {
    var day = moment(mese.numeroMeseNellAnno + '-' + i + '-' + mese.anno);

    var giorno = {
      nrGiorno: i,
      festivo: false,
      nrGiornoInSettimana: day.format('e'),
      nomeGiornoInSettimana: day.format('dddd'),
    }

    giorni.push(giorno);
  }
  return giorni;
}

//LOGICA DATI API

function completaDati(mese, festivita) {

  var giorni = creaGiorniDel(mese);

  for (var i = 0; i < festivita.length; i++) {
    var festaCorrente = festivita[i];
    var indiceGiornoDiFesta = (parseInt(festaCorrente.date.split('-')[2])) - 1;
    giorni[indiceGiornoDiFesta].festivo = true;
    giorni[indiceGiornoDiFesta].nomeFestivita = festaCorrente.name;
  }

  var settimane = creaSettimaneDa(giorni);

  return settimane;
}

function creaSettimaneDa(giorni) {
  var settimane = [[]];
  var numeroSettimana = 0;

  for (var i = 0; i < giorni.length; i++) {
    if (i != 0 && giorni[i].nrGiornoInSettimana == 0) {
      numeroSettimana++;
      settimane[numeroSettimana] = [];
    }

    settimane[numeroSettimana].push(giorni[i]);
  }

  return settimane;
}

//INTERFACCIA

function mostraTitoloPer(mese) {
  $('.selected_month').remove();
  var htmlTemplateMese = $('#selectedMonth').html();
  var template = Handlebars.compile(htmlTemplateMese);
  var data = {
    month: mese.nome,
    year: mese.anno
  }
  var htmlRisultato = template(data);

  $('.month').append(htmlRisultato)
}

function mostraListaGiorniPer(mese) {
  $('.days .day_item').remove();
  var giorniDelMese = [];
  for (var i = 0; i < mese.settimane.length; i++) {
    giorniDelMese = giorniDelMese.concat(mese.settimane[i]);
  }

  for (var i = 0; i < giorniDelMese.length; i++) {
    var htmlTemplateGiorno = $('#day').html();
    var template = Handlebars.compile(htmlTemplateGiorno);
    var data = {
      number: giorniDelMese[i].nrGiorno,
      month: mese.nome,
    };
    if (giorniDelMese[i].festivo) {
      data.festivity = giorniDelMese[i].nomeFestivita;
    }

    var htmlRisultato = template(data);

    $('.days').append(htmlRisultato);

    if (giorniDelMese[i].festivo) {
      $('.days').children('.day_item').last().addClass('holiday');
    }

  }

}
