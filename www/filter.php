<?php

include 'wayf_vars.php';
 
$feeds  = file_get_contents("feeds.js");
$l = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
if(strpos($l, "cs-CZ") !== false || strpos($l, "cs") !== false || strpos($l, "sk-SK") !== false || strpos($l, "sk") !== false) {
    $locale = "cz";
}
else {
    $locale = "en";
};

$serverName = "\"" . $_SERVER['HTTP_HOST']  . "\"";


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

?>
<html>
<head>
<meta charset="UTF-8" />
<script type="text/javascript" src="base64.js"></script>
<link rel="stylesheet" href="jquery-ui.css" />
<link rel="stylesheet" href="filter.css" />
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery-ui.js"></script>
<script type="text/javascript">
var feeds = <?= $feeds ?>;
</script>
<script type="text/javascript">
var serverName = <?= $serverName ?>;
</script>

<?php
if($locale == "cz") {
    $incl = "filter-strings.js";
}
else {
    $incl = "filter-strings-en.js";
}
?>

<script type="text/javascript" src="<?php echo $incl ?>"></script>
<script type="text/javascript" src="filter.js"></script>
<script type="text/javascript">
<?php
addVariable("filterAdminsURL", $filterAdminsURL);
addVariable("filterUsersURL", $filterUsersURL);
?>
</script>



</head>
<body onload="fillFeeds()">

<?php
switch($locale) {
    case "cz":
	$str1 = $filterTitleCS;
	$str2 = "Vytvořit nový filtr";
	$str3 = "Ze seznamu níže vyberte skupiny, jejichž identity provideři budou zobrazeny uživatelům WAYFu. " . 
	        "Pokud seznam necháte prázdný, bude použit defaultní seznam skupin, který obsahuje všechny " . 
                "skupiny, v jejichž metadatech je váš SP.";
	$str4 = "Ze seznamu níže vyberte poskytovatele identit, kteří budou zobrazeni uživatelům WAYFu. " .
		"Pokud seznam necháte prázdný, bude zobrazený seznam obsahovat všechny poskytovatele " . 
		"identity ze všech skupin vybraných v předchozí záložce. Pokud v předchozí záložce nebyla " . 
		"vybrána žádná skupina, bude použit defaultní seznam skupin, který obsahuje všechny skupiny, " .
		"v jejichž metadatech je váš SP. Poskytovatelé identity jsou rozděleni podle skupin, kam patří.";
	$str5 = "Vyberte skupiny";
	$str6 = "Vyberte IdP";
	$str11 = "Filtr zatím nebyl vygenerován. Vygenerujte filtr vybráním některých voleb výše.";
	$str12 = "Vygenerujte filtr vybráním některých voleb výše nebo sem zkopírujte váš existující filtr.";
	$str13 = "Pokud již existující filtr používáte,<br>vložte jeho hodnotu do pole výše<br>a stiskněte toto tlačítko.";
	$str14 = "Filtr v lidsky čitelné podobě pro kontrolu";
	$str15 = "Filtr zatím nebyl vygenerován. Vygenerujte filtr vybráním některých voleb výše.";
	$str16 = "Nastala chyba";
	$str17 = "Při dekódování vašeho existujícího filtru nastala chyba. Ověřte, že jste filtr zkopírovali " .
		 "do vstupního pole celý, případně že jste nepřidali znaky navíc.";
	$str18 = "Vyčkejte";
	$str19 = "Stránka komunikuje se vzdáleným serverem a načítá data. Trpělivost, prosím.";
	$str20 = "Vygenerovaný filtr";
    $str21 = "Varování";
    $str22 = "Vámi vložený filtr neodpovídá přegenerovanému filtru. To může být způsobeno například použitím IdP, které už v příslušné federaci není. Prosím, překontrolujte funkčnost vygenerovaného filtru.";
    $str23 = "Přetáhněte příslušné entity kategorie nebo Sirtfi z šedého rámečku do červeného nebo zeleného rámečku. Uživateli se zobrazí seznam IdP, které obsahují některou entity kategorii nebo Sirtfi ze zeleného rámečku a neobsahují žádnou kategorii z červeného rámečku. Každá skupina IdP má vlastní nastavení.";
    $str24 = "Vyberte entity kategorie nebo Sirtfi";
	break;

    case "en":
    default:
	$str1 = $filterTitleEN;
	$str2 = "Create new filter";
	$str3 = "Select groups of IdPs. If you select at least one group, WAYF will show only IdPs from this list." . 
	        " If you leave this list empty, default list of groups will be used. Default list means all groups having your SP in metadata.";
	$str4 = "Filter IdPs either by allow list or deny list.<br><br>" .
            "Having a allow list selection filters out IdPs not on it.<br>" .
            "Having a deny list selection filters out IdPs on it.<br><br>" .
            "The list of Idps may be further adjusted by selecting entity categories. When used together with entity categories filtering, the list shown comprises of IdPs not filtered out by categories filter with possible additions of IdP allow list or possible deductions of IdP deny list.";
	$str5 = "Select groups";
	$str6 = "Select individual IdPs";
	$str11 = "Filter was not generated yet. Generate filter using check boxes above.";;
	$str12 = "Generate filter using checkboxes or copy existing filter.";
	$str13 = "If you already have a filter, copy its value to the field above<br>and press this button.";
	$str14 = "Human readable form of filter (just for checking)";
	$str15 = "Filter was not generated yet. Generate filter using check boxes above.";
	$str16 = "Error occured";
	$str17 = "An error occured during the decoding of your existing filter. Make sure you copied whole filter.";
	$str18 = "Wait, please";
	$str19 = "Page is communicating with remote server. Please, be patient.";
	$str20 = "Generated filter";
    $str21 = "Warning";
    $str22 = "Entered filter differs from the builded one. It can be caused by using IdP, which is not in federation any more. Please, check filter's proper functionality.";
    $str23 = "Filter entities by entity categories or Sirtfi. Available categories/Sirtfi may be activated by moving them to green or red boxes.<br><br>" .
             "Having a selection in green box filters out entities not matching at least one of the selected categories.<br>" .
             "Having a selection in red box filters out entities matching at least one of the selected categories.<br><br>" .
             "The list of Idps may be further adjusted by selecting individual IdPs. When used together with individual IdP filtering, the list shown comprises of IdPs not filtered out by categories filter with possible additions of IdP allow list or possible deductions of IdP deny list.";
    $str24 = "Select entity categories or Sirtfi";
	break;
}
?>

<h1 class="entry-title"><?php echo $str1 ?></h1>

<form>

<div id="tabs">

<ul>
<li><a href="#tabs-1"><?php echo $str2 ?></a></li>
</ul>

<div id="tabs-1">

<div id="accordion">
<h3 class="accgroup"><?php echo $str5 ?></h3>
<div id="feedsDiv" class="accgroup">
<div class="info"><span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 50px 0;"></span><?php echo $str3 ?></div><br>
</div>

<h3 class="accec"><?php echo $str24 ?></h3>
<div id="ecDiv" class="accec">
<div class="info"><span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 50px 0;"></span><?php echo $str23 ?></div>
<div id="ecaccordion">
</div>
</div>

<h3 class="accidps"><?php echo $str6 ?></h3>
<div id="idpsDiv" class="accidps">
<div class="info"><span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 50px 0;"></span><?php echo $str4 ?></div>
<div id="idpaccordion">
</div>
</div>

</div><!-- accordion -->
<br><br>
<div class="info" id="filterinfo">
<?php echo $str11 ?>
</div>

<h4><?php echo $str20 ?></h4>
<textarea id="filterval" rows="6" cols="100"><?php echo $str12 ?></textarea><br><br>
<button><?php echo $str13 ?></button>
<br><br>

<div class="info" id="filterinfo">
<b><?php echo $str14 ?></b><br><br>
<div id="kontrola"><?php echo $str15 ?></div>
</div>

</div><!-- tabs-1 -->

<div id="tabs-2">
</div><!-- tabs-2 -->

</div><!-- tabs -->

<br><br>

</form>

<div id="errdialog" title="<?php echo $str16 ?>">
<?php echo $str17 ?>
</div>

<div id="dfdialog" title="<?php echo $str21 ?>">
<?php echo $str22 ?>
</div>

<div id="gendialog" title="<?php echo $str18 ?>">
<?php echo $str19 ?>
</div>

</body></html>
