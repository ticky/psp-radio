var timerID_for_playlistProc = 0;

function getRemotePlaylist(url)
{
	detect()
	if(is_enabled)
	{
		file = -1;
		getFileContents(url);
		timerID_for_playlistProc = setTimeout('playlistProc()', 1000);
	} else alert('Radio player is disabled!');
}

function getAction(url)
{
	url = url.trim();
	var ext = url.substr(url.lastIndexOf('.')+1).toLowerCase();
	var ret;
	if(ext == 'm3u')
		ret = "doM3u('"+url+"');\"><img class=\"navicon\" src=\"./images/shoutcasticon.png\"/> ";
	else if(ext == 'pls')
		ret ="doPls('"+url+"');\"><img class=\"navicon\" src=\"./images/shoutcasticon.png\"/> ";
	else if(ext == 'mp3' || ext == 'aac' || ext == 'mp4')
		ret ="doStream('"+url+"');\"><img class=\"navicon\" src=\"./images/audioicon.png\"/> ";
	else ret = "window.open('"+url+"');\">";
	return ret;
}

function playlistProc()
{
	detect()
	if(is_enabled)
	{
		if(bSearching)
		{
			timerID_for_playlistProc = setTimeout('playlistProc()', 1000);
			return;
		}
		else
		{
			clearTimeout(timerID_for_playlistProc);
			var playlist = file.split("\n");
			document.writeln(pageHead);
			for(var x = 0; x < playlist.length; x++)
			{
				psp.sysRadioBusyIndicator(1);
				var e1 = playlist[x], e2 = playlist[x+1];
				if(e1.substr(0,7) != '#EXTM3U')
				{
					var info='', thefile='';
					if(e1.substr(0,8) == '#EXTINF:')
					{
						info = e1.substr(e1.indexOf(',')+1);
						thefile = e2;
					}
					else
						thefile = e1;
					var link;
					if(info=='')
						link = '<a href="JavaScript:" onclick="'+getAction(thefile)+thefile+'</a><br/>';
					else
					{
						x++;
						link = '<a href="JavaScript:" onclick="'+getAction(thefile)+info+'</a><br/>';
					}
					document.writeln(link);
				}
				psp.sysRadioBusyIndicator(0);
			}
			document.writeln(pageFoot);
		}
	} else alert('Radio player is disabled!');
}
