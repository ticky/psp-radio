// @flow

type PSPBoolean = 0 | 1;
type PSPEncodingType = 0 /*Latin*/ | 1 /*SJIS*/ | 2 /*EUC-KR*/;

/** Class representing the PSP Internet radio player API */
class PSP {
  //## Methods for starting and stopping playback

  /**
   * Start playback by specifying URL of audio data stream
   */
  sysRadioPlayStream(url: string, userAgent: string): (0 | -1) {
  }

  /**
   * Start playback by specifying URL of PLS file
   */
  sysRadioPlayPls(plsURL: string, userAgentForGetPls: string, userAgentForPlayStream: string) {
    // TODO: Forward to `sysRadioPlayM3u` for max compatibility
  }

  /**
   * Start playback by specifying URL of M3U file
   */
  sysRadioPlayM3u(m3uURL: string, userAgentForGetM3u: string, userAgentForPlayStream: string) {
  }

  /**
   * Stop playback
   */
  sysRadioStop() {
  }
  
  // ## Methods for controlling output volume
  
  /**
   * Set master volume level
   */
  sysRadioSetMasterVolume(value: number) {
    void(0)
  }

  /**
   * Set sub volume level
   */
  sysRadioSetSubVolume(value: number) {
    void(0)
  }
  
  // ## TODO

  // Sets whether the backlight should be kept on
  sysRadioBackLightAlwaysOn(value: PSPBoolean) {
    void(0)
  }

  // Sets whether debug mode is active
  sysRadioSetDebugMode(value: PSPBoolean) {
    void(0)
  }
  
  // Gets the current status of the radio player
  sysRadioGetPlayerStatus() {
  }

  // Gets the title and artist innfo from the current stream
  sysRadioGetContentMetaInfo(contentMetaInfoEncodeType: PSPEncodingType) {
  }

  // Gets the station name from the current stream
  sysRadioGetStreamTitle(contentMetaInfoEncodeType: PSPEncodingType) {
  }

  // Gets the current stream's bit rate in kbps
  sysRadioGetBitRate() {
  }

  // Gets the current stream's sample rate in kHz
  sysRadioGetSamplingRate() {
  }
  
  // Returns the current stream URL
  sysRadioGetStreamUrl() {
  }
  
  // ???
  sysRadioSetAudioShiftWidth(value: number) {
  }
  
  // Check whether AAC+ streaming is supported
  sysRadioCapabilityCheck() {
    return new Audio().canPlayType("audio/aacp") !== '';
  }

  // Play a radio effect sound
  sysRadioPlayEffectSound() {
  }
  
  // Returns the current Y value of the analog stick
  sysRadioGetAnalogStickYValue() {
    return 0;
  }
  
  // Performs a GET request
  sysRadioPrepareForHttpGet(url: string, userAgentForHttpGet: string, size: number, unknown: number) {
  }
  
  // Gets the status (_not_ HTTP status!) of the last HTTP request
  sysRadioGetHttpGetStatus() {
  }
  
  // Returns the result (body?) of the last HTTP request
  sysRadioGetHttpGetResult() {
  }
  
  // Ends the current HTTP request
  sysRadioHttpGetTerminate() {
  }
  
  // Set the state of the busy indicator in the bottom-right
  sysRadioBusyIndicator(value: PSPBoolean) {
  }
  
  // Sets the string for a string operation
  sysRadioPrepareForStrOperation(string: string) {
  }
  
  // Gets the length of the string in the current string operation
  sysRadioStrLength() {
  }
  
  // Gets the index of keyword_name in the current string operation
  sysRadioStrIndexOf(needle: string, currentPos: number) {
  }
  
  // Returns a substring from the current string operation
  sysRadioStrSlice(startPos: number, endPos: number) {
  }
  
  // Ends the current string operation
  sysRadioStrOperationTerminate() {
  }
}

var psp = new PSP();
