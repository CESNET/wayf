function setOverStyle () {
    var st = document.getElementById('ds-style');
    if (st == undefined) {
        st = document.createElement('style');
        st.setAttribute('type','text/css');
        st.id = 'ds-style';
var rules = {
    '#closer': 'margin:0px; padding: 2px 3px; border-radius:3px; text-decoration:none; font-family:Arial; font-size:13; border: solid 1px #BBBBBB; color:#333; cursor:pointer; position:fixed; top:35px; right:12px; z-index:2;',
    '#closer:hover': 'border: solid 1px #000! important; color:#000 !important',
    '#overl': 'width:100%; height:100%; display:block; position:fixed; top:0px; left:0px; background-color:rgba(192, 192, 192, .62);'
};

document.getElementsByTagName('head')[0].appendChild(st);
var s = document.styleSheets[document.styleSheets.length - 1];
//var s = st.sheet ? st.sheet : st.styleSheet;
for (selector in rules) {
    if (s.insertRule) {// W3C
try {
    s.insertRule(selector + ' {' + rules[selector] + '}', s.cssRules.length);
} catch (e) {alert ('insertRule: ' + e);}
    } else {// IE
try {
    s.addRule(selector, rules[selector]/*,s.cssRules.length */);
} catch(e) {alert ('addRule: ' + e);}
    }
}
    }
}

function showCloser (overl) {
    var closer = document.createElement('div');
    var bdy = document.getElementsByTagName('body')[0];
    closer.id = 'closer';
    closer.innerHTML = 'x';
    closer.onclick = function () {
    var ov = overl;
    var par = bdy;
    par.removeChild(ov);
    par.removeChild(this);
    };

    bdy.appendChild(closer);
}

function setIframeFocus(){
  document.getElementById('overl').contentWindow.focus();
}

function startOverlay (ev) {

    if(localStorage === undefined || localStorage === null) {
        return false;
    }

    if(navigator.userAgent.match(/Android/i)) {
        return true;
    }

    if(navigator.userAgent.match(/iPhone/i)) {
        return true;
    }

    if(navigator.userAgent.match(/iPod/i)) {
        return true;
    }

    if(navigator.userAgent.match(/iPad/i)) {
        return true;
    }

    if(navigator.userAgent.indexOf("Opera") == 0) {
        return true;
    }

    if (window.event) {
        ev = window.event;
    }
    var tgt = ev.currentTarget || ev.srcElement;
    var src = tgt.href;

    if (ev.preventDefault) {
        ev.preventDefault();
    } else if (typeof ev.cancelBubble != 'undefined') {
        ev.cancelBubble = true;
    }
    if (typeof ev.returnValue != 'undefined') {
        ev.returnValue = false;
    }

    try {

    var overl = document.createElement('iframe');
    setOverStyle();
    overl.src = src;
    overl.id = "overl";
    overl.name = "overl";
    overl.onload = function () {
        var ol = overl;
        showCloser(ol);
        setTimeout(setIframeFocus, 100);
    };
    var bdy = document.getElementsByTagName('body')[0];
    bdy.appendChild(overl);

    }
    catch(err) {
//        console.log(err);
    }

    return false;
}
