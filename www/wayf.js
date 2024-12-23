/**
 * wayf.js
 *
 * javascript version of WAYF
 *
 * @version 1.1 2013 - 2022
 * @author Jan Chvojka jan.chvojka@cesnet.cz
 * @author Pavel Polacek pavel.polacek@ujep.cz
 * @see getMD - TODO: add link - prepares feed for WAYF
 * @see Mobile Detect - TODO: add link - browser detection
 *
 */



var wayf = "";
var showedIdpList;
var languages = new Array("en", "cs");
var langsAvailable = {
  'cs': { 'img':'flags/cs.png', 'name':'Čeština' },
  'de': { 'img':'flags/de.png', 'name':'Deutsch' },
  'el': { 'img':'flags/el.png', 'name':'Ελληνικά' },
  'en': { 'img':'flags/en.png', 'name':'English' },
  'es': { 'img':'flags/es.png', 'name':'Español' },
  'fr': { 'img':'flags/fr.png', 'name':'Français' },
  'it': { 'img':'flags/it.png', 'name':'Italiano' },
  'lt': { 'img':'flags/lt.png', 'name':'Lietuvių' },
  'nl': { 'img':'flags/nl.png', 'name':'Nederlands' },
  'sv': { 'img':'flags/sv.png', 'name':'Svenska' }
}
  
var fallbackLanguage = "en";
var labels = {
    'BUTTON_NEXT': {'cs':'Jiný účet', 'en':'Another account', 'it':'Altro account', 'nl':'Ander account', 'fr':'Un autre compte', 'el':'Άλλος λογαριασμός', 'de':'Anderes Konto', 'lt':'Kita paskyra', 'es':'Otra cuenta', 'sv':'Annat konto' },
    'TEXT_ALL_IDPS': {'cs':'Přihlásit účtem', 'en':'Log in with', 'it':'Login tramite', 'nl':'Login met', 'fr':'S’authentifier avec', 'el':'Σύνδεση μέσω', 'de':'Anmelden mit', 'lt':'Prisijungti su', 'es':'Acceder con', 'sv':'Logga in med' },
    'TEXT_ACCOUNT': {'cs':'Zřídit účet', 'en':'Create account', 'it':'Crea account', 'nl':'Maak account aan', 'fr':'Créer un compte', 'el':'Δημιουργία λογαριασμού', 'de':'Konto kreieren', 'lt':'Sukurti paskyrą', 'es':'Crear cuenta', 'sv':'Skapa konto' },
    'TEXT_SAVED_IDPS': {'cs':'Přihlásit účtem', 'en':'Log in with', 'it':'Login tramite', 'nl':'Login met', 'fr':'S’authentifier avec', 'el':'Σύνδεση μέσω', 'de':'Anmelden mit', 'lt':'Prisijungti su', 'es':'Acceder con', 'sv':'Logga in med' },
    'SETUP': {'cs':'Nastavení', 'en':'Setup', 'it':'Setup', 'nl':'Maak aan', 'fr':'Configurer', 'el':'Παραμετροποίηση', 'de':'Einstellungen', 'lt':'Nustatymai', 'es':'Configurar', 'sv':'Inställningar' },
    'CONFIRM_DELETE': {'cs':'Zapomenout ', 'en':'Forget ', 'it':'Dimentica ', 'nl':'Vergeet ', 'fr':'Enlever ', 'el':'Διαγραφή ', 'de':'Lösche ', 'lt':'Pamiršti ', 'es':'Olvidar ', 'sv':'Glöm' },
    'BACK_TITLE': {'cs':'Zpět', 'en':'Back', 'it':'Indietro', 'nl':'Terug', 'fr':'Retour', 'el':'Πίσω', 'de':'Zurück', 'lt':'Atgal', 'es':'Atrás', 'sv':'Tillbaka' },
    'NOT_AVAILABLE': {'cs':'K této službě se nelze přihlásit pomocí', 'en':'Service is not available for', 'it':'Il servizio non è disponibile per', 'nl':'Service is niet beschikbaar', 'fr':'Service non fonctionnel pour', 'el':'Ο Πάροχος Ταυτότητας δεν είναι διαθέσιμος για αυτή την υπηρεσία', 'de':'Dienst ist nicht verfügbar für', 'lt':'Paslauga neteikiama', 'es':'Servicio no disponible para', 'sv':'Tjänsten är inte tillgänglig för' },
    'LOADING': {'cs': 'Načítám instituce ...', 'en':'LOADING ...', 'it':' Caricamento ...', 'nl':'Aan het laden', 'fr':'Chargement en cours', 'el':'ΦΟΡΤΩΣΗ ...', 'de':'Laden ...', 'lt':'KRAUNAMA ...', 'es':'CARGANDO...', 'sv':'Läser in...' },
    'GDPR_TEXT': {'cs': 'Zpracování osobních údajů', 'en':'Personal data processing', 'it':'Personal data processing', 'nl':'Personal data processing', 'fr':'Personal data processing', 'el':'Personal data processing', 'de':'Personal data processing', 'lt':'Personal data processing', 'es':'Personal data processing', 'sv':'Personal data processing' },
    'GDPR_LINK': {'cs': 'https://www.cesnet.cz/zpracovani-osobnich-udaju/cookies', 'en':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'it':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'nl':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'fr':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'el':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'de':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'lt':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'es':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en', 'sv':'https://www.cesnet.cz/personal-data-processing/cookies-en/?lang=en' }
}

var mobileVersion = true;
var hostelEntityID = "https://idp.hostel.eduid.cz/idp/shibboleth";
var inIframe = false;
var feedCount = 0;  // number feed to download 
var filterVersion = 1;  // default original version, not suitable for all cases

var logos = new Object();  // temporary array for logos
var noImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var loadingImage = 'data:image/gif;base64,R0lGODlhEAAQAPIAAM7a5wAAAJ2msDU4PAAAAE9UWWlvdnZ9hCH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==';
var missingLogo = "logo/missing.png";

var hideFromDiscoveryCategory = "http://refeds.org/category/hide-from-discovery";

/* some variables are coming from wayf.php, for example returnURL */
var returnUrlParamCharacter = "&";
if( returnURL.indexOf( "?" ) == -1 ) {
  returnUrlParamCharacter = "?";
}

// check support of Array.prototype, otherwise use 3rd implementation
if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) {
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

/** function toAscii - primitive transformation of international characters
  *
  * @param data - dato to transformation
  * @return clear ascii text
  */
var map = {
    "Á": "A",
    "Å": "A",
    "Č": "C",
    "Ď": "D",
    "É": "E",
    "Ě": "E",
    "Í": "I",
    "Ň": "N",
    "Ó": "O",
    "Ö": "O",
    "Ř": "R",
    "Š": "S",
    "Ť": "T",
    "Ú": "U",
    "Ý": "Y",
    "Ž": "Z"
  };

function replaceEntity(chr) {
  return map[chr];
}

function toAscii(data) {
  var ret = data;
  return ret.replace(/[ÁÅČĎÉĚÍŃÓÖŘŠŤÚÝŽ]/g, replaceEntity );
}

/** function isInIframe - returns true if script is embedded in frame
  */
function isInIframe() {
    try {
        if(top.location.href != window.location.href) {
            return true;
        }
        return false;
    } catch (e) {
        return true;
    }
}

/** function getAllFeeds - returns all feeds
  */
function getAllFeeds() {
    var ret = Array();
    base = "/feed/";
    if( typeof feeds !== 'undefined' ) {
      for(feed in feeds) {
        ret[feed] = base + feed+ ".js";
      }
    }
    return ret;
}

function Persistor() {
}

Persistor.prototype.getItem = function(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
    }
}

Persistor.prototype.setItem = function(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
}

Persistor.prototype.removeItem = function(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
}

/** Object View - what user see
  */
function View(divId) {
    this.divId = divId;
    var wayDiv = document.getElementById(divId);
    this.wayfDiv = wayDiv;
}

/** function View.prototype.addButton - insert button 
  */
View.prototype.addButton = function(label) {
    var bWrap = document.createElement('div');
    bWrap.className = "bwrap";

    var nb = document.createElement('button');
    nb.className = "button";

    var nlabel = document.createElement('label');
    nlabel.className = "label";
    nlabel.innerHTML = label;
    var tgt = this.target;
    nb.onclick = function() {
        wayf.listAllIdps(true);
    };
    nb.appendChild(nlabel);
    bWrap.appendChild(nb);


    if(this.bottom.hasChildNodes()) {
        var f = this.bottom.firstChild;
        this.bottom.insertBefore(bWrap, f);
    }
    else {
        this.bottom.appendChild(bWrap);
    }
}

View.prototype.createSetupList = function() {
    wayf.listSavedIdps(true,true);
}

/** function View.prototype.createContainer - generate <div> container for IdP list
  */
View.prototype.createContainer = function(label, showSetup, showClosing, isSetup, isListAll, langCallback) {

    this.wayfDiv = document.createElement('div');
    this.wayfDiv.id = "wayf";

    var top = document.createElement('div');
    top.className = "top";

    if(showClosing && isSetup) {
        var closeEFiller = document.createElement('span');
        closeEFiller.className = "closeEfiller";
        closeEFiller.innerHTML = "↲";
        var closeE = document.createElement('span');
        closeE.className = "closeE";
        closeE.innerHTML = "↲";
        closeE.title = this.getLabelText("BACK_TITLE");
        var callback = (function() {
            return function() {
                if(wayf.userHasSavedIdps()) {
                    wayf.listSavedIdps(false,true);
                } else {
                    wayf.listAllIdps(false);
                }
            }
        })();
        closeE.onclick = callback;
    }

    var title = document.createElement('p');
    title.className = "toptitle";
    title.style.width = "96%";
    // title.innerHTML = label;

    var toplabel = document.createElement('span');
    toplabel.innerHTML = label;
    toplabel.className = "toplabel";

    /* search field */
    var search = document.createElement('input');
    search.className = "topsearch";
    //search.style.backgroundRepeat="no-repeat";
    // search.style.backgroundPosition="right";
    // search.style.backgroundImage="url('search.png')";
    // search.style.borderRadius="3px";
    // search.style.borderStyle="1px solid #bbb";
    // search.style.position="relative";
    // search.style.cssFloat="right";
    // search.style.visibility = "visible";
    // search.style.width="200px";
    // search.style.fontSize="14px";

    if( noSearch ) {
      search.style.visibility = "hidden";
    }

    if( noSearchSavedIdps ) {
      search.style.visibility = "hidden";
    }

    this.bottom = document.createElement('div');
    this.bottom.className = "bottom";

    var setup = document.createElement('div');
    setup.className = "setup";
    setup.onclick = (function() {
        return function() {
            wayf.view.createSetupList();
        }
    })();

    var help = document.createElement('p');
    help.id = 'help';

    // if customLogo is defined, then rewrite image per SP entityID
    if( typeof customLogo !== 'undefined' && SPentityID && typeof customLogo[ SPentityID ] !== 'undefined' ) {  
      if( typeof customLogo[ SPentityID ]["Image"] !== 'undefined' ) {
        organizationHelpImage = customLogo[ SPentityID ]["Image"];
      }
      if( typeof customLogo[ SPentityID ]["Link"] !== 'undefined' ) {
        organizationHelpLink = customLogo[ SPentityID ]["Link"];
      }
      if( typeof customLogo[ SPentityID ]["Label"] !== 'undefined' ) {
        organizationLabel = customLogo[ SPentityID ]["Label"];
      }
       if( typeof customLogo[ SPentityID ]["ImageAlt"] !== 'undefined' ) {
        organizationHelpImageAlt = customLogo[ SPentityID ]["ImageAlt"];
      }
      
    }

    var cesnetLink = document.createElement('a');
    cesnetLink.href = organizationHelpLink;  // comes from wayf_vars.php
    cesnetLink.target="_blank";
    cesnetLink.id = "helpa";

    var sc = document.createElement('span');
    sc.id = 'helps';

    sc.innerHTML = organizationLabel;  // comes from wayf_vars.php
    cesnetLink.appendChild(sc);

    var helpImage = document.createElement('img');
    helpImage.className = "helpimg";
    helpImage.src = organizationHelpImage;
    helpImage.alt = organizationHelpImageAlt;
    helpImage.id = "helpi";

    cesnetLink.appendChild(helpImage);
    help.appendChild(cesnetLink);


    // GDPR cookie link
    var cookieBar = document.createElement('span');
    var cookieLink = document.createElement('a');
    cookieLink.href = this.getLabelText('GDPR_LINK');
    cookieLink.target="_blank";
    cookieLink.id = "cookielink";
    var cookieText = document.createTextNode(this.getLabelText('GDPR_TEXT'));
    cookieLink.append(cookieText);
    cookieBar.appendChild(cookieLink);
    cookieBar.id = "cookiebar";
    
    this.content = document.createElement('div');
    this.content.className = "content";

    var topFiller = document.createElement("div");
    topFiller.className= "topfiller";

    var bottomFiller = document.createElement("div");
    bottomFiller.className= "bottomfiller";

    this.scroller = document.createElement('div');
    this.scroller.className = "scroller";


    this.mixelaHash = new Object();
    this.keySorted = new Object();  // result of sorting

    if(showSetup) {
        this.bottom.appendChild(setup);
    }

    /* style of ui selector */
    if( langStyle === "dropdown" ) {
      var langDropdown = document.createElement('div');
      langDropdown.className = "dropdown";
      langDropdown.onclick = (function() {
          var langDrop = langDropdown;
          return function() {
            langDrop.style.display = "block";
          }
        })();

      var langSpan = document.createElement('span');
      langSpan.innerHTML = prefLang;
      langDropdown.appendChild( langSpan );
      
      var langDropdownContent = document.createElement('div');
      langDropdownContent.className = "dropdown-content";
  
       for(var curLang in langsAvailable) {
        var spanLang = document.createElement('span');
        spanLang.innerHTML = curLang;
        spanLang.className = "span-lang";
        spanLang.onclick = (function() {
          var lang = curLang;
          return function() {
            prefLang = lang;
            langCallback();
          }
        })();

        langDropdownContent.appendChild( spanLang );
      }

      langDropdown.appendChild( langDropdownContent );

      this.bottom.appendChild( langDropdown );
     //var flagImg = new Array();

    } 
    if( langStyle === "txt" ) {
      var select = document.createElement('select');
      select.className = "lang";
      select.id = "selLang";
      select.onchange = (function() {
          var mySelect = select;
          return function() {
            if( mySelect.selectedOptions.length == 1 ) {
              prefLang = mySelect.selectedOptions[0].value;
              langCallback();
            }
          }
        })();

      for(var curLang in langsAvailable) {
        var divSelect = document.createElement('div');
        divSelect.className = "lang";
        var option = document.createElement('option');
        option.value = curLang;
        option.innerHTML = langsAvailable[ curLang ].name;
        option.onchange = (function() {
          var lang = curLang;
          return function() {
            prefLang = lang;
            langCallback();
          }
        })();

        if( curLang === prefLang ) option.selected = true;
        select.appendChild( option ); 
      }
      divSelect.appendChild( select );
      this.bottom.appendChild( divSelect );
    } 
    if( langStyle === "img" ) {
      for(var curLang in langsAvailable) {
        var flag = document.createElement('div');
        flag.className = "lang";
        // flag.style.margin="3px";
    
        var flagImg = document.createElement('img');
        flagImg.src = langsAvailable[curLang].img;
        flagImg.onclick = (function() {
          var lang = curLang;
          return function() {
            prefLang = lang;
            langCallback();
          }
        })();
  
        flag.appendChild( flagImg );
     
        // langDropdownContent.appendChild( flag );
        this.bottom.appendChild( flag );
     
      }
    }

    // langDropdown.appendChild( langDropdownContent );

    top.appendChild(title);
    title.appendChild(search);
    title.appendChild(toplabel);

    if(showClosing && isSetup) {
        if(inIframe) {
            this.wayfDiv.appendChild(closeEFiller);
            this.wayfDiv.appendChild(closeE);
        } else {
            top.appendChild(closeE);
        }
    }

    this.wayfDiv.appendChild(top);
    this.content.appendChild(topFiller);
    this.content.appendChild(this.scroller);
    this.content.appendChild(bottomFiller);
    this.wayfDiv.appendChild(this.content);

    //this.bottom.appendChild(langCS);
    //this.bottom.appendChild(langEN);
    this.bottom.appendChild(help);
    this.bottom.appendChild(cookieBar);

    this.wayfDiv.appendChild(this.bottom);

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(this.wayfDiv);

    $( ".content" ).scroll( function() {
      loadVisibleLogos(); }  
    );

    $( ".content" ).on('touchend', function() {
      loadVisibleLogos(); }  
    );

    $( document.body ).off( "keyup" ).keyup( function(e) {

        var act = $( ".selected" );
        var keyUpOrDown = false;
        if( act.length > 0 ) {
          var newAct = act;
  
          // if pressed key is enter
          if( e.which === 13 ) {
            // $( ".scroller" ).children( "div:visible" ).first().click();
            act.click();
            return;
          }
          // 38 -up, 40 - down
  /*       if( isListAll ) { */
           // listAllIdps()
           var ind = $( ".enabled:visible" ).index( act );
           var length = $( ".enabled:visible").length;
           if( e.which === 40 ) {
             keyUpOrDown = true;
             var next = $( ".enabled:visible" ).eq(ind+1);
             if(( ind+1 ) >= length ) {
               next = $( ".enabled:visible" ).eq(0);  // go to first record
             }
             if( next.length === 1 ) {
               act.removeClass( "selected" );
               next.addClass( "selected" );
               newAct = next;
             }
           }
           if( e.which === 38 ) {
             keyUpOrDown = true;
             var prev = $( ".enabled:visible" ).eq(ind-1);
             if(( ind-1 ) < 0 ) {
               prev = $( ".enabled:visible" ).eq( length-1 );
             }
             if( prev.length === 1 ) {
               act.removeClass( "selected" );
               prev.addClass( "selected" );
               newAct = prev;
             }
           }
  
           var relativePosition = newAct.offset().top;
           var divContent = $( "div.content" );
           // console.log( relativePosition );
           // console.log( divContent[0].scrollTop  );
           $( "div.content" ).scrollTop( divContent[0].scrollTop + newAct.offset().top - 200 ); 
         }

         if( ! keyUpOrDown ) {
           if(( isListAll && (! noSearch )) || (( ! isListAll ) && (! noSearchSavedIdps ))) {
             var searchFor = search.value; // $( ".topsearch" ).val();
             searchAuto( searchFor, wayf, null, true );
             loadVisibleLogos();
             act.removeClass("selected" );
             $( ".enabled:visible" ).eq(0).addClass("selected");
           }
         }

    } );


}

/** function View.prototype.deleteContainer - destroy <div> container from page
  */
View.prototype.deleteContainer = function() {
    if(this.wayfDiv == null) {
       return;
    }
    try {
        if(inIframe) {
            this.wayfDiv.parentNode.removeChild(this.wayfDiv);
        }
        else {
            document.body.removeChild(this.wayfDiv);
        }
    }
    catch(e) {
    }
}

/** function View.prototype.addIdpToList - insert one Idp to list of Idp in container
  */
View.prototype.addIdpToList = function(eid, logoSource, label, callback, showDeleteIcon, enabled) {

    if(typeof label == 'undefined') {
	return;
    }

    var idpDiv = document.createElement('div');
    idpDiv.id = eid;
    if(enabled) {
        idpDiv.className = "enabled";
        idpDiv.title = label;
    }
    else {
        if (hideFiltered) {
            return;
        }
        idpDiv.className = "disabled";
        idpDiv.title = this.getLabelText( "NOT_AVAILABLE" ) + ' - ' + label;
    }
    if(callback != null) {
        idpDiv.onclick = callback;
    }


    var logo = document.createElement('img');
    logo.className = "logo";
    if( logoSource == missingLogo ) {
      logo.src = noImage;
    } else {
      logo.src = loadingImage;
    }
    logos[ eid ] = logoSource;

    var idpName = document.createElement('span');
    idpName.className = "title";
    idpName.innerHTML = label;

    var hr = document.createElement('hr');
    idpDiv.appendChild(logo);
    idpDiv.appendChild(idpName);

    if(showDeleteIcon) {
        var trashIcon = document.createElement('img');
        trashIcon.className = "trashicon";
        trashIcon.src = "trash_48.png";
        idpDiv.appendChild(trashIcon);
    }

    idpDiv.appendChild(hr);

    /* idp zaradime abecedne do seznamu bez ohledu na nabodenicka */
    var upLabel = toAscii(label.toUpperCase());

    /* first full hash array, sort and full list */
    this.mixelaHash[ upLabel ] = idpDiv;

}

/** function View.prototype.addTopLabel - insert top label to container
  */
View.prototype.addTopLabel = function(text) {
    var topFix = document.createElement('div');
    topFix.className = "topfix";
    var topLabel = document.createElement('div');
    topLabel.className = "toplabel";
    var listLabel = document.createElement('span');
    listLabel.className = "listlabel";
    listLabel.innerHTML = text;
    topLabel.appendChild(listLabel);
    topFix.appendChild(topLabel);
    this.listDiv.appendChild(topFix);
}

/** function View.prototype.getLabelText - get message statically defined on top of this file (variable labels)
  */
View.prototype.getLabelText = function(id) {
    var lab = labels[id];
    if(lab == null) {
        return "";
    }
    if(prefLang != "") {
        var txt = lab[prefLang];
        if(txt != null) {
            return txt;
        }
    }
    for(var l in languages) {
        var lang = languages[l];
        var txt = lab[lang];
        if(txt != null) {
            return txt
        }
    }
    if(lab[fallbackLanguage] != null) {
        return lab[fallbackLanguage];
    }
    for(var l in lab) {
        return lab[l];
    }
}

/* loadImages whes is visible */
$.fn.isInViewport = function() {
  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();
  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).outerHeight();
  return elementBottom > viewportTop && elementTop < viewportBottom;
};

function loadVisibleLogos() { 
  $( ".scroller" ).children().each( function() {
    // test if is already loaded
    if( typeof logos[ this.id ] !==  "undefined" ) {
      if( $( this ).isInViewport() ) {
        // console.log( this.id );
        // download and show logo of IdP
        this.children["0"].src = logos[ this.id ];
        delete logos[ this.id ];
      }
    }
  } );
} 
    
/** Contructor of object Wayf
  */
function Wayf(divName) {
    this.feedData = new Array();
    this.divName = divName;
    this.ETAG = 'Etag';
    this.LASTMOD = 'Last-Modified';
    this.METHOD_GET = 'GET';
    this.HEADER_ETAG = 'If-None-Match';
    this.LOGO_SUFFIX_SMALL = "";
    this.LOGO_SUFFIX_BIG = "";
    this.persistor = new Persistor();
    this.view = new View(divName);
    this.selectedIdps = new Object();  // list of idps, only ones added to view by addIdpToList(), caching results
    this.lastSearch = '';  // last search string 
    var ifr = false;
    var cssFile = "";

    this.deleteHostelIdp();
    if(inIframe) {
        ifr = true;
        this.view.target = window.parent;
    }
    else {
        this.view.target = window;
    }
    if(isMobile) {
        if(osType == "android") {
            cssFile = 'android.css';
        } else {
            cssFile = 'mobile.css';
        }
    } else {
        if(ifr) {
            cssFile = 'computer-iframe.css';
        }
        else {
            cssFile = 'computer.css';
        }
    }

    var cssId = 'myCss'; 
    if (!document.getElementById(cssId)) {
        var head  = document.getElementsByTagName('head')[0];
        var linkWayf = document.createElement('link');
        linkWayf.id = 'wayfCss';
        linkWayf.rel  = 'stylesheet';
        linkWayf.type = 'text/css';
        linkWayf.href = serverURL + 'wayf.css';
        linkWayf.media = 'all';
        head.appendChild(linkWayf);
       
        var link  = document.createElement('link');
        link.id   = cssId;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = serverURL + cssFile;
        link.media = 'all';
        head.appendChild(link);
    }
}

Wayf.prototype.getQueryVariable = function(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return "";
}

/** function Wayf.prototype.saveUsedIdp - save selected IdP to local persistant memory
  */
Wayf.prototype.saveUsedIdp = function(feedId, id) {
    var date = new Date();
    var time = date.getTime();
    var changeIdp = true;
    try {
        var usedIdps = wayf.persistor.getItem("usedIdps");
    }
    catch(err) {
    }
    var key = id;
    var usedIdpsObj;
    var idp;
    if(usedIdps == null) {
        usedIdpsObj = new Object;
        idp = new Object();
        idp.entity = wayf.feedData[feedId].mdSet.entities[id];
        wayf.getBase64Image(idp.entity.logo + "_b64", 0);
    }
    else {
        usedIdpsObj = JSON.parse(usedIdps);
        idp = null;
        try {
            idp = usedIdpsObj[id];
        }
        catch(err) {
        }
        if(idp == null) {
            idp = new Object();
            wayf.getBase64Image(wayf.feedData[feedId].mdSet.entities[id].logo + "_b64", 0);
        }
        else {
            wayf.blogo = idp.logo;
            wayf.etag = idp.logo_etag;
            wayf.getBase64Image(idp.entity.logo + "_b64", idp.logo_etag);
            changeIdp = false;
        }
    }
    idp.logo = wayf.blogo;
    idp.logo_etag = wayf.blogo_etag;
    idp.lastused = time;
    try {
        idp.entity = wayf.feedData[feedId].mdSet.entities[id];
    }
    catch(err) {
    }
    usedIdpsObj[key] = idp;
    wayf.persistor.setItem("usedIdps", JSON.stringify(usedIdpsObj));
}

/** function Wayf.prototype.deleteUsedIdp - dalete selected IdP from local persistant memory
  */
Wayf.prototype.deleteUsedIdp = function(id) {
    try {
        var usedIdps = this.persistor.getItem("usedIdps");
        var usedIdpsObj = JSON.parse(usedIdps);
        var isValidEntity = false;
        var entity = usedIdpsObj[id]['entity'];
        var label;
        if( typeof entity == "undefined" ) {
          isValidEntity = true;
        } else { 
          label = this.getLabelFromLabels(entity.label);
        }

        if(isValidEntity || (confirm(this.view.getLabelText("CONFIRM_DELETE") + label + "?"))) {
            var usedIdpsObj = JSON.parse(usedIdps);
            var newUsedIdpsObj = new Object();
            var haveData = false;
            for(var key in usedIdpsObj)  {
                if(key != id) {
                    var val = usedIdpsObj[key];
                    newUsedIdpsObj[key] = val;
                    haveData = true;
                }
            }
            this.persistor.removeItem("usedIdps");
            if(haveData) {
                this.persistor.setItem("usedIdps", JSON.stringify(newUsedIdpsObj));
                this.usedIdps = newUsedIdpsObj;
                this.listSavedIdps(true,true);
            }
            else {
                this.listAllIdps(false);
            }
        }
    }
    catch(err) {
        return;
    }
}

/** function Wayf.prototype.deleteHostelIdp - dalete Hostel IdP from local persistant memory
 */
Wayf.prototype.deleteHostelIdp = function() {
    try {
        var id = hostelEntityID;
        var usedIdps = this.persistor.getItem("usedIdps");
        var usedIdpsObj = JSON.parse(usedIdps);
        var isValidEntity = false;
        var entity = usedIdpsObj[id]['entity'];
        var label;


        var usedIdpsObj = JSON.parse(usedIdps);
        var newUsedIdpsObj = new Object();
        var haveData = false;
        for(var key in usedIdpsObj)  {
            if(key != id) {
                var val = usedIdpsObj[key];
                newUsedIdpsObj[key] = val;
                haveData = true;
            }
        }
        this.persistor.removeItem("usedIdps");
        if(haveData) {
            this.persistor.setItem("usedIdps", JSON.stringify(newUsedIdpsObj));
        }
    }
    catch(err) {
        return;
    }
}


/** function Wayf.prototype.isIdpInFeed - return true if IdP is in locally stored feed
  */
Wayf.prototype.isIdpInFeed = function(idp, feed) {
    var feedStr = wayf.persistor.getItem("saved@" + feed);
    if(feedStr == null) {
        return false;
    }
    else {
        var tmpFeedData = JSON.parse(feedStr);
        if(idp in tmpFeedData["mdSet"]["entities"]) {
            return true;
        }
    }
    return false;
}

/** function Wayf.prototype.isInEc - exist EC in allowEC/denyEC?
  */
Wayf.prototype.isInEc = function( allowOrDenyEcArray, ecArray ) {
  for( var ec in ecArray ) {
    if( allowOrDenyEcArray.indexOf(ecArray[ec])>=0) {
      return true;
    }
  }
  return false;
}

/** function Wayf.prototype.isInRA - exist RA in allowRA/denyRA?
  */
Wayf.prototype.isInRA = function( allowOrDenyRaArray, ra ) {
  if( allowOrDenyRaArray.indexOf(ra)>=0) 
    return true;

  return false;
}

Wayf.prototype.listAllData = function(feedId, mdSet) {
    var idpFilter = false;
    var filterDenyIdps = false;  // particular deny Idp filter
    var filterAllowIdps = false; // particular allow Idp filter
    var filterAllowEC = false;  // Allow EntityCategory filter
    var filterDenyEC = false;  // Deny EntityCategory filter
    var filterAllowRA = false;  // Allow RegistrationAuthority filter
    var filterDenyRA = false;  // Deny RegistrationAythority filter
    var filterHideFromDiscovery = true;  // Filter entity-category hide-from-discovery by default

    if( useFilter ) {
      if( filterVersion == "2" ) {
        // exist denyIdPs?
        if( typeof filter.allowFeeds[feedId].denyIdPs !== "undefined" ) {
          filterDenyIdps = true;
        } else {
          // exist allowIdPs?
          // deny has higher priority
          if( typeof filter.allowFeeds[feedId].allowIdPs !== "undefined" ) {
            filterAllowIdps = true;
          }
        }

        // exist denyEC?
        if( typeof filter.allowFeeds[feedId].denyEC !== "undefined" ) {
          filterDenyEC = true;
        }

        // exist allowEC?
        if( typeof filter.allowFeeds[feedId].allowEC !== "undefined" ) {
          filterAllowEC = true;
          // disable filter out hide-from-discovery
          if( filter.allowFeeds[feedId].allowEC.indexOf( hideFromDiscoveryCategory ) >= 0 ) {
            filterHideFromDiscovery = false;
            // singular case, allowed is only HfD, it is non-sense
            if( filter.allowFeeds[feedId].allowEC.length == 1 ) {
              filterAllowEC = false;
            }
          }
        }

        // exist denyRA?
        if( typeof filter.allowFeeds[feedId].denyRA !== "undefined" ) {
          filterDenyRA = true;
        }
        // exist allowRA?
        if( typeof filter.allowFeeds[feedId].allowRA !== "undefined" ) {
          filterAllowRA = true;
        }

      } else {
        // filter v1
        if( ("allowIdPs" in filter)) {
          idpFilter = true;
        }
      }
    }

    for(var eid in mdSet.entities) {
        if(eid == "indexOf") {
            continue;
        }

        if( filterVersion == "2" ) {
          // denyIdPs is used
          if( filterDenyIdps && filter.allowFeeds[feedId].denyIdPs.indexOf(eid) >= 0 ) {
              continue;
          } else {

            // allowIdPs per feed
            if( filterAllowIdps ) { 

              if( filter.allowFeeds[feedId].allowIdPs.indexOf(eid)>=0 || (filterAllowEC && wayf.isInEc( filter.allowFeeds[feedId].allowEC, mdSet.entities[eid].EC )) || (filterAllowRA && wayf.isInRA( filter.allowFeeds[feedId].allowRA, mdSet.entities[eid].RA ))) {
                // nothing, too complex if
              } else {
                continue;
              } 
            } else {
  
              // RegistrationAuthority, first remove denyRA, then add allowRA
              if( filterDenyRA && wayf.isInRA( filter.allowFeeds[feedId].denyRA, mdSet.entities[eid].RA )) {
                continue;
              }
              if( filterAllowRA && wayf.isInRA( filter.allowFeeds[feedId].allowRA, mdSet.entities[eid].RA )==false) {
                continue;
              }

              // entity category, first remove denyEC, then add allowEC
              if( filterDenyEC && wayf.isInEc( filter.allowFeeds[feedId].denyEC, mdSet.entities[eid].EC )) {
                continue;
              }
              if( filterAllowEC && wayf.isInEc( filter.allowFeeds[feedId].allowEC, mdSet.entities[eid].EC )==false) {
                continue;
              }
            }
          }
        } else {
          // filter v1
          if(idpFilter && filter.allowIdPs.indexOf(eid)<0) {
            continue;
          }
        }
        // filter out hide-from-discovery IdP
        if( filterHideFromDiscovery && ( typeof mdSet.entities[eid].EC !== "undefined" ) && ( mdSet.entities[eid].EC.indexOf( hideFromDiscoveryCategory ) >= 0 )) {
          continue;
        }

        var entity = mdSet.entities[eid];
        var logoSource = entity.logo;
        var label = this.getLabelFromLabels(entity.label);
        var url = this.createEntityLink(eid);
        var tgt = this.view.target;
        var callback = (function() {
            var veid = eid;
            var murl = url;
            var tgrt = tgt;
            return function() {
                try {
                    wayf.saveUsedIdp(feedId, veid);
                }
                catch(err) {
                }
                tgrt.location = murl;
            }
        })();
        this.selectedIdps[ eid ] = entity.label;
        this.view.addIdpToList(eid, logoSource, label, callback, false, true);
    }

}

/** function getFilterVersion - return version of filter
  */
function getFilterVersion() {
  if( typeof filter !== "undefined" ) { 
    if( typeof(filter.ver) !== "undefined" && filter.ver == "2" ) {
      return 2;
    }    
  }
  return 1;  // default version
}

/** function listData - starts here - onload page
  */
function listData() {
    if( typeof alertDsx !== 'undefined' && alertDsx == true ) {
      alert('As announced in March 2020 on the DSX web page and to the SP administrators, the DSX Discovery Service was officially decommissioned on December 31st 2020 and it was shut down on February 1st. \n\nWe suggest to use alternative Discovery Service like the SeamlessAccess Discovery Service (https://seamlessaccess.org/). \n\nContact: support@edugain.org');
    }

    inIframe = isInIframe();  // running in IFRAME?
    filterVersion = getFilterVersion();
    wayf = new Wayf('wayf');
    if(wayf.userHasSavedIdps()) { 
        noSearchSavedIdps = true;
        wayf.listSavedIdps(false,false);  // display saved IdPs
    }
    else {
        wayf.listAllIdps(false);  // display All IdPs in feeds
    }
}

// special characters must be escaped in id selector; source http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/
function escapeJquerySelectorsId( myid ) {
  return "#" + myid.replace( /(:|\.|\[|\])/g, "\\$1" );
}

function searchAuto( query, wayf, callback, saveQuery ) {
  var result = [];
  var usedIdps = wayf.usedIdps;

  var length_old = wayf.lastSearch.length;
  var length = query.length;

  wayf.lastSearch = query;

  if( length < 2 ) {
    if( length_old < 2 ) {
      return;
    } else {
      query = "";
    }
  }

  //var regexp_query = new RegExp( query, "i" );
  var queryArray = query.split(" ");
  var idScroller = document.getElementsByClassName('scroller')[0];
  var frag = document.createDocumentFragment();  
  var fragScroller = document.createElement('div');
  fragScroller.className = "scroller";
  frag.appendChild( fragScroller );

  if( query.length ) {
    $( ".topsearch").css( "background-Image", "none");
  } else {
    $( ".topsearch").css( "background-Image", "url('search.png')");
  }

  // looking at only filtered records
  // var label;
  for(var idLabel in wayf.view.keySorted ) {
    var label = wayf.view.keySorted[ idLabel ];
    var entity = wayf.view.mixelaHash[ label ].id;
    var extractedDomain = entity.split("/");
    if( typeof extractedDomain[2] !== "undefined" && extractedDomain[2].indexOf( query.toLowerCase() ) != -1 ) {
      fragScroller.appendChild( wayf.view.mixelaHash[ label ] );
    } else {
      for(var curLang in this.wayf.selectedIdps[ entity ]){
        if( containAllSubstring( this.wayf.selectedIdps[entity][curLang], queryArray ) == true) {
          fragScroller.appendChild( wayf.view.mixelaHash[ label ] );
          break;
        }
      }
    }
  }

  var idContent = idScroller.parentNode;
  idContent.removeChild( idScroller );  
  idContent.insertBefore( frag, idContent.childNodes[1] );
    
}

function containAllSubstring( str, substringArray ) {
  str = str.replace( /-/g, '' );
  for(var curSubstring in substringArray ) {
    if( str.toLowerCase().indexOf( substringArray[curSubstring].toLowerCase().replace(/-/g, '' ) ) == -1 ) {
      return false;
    }
  }
  return true;
}

Wayf.prototype.getBase64Image = function(url, etag) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4 ) {
            var etag = xmlhttp.getResponseHeader(this.ETAG);
            var lastmod = xmlhttp.getResponseHeader(this.LASTMOD);
            switch(xmlhttp.status) {
                case 200:
                    wayf.blogo = xmlhttp.responseText;
                    wayf.blogo_etag = etag;
                    break;
                case 304:
                    break;
                default:
                    break;
            }
        }
    };
    xmlhttp.open(this.METHOD_GET, url, false);
    xmlhttp.setRequestHeader(this.HEADER_ETAG, etag);
    xmlhttp.send();
}

/** function Wayf.prototype.userHasSavedIdps - check if local persistant memory is available
  */
Wayf.prototype.userHasSavedIdps = function() {
    var usedIdps = this.persistor.getItem("usedIdps");
    if(usedIdps == null) {
        return false;
    }
    else {
        this.usedIdps = JSON.parse(usedIdps);
        return true;
    }
}

/** function Wayf.prototype.getLabelFromLabels - return label of IdP from feed in selected language
  */
Wayf.prototype.getLabelFromLabels = function(labels) {
    if(prefLang != "") {
        var flang = labels[prefLang];
        if(flang != null) {
            return flang;
        }
    }
    for(var l in languages) {
        var lang = languages[l];
        try {
            var flang = labels[lang];
            if(flang != null) {
                return flang;
            }
        }
        catch(err) {
        }
    }
    try {
        var flang = labels[fallbackLanguage];
        if(flang != null) {
            return flang;
        }
    }
    catch(err) {
    }
    for(lab in labels) {
        return labels[lab];
    }
}

/** function Wayf.prototype.listSavedIdps - display saved or all IdP
  */
Wayf.prototype.listSavedIdps = function(isSetup, displayIdps) {
    var idpFilter = false;
    var filterAllowFeeds = false;
    var isListEnabledIdpsEmpty = true;
    
    var af = getAllFeeds();

    /* load feeds */
    if(useFilter) {
      if( filterVersion == "2" ) { 
        for(var f in filter.allowFeeds) {
          if( typeof filter.allowFeeds[f] !== "undefined" ) {
            idpFilter = true;
            break;
          }
        }
        filterAllowFeeds = true;
        if(!isSetup) {
          feedCount = Object.keys(filter.allowFeeds).length;
          for(feed in filter.allowFeeds) {
            feedUrl = af[feed];
            if( typeof feedUrl !== 'undefined' ) {
              wayf.getFeed(feed, feedUrl, false, false, true );
            } else {
              feedCount--;
            }
          }

        }
      } else {
        // filter v1
        if( ("allowIdPs" in filter)) {
          idpFilter = true;
        }

        if("allowFeeds" in filter) {
            filterAllowFeeds = true;
            if(!isSetup) {
                feedCount = Object.keys(filter["allowFeeds"]).length;
                for(feed in filter["allowFeeds"]) {
                    feedUrl = af[filter["allowFeeds"][feed]];
                    if( typeof feedUrl !== 'undefined' ) {
                      wayf.getFeed(filter["allowFeeds"][feed], feedUrl, false, false, true );
                    } else {
                      feedCount--;
                    }
                }
            }
        }
      }
    }
    else {
        /* load all feeds, filter is not set */
        feedCount = Object.keys(allFeeds).length;
        for(var feed in allFeeds) {
            var feedUrl = af[feed];
            if( typeof feedUrl !== 'undefined' ) {
              wayf.getFeed(feed, feedUrl, false, false, true );
            } else {
              feedCount--;
            }
        }
    }

    var usedIdps = this.usedIdps;
    this.view.deleteContainer();
    var langCallback = function() {
        wayf.listSavedIdps(isSetup,true);
    }
    if(isSetup) {
        this.view.createContainer(this.view.getLabelText('SETUP'), false, true, true, false, langCallback);
    }
    else {
        this.view.createContainer(this.view.getLabelText('TEXT_SAVED_IDPS'), true, inIframe, false, false, langCallback);
    }

    /* foreach saved idp */
    for(var eid in usedIdps) {
        var enableIdp = true;
        //try {

            if(eid == "indexOf") {
                continue;
            }

            var entity = usedIdps[eid];
            // When saved value is broken, delete from persistor and ignore it
            if(typeof entity.entity == 'undefined') {
                wayf.deleteUsedIdp(eid);
                continue;
            }
            var url = this.createEntityLink(eid);
            var tgt = this.view.target;
            var label = this.getLabelFromLabels(entity.entity.label);
            var logoSource = missingLogo;
            if( typeof entity.logo !== "undefined" ) {
              // var je zvlastni
              var logoSource = 'data:image/png;base64,' + entity.logo;
            }
            var enabled = true;
            var alert_na= this.view.getLabelText( "NOT_AVAILABLE" );
            var callback = null;
            var tempFeed = null;
            if(isSetup) {
                callback = (function() {
                    var meid = eid;
                    return function() {
                        wayf.deleteUsedIdp(meid);
                    }
                })();
            }
            else {
                if(eid == hostelEntityID) {
                    enableIdp = false;
                }
                else {
                    
                    if((!filterAllowFeeds) && (!idpFilter)) {
                        /* filter is not defined => take all delivered feeds */
                        enableIdp = false;
                        for(feed in allFeeds) {
                            if(wayf.isIdpInFeed(eid, feed)) {
                                enableIdp = true;
                                break;
                            }
                        }
                    } else {

                      if( filterVersion == "1" ) {
                        /* filter_v1 */
                        enableIdp = false;
                          
                        if(idpFilter && filter["allowIdPs"].indexOf(eid)>=0) {
                          /* add idp explicitly listed in allowIdps */
                          enableIdp = true;
                        } else {
                          /* add idp in allowFeeds */
                          for( feed in filter.allowFeeds ) {
                            if( filterAllowFeeds && wayf.isIdpInFeed( eid, filter.allowFeeds[ feed ] )) {
                              enableIdp = true;
                            }
                          }
                        }

                      } else {
                        /* filter_v2 */

                        var filterDenyIdps;
                        var filterAllowIdps;
                        var filterAllowEC;
                        var filterDenyEC;
                        var filterAllowRA;
                        var filterDenyRA;
                        var eidIsDeny;
                        var eidIsNotInAllow;
                        var eidAll;
                        var tmpEnableIdp;

                        if( filterVersion == "2" && filterAllowFeeds ) {
                          for(feed in filter.allowFeeds) {
                            /* go through all allowFeeds */

                            filterDenyIdps = false;
                            filterAllowIdps = false;
                            filterAllowEC = false;
                            filterDenyEC = false;
                            filterAllowRA = false;
                            filterDenyRA = false;
                            filterHideFromDiscovery = true;
                            eidIsDeny = false;
                            eidIsNotInAllow = false;
                            eidAll = true;
                            tmpEnableIdp = true;

                            if( wayf.isIdpInFeed( eid, feed )) {
                            /* idp is in the feed */

                              if( typeof filter.allowFeeds[feed].denyIdPs !== "undefined" ) { 
                                filterDenyIdps = true;
                                eidAll = false;
                              }

                              if( filterDenyIdps && filter.allowFeeds[feed].denyIdPs.indexOf(eid) >= 0 )
                                eidIsDeny = true;

                              if( typeof filter.allowFeeds[feed].allowIdPs !== "undefined" ) {
                                filterAllowIdps = true;
                                eidAll = false;
                              }

                              if( filterAllowIdps && filter.allowFeeds[feed].allowIdPs.indexOf(eid) < 0)
                                eidIsNotInAllow = true;

                              if( typeof filter.allowFeeds[feed].denyRA !== "undefined" ) {
                                filterDenyRA = true;
                                eidAll = false;
                              }

                              if( typeof filter.allowFeeds[feed].allowRA !== "undefined" ) {
                                filterAllowRA = true;
                                eidAll = false;
                              }

                              if( typeof filter.allowFeeds[feed].denyEC !== "undefined" ) {
                                filterDenyEC = true;
                                eidAll = false;
                              }

                              if( typeof filter.allowFeeds[feed].allowEC !== "undefined" ) {
                                filterAllowEC = true;
                                eidAll = false;
                                if( filter.allowFeeds[feed].allowEC.indexOf( hideFromDiscoveryCategory ) >= 0 ) {
                                  filterHideFromDiscovery = false;
                                }
                              }

                              /* vyhodnoceni v2 */
    
                              // entity category, first remove denyEC, then add allowEC
                              if( filterDenyEC && wayf.isInEc( filter.allowFeeds[feed].denyEC, wayf.feedData[feed].mdSet.entities[eid].EC )) {
                                tmpEnableIdp = false;
                              }
                              if( filterAllowEC && wayf.isInEc( filter.allowFeeds[feed].allowEC, wayf.feedData[feed].mdSet.entities[eid].EC )==false) {
                                tmpEnableIdp = false;
                              }
                              if( filterHideFromDiscovery && ( typeof wayf.feedData[feed].mdSet.entities[eid].EC !== "undefined" ) && ( wayf.feedData[feed].mdSet.entities[eid].EC.indexOf( hideFromDiscoveryCategory ) >= 0 )) {
                                tmpEnableIdp = false;
                                eidAll = false;
                              }
                              
                              // RegistrationAuthority, first remove denyRA, then add allowRA
                              if( filterDenyRA && wayf.isInRA( filter.allowFeeds[feed].denyRA, wayf.feedData[feed].mdSet.entities[eid].RA )) {
                                tmpEnableIdp = false;
                              }
                              if( filterAllowRA && wayf.isInRA( filter.allowFeeds[feed].allowRA, wayf.feedData[feed].mdSet.entities[eid].RA )==false) {
                                tmpEnableIdp = false;
                              }
     
                              // allowIdPs and denyIdps has higher priority than entity category
                              // denyIdPs is used
                              if( eidIsDeny ) {
                                  tmpEnableIdp = false;
                              } else {
                                // allowIdPs per feed
                                if( eidIsNotInAllow ) {
                                  tmpEnableIdp = false;            
                                } else {
                                  if( filterAllowIdps ) {
                                    tmpEnableIdp = true;  // eid is on allowIdPs list, so must be enabled
                                  }
                                }
                              }
     
                              if( eidAll ){
                                tmpEnableIdp = true;
                              }
                   
  
                            } else {
                              tmpEnableIdp = false;
                            }

                            if( tmpEnableIdp == true ) {
                              enableIdp = true;
                              break;  // if idp should be in any feed, list as enabled
                            } else {
                              enableIdp = false;
                            }
                          }                  
                      }
                       /* vyhodnoceni filter v2 */
                     }

                   } 

                }

                var callback = null;
                if(enableIdp) {
                    isListEnabledIdpsEmpty = false;
                    callback = (function() {
                        var murl = url;
                        var tgrt = tgt;
                        var logo_src = entity.logo;
                        var local_eid = eid;
                        return function() {
                            try {
                                wayf.saveUsedIdp("eduID.cz", local_eid);
                            }
                            catch(err) {
                            }
                            tgrt.location = murl;
                        }
                    })();

                } else {
                    callback = (function() {
		                    var vlabel = label;
			                  var valert = alert_na;
		                    return function() {
	                        alert( valert + " - " + vlabel );
		    	              }
                    })();
                }
            }
            try {
                this.selectedIdps[ eid ] = entity.entity.label;
                this.view.addIdpToList(eid, logoSource, label, callback, isSetup, enableIdp);
            }
            catch(err) {
            }

        /*}
        catch(err) {
        } */
    }

    // if list of Idps is empty or contains only grey-out Idps, so show all Idps
    if( !isSetup && isListEnabledIdpsEmpty ) {
      wayf.listAllIdps(false);
      return;
    }

    // show saved Idp
    wayf.view.keySorted = Object.keys( wayf.view.mixelaHash ).sort( function(a,b) { return a>b?1:-1; } );
              
    for( var key in wayf.view.keySorted ) {
      wayf.view.scroller.appendChild( wayf.view.mixelaHash[ wayf.view.keySorted[ key ] ] );
    }

    loadVisibleLogos();

    $( ".scroller" ).children( "div:visible" ).first().addClass( 'selected' );

    if(!isSetup) {
        this.view.addButton(this.view.getLabelText('BUTTON_NEXT'));
    }

    if( ! noSearchSavedIdps ) {
      var textSearch = this.lastSearch;
      $(document).ready( function() {
        //$( ".topsearch" ).css("position", "relative");
        //$( ".topsearch" ).css( "float", "right" ); 
        $( ".topsearch" ).focus();
        $( ".topsearch" ).val( textSearch );
      });
    }
}


Wayf.prototype.getFeed = function(id, url, asynchronous, all, dontShow ) {
    var savedFeedPrefix = "saved@";
    var textSearch = this.lastSearch;

    // optimization
    var tmpFeed;
    if( typeof wayf.feedData[id] !== 'undefined' ) {
      // data is in memory, so add it to list
      wayf.listAllData( id, wayf.feedData[id]["mdSet"]);
      feedCount--;
      return;
    }


   $( ".toplabel" ).text(wayf.view.getLabelText('LOADING'));

   var xmlhttp = new XMLHttpRequest();
    xmlhttp.feedId = id;
    xmlhttp.onreadystatechange = function() {
        var state = xmlhttp.readyState;
        if(xmlhttp.readyState == 4 ) {
            var etag = xmlhttp.getResponseHeader('Etag');
            var lastmod = xmlhttp.getResponseHeader('Last-Modified');
            switch(xmlhttp.status) {
                case 200:
                    var storedMdSet = Object();
                    storedMdSet.etag = etag;
                    storedMdSet.lastmod = lastmod;
                    try {
                        var mdSet = JSON.parse(xmlhttp.responseText);
                    }
                    catch(err) {
                    }
                    storedMdSet.mdSet = mdSet;
                    var label = mdSet.label;
                    wayf.persistor.setItem(savedFeedPrefix + label, JSON.stringify(storedMdSet));
                    wayf.feedData[xmlhttp.feedId] = storedMdSet;
                    if(!dontShow) {
                        wayf.listAllData(xmlhttp.feedId, mdSet);
                    }

                    break;
                case 304:
                    if(!dontShow) {
                        wayf.listAllData(xmlhttp.feedId, wayf.feedData[xmlhttp.feedId].mdSet);
                    }
                    break;
                default:
                    break;
            }

            feedCount--;

            if( feedCount <= 0 ) { 
              // sort mixela
              wayf.view.keySorted = Object.keys( wayf.view.mixelaHash ).sort( function(a,b) { return a>b?1:-1; } );

              $( ".toplabel" ).text(wayf.view.getLabelText('TEXT_ALL_IDPS'));
              $( ".scroller" ).children( "div:visible" ).first().removeClass( 'selected' );
             
              var frag = document.createDocumentFragment();   
              for( var key in wayf.view.keySorted ) {
                frag.appendChild( wayf.view.mixelaHash[ wayf.view.keySorted[ key ] ] );
              }
              wayf.view.scroller.appendChild( frag ); 

              loadVisibleLogos();

              $( ".scroller" ).children( "div:visible" ).first().addClass( 'selected' );

            }
        }
    };
    var feedStr = wayf.persistor.getItem(savedFeedPrefix + id);
    var etag = 0;
    if(feedStr != null) {
        wayf.feedData[id] = JSON.parse(feedStr);
        etag = wayf.feedData[id].etag;
    }
    xmlhttp.open(this.METHOD_GET, url, true);
    xmlhttp.setRequestHeader(this.HEADER_ETAG, etag);
    xmlhttp.send();
}

Wayf.prototype.listAllIdps = function(forceAll) {
    var filterAllowFeeds = false;
    var idpFilter = false;
    var langCallback = function() {
        wayf.listAllIdps(forceAll);
    }

    var textSearch = this.lastSearch;

    noSearchSavedIdps = false;

    this.view.deleteContainer();
    this.view.createContainer(this.view.getLabelText('TEXT_ALL_IDPS'), false, inIframe, false, true, langCallback);
    if(useFilter &&  "allowFeeds" in filter) {
        filterAllowFeeds = true;
    }

    var af = getAllFeeds();
    feedCount = Object.keys(allFeeds).length;
    for(var feedId in allFeeds) {
        if(feedId == "indexOf") {
            continue;
        }
        if( filterAllowFeeds ) {
          if( filterVersion == "2" ) {
            if(typeof filter.allowFeeds[feedId] === "undefined" ) {
              continue;
            }
          } else {
            if(filter.allowFeeds.indexOf(feedId)<0) {
              continue;
            }
          }
        }
        var feedUrl = af[feedId];
        if( typeof feedUrl !== 'undefined' ) {
          this.getFeed(feedId, feedUrl, false, forceAll, false );
        } else {
          feedCount--;
        } 
    }

    // sort mixela
    wayf.view.keySorted = Object.keys( wayf.view.mixelaHash ).sort( function(a,b) { return a>b?1:-1; } );

    var frag = document.createDocumentFragment();   
    for( var key in wayf.view.keySorted ) {
      frag.appendChild( wayf.view.mixelaHash[ wayf.view.keySorted[ key ] ] );
    }
    wayf.view.scroller.appendChild( frag ); 

    loadVisibleLogos();

    $( ".scroller" ).children( "div:visible" ).first().addClass( 'selected' );

    var textSearch = this.lastSearch;
    $(document).ready( function() {

      //$( ".topsearch" ).css( "position", "relative" );
      //$( ".topsearch" ).css( "float", "right" );
      $( ".topsearch" ).focus();
      $( ".topsearch" ).val( textSearch );
    }); 

}

Wayf.prototype.createEntityLink = function(eid) {
    retURL = returnURL + returnUrlParamCharacter + returnIDVariable + "=" + eid + otherParams;
    return retURL;
}
