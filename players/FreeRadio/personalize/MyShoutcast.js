/*
	To add a Shoutcast station, follow the pattern here.
	In each row is the number and title of a station.
	Put the number in single quotes, then a comma, then the station title in single quotes, then a comma.
	If the title of the station has a single quote somewhere in it, replace it with \' (that's "backslash, single quote").
	Make sure that every entry on the list BUT THE LAST has a comma after the station title.
	If you put a comma after the last station, it won't work!
	
	To get the station number, browse the Shoutcast station list at http://www.shoutcast.com/ . Right click the 'Tune in'
	button and copy the link to your clipboard. Find the station number in the link.

	Example:
	.977 - The Hits Channel (http://www.shoutcast.com/sbin/shoutcast-playlist.pls?rn=1025&file=filename.pls)
	Notice the "?rn=1025" : The station number is 1025. You'll see this station in the list below, too.
	
	To add a separator, add an entry with no URL.

	Stations will be listed on the portal page in the order you put them here.
*/


var shoutcast_stations = new Array(
'2680', '1.FM - Blues',
'6951', '1.FM - The Chillout Lounge',
'2541', '1.FM - Otto\'s Baroque Musick',
'7526', '181.FM - Christmas Mix Channel',
'5835', '181.fm - Kickin\' Country (Today\'s Best Country!)',
'2266', '181.fm - POWER 181',
'1553', '.977 The 80s Channel',
'1025', '.977 The Hitz Channel', // see? here's the example.
'8751', 'ChroniX Aggression',
'3201', 'D I G I T A L L Y - I M P O R T E D - Chillout',
'1276', 'D I G I T A L L Y - I M P O R T E D - European Trance, Techno, Hi-NRG',
'1790', 'D I G I T A L L Y - I M P O R T E D - Vocal Trance',
'3674', 'Drone Zone: Atmospheric ambient space music',
'841',  'Groove Salad: a nicely chilled plate of ambient beats and grooves.',
'5067', 'idobi Radio: Music that doesn\'t suck!',
'6445', 'Japan-A-Radio',
'8771', 'Radio Paradise - DJ-mixed modern & classic rock, world, electronica & more',
'333',  'S K Y . F M - 80s, 80s, 80s!',
'1568', 'S K Y . F M - All Hit 70s',
'1403', 'S K Y . F M - Absolutely Smooth Jazz',
'1914', 'S K Y . F M - Classical & Flamenco Guitar',
'2429', 'S K Y . F M - Mostly Classical',
'4977', 'S K Y . F M - New Age',
'8613', 'S K Y . F M - Roots Reggae',
'1677', 'S K Y . F M - The Christmas Channel',
'2207', 'Slow Radio',
'5890', 'SmoothJazz.com',
'9581', 'SmoothLounge.com',
'9036', '[XRM] - Alternative'
);
