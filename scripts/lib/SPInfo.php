<?php
/* getSPInfo - returns an array with information about the SP $spid
   $spid - entityID of the searched SP
   returns an array (feeds => (feed1, feed2...),
                     labels => (lang1 => label1, lang2 => label2...))

   Example (var_dump output):
array(2) {
  ["feeds"]=>
  array(1) {
    [0]=>
    string(7) "eduGAIN"
  }
  ["labels"]=>
  array(2) {
    ["en"]=>
    string(27) "INFN Science Gateway to IGI"
    ["it"]=>
    string(27) "INFN Science Gateway to IGI"
  }
}
 */
function getSPInfo ($spid) {
  $dbf = "/opt/getMD/var/pub/current/lib/SPReg.sqlite";
  $q1 = "select feed.label from feed, spfeed where spfeed.spid='".SQLite3::escapeString($spid)."' and feed.eid=spfeed.feedid";
  $q2 = "select lang, label from displayName where eid='".SQLite3::escapeString($spid)."'";
  $feeds = array();
  $labels = array();

  $db = new SQLite3($dbf);
  $res = $db->query($q1);
  while ($row = $res->fetchArray()) {
    //    var_dump($row);
    array_push($feeds, $row['label']);
  }
  $res = $db->query($q2);
  while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    $labels[$row['lang']] = $row['label'];
  }
  $db->close();
  $sp = array();
  $sp['feeds'] = $feeds;
  $sp['labels'] = $labels;
  return $sp;
}

function getSPInfoAllFeeds ($spid) {
  $dbf = "/opt/getMD/var/pub/current/lib/SPReg.sqlite";
  $q1 = "select feed.label from feed";
  $q2 = "select lang, label from displayName where eid='".SQLite3::escapeString($spid)."'";
  $feeds = array();
  $labels = array();

  $db = new SQLite3($dbf);
  $res = $db->query($q1);
  while ($row = $res->fetchArray()) {
    array_push($feeds, $row['label']);
  }
  $res = $db->query($q2);
  while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    $labels[$row['lang']] = $row['label'];
  }
  $db->close();
  $sp = array();
  $sp['feeds'] = $feeds;
  $sp['labels'] = $labels;
  return $sp;
}

/* check returnUrl against DiscoveryResponse and AssertionConsumeService */
function checkSPDiscoveryResponse ($spid, $returnUrl) {
  $dbf = "/opt/getMD/var/pub/current/lib/SPReg.sqlite";
  $q1 = "select location from spDiscoveryResponse where spid='". SQLite3::escapeString($spid) ."'";
  $q2 = "select location from spAssertionConsume where spid='".SQLite3::escapeString($spid)."'";
  $locationsDisResp = array();
  $locationsAssertConsume = array();

  $db = new SQLite3($dbf);
  $res = $db->query($q1);
  $discoRespDefined = false;
  while ($row = $res->fetchArray()) {
    $discoRespDefined = true;
    $position = strpos( $returnUrl, $row['location'] );
    if( $position !== false && $position < 1 ) {
      return true;
    }
  }

  if( $discoRespDefined ) {
    error_log( addslashes( "checkSPDiscoveryResponse(): parameter return (". $returnUrl .") differs from DiscoveryResponse defined in metadata for entityID (". $spid .")" ));
    return false;
  }

  $res = $db->query($q2);
  list($p1, $p2, $locRU, $p4) = explode('/', $returnUrl );
  while ($row = $res->fetchArray()) {
    if( strcmp( $row['location'] , $locRU ) == 0 ) {
      return true;
    }
  }

  $db->close();

  error_log( addslashes( "checkSPDiscoveryResponse(): parameter return (". $returnUrl .") differs from AssertionConsumeService defined in metadata for entityID (". $spid .")" ));

  return false;
}


?>
