// @flow

type PSPBoolean = 0 | 1;
type PSPEncodingType = 0 /*Latin*/ | 1 /*SJIS*/ | 2 /*EUC-KR*/;

class PSP {
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

  // Starts playing the specified stream
  sysRadioPlayStream(url: string, userAgent: string) {
  }

  // Starts playing the specified PLS stream
  sysRadioPlayPls(plsURL: string, userAgentForGetPls: string, userAgentForPlayStream: string) {
  }
  
  // Returns the current stream URL
  sysRadioGetStreamUrl() {
  }

  // Stops playing the current stream
  sysRadioStop() {
  }
  
  // ???
  sysRadioSetAudioShiftWidth(value: number) {
  }

  // Set some volume level
  sysRadioSetSubVolume(value: number) {
    void(0)
  }
  
  // Set the master volume
  sysRadioSetMasterVolume(value: number) {
    void(0)
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
