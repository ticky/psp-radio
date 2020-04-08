# PSP Radio Emulator

A from-scratch implementation of the PSP Internet Radio player API, allowing the players to be used in a modern web browser.

## What?!

The PSP, in [firmware update 3.80](https://blog.us.playstation.com/2007/12/17/attention-music-lovers-psp-firmware-v380-is-live/), added support for Internet Radio players.

Sony provided a handful of players of their on, some of them mundane, and some of them quite novel. They generally tune to internet radio streams from Shoutcast or Icecast's registries.

The players actually run within the PSP's NetFront internet browser, but in a special mode where they're allowed to embed an `application/x-psp-extplugin` object, which then provides DOM methods for interacting with a non-JavaScript radio player implementation.

This project constitutes a reimplementation of the `application/x-psp-extplugin`'s API in JavaScript, along with a wrapper for running and interacting with the radio players themselves. the ultimate shape of the wrapper is still to be determined, but whilst it is possible to run within a web browser, it imposes several limitations the original did not have.

## How?

The radio players, at this stage, must be patched to embed the project's shim code. This is less of a problem now that [Sony's original catalogue is down](http://web.archive.org/web/20140704222439id_/http://www.playstation.com/psp-app/radio/index.html) (Internet Archive link for your convenience)!

From there, we attach ourselves to the document in a few ways;

1. Pretending the browser has the `application/x-psp-extplugin` plugin available
2. Searching the document for any elements with an `id`, but no `name`, and copying the `id` value to the `name` so they become named properties of the `document` object
3. Setting a global `psp` variable, which tricks some of the PSP's players into not actually embedding their `application/x-psp-extplugin` plugins, but just using that reference

Then, within the `psp` object, we keep a bunch of state and audio objects, so that we can respond to the players' requests to open streams and fetch data over HTTP. We also proxt HTTP requests via a cors proxy, as the Shoutcast and Icecast lookup APIs would otherwise be inaccesible to the web browser.

Finally, because web browsers' audio players do not expose any script-side access to the `icy` or other metadata from a Shoutcast stream, there is a method for polling a poorly-documented, and unfortunately poorly-supported metadata endpoint supported by some Shoutcast and Icecast servers.

## What works? What's missing?

- [x] Loading Sony's players
  - [x] SCE HTTP request API, rebuilt atop `fetch`
  - [x] SCE String manipulation API, made no-op as UTF-8 conversion is not necessary
  - [x] Streaming a radio station
  - [x] Reading radio station metadata (Flaky)
  - [x] Starting audio playback in Safari (with "allow all auto-play" set for the domain)
  - [ ] Starting audio playback in Firefox/Edge/Chrome (don't support the pls format, do seem to support MPEG streams, maybe conversion is possible?)
- [ ] Full audio pipeline
  - [ ] Audio effects
  - [ ] Noise, sound effect and wave generator functions
    - [ ] Morse code generator in sine wave oscillator (I am not joking!)
  - [ ] Gain controls
  - [ ] Audio peak meter functions
- [ ] Finalised UI
  - [ ] Determining if the audio pipeline is feasible on the web
