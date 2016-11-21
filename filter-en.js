function regenerateFilter() {
    var filterInfo = document.getElementById('filterinfo');
    var filterVal = document.getElementById('filterval');
    var rawFilterArea = document.getElementById('rawfilter');
    var filterKey = "filter=";
    var hostel = document.getElementById('hostel');
    var social = document.getElementById('social');
    var hostelreg = document.getElementById('hostelreg');
    var kontrola = document.getElementById('kontrola');
    var filter = "";
    filter = filter + "{";
    var useFeeds = false;
    var checkedFeeds = new Array();
    var feeds = document.getElementsByName('feed[]');
    for (var i=0; i<feeds.length; i++) {
        var feed = feeds[i];
        if(!feed.checked) {
            continue;
        }
        else {
            if(!useFeeds) {
                useFeeds = true;
            }
            checkedFeeds.push(feed);
        }
    }
    if(useFeeds) {
        filter = filter + "\"allowFeeds\": [";
        for (var i = 0; i < checkedFeeds.length; i++) {
            var feed = checkedFeeds[i];
            filter = filter + "\"" + feed.value + "\"";
            if(i < checkedFeeds.length - 1) {
                filter = filter + ",";
            }
        }
        filter = filter + "], ";
    }

    var useIdps = false;
    var checkedIdps = new Array();
    var idps = document.getElementsByName('idp[]');
    for (var i=0; i<idps.length; i++) {
        var idp = idps[i];
        if(!idp.checked) {
            continue;
        }
        else {
            if(!useIdps) {
                useIdps = true;
            }
            checkedIdps.push(idp);
        }
    }
    if(useIdps) {
        filter = filter + "\"allowIdPs\": [";
        for (var i = 0; i < checkedIdps.length; i++) {
            var idp = checkedIdps[i];
            filter = filter + "\"" + idp.value + "\"";
            if(i < checkedIdps.length - 1) {
                filter = filter + ",";
            }
        }
        filter = filter + "], ";
    }

    filter = filter + "\"allowHostel\": ";
    if(hostel.checked) {
        filter = filter + "true, \"allowHostelReg\": "
        if(hostelreg.checked) {
            filter = filter + "true"
        }
        else {
            filter = filter + "false";
        }
    }
    else {
        filter = filter + "false, \"allowHostelReg\": false";
    }

    filter = filter + "}";

    var filterValue = Base64.encode(filter);
    var filterLen = filterValue.length;
    var rawFilterValue = filterKey + filter;

        
    fPopis = "Use this filter value as a parameter sent to WAYF by your SP." +
             " You can achieve it by using <ul><li>Parameter \"<i>filter</i>\" containing the filter value" +
             " shown below, or by </li><li>Parameter \"<i>efilter</i>\" linking to a URL " +
             " with a file containing the filter value.</li></ul><b>Examples:</b>" +
             "<ul><li>/wayf.php?filter=abcd</li><li>/wayf.php?efilter=www.example.com/someurl" +
             " (URL www.example.com/someurl contains the generated filter)</li></ul>For more info see " +
             " WAYF documentation for <a href=\"https://www.eduid.cz/en/tech/wayf/sp\" target=\"_blank\">SP admins</a>" +
             " or <a href=\"https://www.eduid.cz/en/tech/wayf\" target=\"_blank\">users</a>.<br><br>" +
             " Maximal allowed length of all parameters sent to WAYF is 512 bytes.<br>Generated filter has now" +
             filterLen + " bytes.</b><br><br>" + 
             "For Shibboleth SP configuration you can use the following code:<br><br>" +

             "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SessionInitiator</span> type=\"Chaining\" Location=\"/DS\" isDefault=\"false\" id=\"DS\"&gt;<br>" +
             "    &lt;SessionInitiator type=\"SAML2\" template=\"bindingTemplate.html\"/&gt;<br>" +
             "    &lt;SessionInitiator type=\"Shib1\"/&gt;<br>" + 
             "    &lt;SessionInitiator type=\"SAMLDS\" URL=\"/wayf.php?filter=<span class=\"red\">" +
             filterValue +
             "</span>\"/&gt;<br>" +
             "&lt;/<span class=\"tagname\">SessionInitiator</span>&gt;</div><br><br>" + 
             
             "Newer versions of Shibboleth SP allows simplified configuration:<br><br>" + 
             
             "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SSO</span> discoveryProtocol=\"SAMLDS\"<br>" + 
             "    discoveryURL=\"/wayf.php?filter=<span class=\"red\">" + 
             filterValue +
             "</span>\"&gt;<br>" + 
             "    SAML2 SAML1<br>" +
             "&lt;/<span class=\"tagname\">SSO</span>&gt;</div><br><br>" + 
             
             "If you are using <a href=\"https://simplesamlphp.org/\">SimpleSAMLphp</a> as a SP, copy the following configuration to config/authsources.php file" + 
             " (note, that this is only a part of the configuration):<br><br>" +
             
             "<div class=\"scroll nowrap\">\'<span class=\"tagname\">default-sp</span>\' => array(<br>" + 
             "    \'saml:SP\',<br>" + 
             "    \'idp\' => NULL,<br>" + 
             "    \'discoURL\' => \'/wayf.php?filter=<span class=\"red\">" +
              filterValue + 
             "</span>\',<br>" + 
             "    ...<br>" + 
             "),<div><br><br>" + 
             "";

             
             "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SessionInitiator</span> type=\"Chaining\" Location=\"/DS\" isDefault=\"false\" id=\"DS\"&gt;<br>" +
             "    &lt;SessionInitiator type=\"SAML2\" template=\"bindingTemplate.html\"/&gt;<br>" +
             "    &lt;SessionInitiator type=\"Shib1\"/&gt;<br>" + 
             "    &lt;SessionInitiator type=\"SAMLDS\" URL=\"/wayf.php?filter=<span class=\"red\">" +
             filterValue +
             "</span>\"/&gt;<br>" +
             "&lt;/<span class=\"tagname\">SessionInitiator</span>&gt;</div><br><br>" + 
             
             "Novější verze Shibboleth SP umožnuje zjednodušenou konfiguraci:<br><br>" + 
             
             "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SSO</span> discoveryProtocol=\"SAMLDS\"<br>" + 
             "    discoveryURL=\"/wayf.php?filter=<span class=\"red\">" + 
             filterValue +
             "</span>\"&gt;<br>" + 
             "    SAML2 SAML1<br>" +
             "&lt;/<span class=\"tagname\">SSO</span>&gt;</div><br><br>" + 
             
             "Pokud jako SP používáte <a href=\"https://simplesamlphp.org/\">SimpleSAMLphp</a>, můžete použít v souboru config/authsources.php " + 
             "následující konfiguraci (jedná se pouze o část konfigurace):<br><br>" +
             
             "<div class=\"scroll nowrap\">\'<span class=\"tagname\">default-sp</span>\' => array(<br>" + 
             "    \'saml:SP\',<br>" + 
             "    \'idp\' => NULL,<br>" + 
             "    \'discoURL\' => \'/wayf.php?filter=<span class=\"red\">" +
              filterValue + 
             "</span>\',<br>" + 
             "    ...<br>" + 
             "),<div><br><br>" + 
             
             "";

    filterInfo.innerHTML = fPopis;
    filterVal.value = Base64.encode(filter);

    var kValue = "";

    if(useFeeds) {
        kValue = "Used groups<ul>";
        for (var i = 0; i < checkedFeeds.length; i++) {
            kValue = kValue + "<li>" + checkedFeeds[i].value + "</li>";
        }
        kValue = kValue + "</ul>";
    }

    if(useIdps) {
        kValue = kValue + "Used IdPs<ul>";
        for (var i = 0; i < checkedIdps.length; i++) {
            var c = 'input[value="' + checkedIdps[i].value + '"]' ;
            var ff = $(c).next().html();
            kValue = kValue + "<li>" + ff + "</li>";
        }
        kValue = kValue + "</ul>";
    }

    kValue = kValue + "Special identity provider <a href=\"http://hostel.eduid.cz/\">Hostel IdP</a> ";
    if(hostel.checked) {
        kValue = kValue + "used.<br>Account creation at <a href=\"http://hostel.eduid.cz/\">Hostel IdP</a> ";
        if(hostelreg.checked) {
            kValue = kValue + "is";
        }
        else {
            kValue = kValue + "is not";
        }
        kValue = kValue + " allowed.";
    }
    else {
        kValue = kValue + "not used.";
    }

    kontrola.innerHTML = kValue;
    $('#filterval').removeClass("errorfilter");
}

function decodeFilter() {
    try {
        $('#filterval').removeClass("errorfilter");
        var filterArea = document.getElementById('filterval');
        var base64Filter = filterArea.value;
        var decoded = Base64.decode(base64Filter);
        var filter = JSON.parse(decoded);
        $(':checkbox').attr('checked', false);
        if(filter.allowFeeds != null) {
            for (var i in filter.allowFeeds) {
                var feed = filter.allowFeeds[i];
                var c = 'input[value="' + feed + '"]';
                $(c).click();
            }
        }
        if(filter.allowIdPs != null) {
            for (var i in filter.allowIdPs) {
                var idp = filter.allowIdPs[i];
                var c = 'input[value="' + idp + '"]';
                $(c).click();
            }
        }
        if(filter.allowHostel != null) {
            if(filter.allowHostel instanceof Array) {
                throw "allowHostel is an Array";
            }
            else {
                if(filter.allowHostel == true) {
                    $('#hostel').click();
                    if(filter.allowHostelReg != null) {
                        if(filter.allowHostelReg instanceof Array) {
                            throw "allowHostelReg is an Array";
                        }
                        else {
                            if(filter.allowHostelReg == true) {
                                $('#hostelreg').click();
                            }
                        }
                    }
                }
            }
        }
    }
    catch(err) {
	alert(err);
        $("#errdialog").dialog("open");
        $('#filterval').addClass("errorfilter");
    }
}

function sortEntities(e1, e2) {
    if(e1 == e2) {
        return 0;
    }
    else if(e1 < e2) {
        return -1;
    }
    else {
        return 1;
    }
}

var ea;

function getNameFromId(id) {
    var name = id["label"]["cs"];
    if(name == null) {
        var name = id["label"]["en"];
    }
    if(name == null) {
        var name = id["label"]["de"];
    }
    if(name == null) {
        var name = id["label"]["fr"];
    }
    if(name == null) {
        var name = id["label"]["it"];
    }
    return name;
}

function sortIdps(a, b) {
    var idpNameA = getNameFromId(ea[a]);
    var idpNameB = getNameFromId(ea[b]);
    return idpNameA.localeCompare(idpNameB);
}

function showIdps(url, content) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        return function(cont) {
            if(xmlhttp.readyState == 4 ) {
                switch(xmlhttp.status) {
                    case 200:
                        var feedData = JSON.parse(xmlhttp.responseText);
                        var eArray = feedData.entities;
                        ea = eArray;
//                        alert(JSON.stringify(eArray));
                        var keys = [];
                        for (var key in eArray) {
                            if (eArray.hasOwnProperty(key)) {
                                keys.push(key);
                            }
                        }
                        keys.sort(sortIdps);
                        for(var e in keys) {
                            var ent = keys[e];
                            var value = eArray[ent];
                            var idpName = getNameFromId(value);
                            var i = document.createElement("input");
                            var l = document.createElement("label");
                            i.type = "checkbox";
                            i.name = "idp[]";
                            i.value = ent;
                            i.className = "oc";
                            var s = document.createElement("span");
                            s.innerHTML = idpName + " (" + ent + ")";
                            var b = document.createElement("br");
                            
                            l.appendChild(i);
                            l.appendChild(s);
                            
                            cont.appendChild(l);
                            cont.appendChild(b);
                        }
                        break;
                    case 304:
                        break;
                    default:
                        break;
                }
            }
        }(content);
    };
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}

function fillFeeds() {

    $("#gendialog").dialog({
        autoOpen: true,
        modal: true,
        closeOnEscape: false,
    });
//    $('textarea').each(function() {
//        $.data(this, 'default', this.value);
//    }).focus(function() {
//        if(!$.data(this, 'edited')) {
//            this.value = '';
//        }
//    }).change(function() {
//        $.data(this, 'edited', this.value != "");
//    }).blur(function() {
//        if(!$.data(this, 'edited')) {
//            this.value = $.data(this, 'default');
//        }
//    });

    var feedsDiv = document.getElementById("feedsDiv");
    for(var key in feeds)  {
        var i = document.createElement("input");
        i.type = "checkbox";
        i.name = "feed[]";
        i.value = key;
        i.className = "oc";
        var l = document.createElement("label");
        var s = document.createElement("span");
        s.innerHTML = key;
        var b = document.createElement("br");
        l.appendChild(i);
        l.appendChild(s);
        feedsDiv.appendChild(l);
        feedsDiv.appendChild(b);
        var value = feeds[key];
        var idpAcc = document.getElementById("idpaccordion");
        var title = document.createElement("h3");
        var cont = document.createElement("div");
        cont.id = key;
        title.innerHTML = key;
        idpAcc.appendChild(title);
        idpAcc.appendChild(cont);
        showIdps(value, cont);
    }
    $('.oc').change(function(){ regenerateFilter(); });
    $("#accordion,#idpaccordion").accordion({
        heightStyle: "content"
    });
    $("#tabs").tabs();
    $(".info").addClass('ui-state-highlight ui-corner-all').css('margin-bottom', '1em').css('padding', '1em 1em');
    $("button").button().click(function(event) {
        event.preventDefault();
        decodeFilter();
    });
    $("#errdialog").dialog({
        autoOpen: false,
        buttons: [ {text: "Ok", click: function(){ $(this).dialog("close"); } } ],
        dialogClass: "alert",
        modal: true
    });
    $("#gendialog").dialog("close");
}
