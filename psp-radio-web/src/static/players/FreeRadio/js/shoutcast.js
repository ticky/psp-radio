function doShoutcast()
{
	for(var x = 0; x < shoutcast_stations.length; x+=2)
		document.writeln((shoutcast_stations[x] != '' ? '<a href="JavaScript:" onMouseDown="doPls(\'http://www.shoutcast.com/sbin/shoutcast-playlist.pls?rn='+shoutcast_stations[x]+'&file=filename.pls\');">' : '<h4>')+shoutcast_stations[x+1]+(shoutcast_stations[x] != '' ? '</a><br/>' : '</h4>'));
}
