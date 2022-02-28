// ==========================================================================
// Copyright (C) 2008-2010 Sony Computer Entertainment Inc.
// All Rights Reserved.
// ==========================================================================


/*----*/
var shoutcastPageIsClosed = true;
function jumpToShoutcast () {
	shoutcastPage = window.open ("http://www.shoutcast.com/disclaimer", "What is SHOUTcast");
	if ( shoutcastPage ) shoutcastPageIsClosed = false;
	else shoutcastPageIsClosed = true;
}

if ( navigator.mimeTypes
     && navigator.mimeTypes ["application/x-psp-extplugin"] ) {
    var plugin
		= navigator.mimeTypes ["application/x-psp-extplugin"].enabledPlugin;
    if ( plugin ) {
        document.write
			("<object name=psp type=\"application/x-psp-extplugin\" >"
			 +"</object>\n");
    }
}
else psp = null;
var isPSPRadio = false;

window.onload = onLoadProc;
window.onunload = onUnLoadProc;

var streamTitle="";
var contentMetaInfo="";

var timerID_for_initProc = 0;
var timerID_for_streamStatusCheckProc = 0;
var timerID_for_contentMetaInfo = 0;
var timerID_for_dayTick=(0);
var startDate = "";

/*----*/
function onLoadProc () {
	document.title = title;
	document.getElementById ("metaInfo").style.fontSize
		= contentMetaInfoFontSize_LARGE;
	document.getElementById ("stationInfo").style.fontSize
		= stationInfoFontSize_LARGE;
	timerID_for_initProc = setTimeout (initProc, 1500);
}

/*----*/
function onUnLoadProc () {
	if ( ! shoutcastPageIsClosed ) {
		shoutcastPage.close ();
		shoutcastPageIsClosed = true;
	}
}

/*----*/
function initProc () {
	clearTimeout (timerID_for_initProc); timerID_for_initProc = 0;
	timerID_for_streamStatusCheckProc
		= setTimeout ('streamStatusCheckProc ()', 1500);
    timerID_for_contentMetaInfo
		= setTimeout ('updateContentMetaInfo ()', 2000);
	timerID_for_dayTick
		= setInterval ('dayTickProc ()', 24*3600*1000);

	var d = new Date ();
	startDate = (1900 + d.getYear ()) + "." + (d.getMonth () + 1) + "." + d.getDate ();

	if ( psp ) {
		psp.sysRadioBackLightAlwaysOn (1);
		isPSPRadio = true;
		psp.sysRadioSetDebugMode (0);
		psp.sysRadioSetSubVolume (0);
		psp.sysRadioSetMasterVolume (255);
		{
			var n = onKeywords.length;
			var m = Math.floor (Math.random () * (n + 1));
			if ( n <= m ) m = n - 1;
			prepareForGetStationList (onKeywords [m]);
		}
		bAacpSupport = psp.sysRadioCapabilityCheck (0) ? true : false;
	}
}

/*----*/
function sw ( mode ) {
	switch ( mode ) {
	case 2: // mouse down
		if ( bNowHttpGetIsBusy ) return;
		if ( bInAnalizingStationListString ) bForcedExitFlag = true;
		psp.sysRadioPlayEffectSound ();
		switchState = switchState ? 0 : 1;
		if ( switchState == 1 ) {
			document.toggleSwitch.src = "images/ON.jpg";
			var n = onKeywords.length;
			var m = Math.floor (Math.random () * (n + 1));
			if ( n <= m ) m = n - 1;
			prepareForGetStationList (onKeywords [m]);
		}
		else {
			document.toggleSwitch.src = "images/OFF.jpg";
			var n = offKeywords.length;
			var m = Math.floor (Math.random () * (n + 1));
			if ( n <= m ) m = n - 1;
			prepareForGetStationList (offKeywords [m]);
		}
		streamStatusCheckProcWorkState = 0;
		if ( Math.random () < 0.5 ) psp.sysRadioSetAudioShiftWidth (-25);
		else psp.sysRadioSetAudioShiftWidth (15);
		break;
	case 0: // mouse over
	case 1: // mouse out
	case 3: // mouse up
	default:
		break;
	}
}

/*----*/
function cs_mouseOver () {
	if ( isPSPRadio ) psp.sysRadioBackLightAlwaysOn (0);
}

/*----*/
function cs_mouseOut () {
	if ( isPSPRadio ) psp.sysRadioBackLightAlwaysOn (1);
}

var bAacpSupport = false;

var devID="sh1ODSQoScMFgZWn";
var shoutcastYelloPageUrl_A_API2="http://api.shoutcast.com/legacy/stationsearch?k="+devID+"&search=";
var shoutcastPlsUrl_A_API2="http://yp.shoutcast.com/sbin/tunein-station.pls?id=";
var shoutcastPlsUrl_B_API2="&k="+devID;

var shoutcastYelloPageUrl_A_API1="http://www.shoutcast.com/sbin/newxml.phtml?search=";
var shoutcastPlsUrl_A_API1="http://www.shoutcast.com/sbin/shoutcast-playlist.pls?rn=";
var shoutcastPlsUrl_B_API1="&file=filename.pls";

var shoutcastYelloPageUrl_A=shoutcastYelloPageUrl_A_API2;
var shoutcastPlsUrl_A=shoutcastPlsUrl_A_API2;
var shoutcastPlsUrl_B=shoutcastPlsUrl_B_API2;

var bBusy = false;
var userAgentForPlayStream = "PSP-InternetRadioPlayer/1.00";
var userAgentForHttpGet = "PSP-InternetRadioPlayer/1.00";
var userAgentForGetPls = "PSP-InternetRadioPlayer/1.00";
var timerID_for_httpGetProc=(0);
var bNowHttpGetIsBusy = false;
var maxNumStation = 40;
var currentStation = 0;
var currentKeyword = "";
var bForcedExitFlag = false;
var bInAnalizingStationListString = false;
var switchState = 1;
var stationArrayList = new Array (Array (0), Array (0));
var prevKeyword = new Array (2);
var numStationList = 0;
var streamStatusCheckProcWorkState = 0;
var bConnectError = false;
var playerTopPageUrl = "http://radio.psp.dl.playstation.net/psp/radio/player/"
	+ playerName + "/index.html";

/*----*/
function prepareForGetStationList ( keyword ) {
	currentKeyword = keyword;
	bBusy = true;
	if ( isPSPRadio ) psp.sysRadioBusyIndicator (1);
	var url = shoutcastYelloPageUrl_A + escape (keyword);
	if ( isPSPRadio ) {
		var size = 16384;
		psp.sysRadioPrepareForHttpGet (url, userAgentForHttpGet, size, 0);
	}
	bNowHttpGetIsBusy = true;
	httpGetProc ();
}

/*----*/
function httpGetProc () {
	if ( 0 < timerID_for_httpGetProc ) {
		clearTimeout (timerID_for_httpGetProc);
		timerID_for_httpGetProc = 0;
	}
	if ( ! bNowHttpGetIsBusy ) return;
	var stationListStr="";
	if ( isPSPRadio ) {
        result = psp.sysRadioGetHttpGetStatus ();
        if ( result == 1 || result == -1 ) {
			timerID_for_httpGetProc
				= setTimeout ('httpGetProc ()', 500);
			return; // error;
		}
		stationListStr = psp.sysRadioGetHttpGetResult ();
		psp.sysRadioHttpGetTerminate ();
	}
	var newStationArray = makeStationList (stationListStr);
	if ( 0 < newStationArray.length ) {
		delete stationArrayList [switchState];
		stationArrayList [switchState] = newStationArray;
		prevKeyword [switchState] = currentKeyword;
	}
	else {
		delete newStationArray;
		currentKeyword = prevKeyword [switchState];
	}
	var n = stationArrayList [switchState].length;
	if ( maxNumStation < n ) {
		n = maxNumStation;
		stationArrayList [switchState]
			= stationArrayList [switchState].slice (0, maxNumStation);
	}
	numStationList = n;

	currentStation = Math.floor (Math.random () * (numStationList + 1));
	if ( numStationList <= currentStation ) currentStation = numStationList - 1;
	tune (currentStation, 0);

	bForcedExitFlag = false;
	if ( isPSPRadio ) psp.sysRadioBusyIndicator (0);
	streamTitle = "";
	bBusy = false;
	bNowHttpGetIsBusy = false;
}

/*----*/
function tune ( stationNumber, mode ) {
	var result;
	if ( numStationList == 0 ) return;
	if ( numStationList <= stationNumber ) return;
	if ( stationArrayList [switchState] [stationNumber].id.length == 0 ) mode = 1;
	if ( isPSPRadio ) {
		psp.sysRadioBusyIndicator (1);
		if ( mode == 0 ) { // PLS の URL 指定で再生
			var stationID = stationArrayList [switchState] [stationNumber].id;
			var plsURL = shoutcastPlsUrl_A + stationID + shoutcastPlsUrl_B;
			psp.sysRadioPlayPls
				(plsURL, userAgentForGetPls, userAgentForPlayStream);
		}
		else { // ストリーム URL 指定で再生
			psp.sysRadioPlayStream
				(stationArrayList [switchState] [stationNumber].streamUrl,
				 userAgentForPlayStream);
		}
	}
}

/*----*/
var connectionTimeoutCountdown = 0;
function streamStatusCheckProc () {
	if ( 0 < timerID_for_streamStatusCheckProc ) {
		clearTimeout (timerID_for_streamStatusCheckProc);
		timerID_for_streamStatusCheckProc = 0;
	}
	var result = psp.sysRadioGetPlayerStatus ();
	if ( ! psp ) {
		timerID_for_streamStatusCheckProc
			= setTimeout ('streamStatusCheckProc ()', 1500);
		return;
	}
	if ( numStationList == 0 ) {
		timerID_for_streamStatusCheckProc
			= setTimeout ('streamStatusCheckProc ()', 4000);
		return;
	}
	if ( bNowHttpGetIsBusy ) {
		timerID_for_streamStatusCheckProc
			= setTimeout ('streamStatusCheckProc ()', 4000);
	}
	switch ( streamStatusCheckProcWorkState ) {
	case 0:
		{
			var result = psp.sysRadioGetPlayerStatus ();
			switch ( result ) {
			case -1: // エラー
				break;
			case 1: // 再生中
			case 4: // 放送サーバーへ接続中
			case 0: // 処理中でない
				streamStatusCheckProcWorkState = 2;
				connectionTimeoutCountdown = 20;
				break;
			case 2: // pls あるいは m3u データを取得中
			case 3: // pls あるいは m3u データを解析中
			default:
				break;
			}
		}
		break;
	case 2:
		if ( ! bNowHttpGetIsBusy && ! bInAnalizingStationListString ) {
			streamStatusCheckProcWorkState = 3;
			streamTitle = "";
		}
		break;
	case 3: // 再生状態を監視し続ける
	default:
		psp.sysRadioSetAudioShiftWidth (0);
		psp.sysRadioSetSubVolume (255);
		{
			var result = psp.sysRadioGetPlayerStatus ();
			switch ( result ) {
			case 0: // 処理中でない
			case -1: // エラー
				if ( ! bBusy ) psp.sysRadioBusyIndicator (0);
				bConnectError = true;
				if ( numStationList ) {
					currentStation
						= (currentStation + numStationList- 1)
						% numStationList;
				}
				tune (currentStation, 0);
				streamTitle = "";
				break;
			case 1: // 再生中
				bConnectError = false;
				if ( ! bBusy ) psp.sysRadioBusyIndicator (0);
				break;
			default:
				break;
			}
		}
		break;
	}
	timerID_for_streamStatusCheckProc
	  = setTimeout ('streamStatusCheckProc ()', 1500);
}

/*----*/
var lastStationInfoFontSize = stationInfoFontSize_LARGE;
function updateStreamTitle () {
	if ( streamTitle != "" ) return;
	var stationName;
	var bitRate = 0;
	var sampleRate = 0;
	if ( isPSPRadio ) {
		stationName = psp.sysRadioGetStreamTitle (contentMetaInfoEncodeType);
		bitRate = psp.sysRadioGetBitRate () / 1000;
		sampleRate = psp.sysRadioGetSamplingRate () / 1000;
	}
	else {
		stationName = "station name";
		bitRate = 128000 / 1000;
		sampleRate = 44100 / 1000;
	}
	if ( bitRate != 0 && sampleRate != 0 ) {
		stationName
			= bitRate + "kbps/" + sampleRate + "kHz"
			+ ((stationArrayList [switchState] [currentStation].aacp)?"/AAC+":"")
			+ " \"" + currentKeyword + "\""
			+ " : "
			+ stationName;
		streamTitle = unescape (stationName);
	}
	{
		var currentFontSize;
		if ( stationInfoFontSizeChangeLength < streamTitle.length )
			currentFontSize = stationInfoFontSize_SMALL;
		else currentFontSize = stationInfoFontSize_LARGE;
		if ( lastStationInfoFontSize != currentFontSize ) {
			document.getElementById ("stationInfo").firstChild.nodeValue = "";
			document.getElementById ("stationInfo").style.fontSize
				= lastStationInfoFontSize = currentFontSize;
		}
	}
	document.getElementById ("stationInfo").firstChild.nodeValue
		= streamTitle;
}

/*----*/
var lastContentMetaInfoFontSize = contentMetaInfoFontSize_LARGE;
function updateContentMetaInfo () {
	if ( 0 < timerID_for_contentMetaInfo ) {
		clearTimeout (timerID_for_contentMetaInfo);
		timerID_for_contentMetaInfo = 0;
	}
	if ( streamStatusCheckProcWorkState < 3 || bConnectError ) {
		timerID_for_contentMetaInfo
			= setTimeout ('updateContentMetaInfo ()', 2000);
		return;
	}
	var artistAndSongName;
	var bitRate = 0;
	var sampleRate = 0;
	if ( isPSPRadio )
		artistAndSongName
			= psp.sysRadioGetContentMetaInfo (contentMetaInfoEncodeType);
	else artistAndSongName = "-";
	updateStreamTitle ();
	if ( contentMetaInfo == artistAndSongName ) {
		timerID_for_contentMetaInfo
			= setTimeout ('updateContentMetaInfo ()', 2000);
		return;
	}
	contentMetaInfo = artistAndSongName;
	artistAndSongName = unescape (contentMetaInfo);
	{
		var currentFontSize;
		if ( contentMetaInfoFontSizeChangeLength < artistAndSongName.length )
			currentFontSize = contentMetaInfoFontSize_SMALL;
		else currentFontSize = contentMetaInfoFontSize_LARGE;
		if ( lastContentMetaInfoFontSize != currentFontSize ) {
			document.getElementById ("metaInfo").firstChild.nodeValue = "";
			document.getElementById ("metaInfo").style.fontSize
				= lastContentMetaInfoFontSize = currentFontSize;
		}
	}
	document.getElementById ("metaInfo").firstChild.nodeValue
		= artistAndSongName;
    timerID_for_contentMetaInfo
		= setTimeout ('updateContentMetaInfo ()', 2000);
}

/*----*/
var keyword_EndOfQuote = "\"";
var keyword_Station = "<station ";
var keyword_name = "name=\"";
var keyword_mt = "mt=\"";
var keyword_id = "id=\"";
var keyword_br = "br=\"";
var keyword_genre = "genre=\"";
var keyword_lc = "lc=\"";
function makeStationList ( stationListString ) {
    stationRec = new Object ();
    var currentPos = 0;
	var startPos = 0;
	var endPos = 0;
    var prevCurrentPos = -1;
    var state = 0;
    var count = 0;
	psp.sysRadioPrepareForStrOperation (stationListString);
    var length = psp.sysRadioStrLength ();
    var bExit = false;
    stationList = new Array (0);
	bInAnalizingStationListString = true;
    while ( bExit == false && bForcedExitFlag == false ) {
		switch ( state ) {
		case 0: // name
			stationRec.id = stationRec.br = stationRec.sr = stationRec.lc = 0;
			stationRec.mt = stationRec.genre = stationRec.rp = "";
			startPos = psp.sysRadioStrIndexOf (keyword_name, currentPos);
			if ( startPos < 0 || currentPos == startPos ) {
				bExit = true;
				break;
			}
			startPos += keyword_name.length;
			endPos = psp.sysRadioStrIndexOf
				(keyword_EndOfQuote, startPos);
			stationRec.name = psp.sysRadioStrSlice (startPos, endPos);
			currentPos = endPos + keyword_EndOfQuote.length;
			++state;
			break;
		case 1: // mt
			startPos = psp.sysRadioStrIndexOf (keyword_mt, currentPos);
			if ( startPos < 0 || currentPos == startPos ) {
				bExit = true;
				break;
			}
			startPos += keyword_mt.length;
			endPos = psp.sysRadioStrIndexOf (keyword_EndOfQuote, startPos);
			stationRec.mt = psp.sysRadioStrSlice (startPos, endPos);
			currentPos = endPos + keyword_EndOfQuote.length;
			++state;
			break;
		case 2: // id
			startPos = psp.sysRadioStrIndexOf (keyword_id, currentPos);
			if ( startPos < 0 || currentPos == startPos ) {
				bExit = true;
				break;
			}
			startPos += keyword_id.length;
			endPos = psp.sysRadioStrIndexOf (keyword_EndOfQuote, startPos);
			stationRec.id = psp.sysRadioStrSlice (startPos, endPos);
			currentPos = endPos + keyword_EndOfQuote.length;
			++state;
			break;
		case 3: // br (24, 28, 32, 40, 48, 56, 64, 96, 112, 128, 160, 192, 320)
			startPos = psp.sysRadioStrIndexOf (keyword_br, currentPos);
			if ( startPos < 0 || currentPos == startPos ) {
				bExit = true;
				break;
			}
			startPos += keyword_br.length;
			endPos = psp.sysRadioStrIndexOf (keyword_EndOfQuote, startPos);
			stationRec.br = psp.sysRadioStrSlice (startPos, endPos);
			currentPos = endPos + keyword_EndOfQuote.length;
			++state;
			break;
		case 4: // genre
			startPos = psp.sysRadioStrIndexOf (keyword_genre, currentPos);
			if ( startPos < 0 || currentPos == startPos ) {
				bExit = true;
				break;
			}
			startPos += keyword_genre.length;
			endPos = psp.sysRadioStrIndexOf (keyword_EndOfQuote, startPos);
			stationRec.genre = psp.sysRadioStrSlice (startPos, endPos);
			currentPos = endPos + keyword_EndOfQuote.length;
			++state;
			break;
		case 5: // lc
			startPos = psp.sysRadioStrIndexOf (keyword_lc, currentPos);
			if ( startPos < 0 || currentPos == startPos ) {
				bExit = true;
				break;
			}
			startPos += keyword_lc.length;
			endPos = psp.sysRadioStrIndexOf (keyword_EndOfQuote, startPos);
			stationRec.lc = psp.sysRadioStrSlice (startPos, endPos);
			currentPos = endPos + keyword_EndOfQuote.length;
			++state;
			break;
		case 6:
			if ( ( currentPos < prevCurrentPos )
				 || ( prevCurrentPos == currentPos )
				 || ( length - 1 <= currentPos ) ) {
				bExit = true;
			}
			else {
				// 注）mt="audio/mpeg" のもののみを処理する事
				if ( ( bAacpSupport && stationRec.mt == "audio/aacp" )
					 || stationRec.mt == "audio/mpeg" ) {
					stationList.push
						({stationName: stationRec.name,
							  comment: stationRec.genre,
								   id: stationRec.id,
								   lc: stationRec.lc,
								   br: stationRec.br,
								   sr: stationRec.sr,
								 aacp: (stationRec.mt == "audio/aacp")
								       ? true : false,
							  refPage: stationRec.rp,
							streamUrl: ""
								});
					++count;
					if ( maxNumStation <= count ) bExit = true;
				}
			}
			prevCurrentPos = currentPos;
			state = 0;
		}
    }
	psp.sysRadioStrOperationTerminate ();

	// 強制中断された場合は、配列を一旦破棄し空の配列を返す。
	if ( bForcedExitFlag ) {
		delete stationList;
		stationList = new Array (0);
	}
	bInAnalizingStationListString = false;
	delete stationRec;

    return ( stationList );
}
 
/*----*/
function dayTickProc () {
	if ( bNowHttpGetIsBusy ) {
		return;
	}
	if ( isPSPRadio && psp ) {
		var d = new Date ();
		var url = playerTopPageUrl + "?__dt__" + startDate + "_"
			+ (1900 + d.getYear ()) + "." + (d.getMonth () + 1) + "." + d.getDate ();
		var size = 16;
		psp.sysRadioPrepareForHttpGet (url, userAgentForHttpGet, size, 0);
		// 注）これは緩い処理。排他処理は行わない。
	}
}

/*
  Local Variables:
  tab-width:4
  End:
*/
