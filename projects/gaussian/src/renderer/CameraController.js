import { state } from '../app/State.js';
import { createViewMatrix } from '../utils/math.js';
import { DEBUG } from '../app/Config.js';

let _hashTimer = null;

function _writeHash() {
    const p = state.cameraPosition;
    const r = state.cameraRotation;
    const fmt = (n) => n.toFixed(4);
    // NO-OP: do not write camera position into the browser URL automatically.
    // The app previously updated location.replace() here which caused the
    // hash to appear/flash when interacting with the page. Instead, share
    // links should be copied explicitly by UI actions (copy buttons).
}

export function saveCameraState() {
    localStorage.setItem('cameraState', JSON.stringify({
        position:   state.cameraPosition,
        rotation:   state.cameraRotation,
        splatIndex: state.activeSplatIndex,  // remember which scene this camera belongs to
    }));
    if (DEBUG) console.debug('[Camera] saveCameraState', { position: state.cameraPosition, rotation: state.cameraRotation, splatIndex: state.activeSplatIndex });
    // Do not update location.hash here — keep camera persistence local only.
}

// If the URL contains a camera hash (#[pos][rot]), remove it from the URL
// after it has been consumed on startup so the address bar stays clean.
export function clearCameraHashIfPresent() {
    const hash = location.hash || '';
    const match = hash.slice(1).match(/\[([-\d.]+),([-\d.]+),([-\d.]+)\]\[([-\d.]+),([-\d.]+),([-\d.]+)\]/);
    if (match) {
        // Remove only the hash while preserving path and search
        if (DEBUG) console.debug('[Camera] clearCameraHashIfPresent - found hash', { hash });
        history.replaceState(null, '', location.pathname + location.search);
    }
}

// Recompute the view matrix from current camera state and mark the view dirty
export function updateViewMatrix() {
    state.viewMatrix = createViewMatrix(state.cameraPosition, state.cameraRotation);
    state.viewDirty  = true;
    if (DEBUG) console.debug('[Camera] updateViewMatrix', { position: state.cameraPosition, rotation: state.cameraRotation });
}

// Apply a splat's default camera, persist it, and recompute the view matrix
export function resetToSplatCamera(splat) {
    const sc = splat.scale ?? 1;
    state.cameraPosition = splat.cameraPosition.map(v => v * sc);
    state.cameraRotation = [...splat.cameraRotation];
    updateViewMatrix();
    saveCameraState();
    if (DEBUG) console.debug('[Camera] resetToSplatCamera', { splatName: splat.name });
}
