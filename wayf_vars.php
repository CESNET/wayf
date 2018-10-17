<?php
  $prefLang = "cs";
  $lang_ui = "cs";  // language of application, static version
  $organizationLabel = "CESNET";
  $organizationHelpLink = "http://www.eduid.cz/cesnet-ds";
  $organizationHelpImage = "help.png";
  $organizationHelpImageAlt = "Information";
  $filterTitleCS = "Vytvoření filtru pro službu CESNET WAYF";
  $filterTitleEN = "CESNET WAYF filter creation";
  $filterAdminsURL = "https://www.eduid.cz/wiki/eduid/admins/howto/wayf/wayf-sp";
  $filterUsersURL = "https://www.eduid.cz/wiki/eduid/admins/howto/wayf/index";
  $langStyle = "img";  // dropdown or txt (select with lang names) or img (flags) or dropdown

  // feeds variable should be synced with contents of feeds.js
  $feeds = "
{
    'eduID.cz': {
        'label': 'eduID.cz',
        'url': 'eduID.cz' 
    },

    'eduGAIN': {
        'label': 'eduGAIN',
        'url': 'eduGAIN'
    },

    'LoginMuni': {
        'label': 'LoginMuni',
        'url': 'LoginMuni'
    },

    'SocialIdPs': {
        'label': 'Social IdPs',
        'url': 'SocialIdPs'
    },

    'StandaloneIdP': {
        'label': 'Standalone IdPs',
        'url': 'StandaloneIdP'
    },

    'Haka': {
        'label': 'Haka',
        'url': 'Haka'
    }
}
";

  $customLogo = "{ 
//    'https://attributes.eduid.cz/shibboleth': { 'Label':'', 'Link':'', 'Image':'custom/test.png', 'ImageAlt':'Attributes' }
  }";
