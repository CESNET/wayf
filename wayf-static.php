<?php

include 'Mobile_Detect.php';
include '/opt/getMD/lib/SPInfo.php';

$DEVEL = false;
$wayfBase = "https://ds.eduid.cz";

if(isset($DEVEL) && $DEVEL == true) {
    $wayfURL = $wayfBase . "/wayf-static-dev.php";
    $logFile = "/tmp/wayf-dev.log";
}
else {
    $failbackWayf = "https://ds.eduid.cz/wayf-static.php";
    $wayfURL = $wayfBase . "/wayf-static.php";
    $logFile = "/tmp/wayf.log";
}

$messages = array(
    "LOGIN" => array("cs" => "Přihlásit účtem", "en" => "Login with" ),
    "CREATE_ACCOUNT" => array("cs" => "Vytvořit účet", "en" => "Create account" ),
);

function getLabelFromEntity($entity) {
    global $lang;
    if(isset($entity["label"][$lang]) && $entity["label"][$lang] != "") {
        $title = $entity["label"][$lang];
    }
    else if(isset($value["label"]["cs"])) {
        $title = $entity["label"]["cs"];
    }
    else {
        $title = $entity["label"]["en"];
    }
    return $title;
}

function strCompare($str1, $str2) {
    $a = str_replace("Č", "C", $str1);
    $b = str_replace("Č", "C", $str2);
    return strcmp($a, $b);
}

function idpCmp($a, $b) {
    $aLabel = getLabelFromEntity($a);
    $bLabel = getLabelFromEntity($b);
    return strCompare($aLabel, $bLabel);
}

function wlog($data) {
    global $logFile;
    $d = date("Y m d H:i:s");
    error_log("[" . $d . "] [STATIC] ", 3, $logFile);
    $a = print_r($data, true);
    error_log($a, 3, $logFile);
    error_log("\n", 3, $logFile);
}

function wdebug($data, $popis) {
    global $logFile;
    $d = date("Y m d H:i:s");
    error_log("[" . $d . "] [STATIC] ", 3, $logFile);
    $a = print_r($data, true);
    error_log($popis . $a, 3, $logFile);
    error_log("\n", 3, $logFile);
}

function getUri($lang) {
    $uri = "?";
    foreach($_GET as $key => $value) {
        $uri .= $key . "=";
        if($key == "lang") {
            $uri .= $lang . "&";
        }
        else {
            $uri .= urlencode($value) . "&";
        }
    }
    return $uri;
}

function getHostelRegistrarUrl() {
    global $wayfURL, $lang, $hostelRegistrarURL;
    $uri = $hostelRegistrarURL . "?";
    foreach($_GET as $key => $value) {
        $uri .= $key . "=";
        if($key == "return") {
            $uri .= urlencode($wayfURL . getUri($lang) .  "fromHostel=true");
        }
        else {
            $uri .= urlencode($value) . "&";
        }
    }
    return $uri;
}

if(isset($_GET['returnIDParam'])) {
    $returnIDVariable = $_GET['returnIDParam'];
}
else {
    $returnIDVariable = 'entityID';
}

function addIdP($label, $id, $logo) {
    global $returnURL, $returnIDVariable, $ban_lib, $lib;

    if($ban_lib) {
        if(in_array($id, $lib)) {
            return;
        }
    }

    echo("<a class=\"enabled\" title=\"" . $label . "\" href=\"" . $returnURL . "&" . $returnIDVariable . "=" . $id . "\">\n");
    echo("<img class=\"logo\" src=\"" . $logo . "\">\n");
    echo("<span class=\"title\">" . $label . "</span>\n");
    echo("<hr>");
    echo("</a>\n");
}


// ---------- Knihovny? Nein, danke! ----------
$ban_lib = false;
$lib = array();
if(isset($_GET["k-n-d"])) {
    $handle = fopen("/var/www/wayf/libraries.dat", "r");
    if($handle) {
        $ban_lib = true;
        while(($line = fgets($handle)) !== false) {
            $line = trim($line);
            if($line != "") {
                $lib[] = $line;
            }
        }
    } else {
        // error opening the file.
    }
    fclose($handle);
}
// -------------------------------------------


$detect = new Mobile_Detect();
$edge = "<meta http-equiv=\"X-UA-Compatible\" content=\"edge\" >";

//$doctype = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Frameset//EN\" \"http://www.w3.org/TR/html4/frameset.dtd\">\n";
//$charset = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";

$doctype = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">\n";
$charset = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n";

//$doctype = "<!DOCTYPE html>\n";
//$charset = "<meta charset=\"utf-8\" >";

$wayfURL = "https://$_SERVER[SERVER_NAME]/wayf-dev-static.php";

$returnURL = $_GET['return'];
$useFilter = false;
$entityID = $_GET['entityID'];
$lang = "cs";

// Hostel
$loa = $_GET['LoA'];
$kerberos = $_GET['kerberos'];
$hostelRegistrarURL = 'https://adm.hostel.eduid.cz/registrace';
$hostelId = "https://idp.hostel.eduid.cz/idp/shibboleth";
$hostelLabel = "Hostel IdP";
$hostelLogo = "/logo/idp.hostel.eduid.cz.idp.shibboleth.png";
$fromHostelRegistrar = $_GET['fromHostel'];
$allowHostel = false;
$allowHostelReg = false;

// $_GET["filter"] = "eyAiYWxsb3dGZWVkcyI6IEFycmF5KCJlZHVJRC5jeiIpLCAgImFsbG93SG9zdGVsIjogdHJ1ZSwgImFsbG93SG9zdGVsUmVnIjogdHJ1ZX0=";

if(isset($_GET["filter"])) {
    $extFilter = $_GET["filter"];
}
else if(isset($_GET["efilter"])) {
    $ch = curl_init($_GET["efilter"]);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $cdata = curl_exec($ch);
    if(!curl_errno($ch)){
        $info = curl_getinfo($ch);
        $extFilter = $cdata;
    } else {
        wlog('Curl error: ' . curl_error($ch));
    }
    curl_close($ch);
}

$useFilter = false;
$useHostel = false;
if(isset($extFilter)) {
    $rawFilter = $extFilter;
    $filter = base64_decode($rawFilter);
    wdebug($filter, "Decoded filter: ");
    $filter = str_replace("Array(", "[", $filter);
    $filter = str_replace(")", "]", $filter);
    $jFilter = json_decode($filter, true);
    if($jFilter !== NULL) {
        $useFilter = true;
        if(isset($jFilter['allowHostel']) && $jFilter['allowHostel'] == true) {
            $useHostel = true;
            if(isset($jFilter['allowHostelReg']) && $jFilter['allowHostelReg'] == true) {
                $allowHostelReg = true;
            }
        }
    }
    else {
        wlog("Error decoding filter " . $filter);
    }
}
else {
    wlog("External filter is not set.");
}

if(isset($_GET['entityID'])) {
    if(($useFilter && isset($jFilter['allowFeeds']) && $jFilter['allowFeeds'] !== "") || ($useFilter && isset($jFilter['allowIdPs']) && $jFilter['allowIdPs'] !== "")){
//    if($useFilter && isset($jFilter['allowFeeds']) && $jFilter['allowFeeds'] !== "") {
        $spInfo = getSPInfoAllFeeds($entityID);
    }
    else {
        $spInfo = getSPInfo($entityID);
    }
}

wdebug($_GET, "Request: ");
wdebug($_SERVER["HTTP_USER_AGENT"], "User agent: ");
wdebug($_SERVER["REMOTE_ADDR"], "Remote address: ");
wdebug($_SERVER["HTTP_REFERER"], "HTTP referrer: ");
wdebug($spInfo, "spInfo");
wlog("-----");

if(isset($_GET['lang'])) {
    if($_GET['lang'] == "cs" || $_GET['lang'] == "en") {
        $lang = $_GET['lang'];
    }
}

$isDumb = false;
if(isset($_GET['dumb'])) {
    if($_GET['dumb'] == "true") {
        $isDumb = true;
    }
}

if(isset($fromHostelRegistrar)) {
    $returnURL = urldecode($_GET['return']);
    $returnURL = $returnURL . "&" . $returnIDVariable . "=" . $hostelId;
    $otherParams = "";
    foreach($_GET as $gkey => $gval) {
        if(($gkey ==  "fromHostelRegistrar") || ($gkey == "useHostel") || ($gkey == "entityID") || ($gkey == "return")) {
            continue;
        }
        if($gval == "") {
            $otherParams = $otherParams . "&" . $gkey;
        }
        else {
            $otherParams = $otherParams . "&" . $gkey . "=" . urlencode($gval);
        }
    }
    $returnURL = $returnURL . $otherParams;
    header("Location: " . $returnURL);
}
else if(!isset($entityID)) {

    echo($doctype);
    echo("<html><head>");
    echo($charset);
    echo($edge);
    echo("<link rel=\"stylesheet\" type=\"text/css\" href=\"errorpage.css\">");
    echo("</head><body>");

    echo("<div id=\"nadpis_cs\"><h1>Nastala chyba</h1>");
    echo("Poskytovatel služby ke které se hlásíte nepředal všechny parametry potřebné pro přihlášení.<br>");
    echo("K přihlášení je nutný alespoň parametr &quot;<i>entityID</i>&quot;.<br>");
    echo("Seznam parametrů, které poskytovatel služby předal, můžete vidět v seznamu níže.<br>");
    echo("Dokumetaci k přihlašovací službě můžete najít na adrese <a href=\"http://www.eduid.cz/cesnet-ds\">http://www.eduid.cz/cesnet-ds</a></div>");

    echo("<div id=\"nadpis_en\"><h1>An error occured</h1>");
    echo("Service provider didn't send all parameters needed for login.<br>");
    echo("For login is needed at least &quot;<i>entityID</i>&quot.<br>");
    echo("List of parameters sended from service provider is below.");
    echo("<br>Documentation (in czech language) can be found at <a href=\"http://www.eduid.cz/cesnet-ds\">http://www.eduid.cz/cesnet-ds</a></div>");

    echo("<div id=\"paramlist\"><h2>Seznam parametrů / List of parameters</h2>");

    foreach($_GET as $key => $value) {
        $gval = $_GET[$gparam];
        echo("[$key] = [$value]<br>\n");
    }
    echo("</div><div class=\"roztah\"></div>");



}
else {

    $mobile = false;
    if($detect->isMobile() || $detect->isTablet()) {
        $mobile = true;
    }

    $entities = array();


    if($useFilter && isset($jFilter['allowFeeds'])) {
//        wlog("allowFeeds is set");
        foreach($jFilter['allowFeeds'] as $feed) {
//            wdebug($feed, "FilterFeed: ");
            $feedPath = "/opt/getMD/var/pub/current/feed/" . $feed . ".js";
            $feedFile = file_get_contents($feedPath);
            $fd = json_decode($feedFile, true);
            $c_entities = $fd["entities"];
            $entities = array_merge($entities, $c_entities);
        }
    }
    else {
//        wlog("allowFeeds is not set");
        foreach($spInfo['feeds'] as $feed) {
            $feedPath = "/opt/getMD/var/pub/current/feed/" . $feed . ".js";
            $feedFile = file_get_contents($feedPath);
            $fd = json_decode($feedFile, true);
            $c_entities = $fd["entities"];
            $entities = array_merge($entities, $c_entities);
        }
    }

//    wdebug($jFilter, "jFilter: ");
    wdebug($entities, "entities: ");
    wdebug($spInfo, "spInfo: ");
    if($useFilter && isset($jFilter['allowIdPs'])) {
        $fentities = Array();
        foreach($entities as $key => $value) {
//            wdebug($key, "Testing key: ");

            if(in_array($key, $jFilter['allowIdPs'])) {
                $fentities[$key] = $value;
//                wdebug($key, "Adding IdP: ");
            }
        }
        $entities = $fentities;
    }
//    wdebug($spInfo, "Entities: ");
    $sorted_entities = uasort($entities, 'idpCmp');

    echo($doctype);
    echo("<html><head>");
    echo($charset);
    echo($edge);
    if($isDumb) {
        echo("<link rel=\"stylesheet\" type=\"text/css\" href=\"computer-noscript-dumb.css\" />");
    }
    else {
        echo("<link rel=\"stylesheet\" type=\"text/css\" href=\"computer-noscript.css\" />");
    }
    echo("</head><body>\n");

    echo("<div id=\"wayf\">\n");
    echo("<div class=\"top\">\n");
    echo("<p class=\"toptitle\">");

    $login_str = $messages["LOGIN"][$lang];

    echo($login_str);
    echo("</p>\n");
    echo("</div>\n");
    echo("<div class=\"content\">\n");
    echo("<div class=\"topfiller\"></div>\n");
    echo("<div class=\"scroller\">\n");

    $hostelInserted = false;

   foreach($entities as $key => $value) {
        $label = getLabelFromEntity($value);
        if($useHostel && !$hostelInserted) {
            if(strCompare($label, $hostelLabel) > 0) {
                addIdp($hostelLabel, $hostelId, $hostelLogo);
                $hostelInserted = true;
            }
        }
        addIdp($label, $key, $value["logo"]);
    }

/*
    foreach($entities as $key => $value) {
        $label = getLabelFromEntity($value);
        if($allowHostel && !$hostelInserted) {
            if(strCompare($label, $hostelLabel) > 0) {
                addIdp($hostelLabel, $hostelId, $hostelLogo);
                $hostelInserted = true;
            }
        }
        addIdp($label, $key, $value["logo"]);
    }
*/
    echo("</div>\n");
    echo("<div class=\"bottomfiller\"></div>\n");
    echo("</div>\n");

    echo("<div class=\"bottom\">\n");

    if($useHostel && $allowHostelReg) {
        $label = $messages["CREATE_ACCOUNT"][$lang];
        echo("<div class=\"bwrap\">\n");
        echo("<a href=\"" . getHostelRegistrarUrl() . "\" class=\"button\">");
        echo($label);
        echo("</a>");
        echo("</div>\n");
    }

    $pself = $_SERVER["PHP_SELF"];
    $uri = getUri("cs");
    echo("<div class=\"lang\">\n");
    echo("<a href=\"" . $pself . $uri . "&lang=cs" .  "\">");
    echo("<img src=\"cs.png\">");
    echo("</a>");
    echo("</div>\n");

    $uri = getUri("en");
    echo("<div class=\"lang\">\n");
    echo("<a href=\"" . $pself . $uri . "&lang=en" . "\">");
    echo("<img src=\"gb.png\">");
    echo("</a>");
    echo("</div>\n");

    echo("<p id=\"help\"><a id='helpa' href='http://www.eduid.cz/cesnet-ds' target='_blank'><span id='helps'>CESNET</span><img class=\"helpimg\" src=\"help.png\" alt=\"Information\"></a></p>\n");
    echo("</div>\n");
    echo("</div>\n");

    echo("<br><br><br>");

}
echo("</body></html>");
