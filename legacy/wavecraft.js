'use strict';
// ============================================================
// WAVECRAFT — Audio Engine + Visualizer + UI
// ============================================================

// ── Globals ──────────────────────────────────────────────
let audioCtx = null, sourceNode = null, audioBuffer = null, mediaElementSrc = null;
let analyserNode = null, gainNode = null, pannerNode = null;
let subFilter = null, bassFilter = null, midFilter = null, presFilter = null, trebleFilter = null;
let compressor = null, delayNode = null, delayFeedback = null;
let convolverNode = null, reverbGain = null, dryGain = null;
let panner3DNode = null, surroundNodes = null, widenerNode = null;
let splitterNode = null, analyserL = null, analyserR = null;

let isPlaying = false, isLooping = false, isMuted = false;
let startTime = 0, pauseOffset = 0, fileDuration = 0;
let currentMode = 'bars', animFrameId = null;
let particles = [], peakHoldL = 0, peakHoldR = 0, peakTimerL = 0, peakTimerR = 0;
let is3D = false, isSurround = false, orbitAngle = 0;
let prevVolume = 80;
let isStream = false;
let streamAudioEl = null;

const PRESETS = {
    FLAT: { sub: 0, bass: 0, mid: 0, pres: 0, treble: 0, reverb: 0, delay: 0, feedback: 0, width: 1, pan: 0, gain: 80 },
    BASS_BOOST: { sub: 10, bass: 8, mid: -2, pres: 2, treble: 0, reverb: 0.1, delay: 0, feedback: 0, width: 1.2, pan: 0, gain: 80 },
    CLARITY: { sub: -4, bass: -2, mid: 3, pres: 6, treble: 5, reverb: 0, delay: 0, feedback: 0, width: 1, pan: 0, gain: 80 },
    CONCERT: { sub: 4, bass: 2, mid: 0, pres: 4, treble: 2, reverb: 0.6, delay: 150, feedback: 40, width: 1.5, pan: 0, gain: 80 }
};

// ── DOM refs ──────────────────────────────────────────────
const vizCanvas = document.getElementById('viz-canvas');
const ctx2d = vizCanvas.getContext('2d');
const uploadZone = document.getElementById('upload-zone');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const loopBtn = document.getElementById('loop-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const muteBtn = document.getElementById('mute-btn');
const volIcon = document.getElementById('vol-icon');
const volSlider = document.getElementById('vol-slider');
const fsVolSlider = document.getElementById('fs-vol-slider');
const seekFill = document.getElementById('seek-fill');
const seekBarWrap = document.getElementById('seek-bar-wrap');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const seekTrackName = document.getElementById('seek-track-name');
const headerTitle = document.getElementById('header-track-title');
const headerArtist = document.getElementById('header-track-artist');
const spatialDot = document.getElementById('spatial-dot');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenBar = document.getElementById('fullscreen-bar');
const fsPlayBtn = document.getElementById('fs-play-btn');
const fsPlayIcon = document.getElementById('fs-play-icon');
const meterL = document.getElementById('meter-l');
const meterR = document.getElementById('meter-r');
const peakLEl = document.getElementById('peak-l');
const peakREl = document.getElementById('peak-r');
const browseLink = document.getElementById('browse-link');
const streamInput = document.getElementById('stream-input');
const streamBtn = document.getElementById('stream-btn');
const streamLoading = document.getElementById('stream-loading');
const savePresetBtn = document.getElementById('save-preset-btn');
const resetPresetBtn = document.getElementById('reset-preset-btn');
const presetSelect = document.getElementById('preset-select');

// Control refs (populated after knob/slider creation)
const ctrlRefs = {};

// ── Utility ───────────────────────────────────────────────
const fmtTime = s => { const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };
const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));
const lerp = (a, b, t) => a + (b - a) * t;

// ── Audio Context Init ────────────────────────────────────
function initAudioContext() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // EQ (5-band)
    subFilter = audioCtx.createBiquadFilter();
    subFilter.type = 'lowshelf'; subFilter.frequency.value = 60; subFilter.gain.value = 0;

    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'peaking'; bassFilter.frequency.value = 200; bassFilter.Q.value = 1; bassFilter.gain.value = 0;

    midFilter = audioCtx.createBiquadFilter();
    midFilter.type = 'peaking'; midFilter.frequency.value = 1000; midFilter.Q.value = 1; midFilter.gain.value = 0;

    presFilter = audioCtx.createBiquadFilter();
    presFilter.type = 'peaking'; presFilter.frequency.value = 4000; presFilter.Q.value = 1; presFilter.gain.value = 0;

    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = 'highshelf'; trebleFilter.frequency.value = 10000; trebleFilter.gain.value = 0;

    // Compressor
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    // Panner (stereo)
    pannerNode = audioCtx.createStereoPanner();
    pannerNode.pan.value = 0;

    // 3D Panner
    panner3DNode = audioCtx.createPanner();
    panner3DNode.panningModel = 'HRTF';
    panner3DNode.distanceModel = 'inverse';
    panner3DNode.refDistance = 1;
    panner3DNode.maxDistance = 10;
    panner3DNode.positionX.value = 0;
    panner3DNode.positionY.value = 0;
    panner3DNode.positionZ.value = 1;

    // Reverb
    convolverNode = audioCtx.createConvolver();
    reverbGain = audioCtx.createGain(); reverbGain.gain.value = 0;
    dryGain = audioCtx.createGain(); dryGain.gain.value = 1;

    // Delay
    delayNode = audioCtx.createDelay(2.0); delayNode.delayTime.value = 0;
    delayFeedback = audioCtx.createGain(); delayFeedback.gain.value = 0;
    delayNode.connect(delayFeedback);
    delayFeedback.connect(delayNode);

    // Master gain
    gainNode = audioCtx.createGain(); gainNode.gain.value = 0.8;

    // Analysers
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = 0.8;

    splitterNode = audioCtx.createChannelSplitter(2);
    analyserL = audioCtx.createAnalyser(); analyserL.fftSize = 256;
    analyserR = audioCtx.createAnalyser(); analyserR.fftSize = 256;
    splitterNode.connect(analyserL, 0);
    splitterNode.connect(analyserR, 1);

    buildAudioGraph();
    makeImpulseResponse(1.5);
}

function buildAudioGraph() {
    // Chain: sub → bass → mid → pres → treble → compressor → pannerNode → dry/reverb → delay → gain → analyser → splitter → dest
    subFilter.connect(bassFilter);
    bassFilter.connect(midFilter);
    midFilter.connect(presFilter);
    presFilter.connect(trebleFilter);
    trebleFilter.connect(compressor);
    compressor.connect(pannerNode);
    pannerNode.connect(dryGain);
    pannerNode.connect(convolverNode);
    convolverNode.connect(reverbGain);
    dryGain.connect(delayNode);
    reverbGain.connect(delayNode);
    delayNode.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(splitterNode);
    analyserNode.connect(audioCtx.destination);
}

function makeImpulseResponse(duration) {
    if (!audioCtx) return;
    const sr = audioCtx.sampleRate;
    const len = sr * duration;
    const buf = audioCtx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        }
    }
    convolverNode.buffer = buf;
}

// ── File Loading ──────────────────────────────────────────
function loadAudioFile(file) {
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const reader = new FileReader();
    reader.onload = e => {
        audioCtx.decodeAudioData(e.target.result, buf => {
            audioBuffer = buf;
            fileDuration = buf.duration;
            const name = file.name.replace(/\.[^.]+$/, '');
            headerTitle.textContent = name;
            headerArtist.textContent = `${fmtTime(fileDuration)} · ${(file.size / 1048576).toFixed(1)} MB`;
            seekTrackName.textContent = name;
            timeTotal.textContent = fmtTime(fileDuration);
            uploadZone.style.display = 'none';
            drawWaveformThumb(buf);
            startPlayback(0);
        }, () => alert('Could not decode audio file. Try another format.'));
    };
    reader.readAsArrayBuffer(file);
}

function startPlayback(offset) {
    if (!audioBuffer && !isStream) return;
    if (sourceNode) { try { sourceNode.stop(); } catch (e) { } }

    if (isStream && streamAudioEl) {
        streamAudioEl.play();
        isPlaying = true;
        updatePlayUI();
        return;
    }

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = isLooping;
    sourceNode.connect(subFilter); // Connect to first EQ node
    sourceNode.start(0, offset);
    startTime = audioCtx.currentTime - offset;
    pauseOffset = offset;
    isPlaying = true;
    updatePlayUI();
    sourceNode.onended = () => {
        if (isLooping) return;
        isPlaying = false; pauseOffset = 0;
        updatePlayUI();
    };
}

function togglePlay() {
    if (!audioBuffer && !isStream) return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (isStream && streamAudioEl) {
        if (isPlaying) { streamAudioEl.pause(); isPlaying = false; }
        else { streamAudioEl.play(); isPlaying = true; }
        updatePlayUI();
        return;
    }

    if (isPlaying) {
        pauseOffset = audioCtx.currentTime - startTime;
        if (sourceNode) {
            try { sourceNode.stop(); } catch (e) { }
        }
        isPlaying = false;
    } else {
        startPlayback(clamp(pauseOffset, 0, fileDuration));
    }
    updatePlayUI();
}

function updatePlayUI() {
    const svgPlay = '<polygon points="5,3 19,12 5,21"/>';
    const svgPause = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    playIcon.innerHTML = isPlaying ? svgPause : svgPlay;
    fsPlayIcon.innerHTML = isPlaying ? svgPause : svgPlay;
    playBtn.classList.toggle('playing', isPlaying);
}

// ── Waveform Thumbnail ────────────────────────────────────
function drawWaveformThumb(buf) {
    const wc = document.getElementById('waveform-canvas');
    const w = wc.offsetWidth, h = wc.offsetHeight;
    wc.width = w; wc.height = h;
    const cx = wc.getContext('2d');
    const data = buf.getChannelData(0);
    const step = Math.ceil(data.length / w);
    cx.clearRect(0, 0, w, h);
    cx.strokeStyle = '#1DB954'; cx.lineWidth = 1;
    cx.beginPath();
    for (let i = 0; i < w; i++) {
        let min = 1, max = -1;
        for (let j = 0; j < step; j++) {
            const v = data[i * step + j] || 0;
            if (v < min) min = v;
            if (v > max) max = v;
        }
        const y1 = (1 + min) * h / 2, y2 = (1 + max) * h / 2;
        cx.moveTo(i, y1); cx.lineTo(i, y2);
    }
    cx.stroke();
}

// ── Seek Bar ──────────────────────────────────────────────
seekBarWrap.addEventListener('click', e => {
    if ((!audioBuffer && !isStream) || (isStream && !streamAudioEl)) return;
    const rect = seekBarWrap.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;

    if (isStream) {
        if (!isFinite(streamAudioEl.duration)) return;
        streamAudioEl.currentTime = pct * streamAudioEl.duration;
        return;
    }

    const newTime = clamp(pct * fileDuration, 0, fileDuration);
    pauseOffset = newTime;
    if (isPlaying) startPlayback(newTime);
    else timeCurrent.textContent = fmtTime(newTime);
});

// ── Volume ────────────────────────────────────────────────
function setVolume(v) {
    if (!gainNode) return;
    gainNode.gain.value = v / 100;
    updateVolumeIcon(v);
}

function updateVolumeIcon(v) {
    if (v === 0) {
        volIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
    } else if (v < 50) {
        volIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/>';
    } else {
        volIcon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>';
    }
}

volSlider.addEventListener('input', () => {
    prevVolume = +volSlider.value;
    fsVolSlider.value = volSlider.value;
    setSliderFill(volSlider);
    setSliderFill(fsVolSlider);
    setVolume(+volSlider.value);
    if (isMuted) { isMuted = false; }
});

fsVolSlider.addEventListener('input', () => {
    volSlider.value = fsVolSlider.value;
    setSliderFill(volSlider); setSliderFill(fsVolSlider);
    setVolume(+fsVolSlider.value);
});

muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) { prevVolume = +volSlider.value; volSlider.value = 0; }
    else volSlider.value = prevVolume;
    setSliderFill(volSlider);
    setVolume(+volSlider.value);
});

// ── Slider Fill Helper ────────────────────────────────────
function setSliderFill(el) {
    const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
    el.style.setProperty('--pct', pct + '%');
}
function setVSliderFill(el) {
    const pct = ((+el.value - +el.min) / (+el.max - +el.min)) * 100;
    el.style.setProperty('--pct', pct + '%');
}
setSliderFill(volSlider); setSliderFill(fsVolSlider);

// ── Transport Controls ────────────────────────────────────
playBtn.addEventListener('click', togglePlay);
fsPlayBtn.addEventListener('click', togglePlay);

loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    loopBtn.classList.toggle('active', isLooping);
    if (sourceNode) sourceNode.loop = isLooping;
});

// ── Mode Tabs ─────────────────────────────────────────────
document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ── File Upload & Stream ──────────────────────────────────
browseLink.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { if (e.target.files[0]) loadAudioFile(e.target.files[0]); });

dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
dropArea.addEventListener('drop', e => {
    e.preventDefault(); dropArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio')) loadAudioFile(file);
});

streamBtn.addEventListener('click', () => {
    let url = streamInput.value.trim();
    if (!url) return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    streamLoading.style.display = 'block';

    // Use an audio tag to stream the URL
    if (streamAudioEl) { streamAudioEl.pause(); streamAudioEl.src = ''; }
    if (sourceNode) { try { sourceNode.stop(); } catch (e) { } }

    streamAudioEl = new Audio(url);
    streamAudioEl.crossOrigin = 'anonymous';
    streamAudioEl.addEventListener('canplay', () => {
        streamLoading.style.display = 'none';
        uploadZone.style.display = 'none';
        if (!mediaElementSrc) {
            mediaElementSrc = audioCtx.createMediaElementSource(streamAudioEl);
        }
        mediaElementSrc.disconnect();
        mediaElementSrc.connect(subFilter);

        isStream = true;
        audioBuffer = null;
        headerTitle.textContent = 'Audio Stream';
        headerArtist.textContent = url.replace(/^https?:\/\//, '').split('/')[0];
        seekTrackName.textContent = 'Remote Stream';
        const W = document.getElementById('waveform-canvas').width;
        const H = document.getElementById('waveform-canvas').height;
        const cx = document.getElementById('waveform-canvas').getContext('2d');
        cx.clearRect(0, 0, W, H); // clear static waveform

        startPlayback(0);
    });

    streamAudioEl.addEventListener('error', () => {
        streamLoading.style.display = 'none';
        alert('Could not load stream directly. Try a raw audio URL or an audio proxy.');
    });
});


// ── Fullscreen ────────────────────────────────────────────
let fsHideTimer;
fullscreenBtn.addEventListener('click', () => document.documentElement.requestFullscreen().catch(() => { }));

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.getElementById('app').classList.add('fullscreen-active');
        vizCanvas.dispatchEvent(new Event('resize'));
    } else {
        document.getElementById('app').classList.remove('fullscreen-active');
        fullscreenBar.classList.remove('visible');
    }
});

document.addEventListener('mousemove', () => {
    if (!document.fullscreenElement) return;
    fullscreenBar.classList.add('visible');
    clearTimeout(fsHideTimer);
    fsHideTimer = setTimeout(() => fullscreenBar.classList.remove('visible'), 3000);
});

// ── Knob Component ────────────────────────────────────────
function createKnob(container, label, min, max, def, unit, size, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'knob-wrap';
    wrap.title = label;

    const knobEl = document.createElement('div');
    knobEl.className = 'knob';
    knobEl.style.width = knobEl.style.height = size + 'px';

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

    const cx = size / 2, cy = size / 2, r = size / 2 - 5, sw = 3;
    const startA = 135 * Math.PI / 180, endA = 405 * Math.PI / 180;

    // BG arc
    const arcBg = document.createElementNS(ns, 'path');
    arcBg.setAttribute('fill', 'none');
    arcBg.setAttribute('stroke', '#333');
    arcBg.setAttribute('stroke-width', sw);
    arcBg.setAttribute('stroke-linecap', 'round');
    arcBg.setAttribute('d', describeArc(cx, cy, r, 135, 405));

    // Fill arc
    const arcFill = document.createElementNS(ns, 'path');
    arcFill.setAttribute('fill', 'none');
    arcFill.setAttribute('stroke', '#1DB954');
    arcFill.setAttribute('stroke-width', sw);
    arcFill.setAttribute('stroke-linecap', 'round');

    svg.appendChild(arcBg); svg.appendChild(arcFill);
    knobEl.appendChild(svg);

    const dot = document.createElement('div');
    dot.className = 'knob-center';
    knobEl.appendChild(dot);

    const lbl = document.createElement('div');
    lbl.className = 'knob-label';
    lbl.textContent = label;

    const valEl = document.createElement('div');
    valEl.className = 'knob-val';

    let value = def;
    const setVal = v => {
        value = clamp(v, min, max);
        const norm = (value - min) / (max - min);
        const angle = 135 + norm * 270;
        arcFill.setAttribute('d', describeArc(cx, cy, r, 135, angle));
        valEl.textContent = formatKnobVal(value, unit);
        onChange && onChange(value);
    };
    setVal(def);

    let dragging = false, startY = 0, startVal = def;
    knobEl.addEventListener('pointerdown', e => {
        dragging = true; startY = e.clientY; startVal = value;
        knobEl.setPointerCapture(e.pointerId);
        e.preventDefault();
    });
    knobEl.addEventListener('pointermove', e => {
        if (!dragging) return;
        const delta = (startY - e.clientY) * (max - min) / 150;
        setVal(startVal + delta);
    });
    knobEl.addEventListener('pointerup', () => { dragging = false; });
    knobEl.addEventListener('wheel', e => { e.preventDefault(); setVal(value + (e.deltaY < 0 ? 1 : -1) * (max - min) / 50); }, { passive: false });

    wrap.appendChild(knobEl); wrap.appendChild(lbl); wrap.appendChild(valEl);
    container.appendChild(wrap);
    return { getVal: () => value, setVal };
}

function formatKnobVal(v, unit) {
    if (unit === 'dB') return (v >= 0 ? '+' : '') + v.toFixed(1) + 'dB';
    if (unit === 'ms') return Math.round(v) + 'ms';
    if (unit === '%') return Math.round(v) + '%';
    return v.toFixed(2);
}

function describeArc(cx, cy, r, startDeg, endDeg) {
    const start = polarToCart(cx, cy, r, startDeg);
    const end = polarToCart(cx, cy, r, endDeg);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    if (Math.abs(endDeg - startDeg) < 0.5) return '';
    return `M${start.x} ${start.y} A${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

function polarToCart(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── Horizontal Slider ─────────────────────────────────────
function createHSlider(container, label, min, max, def, unit, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'h-slider-wrap';

    const head = document.createElement('div');
    head.className = 'h-slider-head';
    const lbl = document.createElement('span'); lbl.className = 'h-slider-label'; lbl.textContent = label;
    const valEl = document.createElement('span'); valEl.className = 'h-slider-val';
    head.appendChild(lbl); head.appendChild(valEl);

    const inp = document.createElement('input');
    inp.type = 'range'; inp.className = 'h-slider';
    inp.min = min; inp.max = max; inp.step = (max - min) / 200; inp.value = def;

    const update = () => {
        setSliderFill(inp);
        valEl.textContent = formatKnobVal(+inp.value, unit);
        onChange && onChange(+inp.value);
    };
    update();
    inp.addEventListener('input', update);

    wrap.appendChild(head); wrap.appendChild(inp);
    container.appendChild(wrap);
    return { getVal: () => +inp.value, setVal: v => { inp.value = v; update(); } };
}

// ── Vertical EQ Slider ────────────────────────────────────
function createVSlider(container, label, min, max, def, unit, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'v-slider-wrap';

    const lbl = document.createElement('div'); lbl.className = 'v-slider-label'; lbl.textContent = label;

    // Custom track wrapper
    const trackWrap = document.createElement('div');
    trackWrap.style.cssText = 'position:relative;width:20px;height:100px;display:flex;align-items:center;justify-content:center;margin:4px 0;';

    const trackBg = document.createElement('div');
    trackBg.style.cssText = 'position:absolute;width:4px;height:100%;background:#2A2A2A;border-radius:2px;';

    const trackFill = document.createElement('div');
    trackFill.style.cssText = 'position:absolute;width:4px;bottom:0;background:#1DB954;border-radius:2px;transition:height 0.05s linear;';

    const inp = document.createElement('input');
    inp.type = 'range'; inp.className = 'v-slider';
    inp.min = min; inp.max = max; inp.step = 1; inp.value = def;
    inp.style.cssText = 'position:absolute;width:100%;height:100%;opacity:0;cursor:pointer;writing-mode:vertical-lr;direction:rtl;';

    const thumb = document.createElement('div');
    thumb.style.cssText = 'position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.6);pointer-events:none;transition:transform 0.1s;';

    trackWrap.appendChild(trackBg);
    trackWrap.appendChild(trackFill);
    trackWrap.appendChild(inp);
    trackWrap.appendChild(thumb);

    const valEl = document.createElement('div'); valEl.className = 'v-slider-val';

    const formatV = v => (v >= 0 ? '+' : '') + v + unit;
    const update = () => {
        const pct = (+inp.value - min) / (max - min);
        trackFill.style.height = (pct * 100) + '%';
        thumb.style.bottom = 'calc(' + (pct * 100) + '% - 7px)';
        valEl.textContent = formatV(+inp.value);
        onChange && onChange(+inp.value);
    };
    update();
    inp.addEventListener('input', update);
    trackWrap.addEventListener('mouseenter', () => thumb.style.transform = 'scale(1.3)');
    trackWrap.addEventListener('mouseleave', () => thumb.style.transform = 'scale(1)');

    wrap.appendChild(lbl); wrap.appendChild(trackWrap); wrap.appendChild(valEl);
    container.appendChild(wrap);
    return {
        getVal: () => +inp.value,
        setVal: v => { inp.value = v; update(); }
    };
}

// ── Build Control Panels ──────────────────────────────────
function buildControls() {
    // EQ sliders
    const eqBody = document.getElementById('eq-body');
    ctrlRefs.subSlider = createVSlider(eqBody, 'Sub', -12, 12, 0, 'dB', v => subFilter && (subFilter.gain.value = v));
    ctrlRefs.bassSlider = createVSlider(eqBody, 'Bass', -12, 12, 0, 'dB', v => bassFilter && (bassFilter.gain.value = v));
    ctrlRefs.midSlider = createVSlider(eqBody, 'Mid', -12, 12, 0, 'dB', v => midFilter && (midFilter.gain.value = v));
    ctrlRefs.presSlider = createVSlider(eqBody, 'Pres', -12, 12, 0, 'dB', v => presFilter && (presFilter.gain.value = v));
    ctrlRefs.trebleSlider = createVSlider(eqBody, 'Treble', -12, 12, 0, 'dB', v => trebleFilter && (trebleFilter.gain.value = v));

    // Spatial width knob
    ctrlRefs.widthKnob = createKnob(document.getElementById('width-knob-container'), 'WIDTH', 0, 200, 100, '%', 48, v => applyWidth(v / 100));

    // 3D + Surround toggles
    document.getElementById('chk-3d').addEventListener('change', e => {
        is3D = e.target.checked;
        if (is3D) animateOrbit();
    });
    document.getElementById('chk-surround').addEventListener('change', e => { isSurround = e.target.checked; });

    // Compressor
    ctrlRefs.compThresh = createHSlider(document.getElementById('comp-threshold-wrap'), 'Threshold', -60, 0, -24, 'dB', v => compressor && (compressor.threshold.value = v));
    ctrlRefs.compRatio = createHSlider(document.getElementById('comp-ratio-wrap'), 'Ratio', 1, 20, 4, '', v => compressor && (compressor.ratio.value = v));
    ctrlRefs.compAttack = createKnob(document.getElementById('comp-attack-knob'), 'ATK', 1, 200, 3, 'ms', 40, v => compressor && (compressor.attack.value = v / 1000));
    ctrlRefs.compRelease = createKnob(document.getElementById('comp-release-knob'), 'REL', 10, 1000, 250, 'ms', 40, v => compressor && (compressor.release.value = v / 1000));

    // Reverb
    ctrlRefs.reverbKnob = createKnob(document.getElementById('reverb-knob-container'), 'ROOM', 0.1, 4, 1.5, 's', 48, v => makeImpulseResponse(v));
    ctrlRefs.reverbDry = createHSlider(document.getElementById('reverb-dry-wrap'), 'Wet', 0, 100, 0, '%', v => {
        if (reverbGain) reverbGain.gain.value = v / 100;
        if (dryGain) dryGain.gain.value = 1 - (v / 100) * 0.6;
    });
    ctrlRefs.delayTime = createHSlider(document.getElementById('delay-time-wrap'), 'Delay', 0, 1000, 0, 'ms', v => delayNode && (delayNode.delayTime.value = v / 1000));
    ctrlRefs.delayFb = createHSlider(document.getElementById('delay-fb-wrap'), 'Feedback', 0, 90, 0, '%', v => delayFeedback && (delayFeedback.gain.value = v / 100));

    // Pan & Gain
    ctrlRefs.panKnob = createKnob(document.getElementById('pan-knob-container'), 'PAN', -1, 1, 0, '', 64, v => pannerNode && (pannerNode.pan.value = v));
    ctrlRefs.gainKnob = createKnob(document.getElementById('gain-knob-container'), 'GAIN', 0, 150, 80, '%', 64, v => gainNode && (gainNode.gain.value = v / 100));

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyPreset(btn.dataset.preset);
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    savePresetBtn.addEventListener('click', saveCustomPreset);
    resetPresetBtn.addEventListener('click', () => applyPreset('FLAT'));
    presetSelect.addEventListener('change', () => {
        if (!presetSelect.value) return;
        const saved = JSON.parse(localStorage.getItem('wavecraft_presets') || '{}');
        if (saved[presetSelect.value]) applyPreset(presetSelect.value, saved[presetSelect.value]);
        presetSelect.value = '';
    });
    loadSavedPresets();
}

// ── Stereo Width (approximated via gain tricks) ───────────
function applyWidth(w) {
    // w=1 = normal, w>1 = wider, w<1 = narrower
    if (!pannerNode) return;
    // Use compressor as a proxy hook; real M-S needs AudioWorklet
    // For now: subtly spread by adjusting pan automation sim
}

// ── 3D Orbit ──────────────────────────────────────────────
function animateOrbit() {
    if (!is3D || !panner3DNode) return;
    orbitAngle += 0.008;
    const x = Math.sin(orbitAngle) * 2;
    const z = Math.cos(orbitAngle) * 2;
    panner3DNode.positionX.value = x;
    panner3DNode.positionZ.value = z;
    // Update spatial dot
    const dotX = 50 + (x / 2) * 40;
    const dotY = 50 + (z / 2) * 40;
    spatialDot.style.left = dotX + '%';
    spatialDot.style.top = dotY + '%';
    spatialDot.style.transform = 'translate(-50%,-50%)';
    if (is3D) requestAnimationFrame(animateOrbit);
}

// ── Presets ───────────────────────────────────────────────
function applyPreset(name, data) {
    const p = data || PRESETS[name];
    if (!p) return;
    ctrlRefs.subSlider?.setVal(p.sub ?? 0);
    ctrlRefs.bassSlider?.setVal(p.bass ?? 0);
    ctrlRefs.midSlider?.setVal(p.mid ?? 0);
    ctrlRefs.presSlider?.setVal(p.pres ?? 0);
    ctrlRefs.trebleSlider?.setVal(p.treble ?? 0);
    ctrlRefs.reverbDry?.setVal((p.reverb ?? 0) * 100);
    ctrlRefs.delayTime?.setVal(p.delay ?? 0);
    ctrlRefs.delayFb?.setVal(p.feedback ?? 0);
    ctrlRefs.widthKnob?.setVal((p.width ?? 1) * 100);
    ctrlRefs.panKnob?.setVal(p.pan ?? 0);
    ctrlRefs.gainKnob?.setVal(p.gain ?? 80);
    if (subFilter) subFilter.gain.value = p.sub ?? 0;
    if (bassFilter) bassFilter.gain.value = p.bass ?? 0;
    if (midFilter) midFilter.gain.value = p.mid ?? 0;
    if (presFilter) presFilter.gain.value = p.pres ?? 0;
    if (trebleFilter) trebleFilter.gain.value = p.treble ?? 0;
    if (reverbGain) reverbGain.gain.value = (p.reverb ?? 0);
    if (delayNode) delayNode.delayTime.value = (p.delay ?? 0) / 1000;
    if (delayFeedback) delayFeedback.gain.value = (p.feedback ?? 0) / 100;
    if (gainNode) gainNode.gain.value = (p.gain ?? 80) / 100;
}

function saveCustomPreset() {
    const nm = prompt('Preset name:');
    if (!nm) return;
    const saved = JSON.parse(localStorage.getItem('wavecraft_presets') || '{}');
    saved[nm] = {
        sub: ctrlRefs.subSlider?.getVal() ?? 0,
        bass: ctrlRefs.bassSlider?.getVal() ?? 0,
        mid: ctrlRefs.midSlider?.getVal() ?? 0,
        pres: ctrlRefs.presSlider?.getVal() ?? 0,
        treble: ctrlRefs.trebleSlider?.getVal() ?? 0,
        reverb: (ctrlRefs.reverbDry?.getVal() ?? 0) / 100,
        delay: ctrlRefs.delayTime?.getVal() ?? 0,
        feedback: ctrlRefs.delayFb?.getVal() ?? 0,
        width: (ctrlRefs.widthKnob?.getVal() ?? 100) / 100,
        pan: ctrlRefs.panKnob?.getVal() ?? 0,
        gain: ctrlRefs.gainKnob?.getVal() ?? 80,
    };
    localStorage.setItem('wavecraft_presets', JSON.stringify(saved));
    loadSavedPresets();
}

function loadSavedPresets() {
    const saved = JSON.parse(localStorage.getItem('wavecraft_presets') || '{}');
    while (presetSelect.options.length > 1) presetSelect.remove(1);
    Object.keys(saved).forEach(k => {
        const opt = document.createElement('option');
        opt.value = k; opt.textContent = k;
        presetSelect.appendChild(opt);
    });
}

// ── Visualizer Canvas Resize ──────────────────────────────
function resizeCanvas() {
    const rect = vizCanvas.parentElement.getBoundingClientRect();
    vizCanvas.width = rect.width;
    vizCanvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Main Render Loop ──────────────────────────────────────
const freqData = new Uint8Array(1024);
const timeData = new Uint8Array(2048);
const floatData = new Float32Array(2048);

function renderLoop() {
    animFrameId = requestAnimationFrame(renderLoop);
    const W = vizCanvas.width, H = vizCanvas.height;

    // Seek bar update
    if (isPlaying) {
        let elapsed = 0, total = 0;
        if (isStream && streamAudioEl && isFinite(streamAudioEl.duration)) {
            elapsed = streamAudioEl.currentTime;
            total = streamAudioEl.duration;
        } else if (!isStream && fileDuration > 0) {
            elapsed = audioCtx.currentTime - startTime;
            total = fileDuration;
        }
        if (total > 0) {
            const pct = clamp(elapsed / total, 0, 1);
            seekFill.style.width = (pct * 100) + '%';
            timeCurrent.textContent = fmtTime(elapsed);
            if (isStream) timeTotal.textContent = fmtTime(total);
        }
    }

    // Get frequency data
    if (analyserNode) {
        analyserNode.getByteFrequencyData(freqData);
        analyserNode.getByteTimeDomainData(timeData);
    }

    // Clear or Fade (Trails)
    if (currentMode === 'particles' || currentMode === 'wave' || currentMode === 'scope') {
        ctx2d.fillStyle = 'rgba(18, 18, 18, 0.25)';
        ctx2d.fillRect(0, 0, W, H);
    } else {
        ctx2d.clearRect(0, 0, W, H);
    }

    if (!audioBuffer && !isStream) { drawIdleAnimation(W, H); updateMeters(0, 0); return; }

    switch (currentMode) {
        case 'bars': drawBars(W, H); break;
        case 'wave': drawWave(W, H); break;
        case 'radial': drawRadial(W, H); break;
        case 'particles': drawParticles(W, H); break;
        case 'scope': drawScope(W, H); break;
    }

    // Meters
    const avgL = getChannelAvg(analyserL);
    const avgR = getChannelAvg(analyserR);
    updateMeters(avgL, avgR);
}

function getChannelAvg(an) {
    if (!an) return 0;
    const d = new Uint8Array(an.frequencyBinCount);
    an.getByteFrequencyData(d);
    return d.reduce((s, v) => s + v, 0) / d.length / 255;
}

function getBandAvg(data, startBin, endBin) {
    let sum = 0;
    for (let i = startBin; i <= endBin; i++) sum += data[i] || 0;
    return (sum / (endBin - startBin + 1)) / 255;
}

function updateMeters(l, r) {
    const lpct = l * 100, rpct = r * 100;
    meterL.style.height = lpct + '%';
    meterR.style.height = rpct + '%';
    // Peak hold
    if (lpct > peakHoldL) { peakHoldL = lpct; peakTimerL = Date.now(); }
    else if (Date.now() - peakTimerL > 1500) peakHoldL = Math.max(0, peakHoldL - 0.8);
    if (rpct > peakHoldR) { peakHoldR = rpct; peakTimerR = Date.now(); }
    else if (Date.now() - peakTimerR > 1500) peakHoldR = Math.max(0, peakHoldR - 0.8);
    peakLEl.style.bottom = clamp(peakHoldL, 0, 99) + '%';
    peakREl.style.bottom = clamp(peakHoldR, 0, 99) + '%';
    // Color meter
    const meterColor = pct => pct > 90 ? '#E91429' : pct > 70 ? '#F59B23' : '#1DB954';
    meterL.style.background = meterColor(lpct);
    meterR.style.background = meterColor(rpct);
}

// ── Idle animation (before file load) ────────────────────
function drawIdleAnimation(W, H) {
    const t = Date.now() / 1000;
    ctx2d.strokeStyle = 'rgba(29,185,84,0.15)';
    ctx2d.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        const amp = 20 + i * 8;
        const freq = 0.012 + i * 0.003;
        const phase = t * (0.3 + i * 0.1);
        ctx2d.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const y = H / 2 + Math.sin(x * freq + phase) * amp * Math.sin(t + i);
            x === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
    }
}

// ── BARS mode ─────────────────────────────────────────────
function drawBars(W, H) {
    const bins = 128;
    const barW = (W / bins) - 1;
    const halfH = H / 2;
    ctx2d.save();
    for (let i = 0; i < bins; i++) {
        // Apply an exponent to increase dynamic range (lower signals drop faster, highs pop more)
        const val = Math.pow(freqData[i] / 255, 1.5);
        const barH = val * halfH * 0.92;
        const bright = 40 + val * 40; // Expand color brightness range
        const glow = val > 0.4;
        ctx2d.fillStyle = `hsl(141,73%,${bright}%)`;
        if (glow) {
            ctx2d.shadowBlur = 12;
            ctx2d.shadowColor = '#1DB954';
        } else {
            ctx2d.shadowBlur = 0;
        }
        const x = i * (barW + 1);
        // Mirror top + bottom
        ctx2d.fillRect(x, halfH - barH, barW, barH);
        ctx2d.fillRect(x, halfH, barW, barH);
    }
    ctx2d.shadowBlur = 0;
    ctx2d.restore();
}

// ── WAVE mode ─────────────────────────────────────────────
function drawWave(W, H) {
    const mid = H / 2;
    const step = W / timeData.length;
    ctx2d.beginPath();
    ctx2d.moveTo(0, mid);
    for (let i = 0; i < timeData.length; i++) {
        const y = ((timeData[i] / 128) - 1) * mid * 0.85 + mid;
        const x = i * step;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    }
    // Fill
    ctx2d.lineTo(W, mid); ctx2d.lineTo(0, mid); ctx2d.closePath();
    const grad = ctx2d.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(29,185,84,0.25)');
    grad.addColorStop(0.5, 'rgba(29,185,84,0.05)');
    grad.addColorStop(1, 'rgba(29,185,84,0.25)');
    ctx2d.fillStyle = grad;
    ctx2d.fill();
    // Line
    ctx2d.beginPath();
    for (let i = 0; i < timeData.length; i++) {
        const y = ((timeData[i] / 128) - 1) * mid * 0.85 + mid;
        const x = i * step;
        if (i === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);
    }
    ctx2d.strokeStyle = '#1DB954';
    ctx2d.lineWidth = 2;
    ctx2d.shadowBlur = 8; ctx2d.shadowColor = '#1DB954';
    ctx2d.stroke();
    ctx2d.shadowBlur = 0;
}

// ── RADIAL mode ───────────────────────────────────────────
function drawRadial(W, H) {
    const data = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(data);
    const cx = W / 2, cy = H / 2;
    const bass = getBandAvg(data, 0, 10);
    const radius = Math.min(W, H) * 0.15 + (bass * 0.4);

    const time = performance.now() * 0.0002;
    ctx2d.save();
    ctx2d.translate(cx, cy);
    ctx2d.rotate(time);

    ctx2d.beginPath();
    const steps = 128;
    for (let i = 0; i <= steps; i++) {
        const v = data[Math.floor(Math.abs((i % steps) - steps / 2) / (steps / 2) * data.length * 0.6)];
        const r = radius + (v * 0.7);
        const rad = (i / steps) * Math.PI * 2;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
    }
    ctx2d.closePath();
    ctx2d.strokeStyle = '#1DB954';
    ctx2d.lineWidth = 3;
    ctx2d.shadowBlur = 15;
    ctx2d.shadowColor = '#1DB954';
    ctx2d.stroke();
    ctx2d.restore();
}

// ── PARTICLES mode ────────────────────────────────────────
function initParticles(W, H) {
    particles = Array.from({ length: 200 }, () => spawnParticle(W, H));
}

function spawnParticle(W, H) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 1.2;
    return {
        x: W / 2 + (Math.random() - 0.5) * 80,
        y: H / 2 + (Math.random() - 0.5) * 80,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.4 + Math.random() * 0.6,
        decay: 0.004 + Math.random() * 0.006,
        c: `rgba(29,185,84,${0.4 + Math.random() * 0.6})`
    };
}

function drawParticles(W, H) {
    if (particles.length === 0) initParticles(W, H);
    const bassEnergy = freqData.slice(0, 16).reduce((a, b) => a + b, 0) / 16 / 255;
    ctx2d.save();
    particles.forEach((p, i) => {
        const boost = 1 + bassEnergy * 3;
        p.x += p.vx * boost; p.y += p.vy * boost;
        p.alpha -= p.decay;
        if (p.alpha <= 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
            particles[i] = spawnParticle(W, H);
            return;
        }
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx2d.fillStyle = p.c;
        ctx2d.fill();
    });

    // Plexus connections
    ctx2d.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 15000) {
                const alpha = (1 - Math.sqrt(distSq) / 122) * 0.4;
                ctx2d.strokeStyle = `rgba(29, 185, 84, ${alpha})`;
                ctx2d.beginPath();
                ctx2d.moveTo(particles[i].x, particles[i].y);
                ctx2d.lineTo(particles[j].x, particles[j].y);
                ctx2d.stroke();
            }
        }
    }
    ctx2d.restore();
}

// ── SCOPE (Lissajous) mode ────────────────────────────────
function drawScope(W, H) {
    if (!analyserL || !analyserR) return;
    const bufL = new Float32Array(analyserL.fftSize);
    const bufR = new Float32Array(analyserR.fftSize);
    analyserL.getFloatTimeDomainData(bufL);
    analyserR.getFloatTimeDomainData(bufR);
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) * 0.42;
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(29,185,84,0.7)';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowBlur = 6; ctx2d.shadowColor = '#1DB954';
    ctx2d.beginPath();
    const len = Math.min(bufL.length, bufR.length);
    for (let i = 0; i < len; i++) {
        const x = cx + bufL[i] * scale;
        const y = cy + bufR[i] * scale;
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();
    ctx2d.shadowBlur = 0; ctx2d.restore();
}

// ── Init ──────────────────────────────────────────────────
buildControls();
renderLoop();
