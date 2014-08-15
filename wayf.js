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
    'BACK_TITLE': {'cs':'Zpět', 'en':'Back'}
}

var mobileVersion = true;
var hostelEntityID = "https://idp.hostel.eduid.cz/idp/shibboleth";
var inIframe = false;
document.domain = "ds.eduid.cz";

if(localStorage === undefined || localStorage === null) {
    window.location.href = noHTML5URL;
}

if (typeof JSON == 'undefined') {
  var fileref = document.createElement('script')
  fileref.setAttribute("type", "text/javascript")
  fileref.setAttribute("src", "https://ds.eduid.cz/json2.js")
  document.getElementsByTagName("head")[0].appendChild(fileref)
}

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

function toAscii(data) {
    var ret = data;
    ret = ret.replace(/Á/g, "A");
    ret = ret.replace(/Č/g, "C");
    ret = ret.replace(/Ď/g, "D");
    ret = ret.replace(/É/g, "E");
    ret = ret.replace(/Ě/g, "E");
    ret = ret.replace(/Í/g, "I");
    ret = ret.replace(/Ň/g, "N");
    ret = ret.replace(/Ó/g, "O");
    ret = ret.replace(/Ř/g, "R");
    ret = ret.replace(/Š/g, "S");
    ret = ret.replace(/Ť/g, "T");
    ret = ret.replace(/Ú/g, "U");
    ret = ret.replace(/Ý/g, "Y");
    ret = ret.replace(/Ž/g, "Z");
    return ret;
}

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

//localStorage.clear();

function getAllFeeds() {
    var ret = Array();
    base = "https://ds.eduid.cz/feed/";
    feeds = {'ACONet':'https://wayf.aco.net/aconet-aai-metadata.xml', 'InCommon':'urn:mace:incommon', 'Kalmar2':'kalmarcentral2', 'SURFfederatie':'wayf.surfnet.nl', 'SWITCHAAI':'urn:mace:switch.ch:SWITCHaai', 
             'UKAccessFederation':'http://ukfederation.org.uk', 'eduGAIN':'http://edugain.org/', 'eduID.cz':'https://eduid.cz/metadata', 'Hostel':'https://hostel.eduid.cz/metadata',
             'LoginMuni':'https://login.ics.muni.cz/metadata', 'ExLibris':'ExLibris'};
    for(feed in feeds) {
        ret[feed] = base + feed+ ".js";
    }
    return ret;
}

function Persistor() {
}

Persistor.prototype.getItem = function(key) {
    return localStorage.getItem(key);
}

Persistor.prototype.setItem = function(key, value) {
    localStorage.setItem(key, value);
}

Persistor.prototype.removeItem = function(key) {
    localStorage.removeItem(key);
}

function View(divId) {
    this.divId = divId;
    var wayDiv = document.getElementById(divId);
    this.wayfDiv = wayDiv;
}

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
    wayf.listSavedIdps(true);
}

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
                    wayf.listSavedIdps(false);
                } else {
                    wayf.listAllIdps(false);
                }
            }
        })();
        closeE.onclick = callback;
    }

    var title = document.createElement('p');
    title.className = "toptitle";
    title.innerHTML = label;

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

View.prototype.addIdpToList = function(eid, logoSource, label, callback, showDeleteIcon, enabled) {
    var idpDiv = document.createElement('div');
    if(enabled) {
        idpDiv.className = "enabled";
    }
    else {
        idpDiv.className = "disabled";
    }
    if(callback != null) {
        idpDiv.onclick = callback;
    }
    idpDiv.title = label;

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

    var upLabel = toAscii(label.toUpperCase());
    var nodes = this.scroller.childNodes;
    for (var i=0; i<nodes.length; i++) { 
        var node = nodes.item(i);
        if((node.className != "enabled") && (node.className != "disabled")) {
            continue;
        }
        var nnodes = node.childNodes;
        for(var j=0; j<nnodes.length; j++) {
            var nnode = nnodes.item(j);
            if(nnode.className != "title") {
                continue;
            }
            var nLabel = toAscii(nnode.innerHTML.toUpperCase());
            if(upLabel == nLabel) {
                return;
            }
            else if(upLabel < nLabel) {
                this.scroller.insertBefore(idpDiv, node);
                return;
            }
        }
    }
    this.scroller.appendChild(idpDiv);
}

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
                this.listSavedIdps(true);
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
    if(useFilter && ("allowIdPs" in filter)) {
        idpFilter = true;
    }

    for(var eid in mdSet.entities) {
        if(eid == "indexOf") {
            continue;
        }
        if(idpFilter && filter.allowIdPs.indexOf(eid)<0) {
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
        this.view.addIdpToList(eid, logoSource, label, callback, false, true);
    }
}

function listData() {
    inIframe = isInIframe();
    wayf = new Wayf('wayf');
    if(wayf.userHasSavedIdps()) {
        wayf.listSavedIdps(false);
    }
    else {
        wayf.listAllIdps(false);
    }
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

Wayf.prototype.listSavedIdps = function(isSetup) {
    var idpFilter = false;
    var feedFilter = false;
    if(useFilter) {
        if("allowIdPs" in filter) {
            idpFilter = true;
        }
        if("allowFeeds" in filter) {
            feedFilter = true;
            if(!isSetup) {
                var af = getAllFeeds();
                for(feed in filter["allowFeeds"]) {
                    feedUrl = af[filter["allowFeeds"][feed]];
                    wayf.getFeed(feed, feedUrl, false, false, true);
                }
            }
        }
    }
    else {
        for(var feed in allFeeds) {
            var feedUrl = allFeeds[feed];
            wayf.getFeed(feed, feedUrl, false, false, true);
        }
    }

    var usedIdps = this.usedIdps;
    this.view.deleteContainer();
    var langCallback = function() {
        wayf.listSavedIdps(isSetup);
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
            var enabledIdp = false;
            var callback = null;
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

                    if(feedFilter) {
                        enableIdp = false;
                        for(feed in filter["allowFeeds"]) {
                            if(wayf.isIdpInFeed(eid, filter["allowFeeds"][feed])) {
                                enableIdp = true;
                                break;
                            }
                        }
                    }

                    if(idpFilter) {
                        enableIdp = false;
                        if(filter["allowIdPs"].indexOf(eid)>=0) {
                            enableIdp = true;
                        }
                    }

                    if((!feedFilter) && (!idpFilter)) {
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

                }
            }
            try {
                this.view.addIdpToList(eid, logoSource, label, callback, isSetup, enableIdp);
            }
            catch(err) {
            }

        }
        catch(err) {
        }


    }
    if(!isSetup) {
        this.view.addButton(this.view.getLabelText('BUTTON_NEXT'));
    }
}

Wayf.prototype.getFeed = function(id, url, asynchronous, all, dontShow) {
    var savedFeedPrefix = "saved@";
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
    var feedFilter = false;
    var idpFilter = false;
    var langCallback = (function() {
        return function() {
            wayf.listAllIdps(forceAll);
        }
    })();
    this.view.deleteContainer();
    this.view.createContainer(this.view.getLabelText('TEXT_ALL_IDPS'), false, inIframe, false, langCallback);
    if(useFilter &&  "allowFeeds" in filter) {
        feedFilter = true;
    }
    for(var feedId in allFeeds) {
        if(feedId == "indexOf") {
            continue;
        }
        if(feedFilter && filter.allowFeeds.indexOf(feedId)<0) {
            continue;
        }
        var feedUrl = allFeeds[feedId];
        this.getFeed(feedId, feedUrl, false, forceAll, false);
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
        this.view.addHostelIdp(this.view.getLabelText('IDP_HOSTEL'), false);
        if(allowHostelRegistration) {
            this.view.addNewHostelAccountButton(this.view.getLabelText('BUTTON_HOSTEL'), this.view.getLabelText('TEXT_ACCOUNT'));
        }
    }
}

Wayf.prototype.createEntityLink = function(eid) {
    retURL = returnURL + "&" + returnIDVariable + "=" + eid + otherParams;
    return retURL;
}
