<?php
  $prefLang = "en";
  $lang_ui = "en";
  $htmlTitle = "Discovery service";
  $organizationLabel = "Service powered by";
  $organizationHelpLink = "https://wiki.geant.org/display/eduGAIN/How+to+use+as+a+Service+Provider";
  $organizationHelpImage = "eduteams_logo28.png";
  $organizationHelpImageAlt = "eduTEAMS";
  $filterTitleCS = "Vytvoření filtru pro službu eduTEAMS Discovery";
  $filterTitleEN = "eduTEAMS Discovery filter generation";
  $filterAdminsURL = "https://wiki.geant.org/display/eduGAIN/How+to+use+as+a+Service+Provider";
  $filterUsersURL = "https://wiki.geant.org/pages/viewpage.action?pageId=88769546";
  $langStyle = "txt";  // dropdown or txt (select with lang names) or img (flags) or dropdown

  $feeds = "
{ 
    'eduGAIN': {
        'label': 'eduGAIN',
        'url': 'eduGAIN'
    }
}
";

  $customLogo = "{ 
    'https://attribute-viewer.aai.switch.ch/shibboleth': { 'Label':'', 'Link':'https://www.switch.ch', 'Image':'custom/switch-logo.png', 'ImageAlt':'Switch logo' },
    'https://attribute-viewer.aai.switch.ch/interfederation-test/shibboleth': { 'Label':'', 'Link':'https://www.switch.ch', 'Image':'custom/switch-logo.png', 'ImageAlt':'Switch logo' },

    'https://welcome.lifescienceid.org/metadata/backend.xml': { 'Label':'', 'Link':'https://aarc-project.eu/', 'Image':'custom/aarc-logo.png', 'ImageAlt':'AARC logo' },
    'https://welcome.pilot.lifescienceid.org/metadata/backend.xml': { 'Label':'', 'Link':'https://aarc-project.eu/', 'Image':'custom/aarc-logo.png', 'ImageAlt':'AARC logo' },

    'https://repository.jisc.ac.uk/shibboleth': { 'Label':'', 'Link':'https://www.jisc.ac.uk', 'Image':'custom/jisc-logo.png', 'ImageAlt':'JISC logo' },
    'https://www.jiscmail.ac.uk/shibboleth': { 'Label':'', 'Link':'https://www.jisc.ac.uk', 'Image':'custom/jisc-logo.png', 'ImageAlt':'JISC logo' }

  }";
