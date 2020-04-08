// @flow

declare var Audio;

type PSPBoolean = 0 | 1;

/**
 * Character code conversion specification identifier
 * 
 * * `0`: No conversion processing
 * * `1`: Treated as SJIS (CP932) and converted to UTF-8.
 * * `2`: Treated as EUC-KR (CP949) and converted to UTF-8.
 */
type CharacterCodeConversionType = 0 | 1 | 2;

export class PromiseAdapter {
  state: 'pending' | 'rejected' | 'resolved';
  result: string;
  _promise: Promise<any>;

  constructor(callback: () => Promise<any>) {
    this.state = 'pending';

    try {
      this._promise = callback();
    } catch (_error) {
      this.state = 'rejected';
    }

    if (this._promise) {
      this._promise.then(
        this._done.bind(this),
        this._rejected.bind(this)
      );
    }
  }

  _done(response: Response) {
    if (response.ok && response.status >= 200 && response.status < 300) {
      response.text().then(
        (text) => {
          this.result = text;
          this.state = 'resolved';
        },
        this._rejected.bind(this)
      );
    } else {
      this._rejected();
    }
  }

  _rejected() {
    this.state = 'rejected';
  }
}

/**
 * Class representing the PSP Internet radio player API
 *
 * **Audio Sources:**
 * Media element source: https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode
 * Sine oscillator: https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
 * White noise: https://noisehack.com/generate-noise-web-audio-api/#demo
 *
 * **Gain, Effects & Analysis:**
 * Gain node: https://developer.mozilla.org/en-US/docs/Web/API/GainNode
 * Analysis node: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
 * Filter node: https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                                 PSP Radio Player Audio Pipeline                                                 │
 * │┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┬ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
 * │         Audio Sources                                 Gain, Effects & Analysis                        │      Audio Sinks       ││
 * ││                             │                                                                        │                         │
 * │      ┏━━━━━━━━━━━━━━━━┓          ┌────────────────────────┐   ┌──────────────────────────────────┐    │                        ││
 * ││     ┃ Audio stream A ┃────┐ │   │      Cross-fader       │   │             Effects:             │    │                         │
 * │      ┗━━━━━━━━━━━━━━━━┛    ├────▶│ (Automatically applied │─┐ │    sysRadioSetAudioShiftWidth    │    │                        ││
 * ││     ┏━━━━━━━━━━━━━━━━┓    │ │   │ when changing streams) │ └▶│   sysRadioSetAudioCutOffWidth    │──┐ │                         │
 * │      ┃ Audio stream B ┃────┘     └────────────────────────┘   │ sysRadioSetAudioPitchShiftWidth  │  │ │                        ││
 * ││     ┗━━━━━━━━━━━━━━━━┛      │                                └──────────────────────────────────┘  │ │                         │
 * │                                ┌────────────────────────────────────────────────────────────────────┘ │                        ││
 * ││                             │ │                             ┌───────────────────────────────────┐    │                         │
 * │                                │  ┌──────────────────────┐   │      Analysis: Audio levels       │    │                        ││
 * ││                             │ │  │        Gain:         │   │  sysRadioGetRightAudioPeakLevel   │    │                         │
 * │                                └─▶│ sysRadioSetSubVolume │──▶│ sysRadioGetRightAudioAverageLevel │──┐ │                        ││
 * ││                             │    └──────────────────────┘   │   sysRadioGetLeftAudioPeakLevel   │  │ │                         │
 * │                                                              │ sysRadioGetLeftAudioAverageLevel  │  │ │                        ││
 * ││                             │                               └───────────────────────────────────┘  │ │                         │
 * │        ┏━━━━━━━━━━━━┓             ┌─────────────────────────────────────────────────┐               │ │                        ││
 * ││       ┃ Sine wave  ┃        │    │                Gain & Frequency:                │               │ │                         │
 * │        ┃ oscillator ┃────────────▶│ sysRadioSetSineWaveOscillatorFrequencyAndVolume │─┐             │ │                        ││
 * ││       ┗━━━━━━━━━━━━┛        │    └─────────────────────────────────────────────────┘ │             │ │                         │
 * │       ┏━━━━━━━━━━━━━━┓            ┌───────────────────────────────────────┐           ├─────────────┘ │                        ││
 * ││      ┃ White noise  ┃       │    │                 Gain:                 │           │               │                         │
 * │       ┃  oscillator  ┃───────────▶│ sysRadioSetWhiteNoiseOscillatorVolume │───────────┤               │                        ││
 * ││      ┗━━━━━━━━━━━━━━┛       │    └───────────────────────────────────────┘           ▼               │                         │
 * │                                                                          ┌─────────────────────────┐  │                        ││
 * ││                             │                                           │          Gain:          │  │                         │
 * │                                                                          │ sysRadioSetMasterVolume │  │                        ││
 * ││ ┏━━━━━━━━━━━━━━━━━━━━━━━━━┓ │                                           └─────────────────────────┘  │  ┏━━━━━━━━━━━━━━━━━━┓   │
 * │  ┃      Sound effect       ┃                                                          │               │  ┃                  ┃  ││
 * ││ ┃ sysRadioPlayEffectSound ┃─┼────────────────────────────────────────────────────────┴───────────────┼─▶┃   Audio output   ┃   │
 * │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛                                                                          │  ┃                  ┃  ││
 * ││                             │                                                                        │  ┗━━━━━━━━━━━━━━━━━━┛   │
 * │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘│
 * └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
 * ````
 */
export default class PSP {
  _strOperationString: ?string;
  _masterPlayer: HTMLAudioElement;
  _subPlayer: HTMLAudioElement;
  _httpRequest: ?PromiseAdapter;
  _streamMetadataUpdatedAt: number;
  _streamMetadata: ?Element;
  _requestBaseURL: string;

  constructor(baseUrl: string) {
    this._requestBaseURL = baseUrl || '';
    this._masterPlayer = new Audio();
    this._subPlayer = new Audio();

    document.addEventListener('DOMContentLoaded', () => {
      document.body && document.body.appendChild(this._masterPlayer);
      document.body && document.body.appendChild(this._subPlayer);
    });
  }

  _maybeUpdateMetadata() {
    // TODO: (NOTE: This will work for Shoutcast, who knows about Icecast)
    // 1. Fetch the `url`, check content-type
    // 2. Detect playlist format, figure out the actual stream URL and number
    // 3. Store the URL for fetching the statistics URL (`/statistics` relative to stream URL (see http://forums.shoutcast.com/showthread.php?t=401315))
    // 4. Cache metadata from statistics XML
    // 5. Whenever statistics methods (see "Methods for getting playback quality numeric values and playback information strings") are called, use cached metadata and enqueue a metadata update

    // Don't update super often
    if (this._streamMetadataUpdatedAt >= Date.now() - 5000) {
      return;
    }

    this._streamMetadataUpdatedAt = Date.now();

    // If the player is pointed at a downloaded playlist file
    if (this._masterPlayer.src && this._masterPlayer.src.slice(0, 5) === 'data:') {
      // Pull the playlist data back out of the data URI
      const [ type, playlistBase64 ] = this._masterPlayer.src.slice(5).split(';base64,');
      const playlistLines = atob(playlistBase64).trim().split(/\r?\n/g).filter((line) => line.length > 0);

      let targetUrl = null;

      if (type === 'audio/x-scpls') {
        const file1Line = playlistLines.find((line) => /^file1=/i.test(line.trim()));
        if (file1Line) {
          targetUrl = file1Line.split('=').slice(1).join('');
        }
      } else if (type === 'audio/x-mpegurl') {
        targetUrl = playlistLines.find((line) => /^[^#]/i.test(line.trim()));
      }

      if (targetUrl) {
        let metaUrl = new URL(targetUrl);
        let originalPathname = metaUrl.pathname;
        metaUrl.pathname = '/statistics'

        fetch(`${this._requestBaseURL}/${metaUrl.toString()}`, { mode: 'cors' }).then(
          (response) => {
            if (response.ok && response.status >= 200 && response.status < 300) {
              response.text().then((text) => {
                let xml = (new window.DOMParser()).parseFromString(text, 'application/xml');

                this._streamMetadata = Array.from(xml.querySelectorAll('STREAM')).find((element) => element.querySelector('STREAMPATH').innerHTML === originalPathname) || null;
              });
            }
          }
        )
      }
    }
  }

  //## Methods for starting and stopping playback

  /**
   * Start playback by specifying URL of audio data stream
   * 
   * @param url - URL of playlist
   * @param userAgentName - User agent name used when performing HTTP GET for getting playlist information
   * 
   * @returns
   * * `0`: Normal
   * * `-1`: Error
   */
  sysRadioPlayStream(url: string, userAgentName: string): (0 | -1) {
    const headers = new Headers();
    headers.append("User-Agent", userAgentName);

    fetch(`${this._requestBaseURL}/${url}`, { headers, mode: 'cors' })
      .then(
        (response) => {
          if (response.ok && response.status >= 200 && response.status < 300) {
            return response.text().then(
              (text) => {
                const playlistLines = text.trim().split(/\r?\n/g).filter((line) => line.length > 0);

                // Playlist format detection
                if (playlistLines[0] === '[playlist]') {
                  this._masterPlayer.src = `data:audio/x-scpls;base64,${btoa(text)}`;
                } else if (playlistLines[0] === '#EXTM3U') {
                  this._masterPlayer.src = `data:audio/x-mpegurl;base64,${btoa(text)}`;
                } else {
                  this._masterPlayer.src = url;
                }

                return this._masterPlayer.play().then(
                  (played) => {
                    console.log("Playback started OK!", played);

                    // This triggers a refresh of the metadata cache
                    this.sysRadioGetContentMetaInfo(0);
                  },
                  (error) => {
                    console.error(`Failed to start playback: ${error.toString()}`);
                    debugger;
                  }
                );
              }
            );
          }

          return Promise.reject();
      })
      .catch(
        () => {
          this._masterPlayer.src = url;
          return this._masterPlayer.play().then(
            (played) => {
              console.log("Playback started OK!", played);

              // This triggers a refresh of the metadata cache
              this.sysRadioGetContentMetaInfo(0);
            },
            (error) => {
              console.error(`Failed to start fallback playback: ${error.toString()}`);
              debugger;
            }
          );
        }
      );

    return 0;
  }

  /**
   * Start playback by specifying URL of PLS file
   * 
   * @param url - URL of playlist
   * @param userAgentName0 - User agent name used when performing HTTP GET for getting playlist information
   * @param userAgentName1 - User agent name used when connecting to broadcast server
   * 
   * @returns
   * * `0`: Normal
   * * `-1`: Error
   */
  sysRadioPlayPls(url: string, userAgentName0: string, userAgentName1: string): (0 | -1) {
    return this.sysRadioPlayStream(url, userAgentName0);
  }

  /**
   * Start playback by specifying URL of M3U file
   * 
   * @param url - URL of playlist
   * @param userAgentName0 - User agent name used when performing HTTP GET for getting M3U file
   * @param userAgentName1 - User agent name used when connecting to broadcast server
   * 
   * @returns
   * * `0`: Normal
   * * `-1`: Error
   */
  sysRadioPlayM3u(url: string, userAgentName0: string, userAgentName1: string): (0 | -1) {
    return this.sysRadioPlayStream(url, userAgentName0);
  }

  /**
   * Stop playback
   * 
   * @param [mode] - Identifier of audio data stream to be stopped:
   * * `0`: Main audio data stream
   * * `1`: Sub audio data stream
   */
  sysRadioStop(mode?: 0 | 1): 0 {
    switch (mode) {
      case 1:
        this._subPlayer.pause();
        this._subPlayer.src = '';
        break;
    
      case 0:
      default:
        this._masterPlayer.pause();
        this._masterPlayer.src = '';
        break;
    }

    return 0;
  }
  
  // ## Methods for controlling output volume
  
  /**
   * Set master volume level
   * 
   * @param vol - Volume value (0 ≦ `vol` ≦ 255)
   */
  sysRadioSetMasterVolume(vol: number): 0 {
    return 0;
  }

  /**
   * Set sub volume level
   * 
   * @param vol - Volume value (0 ≦ `vol` ≦ 255)
   */
  sysRadioSetSubVolume(vol: number): 0 {
    return 0;
  }

  // ## Methods for getting audio output level

  /**
   * Get peak audio level being output from audio left channel.  
   * Used for displaying audio level meter, etc.
   * 
   * @param [mode] - Identifier for specifying the range of the return value (see below)
   * @returns
   * * **When mode is not specified or when 0 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 255 
   * * **When 1 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 32767
   * * **When 2 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 90
   */
  sysRadioGetLeftAudioPeakLevel(mode?: (0 | 1 | 2)): number {
    return 0;
  }

  /**
   * Get peak audio level being output from audio right channel.  
   * Used for displaying audio level meter, etc.
   * 
   * @param [mode] - Identifier for specifying the range of the return value (see below)
   * @returns
   * * **When mode is not specified or when 0 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 255 
   * * **When 1 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 32767
   * * **When 2 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 90
   */
  sysRadioGetRightAudioPeakLevel(mode?: (0 | 1 | 2)): number {
    return 0;
  }

  /**
   * Get average audio level being output from audio left channel.  
   * Used for displaying audio level meter, etc.
   * 
   * @param [mode] - Identifier for specifying the range of the return value (see below)
   * @returns
   * * **When mode is not specified or when 0 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 255 
   * * **When 1 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 32767
   * * **When 2 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 90
   */
  sysRadioGetLeftAudioAverageLevel(mode?: (0 | 1 | 2)): number {
    return 0;
  }

  /**
   * Get average audio level being output from audio right channel.  
   * Used for displaying audio level meter, etc.
   * 
   * @param [mode] - Identifier for specifying the range of the return value (see below)
   * @returns
   * * **When mode is not specified or when 0 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 255 
   * * **When 1 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 32767
   * * **When 2 is specified for mode**: Integer value in the range 0 ≦ `result` ≦ 90
   */
  sysRadioGetRightAudioAverageLevel(mode?: (0 | 1 | 2)): number {
    return 0;
  }

  // ## Methods for controlling sound effects

  /**
   * Set oscillation frequency and volume level of sine wave oscillator
   * 
   * @param freq - Oscillation frequency (0 ≦ `freq` ≦ 22500; units: Hz)
   * @param [vol] - Volume (0 ≦ `vol` ≦ 255)
   * @param [tension] - Rate of frequency change (0 ≦ `tension` ≦ 255)
   * @param [cwtext] - Morse code text
   * @param [keyingspeed] - Morse code keying speed (0 ≦ `keyingspeed` ≦ 32)
   */
  sysRadioSetSineWaveOscillatorFrequencyAndVolume(freq: number, vol?: number, tension?: number, cwtext?: string, keyingspeed?: number): 0 {
    return 0;
  }

  /**
   * Set volume level of pseudo white noise oscillator
   * 
   * @param vol - Volume (0 ≦ `vol` ≦ 255)
   * @param [lowF] - Lower limit of generated frequencies (0 ≦ `lowF` ≦ 255) 
   * @param [highF] - Upper limit of generated frequencies (0 ≦ `highF` ≦ 255, where `lowF` ≦ `highF`)
   * @param [tension] - Rate of frequency change (0 ≦ `tension` ≦ 255)
   */
  sysRadioSetWhiteNoiseOscillatorVolume(vol: number, lowF?: number, highF?: number, tension?: number): 0 {
    return 0;
  }

  /**
   * Set shift width of audio frequency component
   * 
   * @param val - Shift width (-256 ≦ `val` ≦ 256)  
   *              Note: The meaning of this numeric value is an internally defined independent entity. The units of this value are not Hz.
   */
  sysRadioSetAudioShiftWidth(val: number): 0 {
    return 0;
  }

  /**
   * Set cut-off width of audio frequency component
   * 
   * @param val - Cut-off width (-256 ≦ `val` ≦ 256)  
   *              Note: The meaning of this numeric value is an internally defined independent entity. The units of this value are not Hz.
   */
  sysRadioSetAudioCutOffWidth(val: number): 0 {
    return 0;
  }

  /**
   * Set pitch shift width of audio frequency component
   * 
   * @param val - Pitch shift width (-256 ≦ `val` ≦ 256)  
   *              Note: The meaning of this numeric value is an internally defined independent entity. The units of this value are not Hz.
   */
  sysRadioSetAudioPitchShiftWidth(val: number): 0 {
    return 0;
  }

  /**
   * Play sound effect
   * 
   * This extended method plays a clicking sound (like a shutter sound).
   */
  sysRadioPlayEffectSound(): 0 {
    return 0;
  }

  // ## Methods related to "HTTP GET" processing

  /**
   * Prepare to perform HTTP GET for specified URL
   * 
   * @param url - Target URL
   * @param userAgentName - User agent name
   * @param length - Maximum size
   * @param charCodeConvertOption - Character code conversion specification identifier
   * 
   * @returns
   * * `0`: Normal
   * * `-1`: Error
   */
  sysRadioPrepareForHttpGet(
    url: string,
    userAgentName: string = "Mozilla/4.0 (PSP (PlayStation Portable); 2.00)",
    length: number = 49152,
    charCodeConvertOption: CharacterCodeConversionType
  ): 0 | -1 {
    const headers = new Headers();
    headers.append("User-Agent", userAgentName);
    this._httpRequest = new PromiseAdapter(() => fetch(`${this._requestBaseURL}/${url}`, { headers, mode: 'cors' }));
    return 0;
  }

  /**
   * Report status of sysRadioPrepareForHttpGet processing
   * 
   * @returns
   * * `0`: HTTP GET processing is completed.
   * * `1`: HTTP GET processing is in progress.
   * * `-1`: HTTP GET processing failed.
   */
  sysRadioGetHttpGetStatus(): 0 | 1 | -1 {
    if (this._httpRequest) {
      return {
        'resolved': 0,
        'pending': 1,
        'rejected': -1
      }[this._httpRequest.state];
    }

    return -1;
  }

  /**
   * Return sysRadioPrepareForHttpGet processing result as string
   * 
   * @returns The HTTP GET processing result.
   */
  sysRadioGetHttpGetResult(): string {
    if (this._httpRequest) {
      return this._httpRequest.result;
    }

    return '';
  }

  /**
   * Perform sysRadioPrepareForHttpGet housekeeping
   */
  sysRadioHttpGetTerminate() {
    delete this._httpRequest;
  }

  // ## Method for getting internal status

  /**
   * Get internal status of player system
   * 
   * @returns
   * * `0`: No processing is being performed.
   * * `1`: Audio data stream is being played.
   * * `2`: PLS or M3U data is being obtained.
   * * `3`: PLS or M3U data is being parsed.
   * * `4`: Connecting to the broadcast server.
   * * `-1`: Some kind of error occurred.
   */
  sysRadioGetPlayerStatus(): 0 | 1 | 2 | 3 | 4 | -1 {
    if (!this._masterPlayer || this._masterPlayer.error !== null) {
      return -1;
    }

    if (this._masterPlayer.paused) {
      return 0;
    }

    // Roughly map the `readyState` to the PSP's playback states
    switch (this._masterPlayer.readyState) {
      case 1: // Enough of the media resource has been retrieved that the metadata attributes are initialized. Seeking will no longer raise an exception.
        return 2;

      case 2: // Data is available for the current playback position, but not enough to actually play more than one frame.
        return 4;

      case 3: // Data for the current playback position as well as for at least a little bit of time into the future is available (in other words, at least two frames of video, for example).
        return 3;

      case 4: // Enough data is available—and the download rate is high enough—that the media can be played through to the end without interruption.
        return 1;

      case 0: // No information is available about the media resource.
      default:
        return -1
    }
  }

  // ## Methods for getting playback quality numeric values and playback information strings

  /**
   * Get communication circuit band quality evaluation value
   * 
   * @returns An integer value in the range 0 ≦ `result` ≦ 255.
   */
  sysRadioGetNetworkBandQuality(): number {
    return 255;
  }

  /**
   * Get audio distortion rate (upper and lower limit saturation frequency of sound)
   * 
   * @returns An integer value in the range 0 ≦ `result` ≦ 255.
   */
  sysRadioGetAudioSoundDistortionRate(): number {
    return 0;
  }

  /**
   * Get content meta information related to audio data stream being played
   * 
   * @returns A content meta information string is returned.
   */
  sysRadioGetContentMetaInfo(charCodeConvertOption: CharacterCodeConversionType): string {
    this._maybeUpdateMetadata();

    if (this._streamMetadata) {
      const titleElement = this._streamMetadata.querySelector('SONGTITLE');

      if (titleElement) {
        return titleElement.innerHTML;
      }
    }

    return '';
  }

  /**
   * Get bit rate of audio data stream being played
   * 
   * @returns An integer value in the range 0 ≦ `result` ≦ 320,000.  
   *          If the Internet radio player is not connected, 0 is returned.
   */
  sysRadioGetBitRate(): number {
    this._maybeUpdateMetadata();

    if (this._streamMetadata) {
      const bitrateElement = this._streamMetadata.querySelector('BITRATE');

      if (bitrateElement) {
        return parseInt(bitrateElement.innerHTML) * 1000;
      }
    }

    return 0;
  }

  /**
   * Get sampling rate value of audio data stream being played
   * 
   * @returns An integer value in the range 0 ≦ `result` ≦ 48,000.  
   *          If the Internet radio player is not connected, 0 is returned.
   */
  sysRadioGetSamplingRate(): number {
    this._maybeUpdateMetadata();

    if (this._streamMetadata) {
      const samplerateElement = this._streamMetadata.querySelector('SAMPLERATE');

      if (samplerateElement) {
        return parseInt(samplerateElement.innerHTML);
      }
    }

    return 0;
  }

  // ## Methods for getting information related to audio data stream being played

  /**
   * Get URL of audio data stream being played
   * 
   * @returns The URL string of the broadcast server is returned.  
   *          If the Internet radio player is not connected, a string with length 0 is returned.
   */
  sysRadioGetStreamUrl(): string {
    return '';
  }

  /**
   * Get title information of audio data stream being played
   * 
   * @returns The stream title information string is returned.  
   *          If the Internet radio player is not connected, a string with length 0 is returned.
   */
  sysRadioGetStreamTitle(/*contentMetaInfoEncodeType: CharacterCodeConversionType*/): string {
    this._maybeUpdateMetadata();

    if (this._streamMetadata) {
      const serverTitleElement = this._streamMetadata.querySelector('SERVERTITLE');

      if (serverTitleElement) {
        return serverTitleElement.innerHTML;
      }
    }

    return '';
  }

  /**
   * Get related Web page URL string of audio data stream being played
   * 
   * @returns The related page's URL string is returned.  
   *          If the Internet radio player is not connected, a string with length 0 is returned.
   */
  sysRadioGetRelatedPageUrl(): string {
    this._maybeUpdateMetadata();

    if (this._streamMetadata) {
      const serverUrlElement = this._streamMetadata.querySelector('SERVERURL');

      if (serverUrlElement) {
        return serverUrlElement.innerHTML;
      }
    }

    return '';
  }

  /**
   * Get IP address of broadcast server of audio data stream being played
   * 
   * @returns The IP address string of the broadcast server from which the audio data stream is being received (to which the Internet radio player is connected) is returned.  
   *          If the Internet radio player is not connected, a string with length 0 is returned.
   */
  sysRadioGetStreamIpAddress(): string {
    return '';
  }

  /**
   * Get connection port number of broadcast server of audio data stream being played
   * 
   * @returns The port number (integer value) is returned.  
   *          If the Internet radio player is not connected, 0 is returned.
   */
  sysRadioGetStreamPort(): number {
    return 0;
  }

  /**
   * Get level indicating residual amount of audio data stream buffer being played
   * 
   * @returns An integer value in the range 0 ≦ `result` ≦ 255 is returned.
   */
  sysRadioGetStreamBufferLevel(): number {
    return 255;
  }

  // ## Methods for finding files on the Memory Stick Duo™

  /**
   * Prepare for directory entry scan on the Memory Stick Duo™
   * 
   * @param [path] - Pathname  
   *                 If this is omitted, the root directory "/" is assumed to be specified.
   * 
   * @returns
   * * `0`: Normal termination
   * * `-1`: Error (the directory specified in the argument does not exist, etc.)
   */
  sysRadioPrepareForScanDir(path: string = '/'): 0 | -1 {
    return -1;
  }

  /**
   * Scan directory and return file entry (filename) that was found first.  
   * For the second and subsequent calls, return the file entry (filename) that was found next.
   * 
   * @returns A file entry (filename) string.  
   *          If the length of the returned string is 0, it means that the scan finished or that an error occurred.
   */
  sysRadioScanDir(): string {
    return '';
  }

  /**
   * Detect whether a Memory Stick Duo™ was inserted or removed following previous {@link sysRadioPrepareForScanDir}
   * 
   * @returns
   * * `0`: Memory Stick Duo™ has not been inserted or removed.
   * * `1`: Memory Stick Duo™ was removed.
   * * `2`: Memory Stick Duo™ was reinserted.
   */
  sysRadioGetMediaInOutStatus(): 0 | 1 | 2 {
    return 0;
  }

  // ## String search processing methods

  /**
   * Prepare for string search or string extraction processing
   * 
   * @param str - String to be processed
   */
  sysRadioPrepareForStrOperation(str: string): 0 {
    this._strOperationString = str;
    return 0;
  }

  /**
   * Nearly equivalent to JavaScript standard method "length."  
   * Returns string length as value in terms of bytes.
   * 
   * @returns The string length (in bytes).
   */
  sysRadioStrLength(): number {
    return this._strOperationString
      ? this._strOperationString.length
      : 0;
  }

  /**
   * Nearly equivalent to JavaScript standard method "indexOf."  
   * Searches for string pattern.
   * 
   * @param pattern - Search keyword string
   * @param startPos - Search starting position (units: bytes)
   * 
   * @returns The detected position (units: bytes).
   */
  sysRadioStrIndexOf(pattern: string, startPos: number): number {
    // TODO: the SCEI implementation appears to have a bug
    //       where it returns the *second* index
    return this._strOperationString
      ? this._strOperationString.indexOf(pattern, startPos)
      : -1;
  }

  /**
   * Nearly equivalent to JavaScript standard method "slice."  
   * Extracts substring.
   * 
   * @param startPos - Extraction starting position (bytes)
   * @param endPos - Extraction ending position (bytes)
   * 
   * @returns The extracted string.
   */
  sysRadioStrSlice(startPos: number, endPos: number): string {
    return this._strOperationString
      ? this._strOperationString.slice(startPos, endPos)
      : '';
  }

  /**
   * Nearly equivalent to JavaScript standard method "charCodeAt."  
   * Returns character code of specific position in string.
   * 
   * @param pos - Character code acquisition position (in bytes)
   * 
   * @returns Character code.
   */
  sysRadioStrCharCodeAt(pos: number): number {
    return this._strOperationString
      ? this._strOperationString.charCodeAt(pos)
      : -1;
  }

  /**
   * Terminate string search processing.
   */
  sysRadioStrOperationTerminate(): 0 {
    delete this._strOperationString;
    return 0;
  }
  
  // ## String conversion processing methods

  /**
   * Convert characters that contain a character entity name to an actual character
   * 
   * @param str - String to be processed
   * 
   * @returns The converted string.
   */
  sysRadioCharacterEntityConvert(str: string): string {
    return require("entities").decodeHTML(str);
  }

  /**
   * Convert UTF-8 string to SJIS or EUC-KR string.
   * 
   * @param charCodeConvertOption - Identifier for specifying character code conversion
   * * `1`: Convert string specified by str to SJIS (CP932).
   * * `2`: Convert string specified by str to EUC-KR (CP949).
   * @param str - UTF-8 string to be converted
   * 
   * @returns Converted string. **Note** that this implementation simply returns the string unaltered, expecting modern web browser implementations to handle the UTF-8 string.
   */
  sysRadioCharacterCodeConvert(charCodeConvertOption: CharacterCodeConversionType, str: string): string {
    return str;
  }

  // ## Methods for getting analog pad values

  /**
   * Get analog stick's X value
   * 
   * @returns An integer value in the range -128 ≦ `result` ≦ 127.
   */
  sysRadioGetAnalogStickXValue(): number {
    return 0;
  }

  /**
   * Get analog stick's Y value
   * 
   * @returns An integer value in the range -128 ≦ `result` ≦ 127.
   */
  sysRadioGetAnalogStickYValue() {
    return 0;
  }

  /**
   * Get analog stick's angle value
   * 
   * @returns An integer value in the range -2048π ≦ `result` ≦ 2048π.
   */
  sysRadioGetAnalogStickAngleValue() {
    return 0;
  }

  /**
   * Get analog stick's radius value
   * 
   * @returns An integer value in the range 0 ≦ `result` ≦ √(128^2 + 128^2).  
   *          However, result=√(128^2 + 128^2) is not valid for the PSP™ system.
   */
  sysRadioGetAnalogStickRadiusValue(): number {
    return 0;
  }

  // ## Methods related to debug log console

  /**
   * Set debug mode
   * 
   * @param flag - Debug mode setting.
   * * `0`: Debug mode OFF.
   * * `1`: Debug mode ON.
   */
  sysRadioSetDebugMode(flag: 0 | 1): 0 {
    return 0;
  }

  /**
   * Display string on debug log console
   * 
   * @param str - String to be displayed
   */
  sysRadioDebugLog(str: string): 0 {
    console.debug(`[sysRadioDebugLog]: ${str}`);
    return 0;
  }

  /**
   * Set debug log console's text style (typeface, character color, background color, existence of shadow, character align attribute)
   * 
   * @param colorF0r - R value of character color 0
   * @param colorF0g - G value of character color 0
   * @param colorF0b - B value of character color 0
   * @param colorF0a - A value of character color 0
   * @param [colorF1r] - R value of character color 1
   * @param [colorF1g] - G value of character color 1
   * @param [colorF1b] - B value of character color 1
   * @param [colorF1a] - A value of character color 1
   * @param [colorBr] - R value of character background color 1
   * @param [colorBg] - G value of character background color 1
   * @param [colorBb] - B value of character background color 1
   * @param [colorBa] - A value of character background color 1  
   *                    The above are all integer values in the range 0 ≦ `color` ≦ 255.
   * @param [slyle] - Character style specification.
   * * `0`: Regular character.
   * * `1`: Bold character (however, only letters and numbers).
   * @param [align] - Alignment specification.
   * * `0`: Left justified
   * * `1`: Centered
   * * `2`: Right justified
   */
  sysRadioSetDebugLogTextStyle(
    colorF0r: number,
    colorF0g: number,
    colorF0b: number,
    colorF0a: number,
    colorF1r: number,
    colorF1g: number,
    colorF1b: number,
    colorF1a: number,
    colorBr: number,
    colorBg: number,
    colorBb:
    number,
    colorBa: number,
    slyle: 0 | 1,
    align: 0 | 1 | 2
  ): 0 {
    return 0;
  }

  /**
   * Clear strings displayed on debug log console
   */
  sysRadioClearDebugLog(): 0 {
    return 0;
  }

  // ## Miscellaneous

  /**
   * Get Internet radio player system core version information
   * 
   * @returns The PSP™ Internet radio player system core version information string is returned.
   */
  sysRadioGetPlayerCoreVersionInfo(): string {
    return 'PSP-2000:RadioPlayerCore_5.0.0';
  }

  /**
   * Get support information related to a specific function
   * 
   * @param id - Inquiry item ID
   * * `0`: Can AAC+ stream be played?
   * * `1`: Can the {@link sysRadioSleep} method be used?
   * * `2`: Can the {@link sysRadioGetLeftAudioAverageLevel} and {@link sysRadioGetRightAudioAverageLevel} methods be used?
   * * `3`: Can the {@link sysRadioStrCharCodeAt} method be used?
   * * `4`: Can the {@link sysRadioCharacterCodeConvert} method be used?
   * * `5`: Can the {@link sysRadioGetSystemStatus} method be used?
   */
  sysRadioCapabilityCheck(id: number): PSPBoolean {
    console.debug(`sysRadioCapabilityCheck: radio player capability ${id} requested`);
    switch (id) {
      case 0:
        return (
          new Audio().canPlayType("audio/aacp") !== ''
          ? 1
          : 0
        );

      default:
        return 0;
    }
  }

  /**
   * Get PSP™ system's START button toggle status
   * 
   * On a real PSP™ system, pressing the START button toggles this value.
   * It is `1` by default, and when you press the START button it is toggled between that and `0`.
   * Some radio players use this to toggle their mute function.
   * 
   * @returns
   * * `1`: Returned when the START button has not been toggled.
   * * `0`: Returned when the START button has been toggled.
   */
  sysRadioGetStartButtonToggleStatus(): PSPBoolean {
    console.debug(`sysRadioGetStartButtonToggleStatus: START button toggle state requested`);
    return 1;
  }

  /**
   * Control backlight's always on state when powered by external power supply
   * 
   * @param flag - When 1 is specified, the Internet radio player is in a state in which the backlight is always on, and when 0 is specified, this state is canceled.
   */
  sysRadioBackLightAlwaysOn(flag: PSPBoolean): 0 {
    if (flag == 1) {
      console.debug(`sysRadioBackLightAlwaysOn: backlight lock requested`);
    } else if (flag == 0) {
      console.debug(`sysRadioBackLightAlwaysOn: backlight lock cleared`);
    } else {
      console.debug(`sysRadioBackLightAlwaysOn: invalid state specified: ${flag}`);
    }

    return 0;
  }

  /**
   * Control busy indicator display at bottom left of screen
   * 
   * @param flag - If 1 is specified, the busy indicator appears, and if 0 is specified, it is hidden.
   */
  sysRadioBusyIndicator(flag: PSPBoolean): 0 {
    if (flag == 1) {
      console.debug(`sysRadioBusyIndicator: busy indicator requested`);
    } else if (flag == 0) {
      console.debug(`sysRadioBusyIndicator: busy indicator cleared`);
    } else {
      console.debug(`sysRadioBusyIndicator: invalid state specified: ${flag}`);
    }

    return 0;
  }

  /**
   * Capture screenshot
   * 
   * @returns
   * * `0`: Processing was successful
   * * `-1`: Error
   */
  sysRadioCaptureScreenShot(): 0 | -1 {
    console.debug(`sysRadioCaptureScreenShot: screenshot requested`);
    return -1;
  }

  /**
   * Set PSP™ system sleep mode
   */
  sysRadioSleep(): 0 {
    console.debug(`sysRadioSleep: sleep mode requested`);
    return 0;
  }

  /**
   * Inquire about internal status of PSP™ system.
   * 
   * @param id - Inquiry item ID
   * * `0`: Was sleep mode canceled after sleep mode was entered?
   */
  sysRadioGetSystemStatus(id: number): PSPBoolean {
    switch (id) {
      case 0:
        console.debug(`sysRadioGetSystemStatus(1): previous sleep mode state queried`);
        return 1;

      default:
        console.debug(`sysRadioGetSystemStatus(${id}): unknown system status queried`);
        return 0;
    }
  }
}
