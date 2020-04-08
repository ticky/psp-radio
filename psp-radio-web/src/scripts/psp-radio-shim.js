// @flow

import PSP from 'psp-radio-api'

// $FlowFixMe: This is required to make SCEI's code try to load the Radio plugin
navigator.mimeTypes["application/x-psp-extplugin"] = { enabledPlugin: true };

// Shim to force all elements with `id`s to also have that name, if no `name` is set.
// 
// It looks like NetFront implements the "named items" API
// (Spec: https://html.spec.whatwg.org/multipage/dom.html#dom-document-namedItem-which,
// where an element with a `name` is a property of the `document` object with that name)
// but with `id` properties also counting where no `name` is set.
// Very mid-1990s of them!
document.addEventListener('DOMContentLoaded',
  () => Array.from(document.querySelectorAll('[id]:not([name])')).forEach(
    (element) => element.setAttribute('name', element.id)
  )
);

window.psp = new PSP('https://cors-anywhere.herokuapp.com');
