/* Four independent MindAR anchors. Camera processing stays in the browser. */
const scene = document.querySelector('a-scene');
const start = document.querySelector('#start'), stop = document.querySelector('#stop');
const panel = document.querySelector('#start-panel'), status = document.querySelector('#status');
const message = document.querySelector('#message'), controls = document.querySelector('#controls');
const frame = document.querySelector('#scan-frame'), selector = document.querySelector('#active-model');
const slider = document.querySelector('#scale');
const surface = document.querySelector('#gesture-surface');
const zoomValue = document.querySelector('#zoom-value');
const MIN_SCALE = 0.15, MAX_SCALE = 3, DEFAULT_SCALE = 0.6;
const states = [...document.querySelectorAll('[data-model]')].map(anchor => ({
  id: anchor.dataset.model, name: anchor.dataset.name, anchor,
  model: anchor.querySelector('.model'), size: anchor.querySelector('.size'),
  turntable: anchor.querySelector('.turntable'), scale: DEFAULT_SCALE,
  orientation: new AFRAME.THREE.Quaternion(), height: 0, ready: false, error: false
}));
const visible = new Set();
const pointers = new Map();
let gestureState = null;
let previousDistance = 0, previousAngle = 0;
let running = false, busy = false, wantsCamera = false;
const secure = window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
function active() { return states.find(s => s.id === selector.value) || states[0]; }
function syncControls() {
  slider.value = active().scale;
  zoomValue.value = `${Math.round(active().scale / DEFAULT_SCALE * 100)} %`;
}
function selectModel(state) { selector.value = state.id; syncControls(); }
function setScale(state, value) {
  state.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
  state.size.object3D.scale.setScalar(state.scale);
  // Rotate around the model centre; keep its upright foot on the card after zoom.
  state.turntable.object3D.position.y = state.height * state.scale / 2;
  if (state === active()) syncControls();
}
function clearGesture() {
  const ids = [...pointers.keys()];
  pointers.clear(); gestureState = null; previousDistance = 0;
  for (const id of ids) if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id);
}
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
  state.model.object3D.position.set(-center.x * factor, -center.y * factor, -center.z * factor);
  state.height = size.y * factor;
  setScale(state, state.scale);
  state.ready = true; updateReady();
}
function refreshTracking() {
  if (!running) return;
  frame.hidden = visible.size > 0;
  status.textContent = visible.size ? `${visible.size} / ${states.length} sichtbar · ${states.filter(s => visible.has(s.id)).map(s => s.name).join(', ')}` : 'Scanbilder suchen · Ganzes Bild erfassen';
  [...selector.options].forEach(o => {const s = states.find(s => s.id === o.value); o.textContent = `${s.name}${visible.has(s.id) ? ' · sichtbar' : ''}`;});
}
function releaseCamera() {
  clearGesture(); surface.hidden = true;
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
    if (!gestureState && !visible.has(selector.value)) selectModel(state);
    refreshTracking();
  });
  state.anchor.addEventListener('targetLost', () => {
    visible.delete(state.id);
    if (gestureState === state) clearGesture();
    refreshTracking();
  });
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
  busy = false; running = true; panel.hidden = true; stop.hidden = false; controls.hidden = false; surface.hidden = false; refreshTracking();
});
scene.addEventListener('arError', event => fail(event.detail));
scene.addEventListener('loaded', () => {states.forEach(normalize);updateReady();});
selector.addEventListener('change', () => {clearGesture();syncControls();});
slider.addEventListener('input', e => {clearGesture();setScale(active(),Number(e.target.value));});
document.querySelector('#rotate').addEventListener('click', () => {
  clearGesture();const s=active();
  s.orientation.multiply(new AFRAME.THREE.Quaternion().setFromAxisAngle(new AFRAME.THREE.Vector3(0,1,0),Math.PI/4)).normalize();
  s.turntable.object3D.quaternion.copy(s.orientation);
});
document.querySelector('#reset').addEventListener('click', () => {
  clearGesture();const s=active();s.orientation.identity();s.turntable.object3D.quaternion.identity();setScale(s,DEFAULT_SCALE);
});

// Pointer Events support mouse, pen and touch, including real two-finger gestures.
const raycaster = new AFRAME.THREE.Raycaster();
const cameraQuaternion = new AFRAME.THREE.Quaternion();
const parentQuaternion = new AFRAME.THREE.Quaternion();
const deltaQuaternion = new AFRAME.THREE.Quaternion();
const rotationAxis = new AFRAME.THREE.Vector3();
function pickModel(x,y) {
  const rect = scene.renderer.domElement.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  scene.object3D.updateMatrixWorld(true);
  raycaster.setFromCamera(new AFRAME.THREE.Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),scene.camera);
  let closest = Infinity, picked = null;
  for (const state of states) {
    if (!state.ready || !visible.has(state.id) || !state.anchor.object3D.visible) continue;
    const hit = raycaster.intersectObject(state.model.object3D,true)[0];
    if (hit && hit.distance < closest) {closest=hit.distance;picked=state;}
  }
  return picked;
}
function rotateInView(state,x,y,z,angle) {
  if (!angle) return;
  scene.camera.getWorldQuaternion(cameraQuaternion);
  state.turntable.object3D.parent.getWorldQuaternion(parentQuaternion);
  rotationAxis.set(x,y,z).normalize().applyQuaternion(cameraQuaternion).applyQuaternion(parentQuaternion.invert()).normalize();
  deltaQuaternion.setFromAxisAngle(rotationAxis,angle);
  state.orientation.premultiply(deltaQuaternion).normalize();
  state.turntable.object3D.quaternion.copy(state.orientation);
}
function rebasePointers() {
  if (pointers.size !== 2) {previousDistance=0;return;}
  const [a,b] = [...pointers.values()];
  previousDistance=Math.hypot(b.x-a.x,b.y-a.y);
  previousAngle=Math.atan2(b.y-a.y,b.x-a.x);
}
surface.addEventListener('pointerdown', event => {
  if (!running || (event.pointerType === 'mouse' && event.button !== 0)) return;
  if (!pointers.size) {
    const picked=pickModel(event.clientX,event.clientY);
    const selected=visible.has(active().id) ? active() : states.find(s=>visible.has(s.id));
    gestureState=picked || selected;
    if (!gestureState) return;
    selectModel(gestureState);
  }
  event.preventDefault();
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  surface.setPointerCapture(event.pointerId);
  rebasePointers();
});
surface.addEventListener('pointermove', event => {
  if (!pointers.has(event.pointerId) || !gestureState) return;
  event.preventDefault();
  if (!running || !visible.has(gestureState.id)) {clearGesture();return;}
  const before=pointers.get(event.pointerId);
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if (pointers.size===1) {
    const dx=event.clientX-before.x,dy=event.clientY-before.y;
    rotateInView(gestureState,dy,dx,0,Math.hypot(dx,dy)*0.008);
  } else if (pointers.size===2) {
    const [a,b]=[...pointers.values()];
    const distance=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);
    if (previousDistance>12 && distance>12) {
      setScale(gestureState,gestureState.scale*distance/previousDistance);
      const twist=Math.atan2(Math.sin(angle-previousAngle),Math.cos(angle-previousAngle));
      rotateInView(gestureState,0,0,1,-twist);
    }
    previousDistance=distance;previousAngle=angle;
  }
});
surface.addEventListener('pointerup', event => {
  if (!pointers.has(event.pointerId)) return;
  pointers.delete(event.pointerId);
  if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
  if (!pointers.size) {gestureState=null;previousDistance=0;}
  else rebasePointers();
});
surface.addEventListener('pointercancel', clearGesture);
surface.addEventListener('lostpointercapture', event => {if(pointers.has(event.pointerId))clearGesture();});
surface.addEventListener('wheel', event => {
  if (!running || !visible.has(active().id)) return;
  event.preventDefault();clearGesture();setScale(active(),active().scale*Math.exp(-event.deltaY*0.001));
},{passive:false});
stop.addEventListener('click', stopCamera);
window.addEventListener('pagehide', stopCamera);
document.addEventListener('visibilitychange', () => {if (document.hidden && (running || busy)) stopCamera();});
syncControls();updateReady();
