/* StudyFlow service worker: network-first (updates arrive instantly), cached copy when offline. */
const CACHE='sf-pwa-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);if(u.origin!==location.origin)return;
 const key=new Request(u.origin+u.pathname);
 const isIcon=u.pathname.includes('/icons/');
 if(isIcon){e.respondWith(caches.match(key).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(key,cp));return res})));return}
 e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(key,cp))}return res}).catch(()=>caches.match(key).then(m=>m||(r.mode==='navigate'?caches.match(new Request(u.origin+u.pathname.replace(/[^/]*$/,'')+'index.html')):undefined)).then(m=>m||Response.error())));
});
