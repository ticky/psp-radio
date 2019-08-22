document.writeln('<link rel="stylesheet" type="text/css" href="./personalize/user_theme.css"/>');
document.writeln('<div id="bg">&nbsp;</div>');

var pageHead = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">\n<head>\n<meta http-equiv="content-type" content="text/html; charset=utf-8"/>\n<title>FreeRadio</title>\n<link href="./css/fpr.css" rel="stylesheet" type="text/css" />\n<script>var psp = parent.frames[0].document.getElementById(\'psp\');</script>\n<script type="text/javascript" src="./js/fpr.js"></script>\n<script type="text/javascript" src="./js/plugins.js"></script>\n</head>\n<body>\n<div id="meta">&nbsp;</div>\n<div id="stopbutton"><input type="button" value="Stop playback" onclick="resetRadio();"/></div>\n<div id="content" style="position: relative; top: 20px;">\n';

var pageHead_podcast = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">\n<head>\n<meta http-equiv="content-type" content="text/html; charset=utf-8"/>\n<title>FreeRadio - Podcast</title>\n<link href="./css/podcast.css" rel="stylesheet" type="text/css" /></head>\n<body>\n<div id="content">';

var pageFoot = '</div>\n<script type="text/javascript">if(psp.sysRadioPrepareForScanDir)start_plugins();</script></body>\n</html>';
var pageFoot_podcasts = '</div>\n</body>\n</html>';

var isPSPRadio = true;

var stopButton = '<input type="button" value="stop playback" onclick="resetRadio();"/>\n';

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

String.prototype.replaceAll = function (f, r) {
    var q = this;
    while(q.indexOf(f) > -1) q = q.replace(f, r);
    return q;
}

var is_enabled = false;

function detect()
{
	try
	{
		psp.sysRadioGetNetworkBandQuality();
		is_enabled = true;
	} catch(e) {}
}

function updateMeta()
{
	detect()
	if(is_enabled)
	{
		if(document.getElementById('meta'))
		{
			document.getElementById('meta').innerHTML = psp.sysRadioGetContentMetaInfo(0) ? "Now playing: "+psp.sysRadioGetContentMetaInfo(0) : "<no information available>";
		}
// more metainfo for diagnostics...
/*		if(document.getElementById('meta2'))
		{
			document.getElementById('meta2').innerHTML = psp.sysRadioGetNetworkBandQuality() ? 'Stream strength: '+Math.round(100*(psp.sysRadioGetNetworkBandQuality() / 255),0)+'%': "<no stream>";
			if(document.getElementById('meta2').innerHTML != "<no stream>")
			{
				document.getElementById('meta2').innerHTML += "; buffer: "+psp.sysRadioGetStreamBufferLevel() + (psp.sysRadioGetStreamIpAddress() ? ' ('+psp.sysRadioGetStreamIpAddress()+':'+psp.sysRadioGetStreamPort()+')' : '');
			}
			if(document.getElementById('meta3'))
			{
				document.getElementById('meta3').innerHTML = 'Peaks: '+psp.sysRadioGetLeftAudioPeakLevel()+' left, '+psp.sysRadioGetRightAudioPeakLevel()+' right; Bitrate: '+(psp.sysRadioGetBitRate()/1000)+'kbps, sampling rate: '+(psp.sysRadioGetSamplingRate()/1000)+'kHz';
			}
		}*/
		timerID_for_meta = setTimeout('updateMeta()', 1500);
	} else alert('Radio player is disabled!');
}

// --------------------------------------------------------------------------
// user agents
// --------------------------------------------------------------------------

var userAgentForPlayStream = "PSP-InternetRadioPlayer/1.00";
var userAgentForHttpGet = "PSP-InternetRadioPlayer/1.00";
var userAgentForGetPls = "PSP-InternetRadioPlayer/1.00";

function mute()
{
	detect()
	if(is_enabled)
	{
		psp.sysRadioSetMasterVolume (0);
	}
}

function unmute()
{
	detect()
	if(is_enabled)
	{
		psp.sysRadioSetMasterVolume (255);
	}
}

// --------------------------------------------------------------------------
// check for the start button for toggling mute
// --------------------------------------------------------------------------

function startButtonPollingProc () {
	detect()
	if(is_enabled)
	{
		if ( psp ) {
			var status = psp.sysRadioGetStartButtonToggleStatus ();
			if ( status ) {
				unmute();
			}
			else {
				mute();
			}
		}
	}
}

// --------------------------------------------------------------------------
// PSP plugin object extended initialization
// --------------------------------------------------------------------------
var timerID_for_startButtonStatusPolling = 0;
function radioPlayerInit0 ( streamUrl ) {
	if ( bInited ) return;
	bInited = true;
	if ( psp ) {
		var result;
		if ( sw_noise_status == 1 )
			psp.sysRadioSetWhiteNoiseOscillatorVolume (60);
		if ( 0 < streamUrl.length ) {
			// no previous station selected
			result = psp.sysRadioPlayStream
				(streamUrl, userAgentForPlayStream);
		}
		psp.sysRadioSetMasterVolume (255);
		psp.sysRadioSetSubVolume (255);
        psp.sysRadioBackLightAlwaysOn (1);
		psp.sysRadioSetDebugMode (1);
		window.resizeTo (480, 544);
		psp.sysRadioSetDebugLogTextStyle
			(224,224,224,255, 255,255,255,255, 30,30,40,96,
			 1, 0, 1);
	}
}

/*
  Local Variables:
  tab-width:4
  End:
*/

timerID_for_meta = 0;

function resetRadio()
{
	detect()
	if(is_enabled)
	{
		clearTimeout(timerID_for_meta);
		psp.sysRadioPlayEffectSound();
		psp.sysRadioStop();
		psp.sysRadioSetWhiteNoiseOscillatorVolume(0);
		timerID_for_meta = setTimeout('updateMeta()', 1000);
	} else alert('Radio player is disabled!');
}

function whitenoise()
{
	detect()
	if(is_enabled)
	{
		resetRadio();
		psp.sysRadioSetWhiteNoiseOscillatorVolume(100);
	} else alert('Radio player is disabled!');
}

function doStream(url)
{
	detect()
	if(is_enabled)
	{
		resetRadio();
		psp.sysRadioPlayStream(url, userAgentForPlayStream);
		psp.sysRadioSetMasterVolume (255);
		psp.sysRadioSetSubVolume (255);
	} else alert('Radio player is disabled!');
}

function doPls(url)
{
	detect()
	if(is_enabled)
	{
		resetRadio();
		psp.sysRadioPlayPls(url, userAgentForGetPls, userAgentForPlayStream);
		psp.sysRadioSetMasterVolume (255);
		psp.sysRadioSetSubVolume (255);
	} else alert('Radio player is disabled!');
}

function doM3u(url)
{
	detect()
	if(is_enabled)
	{
		resetRadio();
		psp.sysRadioPlayM3u(url, userAgentForGetPls, userAgentForPlayStream);
		psp.sysRadioSetMasterVolume (255);
		psp.sysRadioSetSubVolume (255);
	} else alert('Radio player is disabled!');
}

timerID_for_startButtonStatusPolling = setInterval ('startButtonPollingProc ()', 500);

function getFile(url, size)
{
	detect()
	if(is_enabled)
	{
		psp.sysRadioBusyIndicator(1);
		psp.sysRadioPrepareForHttpGet (url, userAgentForHttpGet, size, 0);
		bNowFileGetIsBusy = true;
		getFileProc ();
	} else alert('Radio player is disabled!');
}

var file=-1;
var timerID_for_getFileProc = 0;
var bNowFileGetIsBusy = false;
function getFileProc()
{
	detect()
	if(is_enabled)
	{
		if ( ! bNowFileGetIsBusy ) return;
		result = psp.sysRadioGetHttpGetStatus ();
		if ( result == 1 ) { // busy
			timerID_for_getFileProc = setTimeout ('getFileProc()', 500);
			return;
		}
		else if ( result == -1 )
		{
			psp.sysRadioBusyIndicator(0);
			return; // error;
		 }
		var res = psp.sysRadioGetHttpGetResult ();
		file = res;
		psp.sysRadioHttpGetTerminate ();
		psp.sysRadioBusyIndicator(0);
		bNowFileGetIsBusy = false;
	} else alert('Radio player is disabled!');
}

function getPlaylist(url)
{
	location.href="./playlist.html#url="+url;
}

var bSearching = false;
function getFileContents(url)
{
	detect()
	if(is_enabled)
	{
		if(!bSearching)
		{
			bSearching = true;
			getFile(url, 4*1024*1024); // works for any file up to 4MB.
			setTimeout('getFileContents("'+url+'")', 1000);
			return false;
		}
	
		if(psp.sysRadioGetHttpGetStatus() == 1)
		{
			setTimeout('getFileContents("'+url+'")', 1000);
			return false;
		}
		bSearching = false;
		return true;
	} else alert('Radio player is disabled!');
}
