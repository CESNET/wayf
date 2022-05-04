var ecList = {};
var ea;

var allowEC = "allowEC";
var denyEC = "denyEC";

function normalizeFeeds() {
    for (var feed in feeds) {
        var checked = $("input[name='" + feed + "-idp[]']:checked");
        if (checked.length > 0) {
            var ft = ($("input[value='" + feed + "']"))[0];
            if (!ft.checked) {
                ft.click();
            }
        }
    }
}


function colorIdPs() {
    for (var key in feeds) {
        var feed = feeds[key].url;
        var ft = ($("input[name='" + feed + "-filterType']:checked"))[0];
        var checked = $("input[name='" + feed + "-idp[]']:checked").next();
        var unchecked = $("input[name='" + feed + "-idp[]']:not(:checked)").next();
        if (ft.value == "whitelist") {
            checked.removeClass("black red").addClass("green");
            unchecked.removeClass("green red").addClass("black");
        } else {
            checked.removeClass("black green").addClass("red");
            unchecked.removeClass("green red").addClass("black");
        }
    }
}


function regenerateFilter() {

    var filterInfo = document.getElementById('filterinfo');
    var filterVal = document.getElementById('filterval');
    var rawFilterArea = document.getElementById('rawfilter');
    var filterKey = "filter=";
    var social = document.getElementById('social');
    var kontrola = document.getElementById('kontrola');
    var filter = "";
    var checkedFeeds = new Array();
    var useFeeds = false;
    var fo = {};
    fo.ver = "2";

    colorIdPs();
    normalizeFeeds();
    var checkedFeeds = $("input[name='feed[]']:checked");
    if (checkedFeeds.length > 0) {
        fo.allowFeeds = {};
        for (var i = 0; i < checkedFeeds.length; i++) {
            var feed = checkedFeeds[i];
            fo.allowFeeds[feed.value] = {};


            var checkedEC = $("input[feed='" + feed + "']:checked");
            var ecLen = checkedEC.length;

            var checkedIdPs = $("input[name='" + feed.value + "-idp[]']:checked");
            if (checkedIdPs.length > 0) {
                var fds = Array();
                for (var j = 0; j < checkedIdPs.length; j++) {
                    var idp = checkedIdPs[j];
                    var idpVal = idp.value;
                    fds.push(idpVal);
                }
                var ft = $("input[name='" + feed.value + "-filterType']:checked");
                var filterType = ft[0];
                var fts = filterType.value == "whitelist" ? "allowIdPs" : "denyIdPs";
                fo.allowFeeds[feed.value][fts] = fds;
            } else {
                fo.allowFeeds[feed.value] = {};
            }

            var allowedEC = ecList[feed.value][allowEC];
            if (allowedEC.length > 0) {
                fo.allowFeeds[feed.value][allowEC] = allowedEC;
            }

            var deniedEC = ecList[feed.value][denyEC];
            if (deniedEC.length > 0) {
                fo.allowFeeds[feed.value][denyEC] = deniedEC;
            }
        }
    }

    var filter = JSON.stringify(fo);
    var filterValue = Base64.encode(filter);
    var filterLen = filterValue.length;
    var rawFilterValue = filterKey + filter;
    kontrola.innerText = filter;

    fPopis = str4 + filterValue + str5 + str6 + filterLen + str7 + str1 + filterAdminsURL + str2 + filterUsersURL + str3;
    filterInfo.innerHTML = fPopis;
    filterVal.value = filterValue;

    $('#filterval').removeClass("errorfilter");
}


function decodeFilter() {
    try {
        $('#filterval').removeClass("errorfilter");
        var filterArea = document.getElementById('filterval');
        var base64Filter = filterArea.value;
        var decoded = Base64.decode(base64Filter);
        var filter = JSON.parse(decoded);
        var encoded = Base64.encode(decoded);
        var kontrola = document.getElementById('kontrola');
        if (filter.ver == null) {
            throw "This is not compatible filter version.";
        }
        $(':checkbox').attr('checked', false);
        $("input[value='whitelist']").click();
        $("[container='zero']").empty();
        $("[container='allowEC']").empty();
        $("[container='denyEC']").empty();
        for (var key in feeds) {
            var feed = feeds[key].url;
            ecList[feed][allowEC] = Array();
            ecList[feed][denyEC] = Array();
        }
        if (filter.allowFeeds != null) {
            for (var feed in filter.allowFeeds) {
                var zero = $("[feed='" + feed + "'][container='zero']");
                var allow = $("[feed='" + feed + "'][container='allowEC']");
                var deny = $("[feed='" + feed + "'][container='denyEC']");
                $("input[value='" + feed + "']").click();
                if (filter.allowFeeds[feed].allowIdPs != null) {
                    for (var kidp in filter.allowFeeds[feed].allowIdPs) {
                        var idp = filter.allowFeeds[feed].allowIdPs[kidp];
                        var i = $("input[name='" + feed + "-idp[]'][value='" + idp + "']");
                        i.click();
                    }
                } else if (filter.allowFeeds[feed].denyIdPs != null) {
                    $("[name='" + feed + "-filterType'][value='blacklist']").click();
                    for (var kidp in filter.allowFeeds[feed].denyIdPs) {
                        var idp = filter.allowFeeds[feed].denyIdPs[kidp];
                        var i = $("input[name='" + feed + "-idp[]'][value='" + idp + "']");
                        i.click();
                    }
                }

                if (filter.allowFeeds[feed].allowEC != null) {
                    for (var kec in filter.allowFeeds[feed].allowEC) {
                        var ec = filter.allowFeeds[feed].allowEC[kec];
                        ecList[feed].allowEC.push(ec);
                        var sp = document.createElement("li");
                        sp.classList.add("ecitem");
                        sp.innerText = ec;
                        allow.append(sp);
                    }
                    regenerateFilter();
                }
                if (filter.allowFeeds[feed].denyEC != null) {
                    for (var kec in filter.allowFeeds[feed].denyEC) {
                        var ec = filter.allowFeeds[feed].denyEC[kec];
                        ecList[feed].denyEC.push(ec);
                        var sp = document.createElement("li");
                        sp.classList.add("ecitem");
                        sp.innerText = ec;
                        deny.append(sp);
                    }
                    regenerateFilter();
                }

            }
        }
        for (var key in feeds) {
            var feed = feeds[key].url;
            var zero = $("[feed='" + feed + "'][container='zero']");
            for (var kec in ecList[feed].allEC) {
                var ec = ecList[feed].allEC[kec];
                var sp = document.createElement("li");
                sp.classList.add("ecitem");
                sp.innerText = ec;
                zero.append(sp);
            }
        }
        if (kontrola.innerText !== decoded) {
            $("#dfdialog").dialog("open");
        }
    } catch (err) {
        alert(err);
        $("#errdialog").dialog("open");
        $('#filterval').addClass("errorfilter");
    }
}

function sortEntities(e1, e2) {
    if (e1 == e2) {
        return 0;
    } else if (e1 < e2) {
        return -1;
    } else {
        return 1;
    }
}

function getNameFromId(id) {
    var name = id["label"]["cs"];
    if (name == null) {
        var name = id["label"]["en"];
    }
    if (name == null) {
        var name = id["label"]["de"];
    }
    if (name == null) {
        var name = id["label"]["fr"];
    }
    if (name == null) {
        var name = id["label"]["it"];
    }
    if (name == null) {
        return "";
    }
    return name;
}


function sortIdps(a, b) {
    var idpNameA = getNameFromId(ea[a]);
    var idpNameB = getNameFromId(ea[b]);
    return idpNameA.localeCompare(idpNameB);
}


function showIdps(url, idpContent, ecContent, feed) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        return function (cont, ecCont, fd) {
            if (xmlhttp.readyState == 4) {
                switch (xmlhttp.status) {
                    case 200:
                        var feedData = JSON.parse(xmlhttp.responseText);
                        var eArray = feedData.entities;
                        ea = eArray;
                        var keys = [];
                        var ecSet = [];
                        for (var key in eArray) {
                            if (eArray.hasOwnProperty(key)) {
                                keys.push(key);
                            }
                        }
                        keys.sort(sortIdps);
                        for (var e in keys) {
                            var ent = keys[e];
                            var value = eArray[ent];
                            var idpName = getNameFromId(value);
                            var i = document.createElement("input");
                            var l = document.createElement("label");
                            if (typeof value.EC !== 'undefined') {
                                for (var keyEC in value.EC) {
                                    var ec = value.EC[keyEC];
                                    if (ecSet.indexOf(ec) == -1) {
                                        ecSet.push(ec);
                                    }
                                }
                            }
                            i.type = "checkbox";
                            i.name = fd + "-idp[]";
                            i.value = ent;
                            i.classList.add("oc");
                            var s = document.createElement("span");
                            s.innerHTML = idpName + " (" + ent + ")";
                            var b = document.createElement("br");

                            l.appendChild(i);
                            l.appendChild(s);

                            cont.appendChild(l);
                            cont.appendChild(b);
                        }

                        var zero = document.createElement("ul");
                        zero.classList.add("zero");
                        zero.setAttribute("feed", fd);
                        zero.setAttribute("container", "zero");

                        var plus = document.createElement("ul");
                        plus.classList.add("allow");
                        plus.setAttribute("feed", fd);
                        plus.setAttribute("container", "allowEC");

                        var minus = document.createElement("ul");
                        minus.classList.add("deny");
                        minus.setAttribute("feed", fd);
                        minus.setAttribute("container", "denyEC");

                        for (var key in ecSet) {
                            var ec = ecSet[key];
                            var sp = document.createElement("li");
                            sp.classList.add("ecitem");
                            sp.innerText = ec;
                            zero.appendChild(sp);
                            ecList[fd].allEC.push(ec);
                        }

                        ecContent.appendChild(zero);
                        ecContent.appendChild(plus);
                        ecContent.appendChild(minus);
                        break;
                    case 304:
                        break;
                    default:
                        break;
                }
            }
        }(idpContent, ecContent, feed);
    };
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
}


function deleteKeyFromArray(key, array) {
    var i = array.indexOf(key);
    if (i != -1) {
        array.splice(i, 1);
    }
}


function switchOnFeed(feedName) {
    $("input:checkbox[value='" + feedName + "']").not(":checked").click();
}

function addECStringToList(ecString, feed, listType) {

    // listType values: zero, allowEC, denyEC
    var feedList = ecList[feed];
    var aList = feedList["allowEC"];
    var dList = feedList["denyEC"];
    switch (listType) {

        case "zero":
            deleteKeyFromArray(ecString, aList);
            deleteKeyFromArray(ecString, dList);
            break;

        case "allowEC":
            aList.push(ecString);
            deleteKeyFromArray(ecString, dList);
            switchOnFeed(feed);
            break;

        case "denyEC":
            dList.push(ecString);
            deleteKeyFromArray(ecString, aList);
            switchOnFeed(feed);
            break
    }
}


function fillFeeds() {

    $("#gendialog").dialog({
        autoOpen: true,
        modal: true,
        closeOnEscape: false,
    });
    var feedsDiv = document.getElementById("feedsDiv");
    for (var key in feeds) {

        var label = feeds[key].label;
        var url = feeds[key].url;

        var i = document.createElement("input");
        i.type = "checkbox";
        i.name = "feed[]";
        i.value = url;
        i.className = "oc";

        var newList = {};
        var allow = Array();
        var deny = Array();
        var all = Array();
        newList["allowEC"] = allow;
        newList["denyEC"] = deny;
        newList["allEC"] = all;

        ecList[url] = newList;

        var i1 = document.createElement("input");
        var l1 = document.createElement("label");
        i1.type = "radio";
        i1.name = url + "-filterType";
        i1.value = "whitelist";
        i1.checked = "checked";
        i1.className = "oc";
        var s1 = document.createElement("span");
        s1.innerHTML = str8;
        var b1 = document.createElement("br");
        l1.appendChild(i1);
        l1.appendChild(s1);

        var i2 = document.createElement("input");
        var l2 = document.createElement("label");
        i2.type = "radio";
        i2.name = url + "-filterType";
        i2.value = "blacklist";
        i2.className = "oc";
        var s2 = document.createElement("span");
        s2.innerHTML = str9;
        var b2 = document.createElement("br");
        l2.appendChild(i2);
        l2.appendChild(s2);

        var l = document.createElement("label");
        var s = document.createElement("span");
        s.innerHTML = label;
        var b = document.createElement("br");
        l.appendChild(i);
        l.appendChild(s);
        feedsDiv.appendChild(l);
        feedsDiv.appendChild(b);
        var idpAcc = document.getElementById("idpaccordion");
        var title = document.createElement("h3");
        var cont = document.createElement("div");
        cont.id = url;
        title.innerHTML = label;
        idpAcc.appendChild(title);
        idpAcc.appendChild(cont);

        var ecAcc = document.getElementById("ecaccordion");
        var ecTitle = document.createElement("h3");
        var ecCont = document.createElement("div");
        ecCont.id = url;
        ecTitle.innerHTML = label;
        ecAcc.appendChild(ecTitle);
        ecAcc.appendChild(ecCont);

        cont.appendChild(l1);
        cont.appendChild(b1);

        cont.appendChild(l2);
        cont.appendChild(b2);

        var bb = document.createElement("br");
        cont.appendChild(bb);

        showIdps("/feed/" + url + ".js", cont, ecCont, url);
    }

    $('.oc').change(function () {
        regenerateFilter();
    });
    $(".zero,.allow,.deny").sortable({
        connectWith: ".zero,.allow,.deny",
        receive: function (event, ui) {
            var ec = $(ui.item).text();
            var feed = $(this).attr("feed");
            var cont = $(this).attr("container");
            addECStringToList(ec, feed, cont);
            regenerateFilter();
        }
    });
    $("#accordion,#idpaccordion,#ecaccordion").accordion({
        heightStyle: "content"
    });
    $("#tabs").tabs();
    $(".info").addClass('ui-state-highlight ui-corner-all').css('margin-bottom', '1em').css('padding', '1em 1em');
    $("button").button().click(function (event) {
        event.preventDefault();
        decodeFilter();
    });
    $("#errdialog").dialog({
        autoOpen: false,
        buttons: [{
            text: "Ok", click: function () {
                $(this).dialog("close");
            }
        }],
        dialogClass: "alert",
        modal: true
    });
    $("#dfdialog").dialog({
        autoOpen: false,
        buttons: [{
            text: "Ok", click: function () {
                $(this).dialog("close");
            }
        }],
        dialogClass: "alert",
        modal: true
    });
    $("#gendialog").dialog("close");
}
