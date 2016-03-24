#!/bin/perl -w

use strict;
use MIME::Base64;
use JSON;
use Data::Dumper;

# semik
# jakztakz odladeno na vystupu z cat * |grep 'POST\|GET /wayf.php' |grep 'filter=' | sed "s/%20%20filter/filter/g" | sed "s/++filter/filter/" pusteny na access logy apache

my $invalid_filters;
my $feeds;

while (my $line = <>) {
    if ($line =~ /^.*?\[(.*?)\].*(\?|\&)(e|)filter=(.*?)&/) {
	my $date = $1;
	my $e = $3;
	my $filter = $4;
	next if $e;
	my $df = decode_base64($filter);
	my $json;
	eval {
	    $json = decode_json($df);
	};
	if ($@) {
	    unless(exists $invalid_filters->{$filter}) {
		warn $line;
		warn "Failed to parse: $df; $filter\n";
	    };
	    $invalid_filters->{$filter}++;
	};

	#warn Dumper($json);
	
	if (exists $json->{allowFeeds}) {
	    foreach my $feed (@{$json->{allowFeeds}}) {
		$feeds->{$feed}->{count}++;
		$feeds->{$feed}->{$filter}++;
	    };
	};
    } else {
	warn $line;
    };
};

warn Dumper($invalid_filters);
die Dumper($feeds);
