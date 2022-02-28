var plugins = new Array();
var plugin_names = new Array();

if(psp.sysRadioPrepareForScanDir)
{
	if(psp.sysRadioPrepareForScanDir('radio/plugins') == 0)
	{
		var file;
		while((file = psp.sysRadioScanDir()) != '')
		{
			if(file.substring(file.lastIndexOf('.')+1).toLowerCase()=='plugin')
			{
				document.writeln('<script type="text/javascript" src="./plugins/'+file+'"></script>');
			}
		}
	}
}

function start_plugins()
{
	for(var x=0; x < plugin_names.length; x++)
		plugins[plugin_names[x]].start();
}
