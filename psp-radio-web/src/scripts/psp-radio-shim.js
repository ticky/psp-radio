// @flow

import PSP from 'psp-radio-api'

// $FlowFixMe: This is required
navigator.mimeTypes["application/x-psp-extplugin"] = { enabledPlugin: true };

window.psp = new PSP('https://cors-anywhere.herokuapp.com');
