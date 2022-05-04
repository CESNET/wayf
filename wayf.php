<?php

include 'Mobile_Detect.php';
include '/opt/getMD/lib/SPInfo.php';
include 'wayf_vars.php';  // customization CESNET/eduTEAMS/dsx/perun

$detect = new Mobile_Detect();

$htmlTemplate = file_get_contents("wayf.tpl");

$failbackWayf = "/wayf-static.php";
$script = file_get_contents("wayf.js");
$wayfURL = "/wayf.php";

$searchAndReplace = array(
    '{{title}}' => $htmlTitle,
    '{{errorpage_style}}' => '',
    '{{errorpage}}' => '',
    '{{included_vars_and_script}}' => '',
);

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
    $result = "";
    if(!is_array($varValue)) {
      $varValue = strip_tags($varValue);
    }
    if(!$isRecursion) {
        $result .= "var $varName = ";
    }
    if(is_array($varValue)) {
        $result .= "Array(";
        $print_comma = false;
        foreach( $varValue as $value ) {
          if( $print_comma )
            $result .= ", ";

          addVariable( $varName, $value, true );
          $print_comma = true;
        }
          
        $result .= ")";
    }
    else if(gettype($varValue) == "string") {
        $result .= "\"$varValue\"";
    }
    else if(gettype($varValue) == "boolean") {
        $str = $varValue ? "true" : "false";
        $result .= $str;
    }
    else {
        $result .= $varValue;
    }
    if(!$isRecursion) {
        $result .= ";\n";
    }

    return $result;
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
      $searchAndReplace[ '{{errorpage_style}}' ] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"errorpage.css\">";
      $searchAndReplace[ '{{errorpage}}' ] = "Unable decode filter.<br>\n";
    }    
}

$returnIDVariable = 'entityID';
if(isset($_GET['returnIDParam'])) {
    $returnIDVariable = $_GET['returnIDParam'];
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
    
    $searchAndReplace[ '{{errorpage_style}}' ] = "<link rel=\"stylesheet\" type=\"text/css\" href=\"errorpage.css\">";

    if( $checkSPDiscoveryResponseTest ) {
      // Missing required parameters
      $error = file_get_contents("errorpage_missing_parameters.tpl");
    } else {
      // Invalid value of return parameter
      $error = file_get_contents("errorpage_invalid_return.tpl");
    }

    if(!isset($_GET) || count($_GET)==0) {
        $error .= "<div id=\"paramlist\"><h2>Žádné parametry nebyly předány / No parameters given</h2>";
    }
    else {
        $error .= "<div id=\"paramlist\"><h2>Seznam parametrů / List of parameters</h2>";
        foreach($_GET as $key => $value) {
            $error .= "[$key] = [". htmlentities($value, ENT_QUOTES) ."]<br>\n";
        }
        $error .= "</div><div class=\"roztah\"></div>";
    }

    $searchAndReplace[ '{{errorpage}}' ] = $error;
}
else {

    $mobile = false;
    $dumb = false;

    if($detect->isMobile() && !$detect->isTablet() ) {
        $mobile = true;
    }

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

    if($mobile) {
        // echo "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">";
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

    $included_vars_and_script = "<script type=\"text/javascript\">\n";

    $included_vars_and_script .= addVariable("isTablet", $detect->isTablet() );
    $included_vars_and_script .= addVariable("isMobile", $mobile);
    if($mobile) {
        $included_vars_and_script .= addVariable("osType", $osType);
    }

    $included_vars_and_script .= addVariable("returnIDVariable", $returnIDVariable);

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
    $included_vars_and_script .= addVariable("serverURL", $server);
    $included_vars_and_script .= addVariable("wayfURL", $wayf);

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

    $included_vars_and_script .= addVariable("prefLang", $prefLang);

    // label and link to home organization
    $included_vars_and_script .= addVariable( "organizationLabel", $organizationLabel );
    $included_vars_and_script .= addVariable( "organizationHelpLink", $organizationHelpLink );
    $included_vars_and_script .= addVariable( "organizationHelpImage", $organizationHelpImage );
    $included_vars_and_script .= addVariable( "organizationHelpImageAlt", $organizationHelpImageAlt );

    $included_vars_and_script .= addVariable( "hideFiltered", $hideFiltered );

    if( isset( $feeds )) {
      $included_vars_and_script .= "var feeds = ".$feeds .";\n";
    } else {
      $included_vars_and_script .= "var feeds = '';\n";
    }

    if( isset( $customLogo )) {
      $included_vars_and_script .= "var customLogo = ".$customLogo .";\n";
    }

    $included_vars_and_script .= addVariable( "langStyle", $langStyle );

    $nosearch = false;
    if( isset( $_GET['nosearch'] )) {
      $nosearch = true;
    }
    $included_vars_and_script .= addVariable( "noSearch", $nosearch );

    $referrer = "";
    if(isset($_SERVER['HTTP_REFERER'])) {
	    $referrer = $_SERVER['HTTP_REFERER'];
    }
    $included_vars_and_script .= addVariable("referrer", $referrer);

    $included_vars_and_script .= "var allFeeds = " . $allFeeds . ";\n";
    $included_vars_and_script .= addVariable("returnURL", $returnURL);

    $otherParams = "";
    foreach($_GET as $gkey => $gval) {
	    if(($gkey ==  "return") || ($gkey == "entityID") || ($gkey == "target")) {
	      continue;
	    }
	    if($gval == "") {
            $otherParams = $otherParams . "&" . $gkey;
	    }
	    else {
            $otherParams = $otherParams . "&" . $gkey . "=" . urlencode($gval);
	    }
        // echo "// $gkey = $gval\n";
    }
    $included_vars_and_script .= "var otherParams = \"$otherParams\";\n";
    $included_vars_and_script .= "var useFilter = ";
    if($useFilter) {
        $included_vars_and_script .= "true";
    }
    else {
        $included_vars_and_script .= "false";
    }
    $included_vars_and_script .= ";\n";
    if($useFilter) {
        $included_vars_and_script .= "var filter = $filter;\n";
    }

    $included_vars_and_script .= "var feedsStr = $allFeeds;\n";

    $getParams = "";
    foreach($_GET as $key => $value) {
            $gval = urlencode($value);
            $getParams .= "&" . $key . "=" . $gval;
    }
    $included_vars_and_script .= "var httpParameters = \"$getParams\";\n";

    if( isset( $_GET['entityID'] )) {
      $included_vars_and_script .= "var SPentityID = \"". $_GET['entityID']."\";\n" ;
    }

    $included_vars_and_script .= "var noHTML5URL = \"" . $failbackWayf . "?" . $qs . "\";\n";

    $included_vars_and_script .= $script;
    $included_vars_and_script .= "</script>\n";
    $included_vars_and_script .= "<noscript>\n";
    $included_vars_and_script .= "<meta http-equiv=\"refresh\" content=\"2;url=" . $failbackWayf . "?" . $qs . "\">\n";
    $included_vars_and_script .= "</noscript>\n";
    $searchAndReplace[ '{{included_vars_and_script}}' ] = $included_vars_and_script;
}

echo str_replace( array_keys( $searchAndReplace ), array_values( $searchAndReplace), $htmlTemplate );

