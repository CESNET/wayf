#!/bin/bash

P=/opt/getMD/var/pub/current/feed

if [ -d $P ]
then
  /opt/getMD/bin/check_wayf_json.pl `ls -1 /opt/getMD/var/pub/current/feed/*js | sed "s/^/-f /"`
else
  echo "directory $P does not exist"
  exit 2
fi
