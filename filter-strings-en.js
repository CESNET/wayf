str1 =
    "Use this filter value as a parameter sent to WAYF by your SP." +
    " You can achieve it by using <ul><li>Parameter \"<i>filter</i>\" containing the filter value" +
    " shown below, or by </li><li>Parameter \"<i>efilter</i>\" linking to a URL " +
    " with a file containing the filter value.</li></ul><b>Examples:</b>" +
    "<ul><li>/wayf.php?filter=abcd</li><li>/wayf.php?efilter=www.example.com/someurl" +
    " (URL www.example.com/someurl contains the generated filter)</li></ul>For more info see " +
    " WAYF documentation for <a href=\"https://www.eduid.cz/en/tech/wayf/sp\" target=\"_blank\">SP admins</a>" +
    " or <a href=\"https://www.eduid.cz/en/tech/wayf\" target=\"_blank\">users</a>.<br><br>" +
    " Maximal allowed length of all parameters sent to WAYF is 512 bytes.<br>Generated filter has now ";

str2 =
    " bytes.</b><br><br>" + 
    "For Shibboleth SP configuration you can use the following code:<br><br>" +
    "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SessionInitiator</span> type=\"Chaining\" Location=\"/DS\" isDefault=\"false\" id=\"DS\"&gt;<br>" +
    "    &lt;SessionInitiator type=\"SAML2\" template=\"bindingTemplate.html\"/&gt;<br>" +
    "    &lt;SessionInitiator type=\"Shib1\"/&gt;<br>" + 
    "    &lt;SessionInitiator type=\"SAMLDS\" URL=\"/wayf.php?filter=<span class=\"red\">" +
    "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">";

str3 =
    "</span></span>\"/&gt;<br>" +
    "&lt;/<span class=\"tagname\">SessionInitiator</span>&gt;</div><br><br>" +
    "Newer versions of Shibboleth SP allows simplified configuration:<br><br>" + 
    "<div class=\"scroll nowrap\">&lt;<span class=\"tagname\">SSO</span> discoveryProtocol=\"SAMLDS\"<br>" + 
    "    discoveryURL=\"/wayf.php?filter=<span class=\"red\">" + 
    "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">";

str4 =
    "</span></span>\"&gt;<br>" + 
    "    SAML2 SAML1<br>" +
    "&lt;/<span class=\"tagname\">SSO</span>&gt;</div><br><br>" + 
    "If you are using <a href=\"https://simplesamlphp.org/\">SimpleSAMLphp</a> as a SP, copy the following configuration to config/authsources.php file" + 
    " (note, that this is only a part of the configuration):<br><br>" +
    "<div class=\"scroll nowrap\">\'<span class=\"tagname\">default-sp</span>\' => array(<br>" + 
    "    \'saml:SP\',<br>" + 
    "    \'idp\' => NULL,<br>" + 
    "    \'discoURL\' => \'/wayf.php?filter=<span class=\"red\">" +
    "<span style=\"width:80em; word-wrap:break-word; display:inline-block;\">";

str5 =
    "</span></span>\',<br>" + 
    "    ...<br>" + 
    "),<div><br><br>" + 
    "You can check functionality of your filter on <a target=\"_blank\" href=\"https://ds.eduid.cz/wayf.php?filter=";

str6 =
    "&entityID=sample&return=www.example.org\">this link</a>.<br><br>";

str7 = 
    "Selected IdPs will be visible, others will be hidden.";

str8 =
    "Selected IdPs will be hidden, others will be visible.";