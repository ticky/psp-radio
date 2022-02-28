/*
	To add a raw stream, follow the pattern here.
	In each row is the URL and title of a stream.
	Put the URL in single quotes, then a comma, then the stream title in single quotes, then a comma.
	If the title of the stream has a single quote somewhere in it, replace it with \' (that's "backslash, single quote").
	Make sure that every entry on the list BUT THE LAST has a comma after the stream title.
	If you put a comma after the last stream, it won't work!

	To add a separator, add an entry with no URL.

	Adding a remote playlist works the same way, but you need to put those into either the 'pls' list or the 'm3u' list depending on what sort of list it is (.PLS or .M3U).

	Streams will be listed on the portal page in the order you put them here.
*/

var streams = new Array(
'http://audio.espnradio800.com:8000/','ESPN Radio 800',
'http://pubint.ic.llnwd.net/stream/pubint_wamc2','NPR Live on WAMC',
'http://live1.prostream.nl:8000/qmusic.aac','Q-Music',
'http://81.173.3.134:80','Radio 538',
'http://81.173.3.131:8080','Sky Radio',
'http://stream01.slamfm.trueserver.nl:8080/slamfm','Slam Fm',
'http://209.9.238.5:8794','RKOL 64kbps',
'http://209.9.238.5:8792','RKOL 24kbps',
'http://216.235.94.13/play?s=djhearticaltee&d=live365&r=0&membername=getoutofmyhead&session=djhearticaltee:0&AuthType=NORMAL&SaneID=77.98.70.86-1200322503007541&lid=826003-gbr&tag=live365&token=7deb50cacd5ac02a9e3cc423a8cecb82-5316140080701120','Live365 Reggae'
);

var pls = new Array(
'http://www.lowercasesounds.com/modules/mod_internetradio/makeplaylist.php?ip=72.36.137.189&port=8000&format=PLS','lowercasesounds (pls)',
'http://internetradio.fearfm.nl/customplayer/fearfm_hard_high.pls','FearFM Hard',
'http://internetradio.fearfm.nl/customplayer/fearfm_harder_high.pls','FearFM Harder'
);

var m3u = new Array(
'http://www.lowercasesounds.com/playlist.m3u','lowercasesounds (m3u)',
'http://www.mohradio.com/p/mohradio.m3u','Masters of Hardcore (m3u)'
);
