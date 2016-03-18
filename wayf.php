<?php

include 'Mobile_Detect.php';
include '/opt/getMD/lib/SPInfo.php';

$detect = new Mobile_Detect();

$edge = "<meta http-equiv=\"X-UA-Compatible\" content=\"edge\" >";

//$doctype = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Frameset//EN\" \"http://www.w3.org/TR/html4/frameset.dtd\">\n";
//$charset = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";

$doctype = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">\n";
$charset = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n";

//$doctype = "<!DOCTYPE html>\n";
//$charset = "<meta charset=\"utf-8\" >";

$DEVEL = false;

if(isset($DEVEL) && $DEVEL == true) {
    $failbackWayf = "/wayf-static-dev.php";
    $script = file_get_contents("wayf-dev.js");
    $wayfURL = "/wayf-dev.php";
    $logFile = "/tmp/wayf-dev.log";
}
else {
    $failbackWayf = "/wayf-static.php";
    $script = file_get_contents("wayf.js");
    $wayfURL = "/wayf.php";
    $logFile = "/tmp/wayf.log";
}

function urldecodeToArray($url) {
    $ret_ar = array();
    if (($pos = strpos($url, '?')) !== false) {
        $url = substr($url, $pos + 1);
    }
    if (substr($url, 0, 1) == '&') {
        $url = substr($url, 1);
    }
    $elems_ar = explode('&', $url);
    for ($i = 0; $i < count($elems_ar); $i++) {
        list($key, $val) = explode('=', $elems_ar[$i]);
        $ret_ar[urldecode($key)] = urldecode($val);
    }
    return $ret_ar;
}

/* pass variable from php to javascript */
function addVariable($varName, $varValue, $isRecursion=false) {
    if(!$isRecursion) {
        echo("var $varName = ");
    }
    if(is_array($varValue)) {
        echo("Array(");
        $cnt = count($varValue);
        for($i=0; $i< $cnt; $i++) {
            $value = $varValue[$i];
            addVariable($varName, $value, true);
            if($i+1<$cnt) {
                echo(", ");
            }
        }
        echo(")");
    }
    else if(gettype($varValue) == "string") {
        echo("\"$varValue\"");
    }
    else if(gettype($varValue) == "boolean") {
        $str = $varValue ? "true" : "false";
        echo($str);
    }
    else {
        echo($varValue);
    }
    if(!$isRecursion) {
        echo(";\n");
    }
}

$wayfBase = "https://" . $_SERVER['HTTP_HOST'];
$returnURL = $_GET['return'];

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
    } 
    curl_close($ch);
}


$useFilter = false;
$useHostel = false;
if(isset($extFilter)) {
    $rawFilter = $extFilter;
    $filter = base64_decode($rawFilter);
    $filter = str_replace("Array(", "[", $filter);
    $filter = str_replace(")", "]", $filter);
    $jFilter = json_decode($filter, true);
    if($jFilter !== NULL) {
        $useFilter = true;
        if(isset($jFilter['allowHostel']) && $jFilter['allowHostel'] == true) {
            $useHostel = true;
            if(isset($jFilter['allowHostelReg']) && $jFilter['allowHostelReg'] == true) {
                $useHostel = true;
            }
        }
    }
    
}

$entityID = $_GET['entityID'];
if(isset($_GET['returnIDParam'])) {
    $returnIDVariable = $_GET['returnIDParam'];
}
else {
    $returnIDVariable = 'entityID';
}

if(isset($_GET['entityID'])) {
    if(($useFilter && isset($jFilter['allowFeeds']) && $jFilter['allowFeeds'] !== "") || ($useFilter && isset($jFilter['allowIdPs']) && $jFilter['allowIdPs'] !== "")) {
//    if($useFilter && isset($jFilter['allowFeeds']) && $jFilter['allowFeeds'] !== "") {
        $spInfo = getSPInfoAllFeeds($entityID);
    }
    else {
        $spInfo = getSPInfo($entityID);
    }
}

// Hostel
if(isset($_GET['LoA'])) {
    $_GET['LoA'];
}
if(isset($_GET['lang'])) {
    $lang = $_GET['lang'];
}
if(isset($_GET['kerberos'])) {
    $kerberos = $_GET['kerberos'];
}
$hostelRegistrarURL = 'https://adm.hostel.eduid.cz/registrace';
$hostelId = "https://idp.hostel.eduid.cz/idp/shibboleth";
if(isset($_GET['fromHostel'])) {
    $fromHostelRegistrar = $_GET['fromHostel'];
}


$browser = get_browser($_SERVER['HTTP_USER_AGENT'], true);
$supportedBrowser = true;

if($browser["browser"] == "Firefox" || $browser["browser"] == "Chrome") {
	$supportedBrowser = true;
} else if($browser["browser"] == "IE") {
	if($browser["majorver"] == 9 || $browser["majorver"] == 10) {
		$supportedBrowser = true;
	}
} else if($browser["default"]) {
    if(strpos($_SERVER['HTTP_USER_AGENT'], "Chrome/23")!==FALSE) {
        $supportedBrowser = true;
    }
}

if(isset($fromHostelRegistrar)) {

    $returnURL = urldecode($_GET['return']);
    $returnURL = $returnURL . "&" . $returnIDVariable . "=https://idp.hostel.eduid.cz/idp/shibboleth";
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
else if(!isset($entityID) || !isset($returnURL)) {
    
    echo($doctype);
    echo("<html><head>");
    echo($charset);
    echo($edge);
    echo("<title>Discovery service</title>");
    echo("<link rel=\"stylesheet\" type=\"text/css\" href=\"errorpage.css\">");
    echo("</head><body>");

    echo("<div id=\"nadpis_cs\"><h1>Nastala chyba</h1>");
    echo("Poskytovatel služby ke které se hlásíte nepředal všechny parametry potřebné pro přihlášení.<br>");
    echo("K přihlášení je nutný alespoň parametry &quot;<i>entityID</i>&quot; a &quot;<i>return</i>&quot;.<br>");
    echo("Seznam parametrů, které poskytovatel služby předal, můžete vidět v seznamu níže.<br>");
    echo("Dokumetaci k přihlašovací službě můžete najít na adrese <a href=\"http://www.eduid.cz/cesnet-ds\">http://www.eduid.cz/cesnet-ds</a></div>");

    echo("<div id=\"nadpis_en\"><h1>An error occured</h1>");
    echo("Service provider didn't send all parameters needed for login.<br>");
    echo("For login is needed at least &quot;<i>entityID</i>&quot and &quot;<i>return</i>&quot.<br>");
    echo("List of parameters sended from service provider is below.");
    echo("<br>Documentation (in czech language) can be found at <a href=\"http://www.eduid.cz/cesnet-ds\">http://www.eduid.cz/cesnet-ds</a></div>");

    if(!isset($_GET) || count($_GET)==0) {
        echo("<div id=\"paramlist\"><h2>Žádné parametry nebyly předány / No parameters given</h2>");
    }
    else {
        echo("<div id=\"paramlist\"><h2>Seznam parametrů / List of parameters</h2>");
        foreach($_GET as $key => $value) {
            $gval = $_GET[$gparam];
            echo("[$key] = [$value]<br>\n");
        }
        echo("</div><div class=\"roztah\"></div>");
    }


}
else {

    $mobile = false;
    $dumb = false;

    if($detect->isMobile() || $detect->isTablet()) {
        $mobile = true;
        if($detect->isAndroidOS() && $detect->isSafari()) {
            $dumb = true;
        }
    }

    header("X-UA-Compatible: IE=edge");

    if(isset($_GET["returnIDParam"])) {
        $useIDParam = true;
        $idParam = $_GET["returnIDParam"];
    }
    else {
        $useIDParam = false;
    }

    $qs = $_SERVER['QUERY_STRING'];
    $url = 'Location: ' . $failbackWayf . "?" . $qs;

    if($dumb) {
        $url = $url . "&dumb=true";
        header($url, true, 301);
        exit;
    }

    if(!$mobile && !$supportedBrowser) {
        header($url, true, 301);
        exit;
    }

    echo($doctype);
    echo("<html><head><title>Discovery service</title>");
    echo($charset);
    echo("<link rel=\"stylesheet\" href=\"jquery-ui.css\" />" );
    echo("<script type=\"text/javascript\" src=\"jquery-2.0.0.js\"></script>");
    echo("<script type=\"text/javascript\" src=\"jquery-ui.js\"></script>");
    echo($edge);

    if($mobile) {
        echo("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">");
        if($detect->isiOS()) {
            $osType = "ios";
        } else if($detect->isAndroidOS()) {
            $osType = "android";
        } else {
            $osType = "unknown";
        }
    }

     if($useFilter && isset($jFilter['allowFeeds'])) {
        $f = '{';
        foreach($jFilter['allowFeeds'] as $feed) {
            $f .= "\"$feed\":\"/feed/$feed.js\",";
        }
        $feeds = rtrim($f,",")."}";

    }
    else {
        $f = '{';
        foreach($spInfo['feeds'] as $feed) {
            $f .= "\"$feed\":\"/feed/$feed.js\",";
        }
        $feeds = rtrim($f,",")."}";
    }

    echo("<script type=\"text/javascript\">\n");

    addVariable("isMobile", $mobile);
    if($mobile) {
        addVariable("osType", $osType);
    }

    addVariable("returnIDVariable", $returnIDVariable);

    $server = "http";
    if($_SERVER["HTTPS"] == "on") {
	$server .= "s";
    }
    $server .= "://" . $_SERVER['HTTP_HOST'];
    if(($_SERVER["HTTPS"] == "on" && $_SERVER['SERVER_PORT'] != 443) || ($_SERVER['HTTPS'] != "on" && $_SERVER['SERVER_PORT'] != 80)) {
	$server .= ":" . $_SERVER['SERVER_PORT'];
    }
    $wayf = $server . $_SERVER['PHP_SELF'];
    $server .= "/";
    addVariable("serverURL", $server);
    addVariable("wayfURL", $wayf);

    $prefLang = "";
    if(isset($_GET['lang'])) {
	$prefLang = $_GET['lang'];
    }
    addVariable("prefLang", $prefLang);

    $nosearch = 0;
    if( isset( $_GET['nosearch'] )) {
      $nosearch = 1;
    }
    addVariable( "noSearch", $nosearch );

    $referrer = "";
    if(isset($_SERVER['HTTP_REFERER'])) {
	$referrer = $_SERVER['HTTP_REFERER'];
    }
    addVariable("referrer", $referrer);

    echo("var allFeeds = " . $feeds . ";\n");
    addVariable("returnURL", $returnURL);

    $otherParams = "";
    foreach($_GET as $gkey => $gval) {
	if(($gkey ==  "return") || ($gkey == "entityID") || ($gkey == "target") || ($gkey == "useHostel")) {
	    continue;
	}
	if($gval == "") {
            $otherParams = $otherParams . "&" . $gkey;
	}
	else {
            $otherParams = $otherParams . "&" . $gkey . "=" . urlencode($gval);
	}
        echo("// $gkey = $gval\n");
    }
    echo("var otherParams = \"$otherParams\";\n");
    echo("var useFilter = ");
    if($useFilter) {
        echo("true");
    }
    else {
        echo("false");
    }
    echo(";\n");
    if($useFilter) {
        echo("var filter = $filter;\n");
    }

    echo("var feedsStr = $feeds;\n");

    $getParams = "";
    foreach($_GET as $key => $value) {
            $gval = urlencode($value);
            $getParams .= "&" . $key . "=" . $gval;
    }
    echo("var httpParameters = \"$getParams\";\n");

    if(isset($useHostel)) {
        echo("var useHostel = true;\n");
        $hostelIdpParams = "/Shibboleth.sso/Login?SAMLDS=1&" . $returnIDVariable . "=" . urlencode($hostelId);
        $hostelRegistrarParams = "?return=";
        $hostelReturnParam = $wayfURL . "?fromHostelRegistrar" . $getParams;
        $hostelRegistrarParams .= urlencode($hostelReturnParam);
        $hostelRegistrarParams .= $getParams;
        $hostelRegistrarURLWithParams = $hostelRegistrarURL . $hostelRegistrarParams;
        echo("var hostelRegistrarURL = \"" . $hostelRegistrarURLWithParams . "\";\n");
    }
    else {
        echo("var useHostel = false;\n");
    }

    // ---------- Knihovny? Nein, danke! ----------
    $ban_lib = false;
    $lib = "";
    if(isset($_GET["k-n-d"])) {
        $handle = fopen("/var/www/wayf/libraries.dat", "r");
        if($handle) {
            $ban_lib = true;
            $lib = '[';
            while(($line = fgets($handle)) !== false) {
                $line = trim($line);
                if($line != "") {
                    $lib .= "\"" . $line . "\",";
                }
            }
            $lib = rtrim($lib,",")."]";
        } else {
            // error opening the file.
        }
        fclose($handle);
    }
    addVariable("banLib", $ban_lib);
    if($ban_lib) {
        echo("var libraries = " . $lib . ";\n");
    }
   // -------------------------------------------

    echo("var noHTML5URL = \"" . $failbackWayf . "?" . $qs . "\";\n");

    echo($script);
    echo("</script>\n");
    echo("<noscript>\n");

    echo("<meta http-equiv=\"refresh\" content=\"2;url=" . $failbackWayf . "?" . $qs . "\">\n");

    echo("</noscript>\n");
    echo("</head>\n");
    echo("<body onload=\"listData()\">\n");
}
echo("</body></html>");
