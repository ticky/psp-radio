function doPodcasts()
{
	for(var x = 0; x < podcasts.length; x+=2)
		document.writeln((podcasts[x] != '' ? '<a href="JavaScript:" onclick="getPodcast(\''+podcasts[x]+'\');">' : '<h4>')+podcasts[x+1]+(podcasts[x] != '' ? '</a><br/>' : '</h4>'));
}

var timerID_for_podcastProc = 0;
function getPodcast(url)
{
	detect()
	if(is_enabled)
	{
		file = -1;
		getFileContents(url);
		timerID_for_podcastProc = setTimeout('podcastProc()', 1000);
	} else alert('Radio player is disabled!');
}

function stripJunk(x)
{
	return x.replaceAll("&lt;",'<').replaceAll("&gt;",'>').replaceAll('<![CDATA[','').replaceAll(']]>','');
}

function podcastProc()
{
	detect()
	if(is_enabled)
	{
		if(bSearching)
		{
			timerID_for_podcastProc = setTimeout('podcastProc()', 1000);
			return;
		}
		else
		{
			var has_streams = false;
			clearTimeout(timerID_for_podcastProc);
	
			psp.sysRadioBusyIndicator(1);
			var title='';
			try {
				title = file.substr(file.indexOf('<title>')+7);
				title = stripJunk(title.substr(0, title.indexOf('</title>')));
			} catch(e) {}
	
			var link='';
			try {
				link = file.substr(file.indexOf('<link>')+6);
				link = stripJunk(link.substr(0, link.indexOf('</link>')));
			} catch(e) {}
	
			var image='';
			try {
				image = file.substr(file.indexOf('<itunes:image'));
				image = image.substr(0, image.indexOf('>'));
				image = (/href="([^"]*)"/.exec(image))[1];
			} catch(e) {
				try {
					image = file.substr(file.indexOf('<image>')+7);
					image = image.substr(image.indexOf('<url>')+5);
					image = image.substr(0, image.indexOf('</url>'));
				} catch(e) {
					try {
						image = file.substr(file.indexOf('<media:thumbnail'));
						image = image.substr(0, image.indexOf('>'));
						image = (/url="([^"]*)"/.exec(image))[1];
					} catch(e) {}
				}
			}
			image = stripJunk(image);
	
			var description='';
			try {
				description = file.substr(file.indexOf('<description>')+13);
				description = stripJunk(description.substr(0, description.indexOf('</description>')));
			} catch(e) {}
	
			var data = file.substr(file.indexOf('<item')+5);
			data = data.substr(data.indexOf('>')+1);
			var items = data.split('<item');
			document.writeln(pageHead_podcast+(image != '' ? '<img src="'+image+'"/><br/>\n' : '')+'<h2>'+(link != '' ? '<a href="'+link+'">' : '')+title+(link != '' ? '</a>' : '')+'</h2>\n<h3>'+description+'</h3>\n'+pageFoot_podcasts);
			psp.sysRadioBusyIndicator(0);
	
			for(var x = 0; x < items.length; x++)
			{
				psp.sysRadioBusyIndicator(1);
				var item = items[x];
				title='';
				try {
					title = item.substr(item.indexOf('<title>')+7);
					title = stripJunk(title.substr(0, title.indexOf('</title>')));
				} catch(e) {}
		
				description='';
				try {
					if(item.indexOf('<description>') > -1)
					{
						description = item.substr(item.indexOf('<description>')+13);
						description = description.substr(0, description.indexOf('</description>'))
					} else {
						try {
							description = file.substr(file.indexOf('<content:encoded>')+17);
							description = description.substr(0, description.indexOf('</content:encoded>'));
						} catch(e) {}
					}
					description = stripJunk(description);
				} catch(e) {}
		
				link='';
				try {
					link = item.substr(item.indexOf('<link>')+6);
					link = stripJunk(link.substr(0, link.indexOf('</link>')));
				} catch(e) {}
	
				var enclosure = '';
				try {
					enclosure = item.substr(item.indexOf('<enclosure'));
					enclosure = enclosure.substr(0, enclosure.indexOf('>'));
					var enc = /url="([^"]*)"/.exec(enclosure);
					if(enc == null)
						enclosure = (/url='([^']*)'/.exec(enclosure))[1];
					else enclosure = enc[1];
					enclosure = stripJunk(enclosure);
					if(enclosure != '') has_streams = true;
				} catch(e) {}
	
				document.writeln('<h4>'+title+'</h4>\n' + (enclosure != '' ? '<a href="JavaScript:" onclick="doStream(\''+enclosure+'\');"><img class="navicon" src="./images/listen.png"/> Stream</a> | <a href="'+enclosure+'"><img class="navicon" src="./images/save.png"/> Download</a>' + (link != '' ? ' | ' : '') : '') + (link != '' ? '<a href="'+link+'"><img class="navicon" src="./images/link.png"/> Link</a>' : '') + (enclosure != '' || link != '' ? '<br/>\n' : '') + description + '<br/>\n');
	
				psp.sysRadioBusyIndicator(0);
			}
			if(has_streams)
				document.writeln('<script>var psp = parent.frames[0].document.getElementById(\'psp\');</script>\n<script type="text/javascript" src="./js/fpr.js"></script>\n<input type="button" value="stop playback" onclick="resetRadio();"/>');
	
			document.writeln(pageFoot);
	
		}
	} else alert('Radio player is disabled!');
}
