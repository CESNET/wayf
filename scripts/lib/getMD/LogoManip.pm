#!/usr/bin/perl

package getMD::LogoManip;
use strict;
use Image::Magick;
use Carp;


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
  $self;
}

sub convert {
  my $self = shift;

  unless ($self->{input}) {
    carp "No input specified\n";
    return;
  }

  unless ($self->{output}) {
    carp "No output specified\n";
    return;
  }

  my $config = $self->{conf};

  my $logo  = new Image::Magick;

  my $logo_filename = $self->{input};

  # set density 1x1 for configured logos
  my $density1x1 = $config->logo_density1x1();
  foreach my $density_filename (keys %$density1x1) {
    if ($density1x1->{ $density_filename } eq $logo_filename ) {
      carp "Set density 1x1";
      $logo->Set(density=>'1x1');
    }
  }

  $self->{err} = $logo->Read($logo_filename);
  if ($self->{err}) {
      my $info = '';
      if (-s $self->{input}) {
	my $filetype = `file $self->{input}`; chomp($filetype);
	carp "Can't read $filetype: ".$self->{err};
      } else {
	carp "Can't read \"".$self->{input}."\": $self->{err}";
      };
      #DEBUG `cp $self->{input} /tmp/err-example`; die;
    return;
  }

  $logo->set(colorspace => 'RGB');

  # Vypocteni novych rozmeru
  my ($logow, $logoh) = $logo->Get('width', 'height');
  my ($nlogow, $nlogoh) = ($logow, $logoh);

  # Po upgrade imagemagick:amd64 8:6.8.9.9-5+deb8u5 8:6.8.9.9-5+deb8u6
  # prestala uspokojive chodit detekce korektniho otevreni
  # obrazku. Takovahle kontrola tady ale stejne chybela.
  if (($nlogow == 0) or ($nlogoh == 0)) {
    carp "Logo ".$self->{input}." with=$nlogow height=$nlogoh, how can image have zero size?";
    return ;
  };

  # Pokud je obrazek prilis malicky, tak ho zvetsime ale jen pokud mame
  # k dispozici oba rozmery. Mno... proc? Intuitivne?
  if (defined($config->logo_max_width)
      and defined($config->logo_max_height)) {
    while (($nlogow < $config->logo_max_width)
	   and ($nlogoh < $config->logo_max_height)) {
      $nlogow *= 2;
      $nlogoh *= 2;
    };
  };

  # Kontrola neni-li obrazek moc siroky
  if (defined($config->logo_max_width)) {
    if ($nlogow > $config->logo_max_width) {
      $nlogow = $config->logo_max_width;
      $nlogoh = int($nlogow*$logoh/$logow);
    };
    #print "$logow*$logoh -> $nlogow*$nlogoh\n";
  };

  # Kontrola neni-li obrazek moc vysoky
  if (defined($config->logo_max_height)) {
    if ($nlogoh > $config->logo_max_height) {
      $nlogoh = $config->logo_max_height;
      $nlogow = int($nlogoh*$logow/$logoh);
    };
    #print "$logow*$logoh -> $nlogow*$nlogoh\n";
  }

  $logo->Resize(width => $nlogow,
		height => $nlogoh,
		filter => 'Catrom');

  # Vyplneni, respektive zlikvidovani pruhledneho podkladu
  if (defined($config->logo_fill) and ($config->logo_fill>0)) {
    my $new_logo_size = $nlogow.'x'.$nlogoh;
    my $new_logo = Image::Magick->new(size => $new_logo_size);
    $new_logo->ReadImage($config->logo_fill_color);
    $new_logo->Composite(image => $logo,
			 x => 0,
			 y => 0);
    $logo = $new_logo;
  };

  # TODO: Doladit doostrovani - jen v pripadech kdy dojde ke zmene rozmeru
  $logo->Sharpen(radius => .5,
		 sigma => 0.8);

  # Pokud si uzivatel preje tak dorovnat VYSKU na max pozadovanou
  if (defined($config->logo_fill_height) and ($config->logo_fill_height>0)) {
    if ($nlogoh < $config->logo_max_height) {
      my $new_logo_size = $nlogow.'x'.$config->logo_max_height;
      my $new_logo = Image::Magick->new(size => $new_logo_size);
      # Vypocet vycentrovani obrazku
      my $y_pos = int(($config->logo_max_height-$nlogoh)/2);
      $y_pos = 0 if (defined($config->logo_top) and ($config->logo_top>0));
      $y_pos = $config->logo_max_height-$nlogoh if (defined($config->logo_bottom) and ($config->logo_bottom>0));
      # Prilepeni reiznuteho loga na novy obrazek
      $new_logo->ReadImage($config->logo_fill_color);
      $new_logo->Composite(image => $logo,
			   x => 0,
			   y => $y_pos);
      $logo = $new_logo;
      $nlogoh = $config->logo_max_height;
    };
  };

  # Pokud si uzivatel preje tak dorovnat SIRKU na max pozadovanou
  if (defined($config->logo_fill_width) and ($config->logo_fill_width>0)) {
    if ($nlogow < $config->logo_max_width) {
      my $new_logo_size = $config->logo_max_width.'x'.$nlogoh;
      my $new_logo = Image::Magick->new(size => $new_logo_size);
      # Vypocet vycentrovani obrazku
      my $x_pos = int(($config->logo_max_width-$nlogow)/2);
      $x_pos = 0 if (defined($config->logo_left) and ($config->logo_left>0));
      $x_pos = $config->logo_max_width-$nlogow if (defined($config->logo_right) and ($config->logo_right>0));
      # Prilepeni reiznuteho loga na novy obrazek
      $new_logo->ReadImage($config->logo_fill_color);
      $new_logo->Composite(image => $logo,
			   x => $x_pos,
			   y => 0);
      $logo = $new_logo;
      $nlogow = $config->logo_max_width;
    };
  };

  $logo->Strip; # Odstraneni ICC color profilu, nekdy jsou ukrutne velke

  $self->{err} = $logo->Write('png:'.$self->{output});
  unless (-f $self->{output}) {
      warn "Neexistuje: ".$self->{output}." nepovedlo se zapsat???";
  };
  
  if ($self->{err}) {
      carp "Can't convert from \"".$self->{input}."\" to \"".$self->{output}."\": ".$self->{err};
      return;
  };

  my $cmd = 'optipng '.$self->{output}.' >/dev/null 2>&1';
  system($cmd); my $ret = $? >> 8;
  
  unless ($ret == 0) {
      carp "$ret Failed to execute '$cmd': $!";
  };

  $self;
}

1;
