#!/usr/bin/perl

# Create a list of videos, indexing 30 second clips for use with web info display page
#   Note:  wmv videos must be converted to mp4 for web/html display to work

use strict;
$|++;

my $in  = '/home/bruce/mh/www/video_index1.txt';
my $out = '/home/bruce/mh/www/video_index2.txt';

# This could be done natively in perl, but is easier/faster with the find command.
system '/usr/bin/find /mnt/video -follow -size +20k -iregex ".*\.\(mp4\|mov\)"  -print | sort > ' . $in;


open (IN,  '<', $in);
open (OUT, '>', $out);

while (my $f = <IN>) {
    chomp $f;
    my $i = `ffprobe $f  2>&1`;
    if (my ($d) = $i =~ /Duration\: (\S+)/) {
	my ($h, $m, $s) = split ':', $d;
	my $t = $h*60*60 + $m*60 + $s;
	print "f=$f d=$d h=$h m=$m s=$s t=$t\n";
	my $s1 =  0;
	my $s2 = 30;
	while ($s1 < ($t-5)) {
	    my $l = sprintf "%i/%i", $s1/60, $t/60;
	    print OUT "$f#t=$s1,$s2 label=$l\n";
	    $s1 = $s2;  $s2 += 30;
	}
    }
}
