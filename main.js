/**********************************************/
/**********************************************/
/**** PROGETTO: ajax-ex-calendar - main.js ****/
/**********************************************/
/**********************************************/

/* Creare un calendario dinamico con le festività di una nazione, selezionabile da un menu a tendina. Partiamo dal gennaio 2017 dando la possibilità di cambiare mese, gestendo il caso in cui l’API non possa ritornare festività.

LIbreria Date: https://momentjs.com/ (js base: https://momentjs.com/downloads/moment.min.js)
Holiday API: https://holidayapi.com/ (required params: key, country, year, month)

API KEY : 08c8428e-02cd-43c9-bd37-680414486a2d
TEST URL : https://holidayapi.com/v1/holidays?key=08c8428e-02cd-43c9-bd37-680414486a2d&country=US&year=2017&month=12
required params: key, country, year, month
*/

/*****************************/
/*PROGRAMMA COMPLETO DINAMICO*/
/*****************************/

$(document).ready(function () {
  console.log('welcome to ajax-ex-calendar');

  caricaLingueSupportatePoiAvviaCalendario();

});

/**********************************/
/*************FUNZIONI*************/
/**********************************/

//FUNZIONE PRINCIPALE

function caricaLingueSupportatePoiAvviaCalendario() {
  //Tramite richiesta Get alla pagina dell'API
  //"Scarico l'html della pagina" e con jQuery individuo le lingue dell'API stessa
  $.get('https://holidayapi.com/', function (data) {

    var lingueApi = ottieniElencoLingueSupportateDa($.parseHTML(data));

    var lingueMomentJS = moment.locales();

    //Le confronto con quelle di Moment.js e creo una lista lingue incrociando le suddette
    var lingueSupportateProgramma = generaListaLingueProgrammaDa(lingueApi, lingueMomentJS);

    //creo la dropdown delle sole lingue supportate
    popolaLista(lingueSupportateProgramma);

    //Creo i parametri per l'API per la prima chiamata
    var apiParameters = {
      urlBaseApi: 'https://holidayapi.com/v1/holidays',
      data: {
        key: 'ec31bd05-cbe6-4c94-8047-0751fdd1736c',
        year: 2017,
        month: 1,
        country: 'IT',
      },
    };

    //effettuo la prima Chiamata e Genero il calendario
    generaMeseCalendarioConChiamataApi(apiParameters);

    //Aggiorno il calendario ascoltando i click sulle frecce e il cambio lingua dal dropdown
    $('.fa-arrow-circle-left, .fa-arrow-circle-right').on('click', aggiornaParametriApiDaClickFrecceERicaricaCalendario);

    $('#languages').on('change', aggiornaLinguaApiERicaricaCAlendario);

    function aggiornaParametriApiDaClickFrecceERicaricaCalendario() {
      var cliccataFrecciaDestra = ($(this).hasClass('fa-arrow-circle-right')) ? true : false;

      if (cliccataFrecciaDestra && !(apiParameters.data.month == 12 && apiParameters.data.year == 2018)){
        if (apiParameters.data.month != 12) {
          apiParameters.data.month++;
        } else {
          apiParameters.data.year++;
          apiParameters.data.month = 1;
        }
      } else if (!cliccataFrecciaDestra) {
        if (apiParameters.data.month != 1) {
          apiParameters.data.month--;
        } else {
          apiParameters.data.year--;
          apiParameters.data.month = 12;
        }
      }

      aggiornaLinguaApiERicaricaCAlendario();
    }

    function aggiornaLinguaApiERicaricaCAlendario() {

      apiParameters.data.country =  $('#languages').val();

      generaMeseCalendarioConChiamataApi(apiParameters);
    }

  });
}

//GESTIONE LINGUE

function ottieniElencoLingueSupportateDa(htmlApi) {
  var lingueApi = [];
  $(htmlApi).find('.well-countries a').each(function() {
   var attributoHrefDiACorrente = $(this).attr('href').split('/');
   if (attributoHrefDiACorrente[2].length <= 6){
     lingueApi.push(attributoHrefDiACorrente[2]);
   }
 });

 return lingueApi;
}

function generaListaLingueProgrammaDa(lingueApi, lingueMoment) {
  var lingueProgramma = [];
  for (var i = 0; i < lingueApi.length; i++) {
    if (lingueMoment.includes(lingueApi[i])) {
      lingueProgramma.push(lingueApi[i].toUpperCase());
    }
  }
  return lingueProgramma;
}

//LOGICA OGGETTO MESE CON MOMENT.JS E DATI FESTIVITA' DA API

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
      nrGiornoInSettimana: parseInt(day.format('e')),
      nomeGiornoInSettimana: day.format('dddd'),
    }

    giorni.push(giorno);
  }
  return giorni;
}

function generaMeseCalendarioConChiamataApi(apiParameters) {

  $.ajax({
    url: apiParameters.urlBaseApi,
    method: 'GET',
    data: apiParameters.data,
    success: function (apiData) {

      moment.locale(apiParameters.data.country);

      var meseScelto = creaMeseDa(apiParameters.data.year, apiParameters.data.month);

      meseScelto.settimane = completaDati(meseScelto, apiData.holidays);

      console.log(meseScelto);

      mostraTitoloPer(meseScelto);

      mostraSettimaneDa(meseScelto);

    },

    error: function (error) {
      console.log(error);
    },

  });
}

function completaDati(mese, festivita) {

  //prima creo un array di giorni
  var giorni = creaGiorniDel(mese);

  //assegno ogni festivita dall'api al giorno corrispondente
  for (var i = 0; i < festivita.length; i++) {
    var festaCorrente = festivita[i];
    var indiceGiornoDiFesta = (parseInt(festaCorrente.date.split('-')[2])) - 1;
    giorni[indiceGiornoDiFesta].festivo = true;
    giorni[indiceGiornoDiFesta].nomeFestivita = festaCorrente.name;
  }

  //con gli oggetti giorni completi delle festività creo le settimane
  var settimane = creaSettimaneDa(giorni);

  //e resituisco l'oggetto settimane(ogni settimana è un oggetto a sua volta)
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
  $('.calendar_header .month .selected_month').remove();
  var htmlTemplateMese = $('#selectedMonth').html();
  var template = Handlebars.compile(htmlTemplateMese);
  var data = {
    month: mese.nome,
    year: mese.anno,
  };

  var htmlRisultato = template(data);

  $('.calendar_header .month').append(htmlRisultato);
}

function mostraSettimaneDa(mese) {
  $('.calendar_body .week .day').remove();
  for (var indiceSettimana = 0; indiceSettimana < mese.settimane.length; indiceSettimana++) {
    var numeroSettimana = indiceSettimana + 1;
    mostraGiorniPer(mese.settimane[indiceSettimana], indiceSettimana, numeroSettimana);
  }
}

function mostraGiorniPer(settimanaNelMese, indiceSettimana, numeroSettimana) {

  //funzioni e valori per gestire l'inizio dei giorni della prima settimana e
  //il loro piazzzmento
  function siamoNellaPrimaSettimana() {
    return indiceSettimana == 0;
  }

  var indiceGiornoPrimaSettimana = 0;
  var posizionePrimoGiornoDellaSettimana = 0;
  if (siamoNellaPrimaSettimana()) {
    posizionePrimoGiornoDellaSettimana = 7 - settimanaNelMese.length;
  }

  //per le 7 caselle di ogni settimana
  for (var i = 0; i < 7; i++) {
    //Gestisco il valore del giorno corrente in base a che siamo nella prima o nelle altre settimane
    //Se nel riempire una casella il giorno non è del mese corrente viene generata una casella con sfondo
    //grigio (ciò avviene grazie al risultare null della var)
    var giornoCorrente = (siamoNellaPrimaSettimana()) ? settimanaNelMese[indiceGiornoPrimaSettimana] : settimanaNelMese[i];

    //Maneggio il template di Handlebars e compilo i suoi valori
    //in base alla settimana corrente e al valore di giorno corrente
    var htmlTemplateSettimana = $('#dayTemplate').html();
    var template = Handlebars.compile(htmlTemplateSettimana);

    var data = {
      nrGiorno: '',
      nrGiornoInSettimana: '',
      nomeGiornoInSettimana: '',
    };

    if (giornoCorrente != null && giornoCorrente.nrGiornoInSettimana == i) {
      data.nrGiorno = giornoCorrente.nrGiorno;
      data.nrGiornoInSettimana = giornoCorrente.nrGiornoInSettimana;
      data.nomeGiornoInSettimana = giornoCorrente.nomeGiornoInSettimana;

      if (giornoCorrente.festivo) {
        data.nomeFestivita = giornoCorrente.nomeFestivita;
      }

      if (siamoNellaPrimaSettimana()) {
        indiceGiornoPrimaSettimana++;
      }
    }

    //Creo html finale e gestendo le classi appendo alla settimana corrente
    var htmlRisultato = template(data);

    var nWeekSelector = '.week:nth-of-type(' + numeroSettimana + ')';

    $(nWeekSelector).append(htmlRisultato);

    if (giornoCorrente != null && giornoCorrente.nrGiornoInSettimana == i) {
      $(nWeekSelector).children('.day').last().addClass('active');

      if (giornoCorrente.festivo) {
        $(nWeekSelector).children('.day').last().addClass('holiday');
      }
    } else {
      $(nWeekSelector).children('.day').last().addClass('bg_grey').find('*').each(function () {
        $(this).addClass('empty_square');
      });
    }
  }

  //Gestisco la visibilita dell'ultima riga
  if (numeroSettimana >= 5) {
    if ($('.week.sixth').children('.day').length > 0 ) {
      $('.week.sixth').removeClass('hidden');
    } else {
      $('.week.sixth').addClass('hidden');
    }
  }
}

function popolaLista(lingue) {
  for (var i = 0; i < lingue.length; i++) {

    var cloneTemplateLingua = $('#languages .language.template').clone();

    cloneTemplateLingua.removeClass('template').attr('value', lingue[i]).text(lingue[i]);

    $('#languages').append(cloneTemplateLingua);
  }
}
