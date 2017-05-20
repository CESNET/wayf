/**
 * wayf.js
 *
 * javascript version of WAYF
 *
 * @version ?.? 2013 - 2014
 * @author Jan Chvojka jan.chvojka@cesnet.cz
 * @author Pavel Polacek pavel.polacek@ujep.cz
 * @see getMD - TODO: add link - prepares feed for WAYF
 * @see Mobile Detect - TODO: add link - browser detection
 *
 */



var wayf = "";
var hostelURL  = 'https://adm.hostel.eduid.cz/registrace';
var showedIdpList;
var languages = new Array("cs", "en");
var fallbackLanguage = "en";
var labels = {
    'BUTTON_NEXT': {'cs':'Jiný účet', 'en':'Another account'},
    'BUTTON_HOSTEL': {'cs':'Zřídit účet', 'en':'Create account'},
    'TEXT_ALL_IDPS': {'cs':'Přihlásit účtem', 'en':'Login with'},
    'TEXT_ACCOUNT': {'cs':'Zřídit účet', 'en':'Create account'},
    'TEXT_SAVED_IDPS': {'cs':'Přihlásit účtem', 'en':'Login with'},
    'IDP_HOSTEL': {'cs':'Hostel IdP', 'en':'Hostel IdP'},
    'SETUP': {'cs':'Nastavení', 'en':'Setup'},
    'CONFIRM_DELETE': {'cs':'Zapomenout ', 'en':'Forget '},
    'BACK_TITLE': {'cs':'Zpět', 'en':'Back'},
    'NOT_AVAILABLE': {'cs':'K této službě se nelze přihlásit pomocí', 'en':'Service is not available for'}
}

var mobileVersion = true;
var hostelEntityID = "https://idp.hostel.eduid.cz/idp/shibboleth";
var inIframe = false;
var feedCount = 0;
var filterVersion = 1;  // default original version, not suitable for all cases

// check if local storage is available
/*
try {
    if(localStorage === undefined || localStorage === null) {
	try {
    	    window.location.href = noHTML5URL;
	}
	catch(e) {
	    window.location.href = noHTML5URL;
	}	 
    }
} catch (e2) {
       window.location.href = noHTML5URL;
} 
*/

/*
try {
  localStorage.test = 1;
} catch (e) {
  alert('safari');
}
*/

// check support of json, otherwise use 3rd implementation
if (typeof JSON == 'undefined') {
  var fileref = document.createElement('script')
  fileref.setAttribute("type", "text/javascript")
  fileref.setAttribute("src", "/json2.js")
  document.getElementsByTagName("head")[0].appendChild(fileref)
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
    feeds = {'ACONet':'https://wayf.aco.net/aconet-aai-metadata.xml', 'InCommon':'urn:mace:incommon', 'Kalmar2':'kalmarcentral2', 'SURFfederatie':'wayf.surfnet.nl', 'SWITCHAAI':'urn:mace:switch.ch:SWITCHaai', 
             'UKAccessFederation':'http://ukfederation.org.uk', 'eduGAIN':'http://edugain.org/', 'eduID.cz':'https://eduid.cz/metadata', 'Hostel':'https://hostel.eduid.cz/metadata',
             'LoginMuni':'https://login.ics.muni.cz/metadata', 'ExLibris':'ExLibris', 'Social':'Social'};
    for(feed in feeds) {
        ret[feed] = base + feed+ ".js";
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

/** function View.prototype.addNewHostelAccountButton - insert button for creating new account in Hostel
  */
View.prototype.addNewHostelAccountButton = function(buttonLabel, label) {
    var bWrap = document.createElement('div');
    bWrap.className = "bwrap";

    var nb = document.createElement('button');
    nb.className = "button";

    var nlabel = document.createElement('label');
    nlabel.className = "label";
    nlabel.innerHTML = label;
    var tgt = this.target;

    nb.onclick = function() {
        var localReturnURL = encodeURIComponent(wayfURL + "?fromHostel" + otherParams + "&return=" + encodeURIComponent(returnURL));
        var newLocation = hostelURL + "?r" + otherParams + "&return=" + localReturnURL;
        var tgrt = tgt;
        tgrt.location = newLocation;
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

/** View.prototype.addHostelIdp - add Hostel to IdP list
  */
View.prototype.addHostelIdp = function(label, isSetup) {
    var logoSource = "/logo/idp.hostel.eduid.cz.idp.shibboleth.png";
    var url = returnURL + "&" + returnIDVariable + "=" + hostelEntityID + otherParams;
    var tgt = this.target;
    var callback = (function() {
        var veid = hostelEntityID;
        var murl = url;
        var tgrt = tgt;
        return function() {
            try {
                wayf.saveUsedHostelIdp();
            }
            catch(err) {
            }
            tgrt.location = murl;
        }
    })();
    this.addIdpToList(hostelEntityID, logoSource, label, callback, isSetup, true);
}

View.prototype.createSetupList = function() {
    wayf.listSavedIdps(true,true);
}

/** function View.prototype.createContainer - generate <div> container for IdP list
  */
View.prototype.createContainer = function(label, showSetup, showClosing, isSetup, langCallback) {

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
    // title.innerHTML = label;

    var toplabel = document.createElement('span');
    toplabel.innerHTML = label;

    /* search field */
    var search = document.createElement('input');
    search.className = "topsearch";
    search.size = 12;
    search.style.backgroundRepeat="no-repeat";
    search.style.backgroundPosition="right";
    search.style.backgroundImage="url('search.png')";
    search.style.borderRadius="3px";
    search.style.borderStyle="1px solid #bbb";
    search.style.position="relative";
    search.style.cssFloat="right";
    search.style.visibility = "visible";

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

    var cesnetLink = document.createElement('a');
    cesnetLink.href="http://www.eduid.cz/cesnet-ds";
    cesnetLink.target="_blank";
    cesnetLink.id = "helpa";

    var sc = document.createElement('span');
    sc.id = 'helps';

    sc.innerHTML = "CESNET";
    cesnetLink.appendChild(sc);

    var helpImage = document.createElement('img');
    helpImage.className = "helpimg";
    helpImage.src = "help.png";
    helpImage.alt = "Information";
    helpImage.id = "helpi";

    cesnetLink.appendChild(helpImage);
    help.appendChild(cesnetLink);

    this.content = document.createElement('div');
    this.content.className = "content";

    var topFiller = document.createElement("div");
    topFiller.className= "topfiller";

    var bottomFiller = document.createElement("div");
    bottomFiller.className= "bottomfiller";

    this.scroller = document.createElement('div');
    this.scroller.className = "scroller";

    this.mixelaHash = new Object();

    var langCS = document.createElement('div');
    langCS.className = "lang";
    langCS.onclick = (function() {
        return function() {
            prefLang = "cs";
            langCallback();
        }
    })();
    var langCSimg = document.createElement('img');
    langCSimg.src = "cs.png";
    langCS.appendChild(langCSimg);

    var langEN = document.createElement('div');
    langEN.className = "lang";
    langEN.onclick = (function() {
        return function() {
            prefLang = "en";
            langCallback();
        }
    })();
    var langENimg = document.createElement('img');
    langENimg.src = "gb.png";
    langEN.appendChild(langENimg);

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

    if(showSetup) {
        this.bottom.appendChild(setup);
    }
    this.bottom.appendChild(langCS);
    this.bottom.appendChild(langEN);
    this.bottom.appendChild(help);

    this.wayfDiv.appendChild(this.bottom);

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(this.wayfDiv);
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
        idpDiv.className = "disabled";
        idpDiv.title = this.getLabelText( "NOT_AVAILABLE" ) + ' - ' + label;
    }
    if(callback != null) {
        idpDiv.onclick = callback;
    }

    if(showDeleteIcon) {
        var trashIcon = document.createElement('img');
        trashIcon.className = "trashicon";
        trashIcon.src = "trash_48.png";
        idpDiv.appendChild(trashIcon);
    }

    var logo = document.createElement('img');
    logo.className = "logo";
    logo.src = logoSource;

    var idpName = document.createElement('span');
    idpName.className = "title";
    idpName.innerHTML = label;

    var hr = document.createElement('hr');
    idpDiv.appendChild(logo);
    idpDiv.appendChild(idpName);
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

/** function Wayf.prototype.saveUsedHostelIdp - save selected Hostel to local persistant memory
  */
Wayf.prototype.saveUsedHostelIdp = function() {
    var hostelEntity = {"label": {"en": "Hostel IdP", "cs":"Hostel IdP"}, "logo": "/logo/idp.hostel.eduid.cz.idp.shibboleth.png"};
    var date = new Date();
    var time = date.getTime();
    this.etag = 0;
    try {
        var usedIdps = this.persistor.getItem("usedIdps");
    }
    catch(err) {
    }
    var usedIdpsObj;
    var idp;
    if(usedIdps == null) {
        usedIdpsObj = new Object;
        idp = new Object();
    }
    else {
        usedIdpsObj = JSON.parse(usedIdps);
        idp = null;
        try {
            idp = usedIdpsObj[hostelEntityID];
        }
        catch(err) {
        }
        if(idp == null) {
            idp = new Object();
        }
        else {
            this.blogo = idp.logo;
            this.etag = idp.logo_etag;
        }
    }
    this.getBase64Image("/logo/idp.hostel.eduid.cz.idp.shibboleth.png" + "_b64", this.etag);
    idp.logo = this.blogo;
    idp.logo_etag = this.blogo_etag;
    idp.lastused = time;
    idp.entity = hostelEntity;
    usedIdpsObj[hostelEntityID] = idp;
    this.persistor.setItem("usedIdps", JSON.stringify(usedIdpsObj));
}

/** function Wayf.prototype.deleteUsedIdp - dalete selected IdP from local persistant memory
  */
Wayf.prototype.deleteUsedIdp = function(id) {
    try {
        var usedIdps = this.persistor.getItem("usedIdps");
        var usedIdpsObj = JSON.parse(usedIdps);
        var entity = usedIdpsObj[id]['entity'];
        var label = this.getLabelFromLabels(entity.label);

        if(confirm(this.view.getLabelText("CONFIRM_DELETE") + label + "?")) {
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

/** function Wayf.prototype.isIdpInFeed - return true if IdP is in locally stored feed
  */
Wayf.prototype.isIdpInFeed = function(idp, feed) {
    var feedStr = wayf.persistor.getItem("saved@" + feed);
    if(feedStr == null) {
        return false;
    }
    else {
        feedData = JSON.parse(feedStr);
        if(idp in feedData["mdSet"]["entities"]) {
            return true;
        }
    }
    return false;
}

/** function Wayf.prototype.getUrlFromFeedId - return URL of feed with feedId
  */
Wayf.prototype.getUrlFromFeedId = function(feedId) {
    try {
        var ret = allFeeds[feedId];
        return ret;
    }
    catch(err) {
        return "";
    }
}

Wayf.prototype.listAllData = function(feedId, mdSet) {
    var idpFilter = false;
    var filterDenyIdps = false;
    var filterAllowIdps = false; 

    if( useFilter ) {
      if( filterVersion == "2" ) {
        if( typeof filter.allowFeeds[feedId].denyIdPs !== "undefined" ) {
          filterDenyIdps = true;
        } else {
          // deny has higher priority
          if( typeof filter.allowFeeds[feedId].allowIdPs !== "undefined" ) {
            filterAllowIdps = true;
          }
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
            if( filterAllowIdps && filter.allowFeeds[feedId].allowIdPs.indexOf(eid)<0) {
              continue;            
            }
          }
        } else {
          // filter v1
          if(idpFilter && filter.allowIdPs.indexOf(eid)<0) {
            continue;
          }
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

  if( saveQuery ) {
    wayf.lastSearch = query;
  }

  // wayf.view.deleteContainer();  // nedava smysl, pac si clovek smaze i jquery-ui tagy
  $( ".enabled" ).hide();  // hide all institutions
  $( ".disabled" ).hide();  // hide even all disabled institions

  if( query.length ) {
    $( ".topsearch").css( "background-Image", "none");
  } else {
    $( ".topsearch").css( "background-Image", "url('search.png')");
  }

  // looking at only filtered records
  for(var entity in this.wayf.selectedIdps ) {
    for(var curLang in this.wayf.selectedIdps[entity]){
      if( this.wayf.selectedIdps[entity][curLang].search( new RegExp( query, "i" )) != -1) {
        $( document.getElementById( entity ) ).show();
      }
    }
  }

  $( ".topsearch" ).keypress(function(e) {
    // if pressed key is enter
    if( e.which == 13 ) {
      $( ".scroller" ).children( "div:visible" ).first().click();
    }
  });
 
  // callback( result );  // we don't use autocompletion list
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
          var af = getAllFeeds();
          feedCount = Object.keys(filter.allowFeeds).length;
          for(feed in filter.allowFeeds) {
            feedUrl = af[feed];
            wayf.getFeed(feed, feedUrl, false, false, true );
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
                var af = getAllFeeds();
                feedCount = Object.keys(filter["allowFeeds"]).length;
                for(feed in filter["allowFeeds"]) {
                    feedUrl = af[filter["allowFeeds"][feed]];
                    wayf.getFeed(filter["allowFeeds"][feed], feedUrl, false, false, true );
                }
            }
        }
      }
    }
    else {
        feedCount = Object.keys(allFeeds).length;
        for(var feed in allFeeds) {
            var feedUrl = allFeeds[feed];
            wayf.getFeed(feed, feedUrl, false, false, true );
        }
    }


    var usedIdps = this.usedIdps;
    this.view.deleteContainer();
    var langCallback = function() {
        wayf.listSavedIdps(isSetup,true);
    }
    if(isSetup) {
        this.view.createContainer(this.view.getLabelText('SETUP'), false, true, true, langCallback);
    }
    else {
        this.view.createContainer(this.view.getLabelText('TEXT_SAVED_IDPS'), true, inIframe, false, langCallback);
    }

    for(var eid in usedIdps) {
        var enableIdp = true;
        try {

            if(eid == "indexOf") {
                continue;
            }

            var entity = usedIdps[eid];
            var url = this.createEntityLink(eid);
            var tgt = this.view.target;
            var label = this.getLabelFromLabels(entity.entity.label);
            var logoSource = 'data:image/png;base64,' + entity.logo;
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
                    if(!useFilter || (useFilter && filter.allowHostel!=true)) {
                        enableIdp = false;
                    }
                }
                else {

                    if(filterAllowFeeds) {
                        enableIdp = false;
                        for(feed in filter.allowFeeds) {
                          if(filterVersion == "1" && wayf.isIdpInFeed(eid, filter.allowFeeds[feed] )) {
                              enableIdp = true;
                              tempFeed = filter.allowFeeds[feed];
                              break;
                          } else {
                            if(wayf.isIdpInFeed(eid, feed)) {
                                enableIdp = true;
                                tempFeed = feed;
                                break;
                            }
                          }
                        }
                    }


                    if( filterVersion == "2" && tempFeed != null && typeof filter.allowFeeds[tempFeed].denyIdPs !== "undefined" && filter.allowFeeds[tempFeed].denyIdPs.indexOf(eid) >= 0 ) {
                      // disable IdP in denyIdPs list
                      enableIdp = false; 
                    } else {         
                      if(idpFilter) {
                        enableIdp = false;
                        if( filterVersion == "2" ) {
                          if( tempFeed != null ) {
                            enableIdp = true;
                          }
                        } else {
                          // filter v1
                          if(filter["allowIdPs"].indexOf(eid)>=0) {
                              enableIdp = true;
                          }
                        }
                      }
                    }

                    if((!filterAllowFeeds) && (!idpFilter)) {
                        enableIdp = false;
                        for(feed in allFeeds) {
                            if(wayf.isIdpInFeed(eid, feed)) {
                                enableIdp = true;
                                break;
                            }
                        }
                    }

                }

                var callback = null;
                if(enableIdp) {
                    callback = (function() {
                        var murl = url;
                        var tgrt = tgt;
                        var logo_src = entity.logo;
                        var local_eid = eid;
                        return function() {
                            if(local_eid == hostelEntityID) {
                                try {
                                    wayf.saveUsedHostelIdp();
                                }
                                catch(err) {
                                }
                            }
                            else {
                                try {
                                    wayf.saveUsedIdp("eduID.cz", local_eid);
                                }
                                catch(err) {
                                }
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

        }
        catch(err) {
        }
    }

    // show saved Idp
    var keySorted = Object.keys( wayf.view.mixelaHash ).sort( function(a,b) { return a>b?1:-1; } );
              
    for( var key in keySorted ) {
      wayf.view.scroller.appendChild( wayf.view.mixelaHash[ keySorted[ key ] ] );
    }

    if(!isSetup) {
        this.view.addButton(this.view.getLabelText('BUTTON_NEXT'));
    }

    // jquery-ui
    var textSearch = this.lastSearch;
    $(document).ready( function() {
      $( ".topsearch" ).css("position", "relative");
      $( ".topsearch" ).css( "float", "right" ); 
      $( ".topsearch" ).focus();
      $( ".topsearch" ).val( textSearch );
      $( ".topsearch" ).autocomplete( {
        select: function (event, ui)
        {
          "use strict";
          //console.debug('select event called');
          //console.debug(ui.item.value);
        },
	      source: function( request, response) {
          var searchFor = request.term;
          searchAuto( searchFor, wayf, response, true);
        },
		    minLength: 0
      });

      // lastSearch action
      searchAuto( textSearch, wayf, null, false);

    });

}


Wayf.prototype.getFeed = function(id, url, asynchronous, all, dontShow ) {
    var savedFeedPrefix = "saved@";
    var textSearch = this.lastSearch;

    // optimization
    var tmpFeed;
    if(typeof wayf.feedData[id] != 'undefined' ) {
      // data is in memory, so add it to list
      wayf.listAllData( id, wayf.feedData[id]["mdSet"]);
      return;
    }

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

            if( feedCount == 0 ) { 
              // sort mixela
              var keySorted = Object.keys( wayf.view.mixelaHash ).sort( function(a,b) { return a>b?1:-1; } );

              // empty scroller due to duplicity
              // while(wayf.view.scroller.firstChild) wayf.view.scroller.removeChild( wayf.view.scroller.firstChild );
              
              for( var key in keySorted ) {
                wayf.view.scroller.appendChild( wayf.view.mixelaHash[ keySorted[ key ] ] );
              }

              searchAuto( textSearch, wayf, null, false );
            }
        }
    };
    var feedStr = wayf.persistor.getItem(savedFeedPrefix + id);
    etag = 0;
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
    this.view.createContainer(this.view.getLabelText('TEXT_ALL_IDPS'), false, inIframe, false, langCallback);
    if(useFilter &&  "allowFeeds" in filter) {
        filterAllowFeeds = true;
    }

    var useHostelIdp = false;
    var allowHostelRegistration = false;
    if(useFilter) {
        if("allowHostel" in filter) {
            useHostelIdp = filter.allowHostel;
        }
        if("allowHostelReg" in filter) {
            allowHostelRegistration = filter.allowHostelReg;
        }
    }

    if(useHostelIdp) {
        var hostelLabel = { "en":this.view.getLabelText('IDP_HOSTEL') };
        this.selectedIdps[ hostelEntityID ] = hostelLabel;
        // this.view.addHostelIdp(this.view.getLabelText('IDP_HOSTEL'), false);
        this.view.addHostelIdp('Hostel IdP', false);
        if(allowHostelRegistration) {
            this.view.addNewHostelAccountButton(this.view.getLabelText('BUTTON_HOSTEL'), this.view.getLabelText('TEXT_ACCOUNT'));
        }
    }

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
        var feedUrl = allFeeds[feedId];
        this.getFeed(feedId, feedUrl, false, forceAll, false );
    
    }

      // sort mixela
      var keySorted = Object.keys( wayf.view.mixelaHash ).sort( function(a,b) { return a>b?1:-1; } );

      // empty scroller due to duplicity
      // while(wayf.view.scroller.firstChild) wayf.view.scroller.removeChild( wayf.view.scroller.firstChild );
              
      for( var key in keySorted ) {
        wayf.view.scroller.appendChild( wayf.view.mixelaHash[ keySorted[ key ] ] );
      }

    searchAuto( textSearch, wayf, null, false );

    // jquery-ui
    var textSearch = this.lastSearch;
    $(document).ready( function() {

      $( ".topsearch" ).css( "position", "relative" );
      $( ".topsearch" ).css( "float", "right" );
      $( ".topsearch" ).focus();
      $( ".topsearch" ).val( textSearch );
      $( ".topsearch" ).autocomplete( {
        select: function (event, ui)
        {
          "use strict";
          //console.debug('select event called');
          //console.debug(ui.item.value);
        },
	      source: function( request, response) {
          var searchFor = request.term;
          searchAuto( searchFor, wayf, response, true);
        },
		    minLength: 0
      });
    });
}

Wayf.prototype.createEntityLink = function(eid) {
    retURL = returnURL + "&" + returnIDVariable + "=" + eid + otherParams;
    return retURL;
}
