if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise(async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()})),r.then(()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]})},r=(r,i)=>{Promise.all(r.map(e)).then(e=>i(1===e.length?e[0]:e))},i={require:Promise.resolve(r)};self.define=(r,s,o)=>{i[r]||(i[r]=Promise.resolve().then(()=>{let i={};const t={uri:location.origin+r.slice(1)};return Promise.all(s.map(r=>{switch(r){case"exports":return i;case"module":return t;default:return e(r)}})).then(e=>{const r=o(...e);return i.default||(i.default=r),i})}))}}define("./service-worker.js",["./workbox-69b5a3b7"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"../index.html",revision:"f654b02249a2221b29e6532bb4471bb8"},{url:"../mobile.html",revision:"b72f18a582fad56ab4327e4390e4b449"},{url:"desktop.min.css",revision:"d5ca02c3cd3b5dbd4eca07ac15cd9f7f"},{url:"desktop.min.js",revision:"d5de402f87779a10a4daa02ba2eb61c6"},{url:"desktop.min.js.LICENSE.txt",revision:"d475089901347f22c2732dce524ad7f2"},{url:"mobile.min.css",revision:"f66882b4ab58fca111abeacfb526822e"},{url:"mobile.min.js",revision:"ae44d3f6081e40246d05fe538266e57d"},{url:"mobile.min.js.LICENSE.txt",revision:"d475089901347f22c2732dce524ad7f2"}],{})}));
