#!/bin/bash

/opt/getMD/bin/check_wayf_json.pl `ls -1 /opt/getMD/var/pub/current/feed/*js | sed "s/^/-f /"`
