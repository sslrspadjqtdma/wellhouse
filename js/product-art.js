// 사진이 없는 상품용 빈티지 일러스트를 SVG로 그려 이미지 주소(data URI)로 돌려준다.

const svgUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const escapeXml = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => {
    const base = (value >> shift) & 255;
    const target = amount < 0 ? 0 : 255;
    return Math.round(base + (target - base) * Math.abs(amount));
  };
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}

function zigzag(y, from = 150, to = 250, step = 10, height = 10) {
  let path = `M${from} ${y}`;
  for (let x = from + step, up = true; x <= to; x += step, up = !up) path += ` L${x} ${up ? y - height : y}`;
  return path;
}

const outline = (dark) => `stroke="${dark}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const stitch = (color) => `fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5 5"`;

const longSleeveBody = 'M142 122 L174 106 Q200 128 226 106 L258 122 L296 150 L322 330 L290 338 L262 196 L260 370 L140 370 L138 196 L110 338 L78 330 L104 150 Z';

const hoodieBase = (c, d, l) => `
  <path d="M158 132 Q156 66 200 62 Q244 66 242 132 Z" fill="${c}" ${outline(d)}/>
  <path d="${longSleeveBody}" fill="${c}" ${outline(d)}/>
  <path d="M174 124 Q200 84 226 124 Q200 140 174 124 Z" fill="${d}"/>
  <path d="M140 350 L260 350 M86 312 L114 306 M314 312 L286 306" ${stitch(l)}/>`;

const drawings = {
  tshirt: (c, d, l) => `
    <path d="M140 125 L172 108 Q200 132 228 108 L260 125 L312 165 L284 205 L258 188 L258 372 L142 372 L142 188 L116 205 L88 165 Z" fill="${c}" ${outline(d)}/>
    <path d="M172 108 Q200 138 228 108" fill="none" ${outline(d)}/>
    <path d="M150 358 L250 358 M96 172 L120 192 M304 172 L280 192" ${stitch(l)}/>
    <rect x="166" y="210" width="68" height="52" rx="4" fill="none" stroke="${l}" stroke-width="3"/>
    <circle cx="200" cy="236" r="13" fill="${l}"/>`,
  shorts: (c, d, l) => `
    <path d="M128 150 L272 150 L290 312 L212 318 L200 226 L188 318 L110 312 Z" fill="${c}" ${outline(d)}/>
    <path d="M128 150 L272 150 L273 172 L127 172 Z" fill="${d}" opacity=".35"/>
    <path d="M200 172 L200 226 M118 296 L188 300 M282 296 L212 300" ${stitch(l)}/>
    <path d="M190 172 L186 205 M210 172 L214 205" stroke="${l}" stroke-width="3" stroke-linecap="round"/>`,
  sweater: (c, d, l) => `
    <path d="${longSleeveBody}" fill="${c}" ${outline(d)}/>
    <path d="M174 106 Q200 140 226 106" fill="none" stroke="${d}" stroke-width="6"/>
    <path d="M140 348 L260 348 M84 312 L114 305 M316 312 L286 305" stroke="${d}" stroke-width="5" opacity=".45"/>
    <path d="${zigzag(225)}" fill="none" stroke="${l}" stroke-width="4"/>
    <path d="${zigzag(255)}" fill="none" stroke="${l}" stroke-width="4"/>
    <path d="M150 285 L250 285" stroke="${l}" stroke-width="4" stroke-dasharray="4 8"/>`,
  hoodie: (c, d, l) => `${hoodieBase(c, d, l)}
    <path d="M160 285 L240 285 L254 336 L146 336 Z" fill="none" ${outline(d)}/>
    <path d="M190 130 L187 182 M210 130 L213 182" stroke="${l}" stroke-width="4" stroke-linecap="round"/>`,
  zipup: (c, d, l) => `${hoodieBase(c, d, l)}
    <path d="M150 290 L186 290 L186 336 L146 336 Z M250 290 L214 290 L214 336 L254 336 Z" fill="none" ${outline(d)}/>
    <path d="M200 128 L200 370" stroke="${d}" stroke-width="4"/>
    <path d="M200 128 L200 370" stroke="${l}" stroke-width="2" stroke-dasharray="2 4"/>
    <rect x="194" y="150" width="12" height="22" rx="3" fill="${l}" ${outline(d)}/>`,
  jeans: (c, d, l) => `
    <path d="M146 92 L254 92 L272 388 L214 390 L200 176 L186 390 L128 388 Z" fill="${c}" ${outline(d)}/>
    <path d="M146 92 L254 92 L255 112 L145 112 Z" fill="${d}" opacity=".3"/>
    <path d="M152 114 Q166 145 186 114 M248 114 Q234 145 214 114 M200 112 Q207 150 200 176 M140 120 L136 380 M260 120 L264 380" ${stitch('#e2b462')}/>
    <circle cx="200" cy="102" r="5" fill="#d8b56c"/>`,
  jacket: (c, d, l) => `
    <path d="M138 118 L172 100 L200 150 L228 100 L262 118 L300 148 L324 340 L292 348 L264 200 L264 382 L136 382 L136 200 L108 348 L76 340 L100 148 Z" fill="${c}" ${outline(d)}/>
    <path d="M172 100 L158 138 L190 178 L200 150 Z M228 100 L242 138 L210 178 L200 150 Z" fill="${d}" ${outline(d)}/>
    <path d="M200 150 L200 382" stroke="${d}" stroke-width="3"/>
    <path d="M148 300 L186 300 M214 300 L252 300" stroke="${d}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="210" cy="215" r="6" fill="${l}"/><circle cx="210" cy="260" r="6" fill="${l}"/><circle cx="210" cy="305" r="6" fill="${l}"/>`,

  camera: (c, d) => `
    <path d="M160 172 L176 140 L224 140 L240 172 Z" fill="${d}"/>
    <rect x="92" y="170" width="216" height="142" rx="14" fill="${c}" ${outline(d)}/>
    <rect x="92" y="170" width="216" height="38" rx="10" fill="#d9d4c8" ${outline(d)}/>
    <rect x="258" y="156" width="24" height="14" rx="3" fill="#bdb6a8"/>
    <circle cx="200" cy="258" r="54" fill="#2b2a28"/><circle cx="200" cy="258" r="40" fill="#46443f"/>
    <circle cx="200" cy="258" r="22" fill="#1b2430"/><circle cx="190" cy="248" r="7" fill="#fff" opacity=".45"/>
    <rect x="114" y="182" width="30" height="14" rx="3" fill="#2b2a28" opacity=".5"/>`,
  radio: (c, d) => {
    let dots = '';
    for (let y = 225; y <= 305; y += 14) for (let x = 110; x <= 190; x += 14) if ((x - 150) ** 2 + (y - 265) ** 2 < 46 ** 2) dots += `<circle cx="${x}" cy="${y}" r="3.5" fill="${shade(d, -0.3)}"/>`;
    return `
    <path d="M130 178 Q130 128 200 128 Q270 128 270 178" fill="none" stroke="${d}" stroke-width="9" stroke-linecap="round"/>
    <rect x="78" y="175" width="244" height="172" rx="18" fill="${c}" ${outline(d)}/>
    <circle cx="150" cy="265" r="56" fill="${d}" opacity=".85"/>${dots}
    <rect x="226" y="212" width="74" height="30" rx="4" fill="#efe3c8" ${outline(d)}/>
    <path d="M236 222 L236 234 M248 222 L248 230 M260 222 L260 234 M272 222 L272 230 M284 222 L284 234" stroke="${d}" stroke-width="2"/>
    <path d="M256 216 L256 238" stroke="#b5563f" stroke-width="3"/>
    <circle cx="244" cy="292" r="15" fill="#d9d4c8" ${outline(d)}/><circle cx="284" cy="292" r="15" fill="#d9d4c8" ${outline(d)}/>`;
  },
  cassette: (c, d) => `
    <rect x="150" y="126" width="18" height="12" rx="2" fill="${d}"/><rect x="176" y="126" width="18" height="12" rx="2" fill="${d}"/>
    <rect x="202" y="126" width="18" height="12" rx="2" fill="#b5563f"/><rect x="228" y="126" width="18" height="12" rx="2" fill="${d}"/>
    <rect x="118" y="136" width="164" height="234" rx="14" fill="${c}" ${outline(d)}/>
    <rect x="138" y="166" width="124" height="86" rx="6" fill="#2b2a28"/>
    <circle cx="172" cy="209" r="19" fill="#d9d4c8"/><circle cx="228" cy="209" r="19" fill="#d9d4c8"/>
    <circle cx="172" cy="209" r="6" fill="#2b2a28"/><circle cx="228" cy="209" r="6" fill="#2b2a28"/>
    <rect x="138" y="276" width="124" height="10" rx="5" fill="${d}" opacity=".4"/>
    <path d="M150 310 L250 310 M150 328 L220 328" stroke="${d}" stroke-width="5" stroke-linecap="round" opacity=".5"/>`,
  handheld: (c, d) => `
    <rect x="124" y="104" width="152" height="270" rx="16" fill="${c}" ${outline(d)}/>
    <rect x="144" y="128" width="112" height="100" rx="8" fill="#5c5a55"/>
    <rect x="160" y="142" width="80" height="72" fill="#9aa66a"/>
    <path d="M172 160 L188 160 L188 176 L204 176 M214 196 L228 196" stroke="#4d5a32" stroke-width="5"/>
    <path d="M160 290 L184 290 M172 278 L172 302" stroke="#2b2a28" stroke-width="10" stroke-linecap="round"/>
    <circle cx="232" cy="296" r="11" fill="#a3442f"/><circle cx="254" cy="280" r="11" fill="#a3442f"/>
    <path d="M178 340 L192 334 M206 340 L220 334" stroke="${d}" stroke-width="5" stroke-linecap="round"/>`,
  keyboard: (c, d, l) => {
    let keys = '';
    for (let row = 0; row < 4; row += 1) for (let col = 0; col < 11; col += 1) keys += `<rect x="${74 + col * 23 + (row % 2) * 6}" y="${216 + row * 23}" width="18" height="18" rx="3" fill="${l}" stroke="${d}" stroke-width="1.5"/>`;
    return `<rect x="60" y="202" width="280" height="132" rx="12" fill="${c}" ${outline(d)}/>${keys}
    <rect x="130" y="309" width="140" height="16" rx="3" fill="${l}" stroke="${d}" stroke-width="1.5"/>`;
  },
  headphones: (c, d) => `
    <path d="M118 262 Q118 128 200 128 Q282 128 282 262" fill="none" stroke="${d}" stroke-width="13" stroke-linecap="round"/>
    <rect x="96" y="236" width="50" height="88" rx="20" fill="${c}" ${outline(d)}/>
    <rect x="254" y="236" width="50" height="88" rx="20" fill="${c}" ${outline(d)}/>
    <rect x="132" y="250" width="14" height="60" rx="6" fill="${d}"/><rect x="254" y="250" width="14" height="60" rx="6" fill="${d}"/>`,
  lamp: (c, d) => `
    <path d="M150 136 L250 136 L288 240 L112 240 Z" fill="${c}" ${outline(d)}/>
    <path d="M140 165 L260 165" stroke="${d}" stroke-width="2" opacity=".4"/>
    <ellipse cx="200" cy="244" rx="40" ry="8" fill="#f3d58a" opacity=".8"/>
    <rect x="195" y="240" width="10" height="122" fill="${d}"/>
    <ellipse cx="200" cy="366" rx="62" ry="14" fill="${d}"/>`,

  vase: (c, d, l) => `
    <path d="M176 152 Q176 132 186 126 L214 126 Q224 132 224 152 Q276 202 262 302 Q252 372 200 374 Q148 372 138 302 Q124 202 176 152 Z" fill="${c}" ${outline(d)}/>
    <ellipse cx="200" cy="126" rx="20" ry="6" fill="${d}"/>
    <path d="M146 250 Q200 270 254 250 M142 282 Q200 302 258 282" fill="none" stroke="${l}" stroke-width="5"/>
    <path d="M196 120 Q186 70 160 52 M204 120 Q214 80 244 66" fill="none" stroke="#6f7f55" stroke-width="4"/>
    <circle cx="160" cy="52" r="12" fill="#c9774f"/><circle cx="244" cy="66" r="10" fill="#e1b25c"/>`,
  candle: (c, d) => `
    <rect x="160" y="300" width="80" height="74" rx="6" fill="#c9b79c" ${outline(d)}/>
    <rect x="168" y="196" width="64" height="112" rx="6" fill="${c}" ${outline(d)}/>
    <path d="M200 196 L200 178" stroke="#2b2a28" stroke-width="3"/>
    <path d="M200 134 Q218 162 200 180 Q182 162 200 134 Z" fill="#e8a33d"/>
    <path d="M200 152 Q208 166 200 176 Q192 166 200 152 Z" fill="#fbe2a0"/>
    <path d="M178 214 Q182 236 178 250" fill="none" stroke="${shade(c, 0.4)}" stroke-width="5" stroke-linecap="round"/>`,
  plant: (c, d) => `
    <ellipse cx="160" cy="222" rx="22" ry="58" transform="rotate(-30 160 222)" fill="#6f7f55"/>
    <ellipse cx="240" cy="222" rx="22" ry="58" transform="rotate(30 240 222)" fill="#7b8b5f"/>
    <ellipse cx="200" cy="190" rx="22" ry="70" fill="#5d6b46"/>
    <ellipse cx="180" cy="250" rx="16" ry="40" transform="rotate(-55 180 250)" fill="#8a9a6c"/>
    <path d="M148 290 L252 290 L238 376 L162 376 Z" fill="${c}" ${outline(d)}/>
    <rect x="142" y="282" width="116" height="18" rx="4" fill="${c}" ${outline(d)}/>`,
  clock: (c, d) => {
    let ticks = '';
    for (let i = 0; i < 12; i += 1) {
      const a = (i * Math.PI) / 6;
      ticks += `<path d="M${200 + Math.sin(a) * 78} ${240 - Math.cos(a) * 78} L${200 + Math.sin(a) * 88} ${240 - Math.cos(a) * 88}" stroke="${d}" stroke-width="${i % 3 ? 2 : 5}"/>`;
    }
    return `<circle cx="200" cy="240" r="114" fill="${c}" ${outline(d)}/><circle cx="200" cy="240" r="96" fill="#f6f1e6"/>${ticks}
    <path d="M200 240 L200 182 M200 240 L240 262" stroke="${d}" stroke-width="6" stroke-linecap="round"/><circle cx="200" cy="240" r="7" fill="#b5563f"/>`;
  },
  frame: (c, d) => `
    <rect x="108" y="100" width="184" height="260" fill="${c}" ${outline(d)}/>
    <rect x="128" y="120" width="144" height="220" fill="#ece3d1"/>
    <circle cx="232" cy="176" r="20" fill="#e1a35c"/>
    <path d="M128 300 L176 226 L210 270 L232 246 L272 300 L272 340 L128 340 Z" fill="#7b8b6f"/>
    <path d="M128 340 L272 340" stroke="${d}" stroke-width="2"/>`,
  pencup: (c, d) => `
    <path d="M176 236 L160 132" stroke="#e1b25c" stroke-width="10" stroke-linecap="round"/><path d="M160 132 L156 116" stroke="#2b2a28" stroke-width="6" stroke-linecap="round"/>
    <path d="M200 236 L204 118" stroke="#5d6b4f" stroke-width="10" stroke-linecap="round"/><path d="M204 118 L205 102" stroke="#2b2a28" stroke-width="6" stroke-linecap="round"/>
    <path d="M222 236 L246 142" stroke="#b5563f" stroke-width="10" stroke-linecap="round"/>
    <rect x="152" y="228" width="96" height="146" rx="10" fill="${c}" ${outline(d)}/>
    <path d="M152 262 L248 262 M152 340 L248 340" stroke="${d}" stroke-width="2" opacity=".4"/>`,
  shelf: (c, d) => `
    <rect x="106" y="196" width="26" height="84" fill="#b5563f" ${outline(d)}/><rect x="134" y="210" width="22" height="70" fill="#5d6b4f" ${outline(d)}/>
    <rect x="160" y="190" width="24" height="90" fill="#e1b25c" ${outline(d)}/>
    <rect x="240" y="226" width="56" height="54" rx="8" fill="#f6f1e6" ${outline(d)}/>
    <rect x="68" y="280" width="264" height="22" rx="4" fill="${c}" ${outline(d)}/>
    <rect x="84" y="302" width="20" height="72" fill="${c}" ${outline(d)}/><rect x="296" y="302" width="20" height="72" fill="${c}" ${outline(d)}/>`,
  bookend: (c, d) => `
    <path d="M86 374 L86 210 L118 210 L118 346 L150 346 L150 374 Z" fill="${c}" ${outline(d)}/>
    <path d="M314 374 L314 210 L282 210 L282 346 L250 346 L250 374 Z" fill="${c}" ${outline(d)}/>
    <rect x="122" y="222" width="30" height="124" fill="#b5563f" ${outline(d)}/><rect x="154" y="236" width="26" height="110" fill="#e1b25c" ${outline(d)}/>
    <rect x="182" y="214" width="34" height="132" fill="#5d6b4f" ${outline(d)}/><rect x="218" y="230" width="28" height="116" fill="#2f3a4a" ${outline(d)}/>
    <path d="M250 346 L278 238" stroke="#a3442f" stroke-width="22"/>`,
  tray: (c, d) => `
    <ellipse cx="200" cy="320" rx="150" ry="48" fill="${shade(c, -0.15)}" ${outline(d)}/>
    <ellipse cx="200" cy="310" rx="138" ry="40" fill="${c}"/>
    <rect x="128" y="258" width="44" height="56" rx="6" fill="#f6f1e6" ${outline(d)}/>
    <circle cx="232" cy="296" r="24" fill="#e1b25c" ${outline(d)}/>
    <path d="M266 300 L300 270" stroke="#2b2a28" stroke-width="6" stroke-linecap="round"/>`,
  keycap: (c, d, l) => {
    const cap = (x, y, fill) => `<rect x="${x}" y="${y}" width="76" height="70" rx="12" fill="${shade(fill, -0.2)}" ${outline(d)}/><rect x="${x + 10}" y="${y + 6}" width="56" height="48" rx="9" fill="${fill}"/>`;
    return cap(88, 170, c) + cap(162, 170, l) + cap(236, 170, c) + cap(124, 244, l) + cap(198, 244, '#b5563f')
      + '<text x="236" y="285" font-family="Georgia,serif" font-size="22" fill="#fff" text-anchor="middle">↵</text>';
  },
  mousepad: (c, d) => `
    <path d="M70 360 L110 236 L330 236 L330 360 Z" fill="${c}" ${outline(d)}/>
    <path d="M86 346 L120 250 L316 250 L316 346 Z" fill="none" stroke="${shade(c, 0.35)}" stroke-width="2" stroke-dasharray="6 6"/>
    <ellipse cx="248" cy="302" rx="30" ry="40" fill="#e9e3d6" ${outline(d)}/>
    <path d="M248 262 L248 290" stroke="${d}" stroke-width="2"/>
    <path d="M248 262 Q250 200 300 180" fill="none" stroke="${d}" stroke-width="3"/>`,
  cableclip: (c, d, l) => {
    let clips = '';
    for (let i = 0; i < 5; i += 1) clips += `<rect x="${92 + i * 46}" y="230" width="38" height="44" rx="10" fill="${i % 2 ? l : c}" ${outline(d)}/><path d="M${100 + i * 46} 230 Q${111 + i * 46} 214 ${122 + i * 46} 230" fill="none" stroke="${d}" stroke-width="3"/>`;
    return `<rect x="80" y="270" width="240" height="22" rx="6" fill="${shade(c, -0.25)}" ${outline(d)}/>${clips}
    <path d="M70 226 Q120 150 200 222 T330 200" fill="none" stroke="#2b2a28" stroke-width="5"/>`;
  },
  magnets: (c, d, l) => `
    <circle cx="140" cy="200" r="42" fill="${c}" ${outline(d)}/><path d="M140 158 Q150 138 168 136" fill="none" stroke="#5d6b46" stroke-width="5"/>
    <circle cx="250" cy="214" r="46" fill="#e1b25c" ${outline(d)}/><path d="M250 214 L250 170 M250 214 L290 228 M250 214 L214 236" stroke="#fff" stroke-width="3" opacity=".7"/>
    <rect x="130" y="270" width="70" height="70" rx="14" fill="${l}" ${outline(d)}/><circle cx="152" cy="300" r="4" fill="${d}"/><circle cx="178" cy="300" r="4" fill="${d}"/><path d="M152 316 Q165 326 178 316" fill="none" stroke="${d}" stroke-width="3"/>
    <path d="M250 284 L264 312 L294 316 L272 336 L278 366 L250 350 L222 366 L228 336 L206 316 L236 312 Z" fill="#b5563f" ${outline(d)}/>`,
  memoboard: (c, d) => `
    <rect x="86" y="110" width="228" height="264" rx="6" fill="${c}" ${outline(d)}/>
    <rect x="104" y="128" width="192" height="228" fill="#f6f1e6"/>
    <rect x="120" y="148" width="72" height="72" fill="#f3d58a" transform="rotate(-6 156 184)"/>
    <rect x="208" y="160" width="72" height="72" fill="#cfd8c0" transform="rotate(5 244 196)"/>
    <rect x="142" y="250" width="90" height="70" fill="#f0c9b8" transform="rotate(3 187 285)"/>
    <circle cx="156" cy="152" r="7" fill="#b5563f"/><circle cx="244" cy="164" r="7" fill="#2f3a4a"/><circle cx="187" cy="254" r="7" fill="#5d6b4f"/>
    <path d="M132 180 L176 176 M134 196 L168 193 M222 194 L264 198 M156 280 L214 282" stroke="${d}" stroke-width="3" opacity=".5"/>`,
  box: (c, d, l) => `
    <path d="M90 214 L310 214 L296 374 L104 374 Z" fill="${c}" ${outline(d)}/>
    <rect x="80" y="188" width="240" height="34" rx="4" fill="${shade(c, -0.12)}" ${outline(d)}/>
    <rect x="160" y="262" width="80" height="44" rx="3" fill="${l}" ${outline(d)}/>
    <path d="M174 278 L226 278 M174 292 L210 292" stroke="${d}" stroke-width="3"/>`,
  mug: (c, d, l) => `
    <path d="M150 210 Q160 180 150 160 M190 210 Q200 180 190 160" fill="none" stroke="${d}" stroke-width="3" opacity=".35" stroke-linecap="round"/>
    <path d="M250 250 Q300 250 300 290 Q300 330 250 330" fill="none" stroke="${c}" stroke-width="20"/>
    <path d="M250 250 Q300 250 300 290 Q300 330 250 330" fill="none" ${outline(d)}/>
    <path d="M118 226 L262 226 L252 362 Q250 376 236 376 L144 376 Q130 376 128 362 Z" fill="${c}" ${outline(d)}/>
    <ellipse cx="190" cy="226" rx="72" ry="12" fill="${shade(c, -0.25)}" ${outline(d)}/>
    <path d="M132 280 L252 280" stroke="${l}" stroke-width="8"/>`,
};

function productArt({ shape, color, bg = '#eee6da', accent }) {
  const dark = shade(color, -0.45);
  const light = accent || shade(color, 0.55);
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 470">
    <rect width="400" height="470" fill="${bg}"/>
    <ellipse cx="200" cy="400" rx="140" ry="13" fill="#3a2a1e" opacity=".08"/>
    ${drawings[shape](color, dark, light)}
  </svg>`);
}

const albumPatterns = [
  (a) => [96, 72, 48, 24].map((r) => `<circle cx="190" cy="215" r="${r}" fill="none" stroke="${a}" stroke-width="7"/>`).join(''),
  (a) => [0, 1, 2, 3, 4, 5].map((i) => `<rect x="70" y="${130 + i * 26}" width="240" height="11" fill="${a}" opacity="${1 - i * 0.13}"/>`).join(''),
  (a) => `<circle cx="190" cy="300" r="92" fill="${a}"/><path d="M70 300 L310 300" stroke="${a}" stroke-width="3"/>`,
  (a) => {
    let dots = '';
    for (let y = 136; y <= 280; y += 24) for (let x = 94; x <= 290; x += 24) dots += `<circle cx="${x}" cy="${y}" r="${4 + ((x + y) % 5)}" fill="${a}"/>`;
    return dots;
  },
  (a) => `<path d="M70 300 L230 110 L310 110 L310 160 L150 350 L70 350 Z" fill="${a}"/>`,
  (a) => `<path d="M70 250 Q130 190 190 250 T310 250 L310 350 L70 350 Z" fill="${a}"/><path d="M70 220 Q130 160 190 220 T310 220" fill="none" stroke="${a}" stroke-width="5"/>`,
];

function albumArt({ title, artist, year, color, accent, pattern = 0, bg = '#ece5d8' }) {
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 470">
    <rect width="400" height="470" fill="${bg}"/>
    <ellipse cx="200" cy="400" rx="150" ry="12" fill="#3a2a1e" opacity=".08"/>
    <circle cx="262" cy="230" r="118" fill="#cfcac0"/>
    <circle cx="262" cy="230" r="100" fill="none" stroke="#bdb7ab" stroke-width="2"/>
    <circle cx="262" cy="230" r="76" fill="none" stroke="#bdb7ab" stroke-width="2"/>
    <circle cx="262" cy="230" r="34" fill="${accent}"/><circle cx="262" cy="230" r="9" fill="${bg}"/>
    <g>
      <rect x="70" y="110" width="240" height="240" fill="${color}"/>
      <clipPath id="cover"><rect x="70" y="110" width="240" height="240"/></clipPath>
      <g clip-path="url(#cover)">${albumPatterns[pattern % albumPatterns.length](accent)}</g>
      <rect x="70" y="300" width="240" height="50" fill="${color}" opacity=".88"/>
      <text x="84" y="324" font-family="Georgia,'Malgun Gothic',serif" font-size="17" font-weight="700" fill="#fffaf2">${escapeXml(title)}</text>
      <text x="84" y="342" font-family="'Malgun Gothic',sans-serif" font-size="11" fill="#fffaf2" opacity=".8">${escapeXml(artist)} · ${year}</text>
      <rect x="70" y="110" width="240" height="240" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2"/>
    </g>
  </svg>`);
}
