/* MindAR 1.2.5 / A-Frame 1.6.0. All camera processing stays in the browser. */
const scene = document.querySelector('a-scene');
const model = document.querySelector('#brunnen');
const target = document.querySelector('#target');
const start = document.querySelector('#start');
const stop = document.querySelector('#stop');
const panel = document.querySelector('#start-panel');
const status = document.querySelector('#status');
const message = document.querySelector('#message');
const controls = document.querySelector('#controls');
const frame = document.querySelector('#scan-frame');
let modelReady = false, running = false, busy = false, wantsCamera = false, turn = 0;
const secure = window.isSecureContext && !!navigator.mediaDevices?.getUserMedia;
function ready() {
  if (!secure) {
    status.textContent = 'Für die Kamera ist HTTPS erforderlich';
    message.textContent = 'Öffne am Handy die HTTPS-Adresse. Eine normale HTTP-Adresse im WLAN erlaubt keinen Kamerazugriff. Am PC funktioniert auch localhost.';
    start.textContent = 'HTTPS-Adresse erforderlich';
    return;
  }
  if (modelReady && scene.hasLoaded) { start.disabled = false; start.textContent = 'Kamera starten'; status.textContent = 'Bereit zum Scannen'; }
}
function normalize() {
  if (modelReady) return;
  const object = model.getObject3D('mesh');
  if (!object) return;
  // Detached clone gives bounds in model space, independent of target rotation.
  const clone = object.clone();
  clone.updateMatrixWorld(true);
  const box = new AFRAME.THREE.Box3().setFromObject(clone);
  const size = box.getSize(new AFRAME.THREE.Vector3());
  const center = box.getCenter(new AFRAME.THREE.Vector3());
  const base = Math.max(size.x, size.z);
  if (!Number.isFinite(base) || base <= 0) return fail(new Error('Das Modell hat keine gültige Größe.'));
  const factor = 1 / base;
  model.object3D.scale.setScalar(factor);
  model.object3D.position.set(-center.x * factor, -box.min.y * factor, -center.z * factor);
  modelReady = true;
  reset(); ready();
}
function reset() {
  turn = 0;
  document.querySelector('#turntable').setAttribute('rotation', '0 0 0');
  document.querySelector('#scale').value = '0.85';
  document.querySelector('#size').object3D.scale.setScalar(0.85);
}
function releaseCamera() {
  const system = scene.systems?.['mindar-image-system'];
  // MindAR's stop() assumes camera + controller exist; permission denial has neither.
  if (system?.controller && system.video?.srcObject) {
    try { system.stop(); } catch (error) { console.warn('AR-Aufräumen:', error); }
  }
  document.querySelectorAll('video').forEach(video => {
    video.srcObject?.getTracks().forEach(track => track.stop());
    video.remove();
  });
  target.object3D.visible = false;
}
function fail(error) {
  running = false; busy = false; wantsCamera = false;
  releaseCamera();
  panel.hidden = false; stop.hidden = true; controls.hidden = true; frame.hidden = true;
  status.textContent = 'AR konnte nicht gestartet werden';
  const name = error?.name || error?.cause?.name;
  message.textContent = name === 'NotAllowedError' ? 'Der Kamerazugriff wurde abgelehnt. Erlaube die Kamera in den Browser-Einstellungen und versuche es erneut.' : name === 'NotFoundError' ? 'Keine Kamera gefunden. Öffne diese Seite auf einem Handy mit Kamera.' : name === 'NotReadableError' ? 'Die Kamera ist gerade nicht verfügbar. Schließe andere Kamera-Apps und versuche es erneut.' : 'Kamera oder AR konnte nicht geladen werden. Prüfe die Kameraberechtigung und öffne die Seite direkt in Safari oder Chrome. Lade bei Bedarf die Seite neu.';
  start.disabled = !modelReady || !secure; start.textContent = 'Erneut versuchen';
}
function stopCamera() {
  running = false; busy = false; wantsCamera = false;
  releaseCamera();
  panel.hidden = false; stop.hidden = true; controls.hidden = true; frame.hidden = true;
  status.textContent = 'Kamera gestoppt'; start.disabled = !modelReady || !secure; start.textContent = 'Kamera erneut starten';
}
start.addEventListener('click', async () => {
  if (busy || running || !modelReady) return;
  busy = true; wantsCamera = true; start.disabled = true; start.textContent = 'Kamera wird gestartet …';
  message.textContent = 'Erlaube jetzt den Kamerazugriff im Browser.';
  try { await scene.systems['mindar-image-system'].start(); }
  catch (error) { fail(error); }
});
scene.addEventListener('arReady', () => {
  if (!wantsCamera || document.hidden) {setTimeout(stopCamera, 0); return;}
  busy = false; running = true; panel.hidden = true; stop.hidden = false; frame.hidden = false; controls.hidden = false;
  status.textContent = 'Kamera bereit · Scanbild suchen';
});
scene.addEventListener('arError', event => fail(event.detail));
scene.addEventListener('loaded', () => {normalize(); ready();});
model.addEventListener('model-loaded', normalize);
model.addEventListener('model-error', () => {
  status.textContent = '3D-Modell konnte nicht geladen werden';
  message.textContent = 'Bitte prüfe deine Verbindung und lade die Seite erneut.';
  start.textContent = 'Modell nicht verfügbar'; start.disabled = true;
});
target.addEventListener('targetFound', () => {if (running) {status.textContent = 'Bild erkannt · Dein Brunnen ist da'; frame.hidden = true;}});
target.addEventListener('targetLost', () => {if (running) {status.textContent = 'Bild verloren · Kamera wieder auf das Scanbild richten'; frame.hidden = false;}});
stop.addEventListener('click', stopCamera);
document.querySelector('#scale').addEventListener('input', e => document.querySelector('#size').object3D.scale.setScalar(Number(e.target.value)));
document.querySelector('#rotate').addEventListener('click', () => {turn = (turn + 45) % 360; document.querySelector('#turntable').setAttribute('rotation', `0 ${turn} 0`);});
document.querySelector('#reset').addEventListener('click', reset);
window.addEventListener('pagehide', stopCamera);
document.addEventListener('visibilitychange', () => {if (document.hidden && (running || busy)) stopCamera();});
if (!window.AFRAME || !scene.systems) {status.textContent = 'AR-Bibliotheken werden geladen …';}
normalize(); ready();
