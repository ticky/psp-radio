// ==========================================================================
// Copyright (C) 2008-2010 Sony Computer Entertainment Inc.
// All Rights Reserved.
// ==========================================================================


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

var lastTimeStationInfo = new Object ();
lastTimeStationInfo.streamUrl = "";
lastTimeStationInfo.stationName = "";
lastTimeStationInfo.comment = "";
lastTimeStationInfo.refPage = "";
lastTimeStationInfo.br = "";
lastTimeStationInfo.sr = "";
lastTimeStationInfo.aacp = false;

var streamTitle="";
var contentMetaInfo="";
var clipAnimCount = 5;

var timerID_for_clipAnimProc = 0;
var timerID_for_streamUrl = 0;
var timerID_for_initProc = 0;
var timerID_for_contentMetaInfo = 0;
var timerID_for_streamStatusCheckProc = 0;
var timerID_for_analogStickProc = 0;
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
function onUnLoadProc () {}

/*----*/
function initProc () {
	clearTimeout (timerID_for_initProc); timerID_for_initProc = 0;
	timerID_for_streamStatusCheckProc
		= setTimeout ('streamStatusCheckProc ()', 1500);
    timerID_for_contentMetaInfo
		= setTimeout ('updateContentMetaInfo ()', 2000);
    timerID_for_analogStickProc
		= setInterval ('analogStickProc ()', 100);
    timerID_for_streamUrl
		= setTimeout ('updateStreamUrl ()', 1000);
	timerID_for_dayTick
		= setInterval ('dayTickProc ()', 24*3600*1000);

	var d = new Date ();
	startDate = (1900 + d.getYear ()) + "." + (d.getMonth () + 1) + "." + d.getDate ();

	lastTimeStationInfo.streamUrl = getCookieValue ("streamUrl");
	lastTimeStationInfo.stationName = getCookieValue ("stationName");
	lastTimeStationInfo.comment = getCookieValue ("comment");
	lastTimeStationInfo.refPage = getCookieValue ("refPage");
	lastTimeStationInfo.br = getCookieValue ("br");
	lastTimeStationInfo.sr = getCookieValue ("sr");
	lastTimeStationInfo.aacp = eval (getCookieValue ("aacp"));

	if ( psp ) {
		psp.sysRadioBackLightAlwaysOn (1);
		isPSPRadio = true;
		psp.sysRadioSetDebugMode (0);
		if ( 0 < lastTimeStationInfo.streamUrl.length ) {
			psp.sysRadioPlayStream
				(lastTimeStationInfo.streamUrl, userAgentForPlayStream);
		}
		psp.sysRadioSetSubVolume (0);
		psp.sysRadioSetMasterVolume (255);
		prepareForGetStationList (searchKeyword);
		bAacpSupport = psp.sysRadioCapabilityCheck (0) ? true : false;
	}
}

var clipState = false;

/*----*/
function clipAnimProc () {
	clearTimeout (timerID_for_clipAnimProc);
	timerID_for_clipAnimProc = 0;
	if ( clipAnimCount <= 0 ) return;
	--clipAnimCount;
	document.clip.src = "images/CLIP"+clipAnimCount+".png";
	if ( 0 < clipAnimCount )
		timerID_for_clipAnimProc = setTimeout (clipAnimProc, 200);
	else {
		psp.sysRadioPlayEffectSound ();
		clipState = true;
		psp.sysRadioSetSubVolume (255);
	}
}

/*----*/
var prevRawYValue = 0;
var prevIndex = 0;
var incDecDir = 1;
var deepestIndex = 0;
function analogStickProc () {
	if ( 0 < clipAnimCount ) return;
	if ( isPSPRadio ) {
		var yValue = -psp.sysRadioGetAnalogStickYValue ();
		yValue -= 64;
		if ( yValue < 0 ) yValue = 0;
		yValue = (yValue * 0.3) + (prevRawYValue * 0.7) + 0.1;
		prevRawYValue = yValue;
		var index = Math.floor (yValue / 16); if ( 4 < index ) index = 4;
		if ( prevIndex == index ) return;
		document.clip.src = "images/CLIP"+index+".png";
		prevIndex = index;
		if ( index == 0 ) {
			psp.sysRadioPlayEffectSound ();
			if ( !clipState ) {
				if ( !strictlyOneStation && numStationList )
					currentStation
						= (currentStation + incDecDir + numStationList)
						% numStationList;
				streamTitle = "";
				tune (currentStation, 0);
				writeIntoCookie ();
				clipState = true;
				deepestIndex = 0;
			}
		}
		else {
			if ( deepestIndex < index && index == 4 ) incDecDir = -incDecDir;
			deepestIndex = index;
			if ( clipState ) {
				psp.sysRadioStop ();
				clipState = false;
			}
		}
	}
}

/*----*/
function s_mouseDown () {
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
var bForcedExitFlag = false;
var bInAnalizingStationListString = false;
var stationArray = new Array (0);
var numStationList = 0;
var streamStatusCheckProcWorkState = 0;
var bConnectError = false;
var playerTopPageUrl = "http://radio.psp.dl.playstation.net/psp/radio/player/"
	+ playerName + "/index.html";

/*----*/
function prepareForGetStationList ( keyword ) {
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
	delete stationArray;
	stationArray = makeStationList (stationListStr);
	var n = stationArray.length;
	if ( maxNumStation < n ) {
		n = maxNumStation;
		stationArray = stationArray.slice (0, maxNumStation);
	}
	numStationList = n;

	if ( 0 < lastTimeStationInfo.streamUrl.length ) {
		var i, N=(stationArray.length);
		var bFoundIt=false;
		// 配列中から探す
		for ( i = 0; i < N; i++ ) {
			if ( ( lastTimeStationInfo.stationName
				   == stationArray [i].stationName )
				 && ( lastTimeStationInfo.br
					  == stationArray [i].br )
				 && ( lastTimeStationInfo.sr
					  == stationArray [i].sr )
				 && ( lastTimeStationInfo.aacp
					  == stationArray [i].aacp ) ) {
				bFoundIt = true;
				break;
			}
		}
		// 見つかった場合
		if ( bFoundIt ) {
			currentStation = i;
		}
		// 見つからなかった場合
		else {
			// 配列の先頭に追加
			stationArray.unshift
				({stationName: lastTimeStationInfo.stationName,
					  comment: lastTimeStationInfo.comment,
						   id: "",
						   lc: "0",
						   br: lastTimeStationInfo.br,
						   sr: lastTimeStationInfo.sr,
					     aacp: lastTimeStationInfo.aacp,
					  refPage: lastTimeStationInfo.refPage,
					streamUrl: lastTimeStationInfo.streamUrl
						});
			currentStation = 0;
			++numStationList;
			if ( maxNumStation < numStationList ) {
				stationArray = stationArray.slice (0, maxNumStation);
				numStationList = maxNumStation;
			}
		}
	}
	else {
		tune (currentStation, 0);
		writeIntoCookie ();
	}

	bForcedExitFlag = false;
	if ( isPSPRadio ) psp.sysRadioBusyIndicator (0);
	// アニメーションを開始
	timerID_for_clipAnimProc = setTimeout (clipAnimProc, 0);
	streamTitle = "";
	bBusy = false;
	bNowHttpGetIsBusy = false;
}

/*----*/
function tune ( stationNumber, mode ) {
	var result;
	if ( numStationList == 0 ) return;
	if ( numStationList <= stationNumber ) return;
	if ( stationArray [stationNumber].id.length == 0 ) mode = 1;
	if ( isPSPRadio ) {
		psp.sysRadioBusyIndicator (1);
		if ( mode == 0 ) { // PLS の URL 指定で再生
			var stationID = stationArray [stationNumber].id;
			var plsURL = shoutcastPlsUrl_A + stationID + shoutcastPlsUrl_B;
			psp.sysRadioPlayPls
				(plsURL, userAgentForGetPls, userAgentForPlayStream);
		}
		else { // ストリーム URL 指定で再生
			psp.sysRadioPlayStream
				(stationArray [stationNumber].streamUrl,
				 userAgentForPlayStream);
		}
		//psp.sysRadioSetSubVolume (255);
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
		if ( clipState ) psp.sysRadioSetSubVolume (255);
		else psp.sysRadioSetSubVolume (0);
		{
			var result = psp.sysRadioGetPlayerStatus ();
			switch ( result ) {
			case 0: // 処理中でない
				break;
			case -1: // エラー
				if ( ! bBusy ) psp.sysRadioBusyIndicator (0);
				bConnectError = true;
				if ( !strictlyOneStation && numStationList )
					currentStation
						= (currentStation + incDecDir + numStationList)
						% numStationList;
				tune (currentStation, 0);
				writeIntoCookie ();
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
			+ ((stationList [currentStation].aacp)?"/AAC+":"") + ": "
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
var bDoUpdateStreamUrl = false;
function writeIntoCookie () {
	bDoUpdateStreamUrl = true;
}

/*----*/
function updateStreamUrl () {
	if ( 0 < timerID_for_streamUrl ) {
		clearTimeout (timerID_for_streamUrl);
		timerID_for_streamUrl = 0;
	}
	if ( ! bDoUpdateStreamUrl || ! psp ) {
		timerID_for_streamUrl = setTimeout ('updateStreamUrl ()', 1000);
		return;
	}
	var streamUrl = psp.sysRadioGetStreamUrl ();
	if ( streamUrl.length == 0 ) {
		timerID_for_streamUrl = setTimeout ('updateStreamUrl ()', 1000);
		return;
	}
	var expirationDate = new Date ();
	expirationDate.setTime (expirationDate.getTime ()
							+ (365*1000*60*60*24));
	var exDay = expirationDate.toGMTString ();
	delete expirationDate;
	var cookieValue = "";
	cookieValue
		= cookieValue
		+ "streamUrl:"+ streamUrl + ";"
		+ "stationName:"
		+ stationArray [currentStation].stationName + ";"
		+ "comment:"
		+ stationArray [currentStation].comment + ";"
		+ "refPage:"
		+ stationArray [currentStation].refPage + ";"
		+ "br:"
		+ stationArray [currentStation].br + ";"
		+ "sr:"
		+ stationArray [currentStation].sr + ";"
		+ "aacp:" + stationArray [currentStation].aacp + ";";
	document.cookie
		= escape (modelName) + "=" + escape (cookieValue)
		+ ";path=" + location.pathname
		+ ";expires=" + exDay;
	bDoUpdateStreamUrl = false;
	timerID_for_streamUrl = setTimeout ('updateStreamUrl ()', 1000);
}

/*----*/
function getCookieValue ( keyword ) {
	// クッキーからの値の読み出し
	keyword += ":";
	var cookieValue;
	if ( document.cookie ) cookieValue = unescape (document.cookie) + ";";
	else return ( "" );
	start = cookieValue.indexOf (escape (modelName) + "=");
	if ( start < 0 ) return ( "" );
	cookieValue = cookieValue.substring (start, cookieValue.length - 1);
	var start, end;
	start = cookieValue.indexOf (keyword);
	if ( start != -1 ) {
		end = cookieValue.indexOf (";", start);
		return ( cookieValue.substring (start + keyword.length, end) );
	}
	else return ( "" );
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
