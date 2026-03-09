const fs = require('fs');
let lines = fs.readFileSync('src/app/visualizer/engineHtml.ts', 'utf8').split('\n');
lines[1940] = "    svg.setAttribute('viewBox', \\`0 0 \\${size} \\${size}\\`);";
lines[2016] = "    return \\`M\\${start.x} \\${start.y} A\\${r} \\${r} 0 \\${large} 1 \\${end.x} \\${end.y}\\`;";
lines[2475] = "        ctx2d.strokeStyle = \\`hsla(\\${hue}, 85%, 55%, \\${alpha})\\`;";
fs.writeFileSync('src/app/visualizer/engineHtml.ts', lines.join('\n'));
console.log('Fixed');
