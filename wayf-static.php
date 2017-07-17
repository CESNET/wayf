<?php

/**
 * wayf-static.php 
 *
 * static version of WAYF (without javascript)
 *
 * @version ?.? 2013 - 2014
 * @author Jan Chvojka jan.chvojka@cesnet.cz
 * @see getMD - TODO: add link - prepares feed for WAYF
 * @see Mobile Detect - TODO: add link - browser detection
 *
 */


include 'Mobile_Detect.php';  // Broser detection library
include '/opt/getMD/lib/SPInfo.php';  // Feed preparation
include 'wayf_vars.php';  // customization CESNET/eduTEAMS

// constants
define( "EC", "EC" );  // EC index to entities

// Development mode
$DEVEL = false;

if(isset($DEVEL) && $DEVEL == true) {
    // error_reporting(E_ALL);
    $wayfURL = "/wayf-static-dev.php";
}
else {
    $failbackWayf = "/wayf-static.php";
    $wayfURL = "/wayf-static.php";
}

// Messages
$messages = array(
    "LOGIN" => array("cs" => "Přihlásit účtem", "en" => "Login with" ),
    "CREATE_ACCOUNT" => array("cs" => "Vytvořit účet", "en" => "Create account" ),
);

/** Function returns label in prefered language from metadata
 *
 * @param $entity - metadata
 * @return label
 */
function getLabelFromEntity($entity) {
  global $lang;
    // prefered lang by browser
    if(isset($entity["label"][$lang]) && $entity["label"][$lang] != "") {
        $title = $entity["label"][$lang];
    }
    else if(isset($value["label"]["cs"])) {
        // prefered lang by authors of wayf
        $title = $entity["label"]["cs"];
    }
    else if(isset($entity["label"]["en"])) {
        // standard english label
        $title = $entity["label"]["en"];
      
    }
    else {
         /* english not exist, use first one description */
        $title = reset($entity["label"]);
        if( $title == false ) {
            $title = $entity ." - unknown description";
        }
    }

    return $title;
}

/** Function strCompare - eliminate national character and then compares strings case-insensitive
 *
 * @param $str1 - first string to compare
 * @param $str2 - second string to compare
 * @return true if string equals
 */
function strCompare($str1, $str2) {
  $search  = array( 'Á', 'Å', 'Č', 'Ď', 'É', 'Ě', 'Í', 'Ň', 'Ó', 'Ö', 'Ř', 'Š', 'Ť', 'Ú', 'Ý', 'Ž', 'ě', 'š', 'č', 'ř', 'ž', 'ý', 'á', 'í', 'é', 'ú', 'ů', 'ď', 'ň', 'ť', 'ó' );
  $replace = array( 'A', 'A', 'C', 'D', 'E', 'E', 'I', 'N', 'O', 'O', 'R', 'S', 'T', 'U', 'Y', 'Z', 'e', 's', 'c', 'r', 'z', 'y', 'a', 'i', 'e', 'u', 'u', 'd', 'n', 't', 'o' );
  $a = str_replace( $search, $replace, $str1 );
  $b = str_replace( $search, $replace, $str2 );  
  return strcasecmp($a, $b);
}

/** function idpCmp - compares labels of IdP
 *
 * @param $a - IdP a
 * @param $b - IdP b
 * @return true if IdP labels equals
 */
function idpCmp($a, $b) {
    $aLabel = getLabelFromEntity($a);
    $bLabel = getLabelFromEntity($b);
    return strCompare($aLabel, $bLabel);
}


/** function getUri - returns uri from $_GET with switched lang
 *
 * @param $lang - switch to language $lang
 */
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

/** function getHostelRegistrarUrl - ?
 *
 * @return $uri 
 */
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

// Check if SP specified special return entityID variable
if(isset($_GET['returnIDParam'])) {
    $returnIDVariable = $_GET['returnIDParam'];
}
else {
    // default return in entityID
    $returnIDVariable = 'entityID';
}

/** function addIdP - add IdP to list displayed IdPs
 *
 * param $label - label of IdP
 * param $id - entityId of IdP
 * param $logo - logo of IdP
 */
function addIdP($label, $id, $logo) {
    global $returnURL, $returnIDVariable, $ban_lib, $lib;

    // if IdP is on banned list and should be banned cancel adding (library nowadays) 
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
// Loading list of banned IdP (library nowadays)
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

// Web browser detection
$detect = new Mobile_Detect();

// IE hack - turn off compatible mode in IE
$edge = "<meta http-equiv=\"X-UA-Compatible\" content=\"edge\" >";

//$doctype = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Frameset//EN\" \"http://www.w3.org/TR/html4/frameset.dtd\">\n";
//$charset = "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";

// Tested header, it works well
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
if(isset($_GET['LoA'])) {
    $loa = $_GET['LoA'];
}
if(isset($_GET['kerberos'])) {
    $kerberos = $_GET['kerberos'];
}
if(isset($_GET['fromHostel'])) {
  $fromHostelRegistrar = $_GET['fromHostel'];  // after registration on Hostel
}

$hostelRegistrarURL = 'https://adm.hostel.eduid.cz/registrace';
$hostelId = "https://idp.hostel.eduid.cz/idp/shibboleth";
$hostelLabel = "Hostel IdP";
$hostelLogo = "/logo/idp.hostel.eduid.cz.idp.shibboleth.png";
$allowHostel = false;
$allowHostelReg = false;

// $_GET["filter"] = "eyAiYWxsb3dGZWVkcyI6IEFycmF5KCJlZHVJRC5jeiIpLCAgImFsbG93SG9zdGVsIjogdHJ1ZSwgImFsbG93SG9zdGVsUmVnIjogdHJ1ZX0=";

// filter and external filter
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
$filterVersion = 1;
if(isset($extFilter)) {
    $rawFilter = $extFilter;
    $filter = base64_decode($rawFilter);
    $filter = str_replace("Array(", "[", $filter);
    $filter = str_replace(")", "]", $filter);
    // echo $filter ."\n";
    $jFilter = json_decode($filter, true);
    if($jFilter !== NULL) {
        $useFilter = true;
        if(isset($jFilter['allowHostel']) && $jFilter['allowHostel'] == true) {
            $useHostel = true;
            if(isset($jFilter['allowHostelReg']) && $jFilter['allowHostelReg'] == true) {
                $useHostel = true;
            }
        }
        if(isset($jFilter['ver']) && $jFilter['ver'] == "2" ) {
          $filterVersion = 2;
        }
    } else {
      echo "Unable decode filter.<br>\n";
    }    
    
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

$lang = $prefLang;
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
    // Hostel hack - redirect to Hostel to authenticate
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
    // missing entityID
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
    // right way, all params available
    $mobile = false;
    if($detect->isMobile() || $detect->isTablet()) {
        $mobile = true;
    }

    $entities = array();

    // echo "print_r<br";
    // print_r($jFilter);
    // echo "<br><br>";

    if( $filterVersion == "2" ) {
      // filter v2
      $feedSet = $spInfo['feeds'];  // read All available feeds
      if($useFilter && isset($jFilter['allowFeeds'])) {
        $feedSet = array_keys( $jFilter['allowFeeds'] );  // read only allow feeds in filter
      }

      // echo "feedSet - ";
      // print_r( $feedSet );
      // echo " <br>\n";

      foreach($feedSet as $feed) {

            // echo "aktualni feed - ". $feed ." xxx ";
            $feedPath = "/opt/getMD/var/pub/current/feed/" . $feed . ".js";
            $feedFile = file_get_contents($feedPath);
            $fd = json_decode($feedFile, true);
            $c_entities = $fd["entities"];

            $filterDenyIdps = false;
            $filterAllowIdps = false;
            $filterAllowEC = false;
            $filterDenyEC = false;

            if( isset( $jFilter['allowFeeds'][ $feed ]['denyIdPs'] )) {
              $filterDenyIdps = true;
            }

            if( isset( $jFilter['allowFeeds'][ $feed ]['allowIdPs'] )) {
              $filterAllowIdps = true;
            }

            if( isset( $jFilter['allowFeeds'][ $feed ]['allowEC'] )) {
              $filterAllowEC = true;
            }

            if( isset( $jFilter['allowFeeds'][ $feed ]['denyEC'] )) {
              $filterDenyEC = true;
            }

            foreach($c_entities as $key => $value) {
              if( $filterDenyIdps && in_array( $key, $jFilter['allowFeeds'][ $feed ]['denyIdPs'])) {
                continue;
              } else {
                if( $filterAllowIdps && ! in_array( $key, $jFilter['allowFeeds'][ $feed ]['allowIdPs'])) {
                  continue;
                }
              }

              foreach( $c_entities[ $key ][ EC ] as $ecMetadata ) {
                if( $filterDenyEC && in_array( $ecMetadata, $jFilter['allowFeeds'][ $feed ]['denyEC'])) {
                  //print_r( $c_entities[ $key ] ); echo "<br>";
                  //print_r( $ecMetadata ); echo "<br><br>";
                  continue 2;
                }
                if( $filterAllowEC && ! in_array( $ecMetadata, $jFilter['allowFeeds'][ $feed ]['allowEC'])) {
                  continue 2;
                }
              }
              $entities[$key] = $value;
            }

            // print_r( $c_entities );
        }

    } else { 
      // filter v1
      $feedSet = $spInfo['feeds'];  // read All available feeds
      if($useFilter && isset($jFilter['allowFeeds'])) {
        $feedSet = $jFilter['allowFeeds'];  // read only allow feeds in filter
      }

        foreach($feedSet as $feed) {

            $feedPath = "/opt/getMD/var/pub/current/feed/" . $feed . ".js";
            $feedFile = file_get_contents($feedPath);
            $fd = json_decode($feedFile, true);
            $c_entities = $fd["entities"];
            if(is_array($c_entities)) {
                $entities = array_merge($entities, $c_entities);
            }
            
        }

      if($useFilter && isset($jFilter['allowIdPs'])) {
        $fentities = Array();
        foreach($entities as $key => $value) {
            if(in_array($key, $jFilter['allowIdPs'])) {
                $fentities[$key] = $value;
            }
        }
        $entities = $fentities;
      }
    }

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

    echo("<p id=\"help\"><a id='helpa' href='". organizationHelpLink ."' target='_blank'><span id='helps'>". $organizationLabel ."</span><img class=\"helpimg\" src=\"help.png\" alt=\"Information\"></a></p>\n");
    echo("</div>\n");
    echo("</div>\n");

    echo("<br><br><br>");

}
echo("</body></html>");
