#!/bin/bash

# 1 den
warn=$[1*24*60*60]
# 4 dny
critical=$[4*24*60*60]

P=/opt/getMD/var/pub/current

if [ ! -e $P ]
then
  echo "directory $P does not exist"
  exit 2
fi

# resolve link current
current=`/bin/ls -l $P | /bin/sed 's/.*\/\([0-9]*\)$/\1/'`
now=`/bin/date "+%s"`

age=$[$now-$current]

msg="WAYF data are old $age seconds|age=$age"

if [ $age -gt $critical ]
then
  echo $msg;
  exit 2;
fi

if [ $age -gt $warn ]
then
  echo $msg;
  exit 1;
fi

echo $msg
exit 0;
