if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise(async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()})),r.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},r=(r,i)=>{Promise.all(r.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(r)};self.define=(r,s,o)=>{i[r]||(i[r]=Promise.resolve().then(()=>{let i={};const t={uri:location.origin+r.slice(1)};return Promise.all(s.map(r=>{switch(r){case"exports":return i;case"module":return t;default:return e(r)}})).then(e=>{const r=o(...e);return i.default||(i.default=r),i})}))}}define("./service-worker.js",["./workbox-69b5a3b7"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"../index.html",revision:"140397dec7cd5d2cbfd760b7c0e0c9b4"},{url:"../mobile.html",revision:"07d9f152cee69319b66ec49dc2bfbdbe"},{url:"desktop.min.css",revision:"884cd6ebe221c2ee756db36d5b14a031"},{url:"desktop.min.js",revision:"2d3b574a166858fa0da697170e1ff55a"},{url:"desktop.min.js.LICENSE.txt",revision:"a8f9337c6efcd5e7b3299d594aa816fb"},{url:"mobile.min.css",revision:"a350e51c7803672e28a28115072b67bf"},{url:"mobile.min.js",revision:"090540f35e6207d739c1b2f2a785a072"},{url:"mobile.min.js.LICENSE.txt",revision:"a8f9337c6efcd5e7b3299d594aa816fb"}],{})}));
