#!/usr/bin/env perl

use warnings;
use strict;
use JSON;
use Nagios::Plugin;
use Data::Dumper;

my $np = Nagios::Plugin->new(
    usage => "Usage: %s -f|--file <FILE1> -f|--file <FILE2> "
    . "[ -h|--help ] ",
    version => '0.1',
    blurb   => 'Nagios plugin to check JSON WAYF feeds',
    extra   => "\nExample: \n"
    . "check_wayf_json.pl --file /tmp/file1 -f /tmp/file2",
    plugin  => 'check_wayf_json',
    shortname => "Check JSON WAYF feeds",
);

# add valid command line options and build them into your usage/help documentation.
$np->add_arg(
    spec => 'file|f=s@',
    help => '-f, --file <FILE1>',
    required => 1,
);

$np->getopts;
if ($np->opts->verbose) { (print Dumper ($np))};

my $result = OK;
my $error_msg = '';
my @perf = ();
my $files_ok = 0;
foreach my $file (@{$np->opts->file}) {
    unless (open(F, "<$file")) {
    	$result = CRITICAL;
    	$error_msg .= "Failed to read: $file: $?;";
    	next;
    };    
    my $content = join('', <F>);
    close(F);
    
    my $json_response = undef;
    eval {
	$json_response = decode_json($content);
    };
    if ($@) {
    	$result = CRITICAL;
    	$error_msg .= $file.": ".$@;

	next;
    };

    unless ($json_response) {
    	$result = CRITICAL;
    	$error_msg .= "$file: content isn't JSON;";
	
	next;
    };
    if ((exists $json_response->{'label'}) and
    	(exists $json_response->{'entities'})) {
    	my $label = $json_response->{'label'};
    	my $entities = keys %{$json_response->{'entities'}};

    	# tohle je OK stav
    	push(@perf, "$label=$entities");
    	$files_ok++;
    } else {
    	$result = CRITICAL;
    	$error_msg .= "$file: missing label or entities;";
    };
};

if ($result == OK) {
    $np->nagios_exit($result, "$files_ok files|Total=$files_ok, ".join(' ', @perf));
} else {
    $np->nagios_exit($result, $error_msg);
};
