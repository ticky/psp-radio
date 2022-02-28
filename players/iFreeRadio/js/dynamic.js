var args = new Array(), argnames = new Array();
var loc = location.toString();

if(loc.indexOf('#') > -1)
{
	var dynargs = loc.substr(loc.indexOf('#')+1).split("&");
	for(var x = 0; x < dynargs.length; x++)
	{
		var argn = dynargs[x].split("=")[0], argv = dynargs[x].split("=")[1];
		argnames[argnames.length] = argn;
		args[argn] = argv;
	}
}
