/* Four independent MindAR anchors. Camera processing stays in the browser. */
const scene = document.querySelector('a-scene');
const start = document.querySelector('#start'), stop = document.querySelector('#stop');
const panel = document.querySelector('#start-panel'), status = document.querySelector('#status');
const message = document.querySelector('#message'), controls = document.querySelector('#controls');
const frame = document.querySelector('#scan-frame'), selector = document.querySelector('#active-model');
const slider = document.querySelector('#scale');
const states = [...document.querySelectorAll('[data-model]')].map(anchor => ({
  id: anchor.dataset.model, name: anchor.dataset.name, anchor,
  model: anchor.querySelector('.model'), size: anchor.querySelector('.size'),
  turntable: anchor.querySelector('.turntable'), scale: 0.6, turn: 0, ready: false, error: false
}));
const visible = new Set();
let running = false, busy = false, wantsCamera = false;
const secure = window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
function active() { return states.find(s => s.id === selector.value) || states[0]; }
function updateReady() {
  if (!secure) {
    status.textContent = 'Für die Kamera ist HTTPS erforderlich';
    message.textContent = 'Öffne am Handy die HTTPS-Adresse. Am PC funktioniert auch localhost.';
    start.textContent = 'HTTPS-Adresse erforderlich'; return;
  }
  if (running || busy) return;
  const loaded = states.filter(s => s.ready).length;
  const settled = states.filter(s => s.ready || s.error).length;
  status.textContent = `${loaded} / ${states.length} Modelle geladen`;
  start.disabled = !scene.hasLoaded || settled < states.length || loaded === 0;
  start.textContent = start.disabled ? `Modelle laden (${loaded}/${states.length}) …` : 'Kamera starten';
  if (!start.disabled) status.textContent = 'Bereit · Vier verschiedene Scanbilder';
  const failed = states.filter(s => s.error).map(s => s.name);
  if (failed.length) message.textContent = `Nicht geladen: ${failed.join(', ')}. Andere Modelle können weiter verwendet werden. Zum erneuten Laden die Seite neu öffnen.`;
}
function normalize(state) {
  if (state.ready || state.error) return;
  const object = state.model.getObject3D('mesh');
  if (!object) return;
  const clone = object.clone(); clone.updateMatrixWorld(true);
  const box = new AFRAME.THREE.Box3().setFromObject(clone);
  const size = box.getSize(new AFRAME.THREE.Vector3());
  const center = box.getCenter(new AFRAME.THREE.Vector3());
  const base = Math.max(size.x, size.z);
  if (!Number.isFinite(base) || base <= 0) {state.error = true; updateReady(); return;}
  const factor = 1 / base;
  state.model.object3D.scale.setScalar(factor);
  state.model.object3D.position.set(-center.x * factor, -box.min.y * factor, -center.z * factor);
  state.size.object3D.scale.setScalar(state.scale);
  state.ready = true; updateReady();
}
function refreshTracking() {
  if (!running) return;
  frame.hidden = visible.size > 0;
  status.textContent = visible.size ? `${visible.size} / ${states.length} sichtbar · ${states.filter(s => visible.has(s.id)).map(s => s.name).join(', ')}` : 'Scanbilder suchen · Ganzes Bild erfassen';
  [...selector.options].forEach(o => {const s = states.find(s => s.id === o.value); o.textContent = `${s.name}${visible.has(s.id) ? ' · sichtbar' : ''}`;});
}
function releaseCamera() {
  const system = scene.systems?.['mindar-image-system'];
  if (system?.controller && system.video?.srcObject) {
    try { system.stop(); } catch (error) { console.warn('AR-Aufräumen:', error); }
  }
  document.querySelectorAll('video').forEach(video => {video.srcObject?.getTracks().forEach(track => track.stop());video.remove();});
  visible.clear(); states.forEach(s => {s.anchor.object3D.visible = false;});
}
function fail(error) {
  running = false; busy = false; wantsCamera = false; releaseCamera();
  panel.hidden = false; stop.hidden = true; controls.hidden = true; frame.hidden = true;
  status.textContent = 'AR konnte nicht gestartet werden';
  message.textContent = error?.name === 'NotAllowedError' ? 'Erlaube die Kamera in den Browser-Einstellungen und versuche es erneut.' : 'Prüfe die Kameraberechtigung und öffne die Seite direkt in Safari oder Chrome. Lade bei Bedarf die Seite neu.';
  start.disabled = !states.some(s => s.ready) || !secure; start.textContent = 'Erneut versuchen';
}
function stopCamera() {
  running = false; busy = false; wantsCamera = false; releaseCamera();
  panel.hidden = false; stop.hidden = true; controls.hidden = true; frame.hidden = true;
  status.textContent = 'Kamera gestoppt';
  start.disabled = !states.some(s => s.ready) || !secure; start.textContent = 'Kamera erneut starten';
}
states.forEach(state => {
  const option = document.createElement('option');option.value = state.id;option.textContent = state.name;selector.append(option);
  state.model.addEventListener('model-loaded', () => normalize(state));
  state.model.addEventListener('model-error', () => {state.error = true;updateReady();});
  state.anchor.addEventListener('targetFound', () => {
    if (!running || !state.ready) return;
    visible.add(state.id);
    if (!visible.has(selector.value)) {selector.value = state.id; slider.value = state.scale;}
    refreshTracking();
  });
  state.anchor.addEventListener('targetLost', () => {visible.delete(state.id); refreshTracking();});
  normalize(state);
});
start.addEventListener('click', async () => {
  if (busy || running || !states.some(s => s.ready)) return;
  busy = true; wantsCamera = true; start.disabled = true; start.textContent = 'Kamera wird gestartet …';
  message.textContent = 'Erlaube jetzt den Kamerazugriff im Browser.';
  try { await scene.systems['mindar-image-system'].start(); } catch (error) { fail(error); }
});
scene.addEventListener('arReady', () => {
  if (!wantsCamera || document.hidden) {setTimeout(stopCamera, 0); return;}
  busy = false; running = true; panel.hidden = true; stop.hidden = false; controls.hidden = false; refreshTracking();
});
scene.addEventListener('arError', event => fail(event.detail));
scene.addEventListener('loaded', () => {states.forEach(normalize);updateReady();});
selector.addEventListener('change', () => {slider.value = active().scale;});
slider.addEventListener('input', e => {const s=active();s.scale=Number(e.target.value);s.size.object3D.scale.setScalar(s.scale);});
document.querySelector('#rotate').addEventListener('click', () => {const s=active();s.turn=(s.turn+45)%360;s.turntable.setAttribute('rotation',`0 ${s.turn} 0`);});
document.querySelector('#reset').addEventListener('click', () => {const s=active();s.turn=0;s.scale=0.6;s.turntable.setAttribute('rotation','0 0 0');s.size.object3D.scale.setScalar(s.scale);slider.value=s.scale;});
stop.addEventListener('click', stopCamera);
window.addEventListener('pagehide', stopCamera);
document.addEventListener('visibilitychange', () => {if (document.hidden && (running || busy)) stopCamera();});
updateReady();
