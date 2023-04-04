<?php

include 'Mobile_Detect.php';
include '/opt/getMD/lib/SPInfo.php';
include 'wayf_vars.php';  // customization CESNET/eduTEAMS


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
}
else {
    $failbackWayf = "/wayf-static.php";
    $script = file_get_contents("wayf.js");
    $wayfURL = "/wayf.php";
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
    if(!is_array($varValue)) {
      $varValue = strip_tags($varValue);
    }
    if(!$isRecursion) {
        echo "var $varName = ";
    }
    if(is_array($varValue)) {
        echo "Array(";
        $print_comma = false;
        foreach( $varValue as $value ) {
          if( $print_comma )
            echo ", ";

          addVariable( $varName, $value, true );
          $print_comma = true;
        }
          
        echo ")";
    }
    else if(gettype($varValue) == "string") {
        echo "\"$varValue\"";
    }
    else if(gettype($varValue) == "boolean") {
        $str = $varValue ? "true" : "false";
        echo $str;
    }
    else {
        echo $varValue;
    }
    if(!$isRecursion) {
        echo ";\n";
    }
}

/* return true if returnURL is on whitelist */
function checkReturnURLWhitelist( $returnURL ) {
  $whitelist_array = array(
    "https://attributes.eduid.cz/dsadev/Shibboleth.sso/Login",  // attributes.eduid.cz for developers version dsa-dev.eduid.cz
    "https://attribute-viewer.aai.switch.ch/Shibboleth.sso/Login",  // attribute-viewer at switch
    "https://dspace.amu.cz/Shibboleth.sso/Login",  // RT 461479
    "https://ftas-pa.cesnet.cz/Shibboleth.sso/DS",  // RT 465919
    "https://gc17.cesnet.cz/Shibboleth.sso/DS",  // RT 465919
    "https://pakiti.csirt.muni.cz/Shibboleth.sso/Login",  // RT 461482
    "https://pakiti.egi.eu/Shibboleth.sso/Login",         // RT 461482
    "https://validator.cesnet.cz/Shibboleth.sso/Login",  // non in eduid metadata (testing)
    "https://bydleni.muni.cz/Shibboleth.sso/Login",  // RT 461486
    "https://bydleni.slu.cz/Shibboleth.sso/Login",   // RT 461486
    "http://eunis.cz/simplesamlphp/module.php/saml/sp/discoresp.php",  // RT 461480
    "https://felk.cvut.cz/Shibboleth.sso/Login",
    "https://sitola.fi.muni.cz/Shibboleth.sso/DS",  // RT 461485
    "https://www.sitola.cz/Shibboleth.sso/DS",      // RT 461485
    "https://atributy.eduid.cz/Shibboleth.sso/Login",
    "https://gc1.cesnet.cz/Shibboleth.sso/DS", 
    "https://ozzik.cesnet.cz/Shibboleth.sso/DS",
    "https://rr.funet.fi/attribute-test/Shibboleth.sso/edugain",  // testing funet 
    "https://portal.lf1.cuni.cz/Shibboleth.sso/WAYF",  // https://shibboleth2.lf1.cuni.cz/shibboleth/ RT 461481
    "https://softweco.cz/Shibboleth.sso/Login",  
    "https://idm-test.ics.muni.cz/Shibboleth.sso/Login",  // ?
    "https://login.cesnet.cz/proxy/module.php/saml/sp/discoresp.php",  // ?
    "https://cebhckt-kdp.med.muni.cz/Shibboleth.sso/WAYF", 
    "www.example.org",  // returnUrl used in filter generator 
    "https://stats.czechelib.cz/Shibboleth.sso/Login"  // not in federation yet
  );

  $a_return = explode( "?", $returnURL );

  if( in_array( $a_return[0], $whitelist_array ) ) {
    error_log( addslashes( "checkReturnURLWhitelist(): whitelisted returnURL ". $a_return[0] ));
    return true;
  }

  //error_log( addslashes( "checkReturnURLWhitelist(): NO whitelisted returnURL ". $a_return[0] ));
  return false;
}

$wayfBase = "https://" . $_SERVER['HTTP_HOST'];
if(isset($_GET['return'])) {
  $returnURL = $_GET['return'];
}

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

$hideFiltered = (isset($_GET['hideFilteredOutIdps']) && $_GET['hideFilteredOutIdps'] != 0) ? true : false;

$useFilter = false;
$filterVersion = 1;
if(isset($extFilter)) {
    $rawFilter = $extFilter;
    $filter = base64_decode($rawFilter);
    $filter = str_replace("Array(", "[", $filter);
    $filter = str_replace(")", "]", $filter);
    $jFilter = json_decode($filter, true);
    if($jFilter !== NULL) {
        $useFilter = true;
        if(isset($jFilter['ver']) && $jFilter['ver'] == "2" ) {
          $filterVersion = 2;
        }
    } else {
      echo "Unable decode filter.<br>\n";
    }    
    
}

if(isset($_GET['returnIDParam'])) {
    $returnIDVariable = $_GET['returnIDParam'];
}
else {
    $returnIDVariable = 'entityID';
}

$checkSPDiscoveryResponseTest = false;
if(isset($_GET['entityID'])) {
    $entityID = $_GET['entityID'];
    $checkSPDiscoveryResponseTest = checkSPDiscoveryResponse( $entityID, $returnURL );
    if( $checkSPDiscoveryResponseTest == false ) {
      $checkSPDiscoveryResponseTest = checkReturnURLWhitelist( $returnURL );
    }
    // $checkSPDiscoveryResponseTest = true;  // don't return error, only log it

    if(($useFilter && isset($jFilter['allowFeeds']) && $jFilter['allowFeeds'] !== "") || ($useFilter && isset($jFilter['allowIdPs']) && $jFilter['allowIdPs'] !== "")) {
//    if($useFilter && isset($jFilter['allowFeeds']) && $jFilter['allowFeeds'] !== "") {
        $spInfo = getSPInfoAllFeeds($entityID);
    }
    else {
        $spInfo = getSPInfo($entityID);
    }
}

if(isset($_GET['kerberos'])) {
    $kerberos = $_GET['kerberos'];
}

$supportedBrowser = true;
$server_http_agent = $_SERVER['HTTP_USER_AGENT'];
if( strpos( $server_http_agent, 'MSIE 8' ) === TRUE ) {
  $supportedBrowser = false;
} else if( strpos( $server_http_agent, 'MSIE 7' ) === TRUE ) {
  $supportedBrowser = false;
} else if( strpos( $server_http_agent, 'MSIE 6' ) === TRUE ) {
  $supportedBrowser = false;
}

if(!isset($entityID) || !isset($returnURL) || !$checkSPDiscoveryResponseTest ) {
    
    echo $doctype;
    echo "<html><head>";
    echo $charset;
    echo $edge;
    echo "<title>Discovery service</title>";
    echo "<link rel=\"stylesheet\" type=\"text/css\" href=\"errorpage.css\">";
    echo "</head><body style=\"background-color:white\">";

    if( !isset($entityID) || !isset($returnURL) ) {

      echo "<div id=\"nadpis_cs\"><h1>Nastala chyba</h1>";
      echo "Poskytovatel služby ke které se hlásíte nepředal všechny parametry potřebné pro přihlášení.<br>";
      echo "K přihlášení jsou nutné alespoň parametry &quot;<i>entityID</i>&quot; a &quot;<i>return</i>&quot;.<br>";
      echo "Seznam parametrů, které poskytovatel služby předal, můžete vidět v seznamu níže.<br>";
      echo "Dokumetaci k přihlašovací službě můžete najít na adrese <a target=\"_blank\" href=\"https://www.eduid.cz/cs/tech/wayf\">www.eduid.cz/cs/tech/wayf</a></div>";
  
      echo "<div id=\"nadpis_en\"><h1>An error occured</h1>";
      echo "Service provider didn't send all parameters needed for login.<br>";
      echo "For login are needed at least &quot;<i>entityID</i>&quot and &quot;<i>return</i>&quot.<br>";
      echo "List of parameters sent from service provider is below.";
      echo "<br>Documentation (in czech language) can be found at <a target=\"_blank\" href=\"https://www.eduid.cz/en/tech/wayf\">www.eduid.cz/en/tech/wayf</a></div>";

    } else {

      echo "<div id=\"nadpis_cs\"><h1>Něco se pokazilo</h1>";
      echo "Z bezpečnostních důvodů musí hodnota parametru  &quot;<i>return</i>&quot; odpovídat tomu, co je uvedeno v metadatech služby (SP).<br><br>";
      echo "Dokumetaci k přihlašovací službě můžete najít na adrese <a target=\"_blank\" href=\"https://www.eduid.cz/cs/tech/wayf/sp#kontrola_parametru_return\">www.eduid.cz/cs/tech/wayf/sp#kontrola_parametru_return</a></div>";
  
      echo "<div id=\"nadpis_en\"><h1>An error occured</h1>";
      echo "For security reasons must parameter &quot;<i>return</i>&quot; match value used in metadata of service (SP).<br><br>";
      echo "Documentation can be found at <a target=\"_blank\" href=\"https://www.eduid.cz/en/tech/wayf/sp#return_parameter_check\">www.eduid.cz/en/tech/wayf/sp#return_parameter_check</a></div>";

    }

    if(!isset($_GET) || count($_GET)==0) {
        echo "<div id=\"paramlist\"><h2>Žádné parametry nebyly předány / No parameters given</h2>";
    }
    else {
        echo "<div id=\"paramlist\"><h2>Seznam parametrů / List of parameters</h2>";
        foreach($_GET as $key => $value) {
            echo "[$key] = [". htmlentities($value, ENT_QUOTES) ."]<br>\n";
        }
        echo "</div><div class=\"roztah\"></div>";
    }


}
else {

    $mobile = false;
    $dumb = false;

    if($detect->isMobile() && !$detect->isTablet() ) {
        $mobile = true;
        // if($detect->isAndroidOS() && $detect->isSafari()) {
        //    $dumb = true;
        // }
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

    echo $doctype;
    echo "<html><head><title>Discovery service</title>";
    echo $charset;
    // echo "<link rel=\"stylesheet\" href=\"jquery-ui.min.css\" />";
    echo "<script type=\"text/javascript\" src=\"jquery.js\"></script>";
    // echo "<script type=\"text/javascript\" src=\"jquery-ui.min.js\"></script>";
    echo $edge;

    if($mobile) {
        echo "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">";
        if($detect->isiOS()) {
            $osType = "ios";
        } else if($detect->isAndroidOS()) {
            $osType = "android";
        } else {
            $osType = "unknown";
        }
    }

        // print_r($jFilter);
    if( $filterVersion == "2" ) {
      if($useFilter && isset($jFilter['allowFeeds'])) {
        $f = '{';
        foreach($jFilter['allowFeeds'] as $feed => $tmpF) {
            $f .= "\"$feed\":\"/feed/$feed.js\",";
        }
        $allFeeds = rtrim($f,",")."}";

      }
      else {
        $f = '{';
        foreach($spInfo['feeds'] as $feed => $tmpF) {
            $f .= "\"$feed\":\"/feed/$feed.js\",";
        }
        $allFeeds = rtrim($f,",")."}";
      }

    } else {
      if($useFilter && isset($jFilter['allowFeeds'])) {
        $f = '{';
        foreach($jFilter['allowFeeds'] as $feed) {
            $f .= "\"$feed\":\"/feed/$feed.js\",";
        }
        $allFeeds = rtrim($f,",")."}";

      }
      else {
        $f = '{';
        foreach($spInfo['feeds'] as $feed) {
            $f .= "\"$feed\":\"/feed/$feed.js\",";
        }
        $allFeeds = rtrim($f,",")."}";
      }
    }

    echo "<script type=\"text/javascript\">\n";

    addVariable("isTablet", $detect->isTablet() );
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

    // $prefLang = ""; get prefLang from wayf_vars.php
    if(isset($_GET['lang'])) {
	    $prefLang = $_GET['lang'];
    } else {
      // use language from http accept header
      if( isset( $_SERVER["HTTP_ACCEPT_LANGUAGE"] )) {
        $tmp_lang = locale_accept_from_http( $_SERVER["HTTP_ACCEPT_LANGUAGE"] );
        $rest = explode( "_", $tmp_lang );
        if( isset( $rest[0] )) {
          $prefLang = $rest[0];
          // echo $prefLang;
        }
      }
    }

    addVariable("prefLang", $prefLang);

    // label and link to home organization
    addVariable( "organizationLabel", $organizationLabel );
    addVariable( "organizationHelpLink", $organizationHelpLink );
    addVariable( "organizationHelpImage", $organizationHelpImage );
    addVariable( "organizationHelpImageAlt", $organizationHelpImageAlt );

    addVariable("hideFiltered", $hideFiltered);

    if( isset( $feeds )) {
      echo "var feeds = ".$feeds .";\n";
    } else {
      echo "var feeds = '';\n";
    }

    if( isset( $customLogo )) {
      echo "var customLogo = ".$customLogo .";\n";
    }

    addVariable( "langStyle", $langStyle );

    $nosearch = false;
    if( isset( $_GET['nosearch'] )) {
      $nosearch = true;
    }
    addVariable( "noSearch", $nosearch );

    $referrer = "";
    if(isset($_SERVER['HTTP_REFERER'])) {
	$referrer = $_SERVER['HTTP_REFERER'];
    }
    addVariable("referrer", $referrer);

    echo "var allFeeds = " . $allFeeds . ";\n";
    addVariable("returnURL", $returnURL);

    $otherParams = "";
    foreach($_GET as $gkey => $gval) {
	if(($gkey ==  "return") || ($gkey == "entityID") || ($gkey == "target")) {
	    continue;
	}
	if($gval == "") {
            $otherParams = $otherParams . "&" . filter_var($gkey, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
	}
	else {
            $otherParams = $otherParams . "&" . filter_var($gkey, FILTER_SANITIZE_FULL_SPECIAL_CHARS) . "=" . filter_var($gval, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
	}
        // echo "// $gkey = $gval\n";
    }
    echo "var otherParams = \"$otherParams\";\n";
    echo "var useFilter = ";
    if($useFilter) {
        echo "true";
    }
    else {
        echo "false";
    }
    echo ";\n";
    if($useFilter) {
        $f = urlencode($filter);
        echo "var filter = $f;\n";
    }

    echo "var feedsStr = $allFeeds;\n";

    $getParams = "";
    foreach($_GET as $key => $value) {
            $kval = urlencode($key);
            $gval = urlencode($value);
            $getParams .= "&" . $key . "=" . $gval;
    }
    echo "var httpParameters = \"$getParams\";\n";

    if( isset( $_GET['entityID'] )) {
      echo "var SPentityID = \"". $_GET['entityID']."\";\n" ;
    }

    // ---------- Knihovny? Nein, danke! ----------
    $ban_lib = false;
    $lib = "";
    if(isset($_GET["k-n-d"])) {
        $handle = fopen("libraries.dat", "r");
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
        echo "var libraries = " . $lib . ";\n";
    }
   // -------------------------------------------

    echo "var noHTML5URL = \"" . $failbackWayf . "?" . $qs . "\";\n";

    /* decommission dsx alert hack */
    if( $organizationHelpImage == "geant-logo-gray.png" ) {
      echo "var alertDsx = true;\n";
    }

    echo $script;
    echo "</script>\n";
    echo "<noscript>\n";

    echo "<meta http-equiv=\"refresh\" content=\"2;url=" . $failbackWayf . "?" . $qs . "\">\n";

    echo "</noscript>\n";
    echo "</head>\n";
    echo "<body onload=\"listData()\">\n";
}
echo "</body></html>";
