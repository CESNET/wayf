#!/usr/bin/perl

# Dependencies: libappconfig-perl libproc-processtable-perl perlmagick  libjson-perl sqlite3 xsltproc xmlsec1 optipng

use AppConfig qw(:expand);
use Sys::Syslog;
use Proc::ProcessTable;
use Data::Dumper;

use lib qw(/opt/getMD/lib);
use getMD::LogoManip;

my $cfgFile = '/opt/getMD/etc/getMDrc';

openlog('getMD', 'pid', 'daemon');

$SIG{__DIE__} = sub {
  syslog('crit', join("\n",@_));
  exit 1;
};

$SIG{__WARN__} = sub {
#  print STDERR time.": ".join("\n",@_);
  syslog('warning', join("\n", @_));
};

sub err (@) {
  syslog('err', join("\n",@_));
}

sub dbg (@) {
  syslog('debug', join("\n",@_));
}

sub notice (@) {
  syslog('notice', join("\n",@_));
}

sub info (@) {
  syslog('notice', join("\n",@_));
}


package getMD::Cmd;
use IPC::Open3;
use Symbol;
use IO::Select;
use POSIX ":sys_wait_h";

#require "/home/sova/proj/eduID.cz/discovery/bin/logoManip.pm";

sub new {
  my $proto = shift;
  my $class = ref($proto) || $proto;
  my $self = {};
  bless $self, $class;
  $self->init(@_);
}

sub init {
  my $self = shift;
  $self->{'cmd'} = [@_];
  $self;
}

sub run {
  my $self = shift;
  $self->{'err'} = gensym;
  $self->{'out'} = gensym;

  my $out = gensym;
  my $err = gensym;
  my $in = gensym;
  my $kid = 0;
  
#   local $SIG{CHLD_ERR} = $SIG{CHLD} = sub {
#     die "CHLD_ERR: @_ $?";
#   };
  eval {
    $self->{'pid'} = open3($in, $out, $err, @{$self->{'cmd'}});
    my $s = IO::Select->new($out, $err);
    do {
      my (@exc) = $s->has_exception(0.01);
      if (scalar(@exc)) {
	$kid = waitpid($self->{'pid'}, WNOHANG);
	next;
      }
      my (@readers) = $s->can_read(0.25);
      if (scalar(@readers)) {
	foreach my $r (@readers) {
	  if (eof($r)) {
	    $s->remove($r);
	  } elsif ($r == $out) {
	    $self->{'outbuf'} .= <$r>;
	  } elsif ($r == $err) {
	    $self->{'errbuf'} .= <$r>;
	  }
	}
      } else {
	$kid = waitpid($self->{'pid'}, WNOHANG);
      }
    } while ($s->count() > 0 && $kid != $self->{'pid'});
    $kid = waitpid($self->{'pid'}, WNOHANG);
  };
  if ($@) {
    warn "error: [$?] $@";
    return;
    
  }
  $self->{errcode} = ($?>>8);
  if ($self->{errcode}) {
# DBG
    #main::dbg "errcode: ".$self->{errcode}."\n";
    return;
  }
  $self;
}

package getMD::Feed::Status;

use IO::File;
use File::Spec::Functions;
use Carp;

use constant {
  OK	=> 0,
  ERR_DOWNLOAD	=> 1,
  ERR_VERIFY	=> 2,
  ERR_CONVERT	=> 3,
};


sub new {
  my $proto = shift;
  my $class = ref($proto) || $proto;
  my $self = {};
  bless $self, $class;
  $self->init(@_);
}

sub init {
  my ($self,%arg) = @_;		# %args = (id => $feedID, conf => $conf)
  foreach my $k (keys %arg) {
    $self->{$k} = $arg{$k};
  }
  $self;
}

sub file {
  my $self = shift;
  if ($self->{file}) {
    $self->{file}
  } else {
    catfile($self->{conf}->statusDir, $self->{id});
  }
}

sub begin {
  $_[0]->{start} = time;
}

sub finish {
  $_[0]->{end} = time;
}

sub status {
  my ($self, $stat) = @_;
  if (defined($stat)) {
    $self->{status} = $stat;
  }
  return $self->{status};
}

sub isErr {
  my $self = shift;
  $self->{status} > 0;
}

sub isOK {
  my $self = shift;
  $self->{status} == 0;
}

sub lastfinish {
  my ($self, $lastend) = @_;
  if (defined($lastend)) {
    $self->{lastOKend} = $stat;
  }
  return $self->{lastOKend};
}

sub lastOKfinish {
  my $self = shift;
  $self->{lastOKend};
}

sub addToMsg {
  my ($self, $txt) = @_;
  $self->{buf} .= $txt;
}

sub read {
  my $self = shift;
  my $f = IO::File->new($self->file) or do {
    carp "Error opening status file ".$self->file.": $!\n";
    return;
  };
  my $l = $f->getline;
  chomp($l);
  ($self->{status}, $self->{start}, $self->{end}, $self->{lastOKend})
    = split /\W*/, $l;
  while ($l = $f->getline) {
    $self->{buf} .= $l;
  }
}

sub write {
  my $self = shift;
  my $f = IO::File->new($self->file,"w") or do {
    carp "error creating status file ".$self->file.":$!";
    return;
  };
  $f->printf("%d %d %d", $self->{status}, $self->{start}, $self->{end});
  if (defined($self->{lastOKend})) {
    $f->print($self->{lastOKend});
  }
  $f->print("\n");
  $f->print($self->{buf});
}

sub logStatus {
  my $self = shift;
  my $ostat = $self->new(id	=> $self->{id},
			 conf	=> $self->{conf},
			 file	=> catfile($self->{conf}->oldStatusDir,
					   $self->{id}));
  $ostat->read;
  if ($self->isErr) {
    if ($ostat->isOK) {
      $self->lastfinish($ostat->finish);
    } else {
      $self->lastfinish($ostat->lastOKfinish || -1);
    }
  }
  $self->write;
}

package getMD::Feed;

use strict;
use File::Copy;
use File::Temp;
use File::Spec::Functions;
use MIME::Base64;
use JSON;
use Text::Iconv;
use Data::Dumper;

our $wget = '/usr/bin/wget';
our $sqlite = '/usr/bin/sqlite3';
our $xsltproc = '/usr/bin/xsltproc';
our $xslFile = '/home/sova/proj/eduID.cz/discovery/lib/md2json.xsl';


sub new {
  my $proto = shift;
  my $class = ref($proto) || $proto;
  my $self = {};
  bless $self, $class;
  $self->init(@_);
}

sub init {
  my ($self, %arg) = @_;
  foreach my $k (keys %arg) {
    $self->{$k} = $arg{$k};
  }
  $self->{status} = getMD::Feed::Status->new(id => $self->{id},
					     conf	=> $self->{conf});
  $self;
}

sub begin {
  my $self = shift;
  $self->{status}->begin;
}

sub finish {
  my $self = shift;
  $self->{status}->finish;
}

sub status {
  my $self = shift;
  $self->{status}->status(@_);
}

sub addToStatusMsg {
  my $self = shift;
  $self->{status}->addToMsg(@_);
}

sub logStatus {
  my $self = shift;
  $self->{status}->logStatus;
}

sub get {
  my $self = shift;
  my ($src, $opt) = $self->getSrcURL;

  #my $srcfile = $src; $srcfile =~ s|.*/||;
  my $targetfile = $self->getDldDir.'/'.$self->{id};
  if ($self->{conf}->cmd_curl) {
    warn "tt: $targetfile\n";
    # defaultne je veskere stahovani podminene, jen hloupy eduGAINi
    # server se stim nedovede vyrovat a tak je moznost pred stahovane
    # url dat ! coz zpusobi ze se to stahuje vzdy znovu.
    if ($opt eq 'conditional') {
      $targetfile = $self->getDldDir.'/'.$self->{id};
    };
    # navic eduGAINi MDX nema zadny nazev souboru... no nejsou to dementi? ;)
    $targetfile .= $self->{id} if ($targetfile =~ /\/$/);
    # a jeste ke vsemu uplne zhuleny URL s obrazky
    $targetfile =~ s/[\/\?\=\;\&]/_/g;
    warn "tt: $targetfile\n";

    my @cmdArgs = ('--retry', 1, '--max-time', 180, '--silent', '--show-error', '--insecure', '--location',
		   '--create-dirs',
		   '--output', $targetfile.'.curl');
    push @cmdArgs, ('--time-cond', $targetfile) if ($opt eq 'conditional');

    warn "cmd:".join(' ', @cmdArgs);
    $self->{cmd} = getMD::Cmd->new($self->{conf}->cmd_curl,
				   @cmdArgs,
				   $src);
  } else {
    # wget stahuje podle jmena ktery ma vzdalena strana, pote co jsem
    # doimplementoval podporu pro curl kde se to vzdy stahuje pod
    # nasim ID mi tohle prijde jako hloupy napad, ale nechavam to byt
    # jak to bylo
    my @cmdArgs = ('-P', $self->getDldDir);
    if ($opt eq 'conditional') {
      push @cmdArgs, qw(-N);
    } else {
      push @cmdArgs, ('-O', $self->getDldDir.'/'.$self->{id});
      mkdir($self->getDldDir) unless -d $self->getDldDir;
    };

    $self->{cmd} = getMD::Cmd->new($wget, @cmdArgs, $src);
  };

  if ($self->{cmd}->run()) {
    rename($targetfile.'.curl', $targetfile) if (-e $targetfile.'.curl');
  } else {
    main::err "error downloading feed ".$self->{id}.": $!";
    unlink $targetfile.'.curl' if (-e $targetfile.'.curl');
    warn join(' ', @{$self->{cmd}->{cmd}});
    warn $self->{cmd}{errbuf}."\n";
    return;
  };

  main::dbg "dldFile: ". $self->getDldFname."\n";

  $self;
}

sub verifyXML {
  my $self = shift;
  main::info "verifyXML(".$self->{id}.")\n";
  my ($signerFname, $keyType) = $self->getSignerFname;
  my @cmdArgs = qw(--verify --id-attr:ID urn:oasis:names:tc:SAML:2.0:metadata:EntitiesDescriptor );

# DBG
  #warn "signerFname: $signerFname, keyType: $keyType\n";
  if ($keyType eq 'key') {
    push @cmdArgs, qw(--enabled-key-data raw-x509-cert);
    push @cmdArgs, qw(--pubkey-cert-pem);
    push @cmdArgs, $signerFname;
  } elsif ($keyType eq 'root') {
    push @cmdArgs, qw(--trusted);
    push @cmdArgs, $signerFname;
  };

  $self->{cmd}
    = getMD::Cmd->new($self->{conf}->cmd_xmlsec,
		      @cmdArgs,
#		      qw(--verify --id-attr:ID urn:oasis:names:tc:SAML:2.0:metadata:EntitiesDescriptor --enabled-key-data raw-x509-cert),
		      $self->getDldFname);
  $self->{cmd}->run or do {
    main::err join(' ', $self->{conf}->cmd_xmlsec, @cmdArgs, $self->getDldFname);
    main::err "error: XML signature verificaion failed: $!";
    main::err $self->{cmd}{errbuf}."\n";
    return;
  };
  main::info "verifyXML(".$self->{id}.") OK\n";

  #main::dbg $self->{cmd}{errcode}.":".$self->{cmd}{errbuf};
  
  $self;
}

sub downloadLogo {
  my ($self, $url) = @_;
  my $storedFname = $url;
  $storedFname =~ s|^[^:]*://||;

  main::info "Downloading logo from $url";

  # preferujeme curl kdyz je nakonfigurovan
  my $targetfile = join('/',
			$self->{conf}->downloadLogoDir,
			$storedFname);
  if ($self->{conf}->cmd_curl) {
    $self->{cmd} = getMD::Cmd->new($self->{conf}->cmd_curl,
				   qw(--retry 1 --max-time 10 --silent --show-error --insecure --location),
				   '--output', $targetfile.'.curl',
				   #'--time-cond', $targetfile,
				   '--create-dirs',
				   $url);
  } else {
    $self->{cmd} = getMD::Cmd->new($self->{conf}->cmd_wget,
				   qw(-t 1 -T 10 -N -x --no-check-certificate),
				   '-P', $self->{conf}->downloadLogoDir, $url);
  };
  if ($self->{cmd}->run) {
    rename($targetfile.'.curl', $targetfile) if (-e $targetfile.'.curl');
  } else {
    unlink($targetfile.'.curl') if (-e $targetfile.'.curl');
    warn "error downloading logo from $url: $!\n";
    warn join(' ', @{$self->{cmd}->{cmd}});
    warn $self->{cmd}{errbuf};
    return;
  };
  catfile($self->{conf}->downloadLogoDir, "$storedFname");
}

### File locations
# Parse the feed source URL from the 'feeds' file and return
# the actula download URL and its download options
sub getSrcURL {
  my $self = shift;
  my $uri = $self->{src};
  my $opt = 'conditional';
  if ($uri =~ /^!(.*)$/) {
    $uri = $1;
    $opt = 'unconditional';
  }
  if (wantarray) {
    return ($uri, $opt);
  } else {
    return $uri;
  }
}

# Where to download the XML metadata
sub getDldDir {
  my $self = shift;

  catdir($self->{dldDir},  $self->{id});
}

# find the newest file in a directory
sub lastFile {
  my $d = shift;
  opendir(my $dh, $d) or die "error reading download directory $d: $!";
  my @files = readdir($dh);
  my $maxMtime = 0;
  my $candidate;
  
  foreach my $f (@files) {
    if ($f eq '.' || $f eq '..') {
      next;
    }
    my $mt = (stat("$d/$f"))[9];
    if ($mt > $maxMtime) {
      $candidate = $f;
      $maxMtime = $mt;
    }
  }
  catfile($d, $candidate);
}

# Where the downloaded XML metadata is
sub getDldFname {
  my $self = shift;

  if (!length($self->{dldFname})) {
    $self->{dldFname} = lastFile($self->getDldDir);
  }
  $self->{dldFname};
}

# Where to publish the metadata JS file
sub getPubJSFname {
  my $self = shift;

  catfile ($self->{conf}->feedPubDir, $self->{id}.'.js');
}

# Where is the temporary metadata JS file
sub getTmpJSFname {
  my $self = shift;
  catfile ($self->{conf}->cacheDir, 'feed', $self->{id}.'.js');
}

# Where is the signer certificate located?
sub getSignerFname {
  my $self = shift;
  my $signer;
  my $keyType = 'key';
  my @signer = split ':', $self->{signer}, 2;
  if (scalar(@signer) == 1) {
    $signer = $signer[0];
  } else {
    $signer = $signer[1];
    if ($signer[0] =~ /^r/) {
      $keyType = 'root';
    } elsif ($signer[0] =~ /^k/) {
      $keyType = 'key';
    }
  }

  my $signerFname = catfile ($self->{conf}->signerDir, $signer);
  if (wantarray) {
    return $signerFname, $keyType;
  } else {
    return $signerFname;
  }
}

# Where is the list of logos (parsed from the XML metadata)
sub getLogoListFname {
  my $self = shift;
  catfile ($self->{conf}->logoListDir, $self->{id});
}

# Where is the SQL representation of the SP database (output of extractSP)
sub getSPRegSQLFname {
  my $self = shift;
  catfile ($self->{conf}->cacheDir, 'SP', $self->{id}.'-SP.sql');
}

sub convert {
  my $self = shift;
  main::info "convert(".$self->{id}.")\n";
  $self->{cmd}
    = getMD::Cmd->new($self->{conf}->cmd_xsltproc,
		      '--stringparam', 'label', $self->{id},
		      '--stringparam', 'logostore', $self->{conf}->logoPubBaseURI,
		      '-o', $self->getTmpJSFname,
		      $self->{conf}->xslFile, $self->getDldFname);
  $self->{cmd}->run or do {
    main::err "error converting feed ".$self->{id}.": ".$self->{cmd}{errbuf};
    return;
  };

  # Semik: Pridani konverze do JSONu
  #move($self->getTmpJSFname, $self->getPubJSFname) or do {
  #  main::err "error moving feed ".$self->getTmpJSFname." to ".$self->getPubJSFname.": $!\n";
  #  return;
  #};
  open(F, '<'.$self->getTmpJSFname) or do {
    main::err "error opening feed ".$self->getTmpJSFname.": $!\n";
    return;
  };
  my $json = join('', <F>);
  close(F);
  my $converter = Text::Iconv->new('utf8', "ascii//TRANSLIT");
  my $wayf_db = decode_json( $json  );

  foreach my $entityID (keys %{$wayf_db->{entities}}) {
      foreach my $lang (keys %{$wayf_db->{entities}->{$entityID}->{label}}) {
	  my $label = $wayf_db->{entities}->{$entityID}->{label}->{$lang};
	  my $ascii = $converter->convert($label);
	  if ($label ne $ascii) {
	      $wayf_db->{entities}->{$entityID}->{label}->{"$lang;ascii"} = $ascii;
	  };
      };
      my $entityIDnew = $entityID; $entityIDnew =~ s/&amp;/&/g;
      if ($entityID ne $entityIDnew) {
        my $entity = $wayf_db->{entities}->{$entityID};
        delete $wayf_db->{entities}->{$entityID};
        $wayf_db->{entities}->{$entityIDnew} = $entity;
        warn "rewriting $entityID -> $entityIDnew\n";
      };
  };
  $json = to_json($wayf_db, {pretty=>1});

  open(F, '>'.$self->getPubJSFname) or do {
    main::err "error writting feed ".$self->getPubJSFname.": $!\n";
    return;
  };
  binmode(F, ":utf8");
  print F $json;
  close(F);
  unlink($self->getTmpJSFname);
  
  $self;
}

sub extractSPs {
  my $self = shift;
  main::info "extractSPs(".$self->{id}.")\n";
  
  $self->{cmd}
    = getMD::Cmd->new($self->{conf}->cmd_xsltproc,
		      '--stringparam', 'label', $self->{id},
		      '--stringparam', 'mode', 'sp',
		      '-o', $self->getSPRegSQLFname,
		      $self->{conf}->xslFile, $self->getDldFname);
  $self->{cmd}->run or do {
    main::err "error parsing SPs for feed ".$self->{id}.": $!\n";
    main::err "cmd: ".join ("\n\t", @{$self->{cmd}{cmd}})."\n";
    main::err $self->{cmd}->{errbuf}."\n";
    return;
  };
  $self;
}

sub registerSPs {
  my $self = shift;
  main::info "registerSPs(".$self->{id}.")\n";

  $self->{cmd}
    = getMD::Cmd->new($self->{conf}->cmd_sqlite,
		     $self->{conf}->spdb_db,
		      '.read '.$self->getSPRegSQLFname);
  $self->{cmd}->run or do {
    my @ebuf = grep {!/^Error: [^:]*: column.* not unique/} split(/\n/, $self->{cmd}{errbuf});
    if (scalar(@ebuf)) {
      main::err "error registering SPs for feed ".$self->{id}.": $!\n";
#    warn $self->{cmd}->{errbuf}."\n";
      main::err "ebuf: ".join("\n", @ebuf)."\n";
    }
  };
  
  # DBG
  main::dbg "SPRegSQLFname: ".$self->getSPRegSQLFname."\n";
  $self;
}

sub listLogos {
  my $self = shift;
  main::info "listLogos(".$self->{id}.")\n";
  
  $self->{cmd}
    = getMD::Cmd->new($self->{conf}->cmd_xsltproc,
		      '--stringparam', 'label', $self->{id},
		      '--stringparam', 'logostore', $self->{conf}->logoPubBaseURI,
		      '--stringparam', 'mode', 'logos',
		      '-o', $self->getLogoListFname,
		      $self->{conf}->xslFile, $self->getDldFname);
  $self->{cmd}->run or do {
    main::err "error listing logos for feed ".$self->{id}."$!\n";
    main::err $self->{cmd}{errbuf}."\n";
    
    return;
  };
  unless (-f $self->getLogoListFname) {
    warn "No logos extracted for feed ".$self->{id};
    return;
  }
  # DBG
  main::dbg "logoListFname: ".$self->getLogoListFname."\n";
  
  $self;
  
}

sub getLogos {
  my $self = shift;
  main::info "getLogos(".$self->{id}."; ".$self->getLogoListFname.")\n";

  my $fh = IO::File->new($self->getLogoListFname,'r') or do {
    warn "error opening logolist file ".$self->getLogoListFname.":$!";
    return;
  };
  while (my $l = $fh->getline) {
    my $tmpF;
    my $tmpFO;

    chomp;
    next if ($l =~ /^\s*$/); # skip line if it is only whitespace
    next unless ($l =~ /^(.*)\s+(\S+)$/);
    my $rem = $1; my $loc = $2;
    my $locURIprefix = $self->{conf}->logoPubBaseURI;
    my $locDir = $self->{conf}->logoPubDir;
    $loc =~ s/^$locURIprefix/$locDir/;

    if ($rem =~ /^data:image(.*)$/) {
      my $u = $1;

      my (@parts) = split(/[:;,]/, $u);
      my $imgType = $parts[0];
      $imgType =~ s/\///;
      my $data = $parts[$#parts];
      $tmpFO = File::Temp->new() or do {
	main::err "error creating temporary file: $!";
	return;
      };
      my $osel = select($tmpFO); $| = 1; select($osel);
      $data =~ s/^\s*//;
      my $decoded = decode_base64($data);
      print $tmpFO $decoded;
      $tmpF = $tmpFO->filename;
#      close $tmpFO;
    } else {
      $tmpF = $self->downloadLogo($rem);
    }
    unless ($tmpF and $self->processLogo($tmpF, $loc)) {
      copy(catfile($self->{conf}->logoPredefDir,'missing.png'),$loc);
    }
    $self->b64Logo($loc);
    close $tmpFO if (defined $tmpFO);
  }
  $self;
}

sub processLogo {
  my ($self, $src, $tgt) = @_;

  my $logo = getMD::LogoManip->new(conf	=> $self->{conf},
				   input	=> $src,
				   output	=> $tgt);
  $logo->convert;
}

sub b64Logo {
  my ($self,$srcFname) = @_;
  my $tgtFname = $srcFname . "_b64";

  my $srcF = IO::File->new($srcFname, "r");
  if (defined($srcF)) {
      my $tgtF = IO::File->new($tgtFname, "w");
      my $src = join('',$srcF->getlines);
      $tgtF->print(encode_base64($src,''));
  };
}

package main;

use AppConfig qw(:expand :argcount);
use IO::File;
use File::Basename;
use File::Path qw(make_path remove_tree);
use File::Spec::Functions;
use File::Copy;

my $conf = AppConfig->new({CASE	=> 1,
			  GLOBAL => {
				     DEFAULT	=> undef,
				     ARGCOUNT	=> ARGCOUNT_ONE,
				     EXPAND	=> EXPAND_ALL}},
			  qw(feedList
			     downloadBase
			     pubBase
			     oldPubBase
			     cacheDir
			     signerDir
			     downloadDir
			     downloadLogoDir
			     statusDir
			     oldStatusDir
			     feedPubDir
			     logoPubDir
			     logoPubBaseURI
			     logoListDir
			     logoPredefDir
			     xslFile
			     lockFile
			     spdb_schema
			     spdb_db
			     cmd_wget
			     cmd_sqlite
			     cmd_xsltproc
			     cmd_xmlsec
			     cmd_curl
			     logo_max_width
			     logo_max_height
			     logo_fill_width
			     logo_left
			     logo_right
			     logo_fill_height
			     logo_top
			     logo_bottom
			     logo_fill
			     logo_fill_color
			     test_verify
			   ),
			 oldRun_max_age	=> {default => undef},
			 oldRun_min_kept	=> {default => 5});

sub doFeed {
  my ($url, $feedID, $signer, $desc) = @_;
  my $f = getMD::Feed->new('src'	=> $url,
			   'id'		=> $feedID,
			   'signer'	=> $signer,
			   'desc'	=> $desc,
			   'dldDir'	=> $conf->downloadDir,
			   'conf'	=> $conf);
#			   'cfg'	=> \%cfg);
  $f->begin;
  main::info "--Processing feed $feedID\n";
  $f->get or do {
    $f->addToStatusMsg($f->{cmd}{errbuf});
    $f->status(getMD::Feed::Status::ERR_DOWNLOAD);
    unless ( -e $f->getDldDir) {
	# File with feed wasn't created and there is no cached version
	# from past => terminate.
	main::info "--Prematurely Finished feed $feedID\n";
	return;
    };
  };
  my $dlTime = (stat($f->getDldFname))[9] || -1;
  my $cnvTime = (stat($f->getPubJSFname))[9] || -1;

# DBG
  dbg "dldTime\t\t= $dlTime\ncnvTime\t\t= $cnvTime\n";

  if ($dlTime > $cnvTime) {
    $f->verifyXML or do {
      $f->addToStatusMsg($f->{cmd}{errbuf});
      $f->status(getMD::Feed::Status::ERR_VERIFY);
    };
    # DBG
    warn $f->{cmd}{errcode}.":".$f->{cmd}{errbuf};
    
    $f->convert or do {
      $f->addToStatusMsg($f->{cmd}{errbuf});
      $f->status(getMD::Feed::Status::ERR_CONVERT);
    };
    dbg "storedFname: ".$f->getPubJSFname."\n"
  }

  my $SPRegTime = (stat($f->getSPRegSQLFname))[9] || -1;
  if ($dlTime > $SPRegTime) {
    $f->extractSPs;
    dbg "SPRegSQLFname: ".$f->getSPRegSQLFname."\n";
  }

  $f->registerSPs;

  my $logoListTime = (stat($f->getLogoListFname))[9] || -1;
  dbg "logoListTime\t= $logoListTime\n";
  
#  if (1 or $dlTime > $logoListTime) {
  if ($dlTime > $logoListTime) {
    $f->listLogos;
  }
  $f->getLogos;
  $f->finish;
  $f->logStatus;
  main::info "--Finished feed $feedID\n";
}

sub createDirs {
  my @dirs = ($conf->downloadBase, $conf->pubBase, $conf->feedPubDir, $conf->logoPubDir, $conf->statusDir, $conf->cacheDir);
  foreach my $f ($conf->spdb_db, $conf->lockFile) {
    my $d = dirname($f);
    push(@dirs, $d);
  }
  dbg "creating directories @dirs";
  
  make_path(@dirs, {error => \my $err});
  if (@$err) {
    foreach my $e (@$err) {
      my ($f, $msg) = %$e;
      if ($f eq '') {
	err "general error: $msg\n";
      } else {
	err "error creating path $f: $msg\n";
      }
    }
  }
  if (defined ($conf->logoPredefDir)) {
    opendir(my $dh, $conf->logoPredefDir) or die "error reading directory "
      .$conf->logoPredefDir.": $!";
    foreach my $f (readdir($dh)) {
      my $ff = catfile($conf->logoPredefDir, $f);
      if (-d $ff || $f eq '.' || $f eq '..') {
	next;
      }
      copy($ff, $conf->logoPubDir)
	or die "error copying $f to ".$conf->logoPredefDir.": $!";
    }
  }
  return 1;
}

sub createDB {
#  my $dbFname = $cfg{'SPRegDBFname'};
  my ($dbFname, $dbDefFname) = @_;
  my $cmd = getMD::Cmd->new ($conf->cmd_sqlite,
			     $dbFname,
			     ".read $dbDefFname");
  $cmd->run or do {
    err "error creating database: $!\n";
    err $cmd->{errbuf}."\n";
    return;
  };
  return 1;
}

sub publish {
  my $conf = shift;
  my $rc = 1;

  if (-l $conf->oldPubBase) {
    $rc = unlink $conf->oldPubBase or do {
      err "error unlinking old pubBase: $!\n";
      return;
    };
  }
  if ($rc == 1) {
    symlink $conf->pubBase, $conf->oldPubBase or do {
      err "error publishing data: $!\n";
      return;
    };
  }
  1;
}

sub cleanUp {
  if (defined $conf->oldRun_max_age) {
    my $max_age = time - $conf->oldRun_max_age;
    my $pubBase = dirname($conf->pubBase);
    opendir (my $dh, $pubBase) or do {
      err "error reading pubBase directory $pubBase: $!";
      die
    };
    my @dirs = grep(/^\d+$/, readdir($dh));
    if (scalar(@dirs) > $conf->oldRun_min_kept) {
      my @runs = sort {$a <=> $b} @dirs;
#      dbg "all runs: @runs";
#      dbg "max_age: $max_age";
      
      my @kept = splice @runs, 0 - $conf->oldRun_min_kept;
#      dbg "new runs: @runs";
#      foreach my $run (@runs) {
      for (my $run = shift(@runs); $run; $run = shift(@runs)) {
	last if ($run > $max_age);
	dbg "removing old run data $run";
	remove_tree(catdir($pubBase, $run),{error => \my $err});
	if (@$err) {
	  foreach my $diag (@$err) {
	    my ($f, $msg) = %$diag;
	    if ($f eq '') {
	      err "general error removing directory $pubBase: $msg";
	    } else {
	      {
		err "error unlinking file $f: $msg";
	      }
	    }
	  }
	}
      }
      dbg "keeping old runs @runs @kept";
    }
  }
}

sub getLockFname {
  $conf->lockFile;
}

sub startLock {
  my $f = getLockFname();
  my $fh;
  if (-f $f) {
    $fh = IO::File->new($f) or do {
      die "error reading lockfile $f: $!";
    };
    my $pid = $fh->getline || -1;
    chomp($pid);

    my $t = new Proc::ProcessTable;
    my $running = 0;
    foreach my $p ( @{$t->table} ){
	$running++ if ($p->pid==$pid);
    };

    if ($running) {
	die "another instance already running (pid=$pid, lock=$f). Exiting.";
    } else {
	dbg "overwriting lockfile=$f for pid=$pid which is not running.";
    };
  }
  $fh = IO::File->new($f,"w") or die "error creating lockfile $f: $!. Exiting.";
  $fh->print("$$\n") or die "error writing to lockfile $f: $!. Exiting.";
  $fh->close;
}

sub finishUnlock {
  my $f = getLockFname();
  unlink $f;
}

my $myId = time;
$conf->define('myId');
$conf->set('myId', $myId);

$conf->args();

my $ret = $conf->file($cfgFile);

info "getMD: Starting run $myId";

startLock();
createDirs() or die "Error creating directory structure: $!\n";

createDB($conf->spdb_db, $conf->spdb_schema);

my $feedFile = IO::File->new($conf->feedList, 'r')
  or die "error opening feedList file".$conf->feedList.":$!";
while (my $l = $feedFile->getline) {
  next if ($l =~ /\#/);
  chomp $l;
  next if ($l =~ /^\s*$/);
  
  my ($url, $feedID, $signer, $desc) = split(/\s+/, $l, 4);
  doFeed($url, $feedID, $signer, $desc);
}

publish($conf);
cleanUp();
finishUnlock();
info "getMD run $myId finished";

