export const engineHtml = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WAVECRAFT — Web Music Visualizer</title>
    <meta name="description"
        content="WAVECRAFT: A premium browser-based audio workstation with real-time 3D/2D visualizations, full EQ, spatial audio, reverb, and more." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet" />
    <style>
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0
        }

        :root {
            --bg-base: #121212;
            --bg-elevated: #1E1E1E;
            --bg-highlight: #2A2A2A;
            --bg-press: #333333;
            --accent: #1DB954;
            --accent-hover: #1ED760;
            --accent-dim: #158A3E;
            --text-primary: #FFFFFF;
            --text-secondary: #B3B3B3;
            --text-muted: #6A6A6A;
            --border: #282828;
            --glow: rgba(29, 185, 84, 0.6);
            --error: #E91429;
            --sp-1: 4px;
            --sp-2: 8px;
            --sp-3: 12px;
            --sp-4: 16px;
            --sp-5: 20px;
            --sp-6: 24px;
            --sp-8: 32px;
            --sp-10: 40px;
            --sp-12: 48px;
            --radius-sm: 4px;
            --radius-md: 8px;
            --radius-lg: 12px;
            --radius-pill: 500px;
            --ease: cubic-bezier(0.3, 0, 0, 1);
            --duration: 0.2s;
            --font-ui: 'DM Sans', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }

        html,
        body {
            width: 100%;
            height: 100%;
            background: var(--bg-base);
            color: var(--text-primary);
            font-family: var(--font-ui);
            overflow: hidden
        }

        body {
            display: flex;
            flex-direction: column
        }

        #app {
            display: flex;
            flex-direction: column;
            height: 100vh;
            width: 100%;
            overflow: hidden
        }

        /* ===== HEADER ===== */
        #topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 64px;
            min-height: 64px;
            padding: 0 var(--sp-8);
            background: var(--bg-base);
            border-bottom: 1px solid var(--border);
            z-index: 100;
            flex-shrink: 0;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: var(--sp-2);
            flex-shrink: 0;
            white-space: nowrap;
        }

        .logo svg {
            flex-shrink: 0;
        }

        .logo-text {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: -0.02em;
            color: var(--text-primary);
        }

        .logo-text span {
            color: var(--accent);
        }

        .track-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 0;
        }

        .track-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 400px;
        }

        .track-artist {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 2px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: var(--sp-3);
            width: 220px;
            justify-content: flex-end;
            flex-shrink: 0;
        }

        .icon-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color var(--duration) var(--ease);
        }

        .icon-btn:hover {
            color: var(--text-primary);
        }

        .icon-btn svg {
            pointer-events: none;
        }

        /* ===== VISUALIZER ZONE ===== */
        #visualizer-zone {
            flex: 1;
            position: relative;
            background: #0A0A0A;
            min-height: 200px;
            overflow: hidden;
            background: radial-gradient(ellipse at center, #121212 0%, #000000 100%);
        }

        #viz-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }

        #mode-tabs {
            position: absolute;
            top: var(--sp-4);
            left: var(--sp-4);
            display: flex;
            gap: var(--sp-2);
            z-index: 10;
        }

        .mode-tab {
            padding: 6px 14px;
            border-radius: var(--radius-pill);
            border: none;
            cursor: pointer;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-secondary);
            transition: all var(--duration) var(--ease);
            font-family: var(--font-ui);
        }

        .mode-tab:hover {
            background: rgba(255, 255, 255, 0.18);
            color: var(--text-primary);
        }

        .mode-tab.active {
            background: var(--accent);
            color: #000;
        }

        /* Fullscreen float bar */
        #fullscreen-bar {
            position: absolute;
            bottom: var(--sp-6);
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(12px);
            border-radius: var(--radius-pill);
            padding: var(--sp-3) var(--sp-6);
            display: none;
            align-items: center;
            gap: var(--sp-4);
            opacity: 0;
            transition: opacity 0.3s var(--ease);
            z-index: 20;
        }

        #fullscreen-bar.visible {
            opacity: 1;
        }

        .fullscreen-active #fullscreen-bar {
            display: flex;
        }

        /* ===== PLAYBACK BAR ===== */
        #playback-bar {
            flex-shrink: 0;
            height: 160px;
            background: #181818;
            border-top: 1px solid var(--border);
            padding: 0 var(--sp-8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: var(--sp-3);
        }

        #seek-row {
            display: flex;
            align-items: center;
            gap: var(--sp-4);
        }

        #seek-track-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-primary);
            min-width: 140px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .time-display {
            font-size: 11px;
            color: var(--text-secondary);
            font-family: var(--font-mono);
            flex-shrink: 0;
            white-space: nowrap;
        }

        #seek-bar-wrap {
            flex: 1;
            position: relative;
            height: 20px;
            display: flex;
            align-items: center;
            cursor: pointer;
        }

        #seek-track {
            width: 100%;
            height: 4px;
            background: var(--bg-highlight);
            border-radius: 2px;
            position: relative;
            overflow: visible;
        }

        #seek-fill {
            height: 100%;
            background: var(--accent);
            border-radius: 2px;
            width: 0%;
            transition: none;
            position: relative;
        }

        #seek-thumb {
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            opacity: 0;
            transition: opacity var(--duration) var(--ease);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        #seek-bar-wrap:hover #seek-thumb {
            opacity: 1;
        }

        #waveform-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.3;
            pointer-events: none;
        }

        #transport-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .transport-left,
        .transport-right {
            display: flex;
            align-items: center;
            gap: var(--sp-6);
        }

        .transport-center {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .watermark {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.2em;
            color: var(--bg-highlight);
            text-transform: uppercase;
        }

        .ctrl-icon {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: var(--sp-2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color var(--duration) var(--ease), transform var(--duration) var(--ease);
        }

        .ctrl-icon:hover {
            color: var(--text-primary);
            transform: scale(1.1);
        }

        .ctrl-icon.active {
            color: var(--accent);
        }

        #play-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--accent);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--duration) var(--ease);
            color: #000;
            flex-shrink: 0;
        }

        #play-btn:hover {
            background: var(--accent-hover);
            transform: scale(1.06);
        }

        #play-btn:active {
            transform: scale(0.96);
        }

        #play-btn.playing {
            animation: play-pulse 1.5s ease-out infinite;
        }

        @keyframes play-pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.5);
            }

            70% {
                box-shadow: 0 0 0 14px rgba(29, 185, 84, 0);
            }

            100% {
                box-shadow: 0 0 0 0 rgba(29, 185, 84, 0);
            }
        }

        .volume-cluster {
            display: flex;
            align-items: center;
            gap: var(--sp-3);
        }

        #vol-slider {
            width: 90px;
        }

        /* ===== UPLOAD ZONE ===== */
        #upload-zone {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: var(--sp-4);
            z-index: 50;
            background: rgba(10, 10, 10, 0.92);
            backdrop-filter: blur(4px);
        }

        #drop-area {
            border: 2px dashed var(--accent);
            border-radius: var(--radius-md);
            padding: 48px 64px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--sp-5);
            cursor: pointer;
            transition: all var(--duration) var(--ease);
            background: rgba(29, 185, 84, 0.04);
        }

        #drop-area:hover,
        #drop-area.drag-over {
            background: rgba(29, 185, 84, 0.1);
            border-color: var(--accent-hover);
            transform: scale(1.01);
        }

        #drop-area p {
            font-size: 16px;
            color: var(--text-secondary);
        }

        #drop-area a {
            color: var(--accent);
            text-decoration: underline;
            cursor: pointer;
        }

        #file-input {
            display: none;
        }

        .upload-hint {
            font-size: 12px;
            color: var(--text-muted);
        }

        #stream-import-wrap {
            display: flex;
            align-items: center;
            background: var(--bg-highlight);
            border-radius: var(--radius-pill);
            padding: 4px 4px 4px 16px;
            width: 100%;
            max-width: 320px;
            margin-top: var(--sp-2);
            border: 1px solid transparent;
            transition: border-color 0.2s;
        }

        #stream-import-wrap:focus-within {
            border-color: var(--accent);
        }

        #stream-input {
            background: transparent;
            border: none;
            color: var(--text-primary);
            font-size: 13px;
            flex: 1;
            outline: none;
            font-family: var(--font-ui);
        }

        #stream-input::placeholder {
            color: var(--text-muted);
        }

        #stream-btn {
            background: var(--accent);
            color: #000;
            border: none;
            border-radius: var(--radius-pill);
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            margin-left: 8px;
            transition: all 0.2s;
        }

        #stream-btn:hover {
            background: var(--accent-hover);
            transform: scale(1.05);
        }

        #stream-loading {
            display: none;
            font-size: 13px;
            color: var(--accent);
            margin-top: var(--sp-2);
            font-weight: 600;
        }

        /* ===== CONTROLS PANEL ===== */
        #controls-panel {
            flex-shrink: 0;
            height: 220px;
            background: var(--bg-base);
            border-top: 1px solid var(--border);
            display: flex;
            overflow-x: auto;
            padding: var(--sp-4) 0;
            scrollbar-width: thin;
            scrollbar-color: var(--text-muted) var(--bg-highlight);
        }

        #controls-panel::-webkit-scrollbar {
            height: 4px;
        }

        #controls-panel::-webkit-scrollbar-track {
            background: var(--bg-highlight);
        }

        #controls-panel::-webkit-scrollbar-thumb {
            background: var(--accent);
            border-radius: 2px;
        }

        .ctrl-panel {
            flex-shrink: 0;
            padding: 0 var(--sp-6);
            display: flex;
            flex-direction: column;
            gap: var(--sp-4);
            border-right: 1px solid var(--border);
            min-width: 160px;
        }

        .ctrl-panel:last-child {
            border-right: none;
        }

        .panel-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--text-secondary);
            flex-shrink: 0;
        }

        .panel-body {
            display: flex;
            align-items: flex-end;
            gap: var(--sp-4);
            flex: 1;
            min-height: 0;
        }

        #eq-body {
            align-items: stretch;
            height: 100%;
        }

        /* ===== RANGE INPUT BASE ===== */
        input[type=range] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
        }

        input[type=range]::-webkit-slider-track {
            height: 4px;
            border-radius: 2px;
            background: var(--bg-highlight);
        }

        input[type=range]::-moz-range-track {
            height: 4px;
            border-radius: 2px;
            background: var(--bg-highlight);
        }

        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            margin-top: -4px;
            transition: transform var(--duration) var(--ease);
        }

        input[type=range]::-webkit-slider-thumb:hover {
            transform: scale(1.3);
        }

        input[type=range]::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        #vol-slider::-webkit-slider-track,
        .h-slider::-webkit-slider-track {
            background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--pct, 50%), var(--bg-highlight) var(--pct, 50%));
        }

        /* Vertical sliders */
        .v-slider-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--sp-2);
            flex: 1;
            justify-content: center;
        }

        .v-slider-label {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.06em;
            flex-shrink: 0;
        }

        .v-slider-val {
            font-size: 10px;
            color: var(--text-secondary);
            font-family: var(--font-mono);
            flex-shrink: 0;
        }

        .v-slider {
            -webkit-appearance: none;
            appearance: none;
            writing-mode: vertical-lr;
            direction: rtl;
            width: 20px;
            height: 100px;
            background: transparent;
            border-radius: 2px;
            cursor: pointer;
            outline: none;
            flex-shrink: 0;
        }

        .v-slider::-webkit-slider-runnable-track {
            width: 4px;
            border-radius: 2px;
            background: linear-gradient(to top, var(--accent) 0%, var(--accent) var(--pct, 50%), var(--bg-highlight) var(--pct, 50%));
        }

        .v-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
            margin-left: -5px;
            transition: transform var(--duration) var(--ease);
        }

        .v-slider::-webkit-slider-thumb:hover {
            transform: scale(1.3);
        }

        .v-slider::-moz-range-track {
            width: 4px;
            border-radius: 2px;
            background: var(--bg-highlight);
        }

        .v-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #fff;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
        }

        /* ===== KNOB ===== */
        .knob-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            cursor: ns-resize;
            user-select: none;
        }

        .knob {
            border-radius: 50%;
            background: radial-gradient(circle at 40% 35%, #2A2A2A, #1A1A1A);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: box-shadow var(--duration) var(--ease);
        }

        .knob:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 0 0 2px var(--accent);
        }

        .knob svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .knob-center {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.25);
            z-index: 1;
        }

        .knob-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-secondary);
        }

        .knob-val {
            font-size: 10px;
            color: var(--text-secondary);
            font-family: var(--font-mono);
            margin-top: -3px;
        }

        /* ===== TOGGLE ===== */
        .toggle-wrap {
            display: flex;
            align-items: center;
            gap: var(--sp-3);
        }

        .toggle-label {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            white-space: nowrap;
        }

        .toggle {
            position: relative;
            width: 36px;
            height: 20px;
            flex-shrink: 0;
            cursor: pointer;
        }

        .toggle input {
            opacity: 0;
            width: 0;
            height: 0;
            position: absolute;
        }

        .toggle-track {
            position: absolute;
            inset: 0;
            border-radius: var(--radius-pill);
            background: var(--bg-highlight);
            transition: background 0.15s var(--ease);
        }

        .toggle input:checked~.toggle-track {
            background: var(--accent);
        }

        .toggle-thumb {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #fff;
            transition: transform 0.15s var(--ease);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        .toggle input:checked~.toggle-thumb {
            transform: translateX(16px);
        }

        /* ===== PEAK METER ===== */
        .peak-meter-wrap {
            display: flex;
            align-items: flex-end;
            gap: 4px;
            height: 80px;
        }

        .meter-bar {
            width: 8px;
            height: 100%;
            border-radius: 2px;
            overflow: hidden;
            display: flex;
            flex-direction: column-reverse;
            gap: 1px;
            background: var(--bg-highlight);
            position: relative;
        }

        .meter-fill {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--accent);
            border-radius: 2px;
            transition: height 0.05s linear;
        }

        .meter-peak {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--error);
            border-radius: 1px;
            transition: bottom 0.05s linear;
        }

        .peak-label {
            font-size: 9px;
            color: var(--text-muted);
            font-family: var(--font-mono);
            text-align: center;
            margin-top: 2px;
        }

        /* ===== PRESETS ===== */
        #panel-presets {
            min-width: 220px;
        }

        .preset-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--sp-2);
        }

        .preset-btn {
            padding: 8px 12px;
            border-radius: var(--radius-pill);
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--text-primary);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all var(--duration) var(--ease);
            font-family: var(--font-ui);
        }

        .preset-btn:hover {
            background: #fff;
            color: #000;
        }

        .preset-btn.active {
            background: var(--accent);
            color: #000;
            border-color: var(--accent);
        }

        .preset-actions {
            display: flex;
            gap: var(--sp-2);
            align-items: center;
            margin-top: var(--sp-2);
        }

        .save-btn {
            padding: 6px 14px;
            border-radius: var(--radius-pill);
            background: transparent;
            border: 1px solid var(--accent);
            color: var(--accent);
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            font-family: var(--font-ui);
            transition: all var(--duration) var(--ease);
        }

        .save-btn:hover {
            background: var(--accent);
            color: #000;
        }

        .preset-select {
            flex: 1;
            background: var(--bg-elevated);
            border: 1px solid var(--accent);
            color: var(--text-primary);
            border-radius: var(--radius-sm);
            font-size: 12px;
            padding: 5px 8px;
            font-family: var(--font-ui);
            outline: none;
            cursor: pointer;
        }

        /* ===== SPATIAL PANEL ===== */
        #spatial-indicator {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid var(--border);
            background: var(--bg-elevated);
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
        }

        #spatial-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 8px var(--accent);
            transition: transform 0.1s linear;
        }

        /* ===== HORIZONTAL SLIDER WRAP ===== */
        .h-slider-wrap {
            display: flex;
            flex-direction: column;
            gap: 4px;
            width: 100%;
        }

        .h-slider-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .h-slider-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-secondary);
        }

        .h-slider-val {
            font-size: 10px;
            color: var(--text-secondary);
            font-family: var(--font-mono);
        }

        .h-slider {
            width: 100%;
        }

        /* ===== FOOTER ===== */
        #footer-credits {
            position: absolute;
            bottom: var(--sp-2);
            right: var(--sp-4);
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted);
            letter-spacing: 0.04em;
            z-index: 100;
            pointer-events: none;
        }

        #footer-credits a {
            color: var(--text-secondary);
            text-decoration: underline;
            pointer-events: auto;
            transition: color 0.2s;
        }

        #footer-credits a:hover {
            color: var(--accent);
        }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(8px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse-glow {

            0%,
            100% {
                box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.4);
            }

            50% {
                box-shadow: 0 0 20px 4px rgba(29, 185, 84, 0.25);
            }
        }

        .fade-in {
            animation: fadeInUp 0.4s var(--ease) both;
        }

        .fade-in-2 {
            animation: fadeInUp 0.4s var(--ease) 0.1s both;
        }

        .fade-in-3 {
            animation: fadeInUp 0.4s var(--ease) 0.2s both;
        }

        /* ===== FULLSCREEN ===== */
        :fullscreen #topbar,
        :fullscreen #playback-bar,
        :fullscreen #controls-panel {
            display: none !important;
        }

        :fullscreen #visualizer-zone {
            height: 100vh !important;
        }

        :fullscreen #fullscreen-bar {
            display: flex !important;
        }

        /* ===== MOBILE WARNING ===== */
        #mobile-warning {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: var(--bg-base);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--sp-6);
            padding: var(--sp-8);
            text-align: center;
        }

        @media(max-width:600px) {
            #mobile-warning {
                display: flex;
            }

            #app {
                display: none;
            }
        }
    </style>
</head>

<body>
    <div id="mobile-warning">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <p style="font-size:20px;font-weight:700;">Best experienced on desktop</p>
        <p style="color:var(--text-secondary);font-size:14px;">WAVECRAFT requires a wider screen for the full audio
            workstation experience.</p>
    </div>

    <div id="app">
        <!-- ZONE 1: TOP HEADER -->
        <header id="topbar">
            <div class="logo fade-in">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect width="28" height="28" rx="6" fill="#1DB954" opacity="0.15" />
                    <rect x="3" y="14" width="3" height="10" rx="1.5" fill="#1DB954" />
                    <rect x="8" y="9" width="3" height="15" rx="1.5" fill="#1DB954" />
                    <rect x="13" y="5" width="3" height="19" rx="1.5" fill="#1DB954" />
                    <rect x="18" y="11" width="3" height="13" rx="1.5" fill="#1DB954" />
                    <rect x="23" y="16" width="3" height="8" rx="1.5" fill="#1DB954" />
                </svg>
                <span class="logo-text">WAVE<span>CRAFT</span></span>
                <span style="color:#444;margin-left:10px;font-size:13px;">·</span>
                <a href="https://rishabhj.in" target="_blank" rel="noopener" style="
                    margin-left:8px;
                    font-size:12px;
                    font-weight:600;
                    color:#1DB954;
                    text-decoration:none;
                    letter-spacing:0.02em;
                    opacity:0.85;
                    transition:opacity 0.2s;
                " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'">by Rishabh</a>
            </div>
            <div class="track-info fade-in-2">
                <div class="track-title" id="header-track-title">No track loaded</div>
                <div class="track-artist" id="header-track-artist">Upload a file to begin</div>
            </div>
            <div class="header-actions fade-in-3">
                <button class="icon-btn" id="fullscreen-btn" title="Fullscreen">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <path
                            d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                    </svg>
                </button>
                <button class="icon-btn" title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.8">
                        <circle cx="12" cy="12" r="3" />
                        <path
                            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                </button>
            </div>
        </header>

        <!-- ZONE 2: VISUALIZER -->
        <main id="visualizer-zone">
            <canvas id="viz-canvas"></canvas>
            <div id="mode-tabs">
                <button class="mode-tab active" data-mode="bars">Bars</button>
                <button class="mode-tab" data-mode="wave">Wave</button>
                <button class="mode-tab" data-mode="radial">Radial</button>
                <button class="mode-tab" data-mode="particles">Particles</button>
                <button class="mode-tab" data-mode="scope">Scope</button>
            </div>
            <!-- Upload overlay -->
            <div id="upload-zone">
                <div id="drop-area">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Drop your audio file here</p>
                    <p style="font-size:13px;">or <a id="browse-link">browse files</a></p>
                    <p class="upload-hint">MP3 · WAV · FLAC · OGG · AAC</p>
                    <div id="stream-import-wrap">
                        <input type="text" id="stream-input" placeholder="Paste SoundCloud / Audio URL..." />
                        <button id="stream-btn">Import</button>
                    </div>
                    <div id="stream-loading">Loading stream...</div>
                </div>
                <input type="file" id="file-input" accept=".mp3,.wav,.flac,.ogg,.aac,audio/*" />
            </div>
            <!-- Fullscreen float bar -->
            <div id="fullscreen-bar">
                <button class="ctrl-icon" id="fs-play-btn"
                    style="background:var(--accent);color:#000;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;">
                    <svg id="fs-play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                    </svg>
                </button>
                <div style="display:flex;align-items:center;gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)"
                        stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                    </svg>
                    <input type="range" id="fs-vol-slider" min="0" max="150" value="80" style="width:80px;"
                        class="h-slider" />
                </div>
            </div>
        </main>

        <!-- ZONE 3: PLAYBACK BAR -->
        <section id="playback-bar">
            <div id="seek-row">
                <div id="seek-track-name">—</div>
                <span class="time-display" id="time-current">0:00</span>
                <div id="seek-bar-wrap">
                    <canvas id="waveform-canvas"></canvas>
                    <div id="seek-track">
                        <div id="seek-fill">
                            <div id="seek-thumb"></div>
                        </div>
                    </div>
                </div>
                <span class="time-display" id="time-total">0:00</span>
            </div>
            <div id="transport-row">
                <div class="transport-left">
                    <button class="ctrl-icon" id="shuffle-btn" title="Shuffle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8">
                            <polyline points="16 3 21 3 21 8" />
                            <line x1="4" y1="20" x2="21" y2="3" />
                            <polyline points="21 16 21 21 16 21" />
                            <line x1="15" y1="15" x2="21" y2="21" />
                        </svg>
                    </button>
                    <button class="ctrl-icon" title="Previous">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="19,20 9,12 19,4" />
                            <rect x="5" y="4" width="2" height="16" />
                        </svg>
                    </button>
                    <button id="play-btn" title="Play/Pause">
                        <svg id="play-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </button>
                    <button class="ctrl-icon" title="Next">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,4 15,12 5,20" />
                            <rect x="17" y="4" width="2" height="16" />
                        </svg>
                    </button>
                    <button class="ctrl-icon" id="loop-btn" title="Loop">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="1.8">
                            <polyline points="17 1 21 5 17 9" />
                            <path d="M3 11V9a4 4 0 014-4h14" />
                            <polyline points="7 23 3 19 7 15" />
                            <path d="M21 13v2a4 4 0 01-4 4H3" />
                        </svg>
                    </button>
                </div>
                <div class="transport-center"><span class="watermark">WAVECRAFT</span></div>
                <div class="transport-right">
                    <div class="volume-cluster">
                        <button class="ctrl-icon" id="mute-btn" title="Mute">
                            <svg id="vol-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="1.8">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                            </svg>
                        </button>
                        <input type="range" id="vol-slider" min="0" max="150" value="80" class="h-slider" />
                    </div>
                </div>
            </div>
        </section>

        <!-- ZONE 4: CONTROLS PANEL -->
        <section id="controls-panel">
            <!-- Panel 1: EQ -->
            <div class="ctrl-panel" id="panel-eq" style="min-width:300px;">
                <div class="panel-label">DJ Equalizer</div>
                <div class="panel-body" id="eq-body">
                    <!-- JS will insert sliders -->
                </div>
            </div>

            <!-- Panel 2: Spatial -->
            <div class="ctrl-panel" id="panel-spatial" style="min-width:200px;">
                <div class="panel-label">Spatial</div>
                <div class="panel-body" style="flex-direction:column;align-items:flex-start;gap:10px;">
                    <div style="display:flex;gap:16px;align-items:center;">
                        <div id="width-knob-container"></div>
                        <div id="spatial-indicator">
                            <div id="spatial-dot"></div>
                        </div>
                    </div>
                    <div id="toggle-3d" class="toggle-wrap">
                        <label class="toggle"><input type="checkbox" id="chk-3d" /><span
                                class="toggle-track"></span><span class="toggle-thumb"></span></label>
                        <span class="toggle-label">3D HRTF</span>
                    </div>
                    <div id="toggle-surround" class="toggle-wrap">
                        <label class="toggle"><input type="checkbox" id="chk-surround" /><span
                                class="toggle-track"></span><span class="toggle-thumb"></span></label>
                        <span class="toggle-label">Surround</span>
                    </div>
                </div>
            </div>

            <!-- Panel 3: Dynamics -->
            <div class="ctrl-panel" id="panel-dynamics" style="min-width:220px;">
                <div class="panel-label">Dynamics</div>
                <div class="panel-body" style="flex-direction:column;gap:8px;">
                    <div id="comp-threshold-wrap"></div>
                    <div id="comp-ratio-wrap"></div>
                    <div style="display:flex;gap:12px;">
                        <div id="comp-attack-knob"></div>
                        <div id="comp-release-knob"></div>
                    </div>
                </div>
            </div>

            <!-- Panel 4: FX -->
            <div class="ctrl-panel" id="panel-fx" style="min-width:220px;">
                <div class="panel-label">FX</div>
                <div class="panel-body" style="flex-direction:column;gap:8px;">
                    <div id="reverb-size-wrap" style="display:flex;gap:12px;align-items:center;">
                        <div id="reverb-knob-container"></div>
                        <div id="reverb-dry-wrap" style="flex:1;"></div>
                    </div>
                    <div id="delay-time-wrap"></div>
                    <div id="delay-fb-wrap"></div>
                </div>
            </div>

            <!-- Panel 5: Pan & Gain -->
            <div class="ctrl-panel" id="panel-pan" style="min-width:200px;">
                <div class="panel-label">Pan &amp; Gain</div>
                <div class="panel-body" style="gap:16px;align-items:flex-end;">
                    <div id="pan-knob-container"></div>
                    <div id="gain-knob-container"></div>
                    <div>
                        <div class="peak-meter-wrap">
                            <div class="meter-bar">
                                <div class="meter-fill" id="meter-l"></div>
                                <div class="meter-peak" id="peak-l" style="bottom:70%;"></div>
                            </div>
                            <div class="meter-bar">
                                <div class="meter-fill" id="meter-r"></div>
                                <div class="meter-peak" id="peak-r" style="bottom:70%;"></div>
                            </div>
                        </div>
                        <div style="display:flex;gap:4px;justify-content:center;margin-top:4px;">
                            <span class="peak-label">L</span><span class="peak-label">R</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel 6: Presets -->
            <div class="ctrl-panel" id="panel-presets">
                <div class="panel-label">Presets</div>
                <div class="panel-body" style="flex-direction:column;gap:8px;">
                    <div class="preset-grid">
                        <button class="preset-btn active" data-preset="FLAT">Flat</button>
                        <button class="preset-btn" data-preset="BASS_BOOST">Bass Boost</button>
                        <button class="preset-btn" data-preset="CLARITY">Clarity</button>
                        <button class="preset-btn" data-preset="CONCERT">Concert</button>
                        <button class="preset-btn" data-preset="ROCK">Rock</button>
                        <button class="preset-btn" data-preset="POP">Pop</button>
                        <button class="preset-btn" data-preset="JAZZ">Jazz</button>
                        <button class="preset-btn" data-preset="LOFI">Lo-Fi</button>
                        <button class="preset-btn" data-preset="VOCAL">Vocal</button>
                        <button class="preset-btn" data-preset="CLUB">Club</button>
                    </div>
                    <div class="preset-actions" style="flex-wrap:wrap;">
                        <button class="save-btn" id="save-preset-btn">+ Save</button>
                        <button class="save-btn" id="reset-preset-btn"
                            style="border-color:var(--text-muted);color:var(--text-primary);">Reset</button>
                        <select class="preset-select" id="preset-select">
                            <option value="">Load saved…</option>
                        </select>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <script>
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
    CONCERT: { sub: 4, bass: 2, mid: 0, pres: 4, treble: 2, reverb: 0.6, delay: 150, feedback: 40, width: 1.5, pan: 0, gain: 80 },
    ROCK: { sub: 5, bass: 6, mid: -2, pres: 5, treble: 7, reverb: 0.2, delay: 0, feedback: 0, width: 1.3, pan: 0, gain: 85 },
    POP: { sub: 2, bass: 4, mid: 2, pres: 5, treble: 4, reverb: 0.1, delay: 0, feedback: 0, width: 1.2, pan: 0, gain: 80 },
    JAZZ: { sub: 2, bass: 3, mid: -1, pres: 2, treble: 3, reverb: 0.35, delay: 80, feedback: 25, width: 1.1, pan: 0, gain: 78 },
    LOFI: { sub: 6, bass: 5, mid: -3, pres: -4, treble: -6, reverb: 0.4, delay: 200, feedback: 30, width: 0.8, pan: 0, gain: 75 },
    VOCAL: { sub: -5, bass: -3, mid: 5, pres: 7, treble: 3, reverb: 0.15, delay: 0, feedback: 0, width: 1, pan: 0, gain: 80 },
    CLUB: { sub: 8, bass: 9, mid: 0, pres: 3, treble: 3, reverb: 0.5, delay: 0, feedback: 0, width: 1.6, pan: 0, gain: 90 },
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
function fmtTime(s) { const m = Math.floor(s / 60); return \`\${m}:\${String(Math.floor(s % 60)).padStart(2, '0')}\`; }
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
            const name = file.name.replace(/\\.[^.]+$/, ''); 
            headerTitle.textContent = name;
            headerArtist.textContent = \`\${fmtTime(fileDuration)} · \${(file.size / 1048576).toFixed(1)} MB\`;
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

    // Cleanup any existing source before creating a new one
    if (sourceNode) {
        try {
            sourceNode.stop();
            sourceNode.disconnect();
        } catch (e) { }
    }

    if (isStream && streamAudioEl) {
        streamAudioEl.play();
        isPlaying = true;
        updatePlayUI();
        return;
    }

    // Must recreate the buffer source each time we play
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = isLooping;
    sourceNode.connect(subFilter); // Connect to first EQ node
    sourceNode.start(0, offset);

    startTime = audioCtx.currentTime - offset;
    pauseOffset = offset;
    isPlaying = true;
    updatePlayUI();

    // Handle natural end or loop
    sourceNode.onended = () => {
        // If it was stopped manually (we set isPlaying=false before stop()), ignore.
        if (!isPlaying) return;
        if (isLooping) return;
        isPlaying = false;
        pauseOffset = 0;
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
        isPlaying = false; // Set this BEFORE stopping so onended ignores it
        if (sourceNode) {
            try {
                sourceNode.stop();
                sourceNode.disconnect();
            } catch (e) { }
        }
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
    timeCurrent.textContent = fmtTime(newTime);
    seekFill.style.width = (pct * 100) + '%';
    // Whether playing or paused, restart from new position
    if (isPlaying) {
        startPlayback(newTime);
    } else {
        // Even when paused, update the visual position
        timeCurrent.textContent = fmtTime(newTime);
    }
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
browseLink.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { 
    if (e.target.files[0]) {
        loadAudioFile(e.target.files[0]); 
        fileInput.value = '';
    } 
});

// Global Drag & Drop handling for better UX
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());

dropArea.addEventListener('dragover', e => { 
    e.preventDefault(); 
    e.stopPropagation();
    dropArea.classList.add('drag-over'); 
});
dropArea.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('drag-over');
});
dropArea.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('drag-over');
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio')) { loadAudioFile(file); }
});


streamBtn.addEventListener('click', () => {
    const url = streamInput.value.trim();
    if (!url) return;
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    streamLoading.style.display = 'block';

    // Use an audio tag to stream the URL
    if (streamAudioEl) {
        streamAudioEl.pause();
        streamAudioEl.src = '';
    }
    if (sourceNode) {
        try { sourceNode.stop(); } catch (e) { }
    }

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
        const domainMatch = url.match(/^https?:\\/\\/([^\\/]+)/);
        headerArtist.textContent = domainMatch ? domainMatch[1] : 'Remote Stream';
        seekTrackName.textContent = 'Remote Stream';
        const W = document.getElementById('waveform-canvas').width;
        const H = document.getElementById('waveform-canvas').height;
        const cx = document.getElementById('waveform-canvas').getContext('2d');
        cx.clearRect(0, 0, W, H);

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
    svg.setAttribute('viewBox', \`0 0 \${size} \${size}\`);

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
    return \`M\${start.x} \${start.y} A\${r} \${r} 0 \${large} 1 \${end.x} \${end.y}\`;
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

                        // ── BARS mode (rewritten) ────────────────────────────────────
                        const peakBars = new Float32Array(128); // Peak hold values per bar
                        function drawBars(W, H) {
                            const bins = 128;
                            const gap = 2;
                            const barW = Math.floor((W - gap * (bins - 1)) / bins);
                            const halfH = H / 2;
                            ctx2d.save();
                            ctx2d.clearRect(0, 0, W, H);
                            for (let i = 0; i < bins; i++) {
                                // Raise to a power to increase dynamic range
                                const raw = freqData[i] / 255;
                                const val = Math.pow(raw, 1.8);
                                const barH = Math.max(2, val * halfH * 0.95);
                                const x = i * (barW + gap);

                                // Peak hold logic
                                if (val * halfH * 0.95 > peakBars[i]) {
                                    peakBars[i] = val * halfH * 0.95;
                                } else {
                                    peakBars[i] = Math.max(0, peakBars[i] - 1.5);
                                }

                                // Gradient per bar from bottom
                                const grad = ctx2d.createLinearGradient(0, halfH + barH, 0, halfH);
                                grad.addColorStop(0, \`hsl(141, 80%, 35%)\`);
        grad.addColorStop(0.6, \`hsl(141, 75%, 50%)\`);
        grad.addColorStop(1, val > 0.7 ? '#fff' : '#a3f0c1');
        ctx2d.fillStyle = grad;

        // Bottom bars
        ctx2d.fillRect(x, halfH, barW, barH);
        // Top mirror
        ctx2d.fillRect(x, halfH - barH, barW, barH);

        // Peak indicator line
        if (peakBars[i] > 2) {
            ctx2d.fillStyle = val > 0.8 ? '#ff4444' : '#22ff88';
            ctx2d.fillRect(x, halfH - peakBars[i] - 2, barW, 2);
            ctx2d.fillRect(x, halfH + peakBars[i], barW, 2);
        }
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

// ── RADIAL mode (full centered circle) ────────────────────────
// We use the global freqData (already filled), not a new buffer
function drawRadial(W, H) {
    const cx = W / 2, cy = H / 2;
    const minDim = Math.min(W, H);
    const baseRadius = minDim * 0.22;
    const bins = 256; // number of radial spokes
    const time = performance.now() * 0.0002;

    ctx2d.save();
    ctx2d.clearRect(0, 0, W, H);
    ctx2d.translate(cx, cy);
    ctx2d.rotate(time); // gentle auto-rotation

    // Draw inner filled circle
    ctx2d.beginPath();
    ctx2d.arc(0, 0, baseRadius * 0.6, 0, Math.PI * 2);
    ctx2d.fillStyle = 'rgba(29,185,84,0.06)';
    ctx2d.fill();

    // Draw frequency spokes around the circle
    for (let i = 0; i < bins; i++) {
        const angle = (i / bins) * Math.PI * 2;
        const freqIndex = Math.floor((i / bins) * freqData.length * 0.75);
        const val = Math.pow(freqData[freqIndex] / 255, 1.2);
        const len = val * minDim * 0.35;
        const r1 = baseRadius;
        const r2 = baseRadius + len;
        const cos = Math.cos(angle), sin = Math.sin(angle);

        const hue = 141 + val * 60; // green -> cyan at high energy
        const alpha = 0.4 + val * 0.6;
        ctx2d.beginPath();
        ctx2d.moveTo(cos * r1, sin * r1);
        ctx2d.lineTo(cos * r2, sin * r2);
        ctx2d.strokeStyle = \`hsla(\${hue}, 85%, 55%, \${alpha})\`;
        ctx2d.lineWidth = Math.max(1, val * 3);
        ctx2d.shadowBlur = val > 0.5 ? 8 : 0;
        ctx2d.shadowColor = '#1DB954';
        ctx2d.stroke();
    }

    // Outer glow ring
    ctx2d.beginPath();
    ctx2d.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx2d.strokeStyle = 'rgba(29,185,84,0.4)';
    ctx2d.lineWidth = 1.5;
    ctx2d.shadowBlur = 10;
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
        c: \`rgba(29,185,84,\${0.4 + Math.random() * 0.6})\`
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
                ctx2d.strokeStyle = \`rgba(29, 185, 84, \${alpha})\`;
                ctx2d.beginPath();
                ctx2d.moveTo(particles[i].x, particles[i].y);
                ctx2d.lineTo(particles[j].x, particles[j].y);
                ctx2d.stroke();
            }
        }
    }
    ctx2d.restore();
}

// ── SCOPE (Lissajous) mode (rewritten for brightness) ────────────────────────
function drawScope(W, H) {
    if (!analyserL || !analyserR) return;
    const bufL = new Float32Array(analyserL.fftSize);
    const bufR = new Float32Array(analyserR.fftSize);
    analyserL.getFloatTimeDomainData(bufL);
    analyserR.getFloatTimeDomainData(bufR);
    const cx = W / 2, cy = H / 2;
    // Use most of the canvas area
    const scale = Math.min(W, H) * 0.48;
    const len = Math.min(bufL.length, bufR.length);

    ctx2d.save();
    ctx2d.clearRect(0, 0, W, H);

    // Draw a thin grid for reference
    ctx2d.strokeStyle = 'rgba(29,185,84,0.08)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(cx, 0); ctx2d.lineTo(cx, H);
    ctx2d.moveTo(0, cy); ctx2d.lineTo(W, cy);
    ctx2d.stroke();

    // Outer reference circle
    ctx2d.beginPath();
    ctx2d.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx2d.strokeStyle = 'rgba(29,185,84,0.05)';
    ctx2d.stroke();

    // Draw the Lissajous figure with glow
    ctx2d.shadowBlur = 14;
    ctx2d.shadowColor = '#1DB954';
    ctx2d.strokeStyle = 'rgba(29,185,84,0.9)';
    ctx2d.lineWidth = 1.5;
    ctx2d.beginPath();
    for (let i = 0; i < len; i++) {
        const x = cx + bufL[i] * scale;
        const y = cy + bufR[i] * scale;
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();

    // Second pass with a brighter inner glow
    ctx2d.shadowBlur = 6;
    ctx2d.strokeStyle = 'rgba(180,255,200,0.5)';
    ctx2d.lineWidth = 0.5;
    ctx2d.beginPath();
    for (let i = 0; i < len; i++) {
        const x = cx + bufL[i] * scale;
        const y = cy + bufR[i] * scale;
        i === 0 ? ctx2d.moveTo(x, y) : ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();

    ctx2d.shadowBlur = 0;
    ctx2d.restore();
}

// ── Init ──────────────────────────────────────────────────
buildControls();
renderLoop();

</script>
</body>

</html>`;
