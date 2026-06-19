import { state } from './State.js';
import { updateViewMatrix } from '../renderer/CameraController.js';

let routerHandlers = null;
let suppressRouteSync = false;

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function buildSplatPath(index) {
    const splat = state.splatLibrary[index];
    if (!splat) return '/gaussian';
    const slug = slugify(splat.name) || String(index + 1);
    // Use the gaussian route and a 1-based `s` query parameter (splat number)
    // Example: /gaussian?s=1
    return `/gaussian?s=${index + 1}`;
}

function parseRouteFromLocation() {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const parts = path.split('/').filter(Boolean);

    if (!parts.length) return { view: 'splat', index: null };

    // support the gaussian route with `s` query param (1-based)
    if (parts[0] === 'gaussian') {
        // support subpaths like /gaussian/map and /gaussian/splat-index
        const sub = parts[1] || null;
        if (sub === 'map') return { view: 'map', index: null };
        if (sub === 'splat-index') return { view: 'splat-index', index: null };
        const rawSParam = new URLSearchParams(location.search).get('s');
        const parsedS = rawSParam !== null && rawSParam !== '' ? Number(rawSParam) : NaN;
        const splatNumber = Number.isInteger(parsedS) ? parsedS : null;

        if (splatNumber !== null) {
            const idx = splatNumber - 1; // convert 1-based to 0-based index
            if (idx >= 0 && idx < state.splatLibrary.length) {
                return { view: 'splat', index: idx };
            }
        }

        // fall back to slug matching if present (e.g. /gaussian/slug)
        const slug = parts[1] || null;
        if (slug) {
            const foundIdx = state.splatLibrary.findIndex((s) => slugify(s.name) === slug);
            if (foundIdx >= 0) return { view: 'splat', index: foundIdx };
        }

        return { view: 'splat', index: null };
    }

    return { view: 'splat', index: null };
}

function writeHistory(pathAndSearch, replace = false) {
    const nextUrl = new URL(pathAndSearch, location.origin);
    nextUrl.hash = location.hash;

    const current = `${location.pathname}${location.search}${location.hash}`;
    const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    if (current === next) return;

    if (replace) history.replaceState(null, '', next);
    else history.pushState(null, '', next);
}

function pathForCurrentUi() {
    if (state.mapOpen) return '/gaussian/map';
    if (state.overlayOpen) return '/gaussian/splat-index';
    return buildSplatPath(state.activeSplatIndex);
}

function applyRoute(route, { loadSplat = false } = {}) {
    if (!routerHandlers) return;

    suppressRouteSync = true;
    try {
        let didChangeIndex = false;
        let targetIndex = route.index;
        if (targetIndex === null || targetIndex < 0 || targetIndex >= state.splatLibrary.length) {
            targetIndex = state.activeSplatIndex;
        }

        if (targetIndex >= 0 && targetIndex < state.splatLibrary.length && targetIndex !== state.activeSplatIndex) {
            state.activeSplatIndex = targetIndex;
            localStorage.setItem('activeSplatIndex', String(targetIndex));
            routerHandlers.renderSplatGrid?.();
            didChangeIndex = true;
        }

        if (route.view === 'map') {
            if (state.overlayOpen) routerHandlers.closeOverlay?.();
            if (!state.mapOpen) routerHandlers.openMap?.();
            return;
        }

        if (state.mapOpen) routerHandlers.closeMap?.();

        if (route.view === 'splat-index') {
            if (!state.overlayOpen) routerHandlers.openOverlay?.();
            return;
        }

        if (state.overlayOpen) routerHandlers.closeOverlay?.();

        if (loadSplat && didChangeIndex && targetIndex >= 0 && targetIndex < state.splatLibrary.length) {
            routerHandlers.loadSplatByIndex?.(targetIndex);
        }
    } finally {
        suppressRouteSync = false;
    }
}

export function syncRouteFromUi({ replace = false } = {}) {
    if (suppressRouteSync || !routerHandlers) return;
    writeHistory(pathForCurrentUi(), replace);
}

export function initRouting(handlers) {
    routerHandlers = handlers;

    window.addEventListener('popstate', () => {
        applyRoute(parseRouteFromLocation(), { loadSplat: true });
    });

    // Handle hash-based camera shares while the app is running.
    // When a URL with a camera hash is navigated to (or pasted and entered),
    // apply the camera, load the requested splat (if any), then remove the hash
    // from the address bar so the UI stays clean.
    window.addEventListener('hashchange', () => {
        try {
            const m = location.hash.slice(1).match(/\[([\-\d.]+),([\-\d.]+),([\-\d.]+)\]\[([\-\d.]+),([\-\d.]+),([\-\d.]+)\]/);
            if (m) {
                state.cameraPosition = [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
                state.cameraRotation = [parseFloat(m[4]), parseFloat(m[5]), parseFloat(m[6])];
                updateViewMatrix();
                // Remove hash but keep search/path
                history.replaceState(null, '', location.pathname + location.search);
                // If the URL includes a splat (`s`) param, trigger a load
                applyRoute(parseRouteFromLocation(), { loadSplat: true });
            }
        } catch (err) { console.error('Failed to parse hash:', err); }
    });

    applyRoute(parseRouteFromLocation(), { loadSplat: false });
}