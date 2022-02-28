function doRawStreams()
{
	if(streams.length > 0) document.writeln('<img class="navicon" src="./images/audioicon.png"/> <b>MP3/AAC Streams</b><br/>');
	for(var x = 0; x < streams.length; x+=2)
		document.writeln((streams[x] != '' ? '<a href="JavaScript:" onMouseDown="doStream(\''+streams[x]+'\');">' : '<h4>')+streams[x+1]+(streams[x] != '' ? '</a><br/>' : '</h4>'));
}

function doPlsStreams()
{
	if(pls.length > 0) 
	{
		if(streams.length > 0) document.writeln('<br/>');
		document.writeln('<img class="navicon" src="./images/shoutcasticon.png"/> <b>PLS Playlists</b><br/>');
		for(var x = 0; x < pls.length; x+=2)
			document.writeln((pls[x] != '' ? '<a href="JavaScript:" onMouseDown="doPls(\''+pls[x]+'\');">' : '<h4>')+pls[x+1]+(pls[x] != '' ? '</a><br/>' : '</h4>'));

	}
}

function doM3uStreams()
{
	if(m3u.length > 0)
	{
		if(streams.length > 0 || pls.length > 0) document.writeln('<br/>');
		document.writeln('<img class="navicon" src="./images/shoutcasticon.png"/> <b>M3U Playlists</b><br/>');
		for(var x = 0; x < m3u.length; x+=2)
		document.writeln((m3u[x] != '' ? '<a href="JavaScript:" onMouseDown="doM3u(\''+m3u[x]+'\');">' : '<h4>')+m3u[x+1]+(m3u[x] != '' ? '</a><br/>' : '</h4>'));
	}
}
