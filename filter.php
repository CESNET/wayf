<?php 
$feeds  = file_get_contents("feeds.js"); 
?>
<html>
<head>
<meta charset="UTF-8" />
<style type="text/css">
.errorfilter {
    background-color: Pink;
}
</style>
<script type="text/javascript" src="base64.js"></script>
<link rel="stylesheet" href="jquery-ui.css" />
<link rel="stylesheet" href="filter.css" />
<script type="text/javascript" src="jquery-2.0.0.js"></script>
<script type="text/javascript" src="jquery-ui.js"></script>
<script type="text/javascript">
var feeds = <?= $feeds ?>;
</script>
<script type="text/javascript" src="filter2.js"></script>

</head>
<body onload="fillFeeds()">

<h1 class="entry-title">Vytvoření filtru pro službu WAYF</h1>

<form>

<div id="tabs">

<ul>
<li><a href="#tabs-1">Vytvořit nový filtr</a></li>
<!-- <li><a href="#tabs-2">Upravit existující filtr</a></li> -->
</ul>

<div id="tabs-1">

<div id="accordion">
<h3>Vyberte skupiny</h3>
<div id="feedsDiv">
<div class="info"><span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 50px 0;"></span>
Ze seznamu níže vyberte skupiny, jejichž identity provideři budou zobrazeny uživatelům WAYFu.
Pokud seznam necháte prázdný, bude použit defaultní seznam skupin, který obsahuje všechny skupiny,
v jejichž metadatech je váš SP.
</div><br>
</div>

<h3>Vyberte IdP</h3>

<div id="idpsDiv">
<div class="info"><span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 50px 0;"></span>
Ze seznamu níže vyberte poskytovatele identit, kteří budou zobrazeni uživatelům WAYFu.
Pokud seznam necháte prázdný, bude zobrazený seznam obsahovat všechny poskytovatele
identity ze všech skupin vybraných v předchozí záložce. Pokud v předchozí záložce nebyla
vybrána žádná skupina, bude použit defaultní seznam skupin, který obsahuje všechny skupiny,
v jejichž metadatech je váš SP. Poskytovatelé identity jsou rozděleni podle skupin, kam patří.
</div>
<div id="idpaccordion">
</div>
</div>

<h3>Přidejte Hostel IdP</h3>
<div>
<div class="info"><span class="ui-icon ui-icon-info" style="float: left; margin: 0 7px 50px 0;"></span>
Pokud chcete poskytnout přístup ke své službě i uživatelům, kteří nemají účet u žádného poskytovatele
itentity výše, můžete použít speciálního poskytovatele identity <a href="http://hostel.eduid.cz/">Hostel IdP</a>.
K založení účtu s nejnižším ověřením na <a href="http://hostel.eduid.cz/">Hostel IdP</a> stačí uživateli platný email. Pokud chcete uživatelům
umožnit založení účtu na <a href="http://hostel.eduid.cz/">Hostel IdP</a> přímo z WAYFu, zaškrtněte volbu
"<i>Dovolit uživatelům vytvoření...</i>".
</div>
<input type="checkbox" name="Hostel" id="hostel" value="Use Hostel" class="oc">Umožnit použití Hostel IdP<br>
<input type="checkbox" name="HostelReg" id="hostelreg" value="Use Hostel Reg" class="oc">Dovolit uživatelům vytvoření nového účtu na Hostel IdP
</div>

</div><!-- accordion -->
<br><br>
<div class="info" id="filterinfo">
Filtr zatím nebyl vygenerován. Vygenerujte filtr vybráním některých voleb výše.
</div>

<h4>Vygenerovaný filtr</h4>
<textarea id="filterval" rows="6" cols="100">Vygenerujte filtr vybráním některých voleb výše nebo sem zkopírujte váš existující filtr.</textarea><br><br>
<button>Pokud již existující filtr používáte,<br>vložte jeho hodnotu do pole výše<br>a stiskněte toto tlačítko</button>
<br><br>

<div class="info" id="filterinfo">
<b>Filtr v lidsky čitelné podobě pro kontrolu</b><br><br>
<div id="kontrola">Filtr zatím nebyl vygenerován. Vygenerujte filtr vybráním některých voleb výše.</div>
</div>

</div><!-- tabs-1 -->

<div id="tabs-2">
</div><!-- tabs-2 -->

</div><!-- tabs -->

<br><br>

</form>

<div id="errdialog" title="Nastala chyba">
Při dekódování vašeho existujícího filtru nastala chyba. Ověřte, že jste filtr zkopírovali
do vstupního pole celý, případně že jste nepřidali znaky navíc.
</div>

<div id="gendialog" title="Vyčkejte">
Stránka komunikuje se vzdáleným serverem a načítá data. Trpělivost, prosím.
</div>

</body></html>
