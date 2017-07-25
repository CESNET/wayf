str1 =
    "Následující hodnotu filtru použijte jako parametr poslaný WAYFu z vašeho SP." +
    " To lze udělat <ul><li>Parametrem \"<i>filter</i>\", který obsahuje přímo hodnotu" +
    " filtru uvedeného níže, nebo</li><li>Parametrem \"<i>efilter</i>\", který obsahuje URL," +
    " na kterém je dostupná hodnota filtru níže.</li></ul><b>Příklady použití:</b>" +
    "<ul><li>/wayf.php?filter=abcd</li><li>/wayf.php?efilter=www.example.com/someurl" +
    " (na www.example.com/someurl je vygenerovaný filtr)</li></ul>Pro více informací pokračujte na" +
    " dokumentaci WAYFu pro <a href=\"https://www.eduid.cz/wiki/eduid/admins/howto/wayf/wayf-sp\" target=\"_blank\">správce SP</a>" +
    " nebo <a href=\"https://www.eduid.cz/wiki/eduid/admins/howto/wayf/index\" target=\"_blank\">uživatele</a>.<br><br>" +
    " Maximální možná celková délka" +
    " všech parametrů posílaných na WAYF je 512 bytů.<br><b>Vygenerovaný filtr má nyní ";

str2 =
    " bytů.</b><br><br>" + 
    "Pro konfiguraci Shibboleth SP můžete použít např. následující kód:<br><br>" +
    "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SessionInitiator</span> type=\"Chaining\" Location=\"/DS\" isDefault=\"false\" id=\"DS\"&gt;<br>" +
    "    &lt;SessionInitiator type=\"SAML2\" template=\"bindingTemplate.html\"/&gt;<br>" +
    "    &lt;SessionInitiator type=\"Shib1\"/&gt;<br>" + 
    "    &lt;SessionInitiator type=\"SAMLDS\" URL=\"/wayf.php?filter=<span class=\"red\"><br>" +
    "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">";

str3 =
    "</span><br></span>\"/&gt;<br>" +
    "&lt;/<span class=\"tagname\">SessionInitiator</span>&gt;</div><br><br>" + 
    "Novější verze Shibboleth SP umožnuje zjednodušenou konfiguraci:<br><br>" + 
    "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SSO</span> discoveryProtocol=\"SAMLDS\"<br>" + 
    "    discoveryURL=\"/wayf.php?filter=<span class=\"red\"><br>" + 
    "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">";

str4 =
    "</span><br></span>\"&gt;<br>" + 
    "    SAML2 SAML1<br>" +
    "&lt;/<span class=\"tagname\">SSO</span>&gt;</div><br><br>" + 
    "Pokud jako SP používáte <a href=\"https://simplesamlphp.org/\">SimpleSAMLphp</a>, můžete použít v souboru config/authsources.php " + 
    "následující konfiguraci (jedná se pouze o část konfigurace):<br><br>" +
    "<div class=\"scroll nowrap\">\'<span class=\"tagname\">default-sp</span>\' => array(<br>" + 
    "    \'saml:SP\',<br>" + 
    "    \'idp\' => NULL,<br>" + 
    "    \'discoURL\' => \'/wayf.php?filter=<span class=\"red\"><br>" +
    "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">";

str5 =
    "</span><br></span>\',<br>" + 
    "    ...<br>" + 
    "),<div><br><br>" + 
    "Funkčnost vašeho filtru můžete ověřit na <a target=\"_blank\" href=\"https://ds.eduid.cz/wayf.php?filter=";

str6 =
    "&entityID=sample&return=www.example.org\">tomto odkazu</a>.<br><br>";

str7 = 
    "Vybraná IdP budou viditelná, ostatní budou skrytá";

str8 =
    "Vybraná IdP nebudou viditelná, všechna ostatní budou viditelná";