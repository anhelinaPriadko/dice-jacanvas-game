// Responsive, high-DPI aware dice drawing on canvas.
// Updated: center dice block and draw centered labels under dice.

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const rollBtn = document.getElementById('rollBtn');
const resultEl = document.getElementById('result');
const scoreEl = document.getElementById('score');

let layout = {
  dieSize: 180,
  margin: 20,
  leftX: 20,
  rightX: 220,
  topY: 20,
  cssWidth: 600,
  cssHeight: 220
};

function setCanvasSize() {
  const wrap = canvas.parentElement;
  const styleWidth = Math.floor(wrap.clientWidth);
  const dpr = window.devicePixelRatio || 1;

  // Limit width and compute a comfortable height so labels fit
  const cssWidth = Math.min(styleWidth, 760);
  // Increased height ratio so labels never overlap/are cut off
  const cssHeight = Math.max(240, Math.floor(cssWidth * 0.48));

  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Compute die size to fit two dice + inner spacing
  const outerMargin = 20;
  const gap = Math.max(16, Math.floor(cssWidth * 0.03)); // gap between dice
  const availableWidth = cssWidth - outerMargin * 2;
  const dieSize = Math.min(Math.floor((availableWidth - gap) / 2), Math.floor(cssHeight - outerMargin * 2 - 40)); // leave room for labels

  // Center the two-dice block horizontally
  const totalDiceWidth = dieSize * 2 + gap;
  const startX = Math.max(outerMargin, Math.floor((cssWidth - totalDiceWidth) / 2));

  layout = {
    dieSize,
    margin: outerMargin,
    gap,
    leftX: startX,
    rightX: startX + dieSize + gap,
    topY: Math.max(12, Math.floor((cssHeight - dieSize - 40) / 2)), // leave ~40px for label area
    cssWidth,
    cssHeight
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDie(ctx, x, y, size, value) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#222831';
  ctx.lineWidth = Math.max(3, Math.floor(size * 0.035));
  roundRect(ctx, x, y, size, size, Math.max(8, size * 0.09));

  ctx.fillStyle = '#222831';
  const s = size;
  const cx = x + s / 2;
  const cy = y + s / 2;
  const offset = s * 0.28;
  const dotR = Math.max(4, s * 0.06);

  const drawDot = (dx, dy) => {
    ctx.beginPath();
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
    ctx.fill();
  };

  switch (value) {
    case 1: drawDot(cx, cy); break;
    case 2:
      drawDot(cx - offset, cy - offset);
      drawDot(cx + offset, cy + offset);
      break;
    case 3:
      drawDot(cx - offset, cy - offset);
      drawDot(cx, cy);
      drawDot(cx + offset, cy + offset);
      break;
    case 4:
      drawDot(cx - offset, cy - offset);
      drawDot(cx + offset, cy - offset);
      drawDot(cx - offset, cy + offset);
      drawDot(cx + offset, cy + offset);
      break;
    case 5:
      drawDot(cx - offset, cy - offset);
      drawDot(cx + offset, cy - offset);
      drawDot(cx, cy);
      drawDot(cx - offset, cy + offset);
      drawDot(cx + offset, cy + offset);
      break;
    case 6:
      drawDot(cx - offset, cy - offset);
      drawDot(cx + offset, cy - offset);
      drawDot(cx - offset, cy);
      drawDot(cx + offset, cy);
      drawDot(cx - offset, cy + offset);
      drawDot(cx + offset, cy + offset);
      break;
  }
  ctx.restore();
}

function render(d1 = 1, d2 = 1) {
  // Clear and paint background
  const cssW = layout.cssWidth;
  const cssH = layout.cssHeight;
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = '#393E46';
  ctx.fillRect(0, 0, cssW, cssH);

  // Draw centered dice
  drawDie(ctx, layout.leftX, layout.topY, layout.dieSize, d1);
  drawDie(ctx, layout.rightX, layout.topY, layout.dieSize, d2);

  // Labels centered under each die
  ctx.fillStyle = '#4ECCA3';
  const fontSize = Math.max(12, Math.floor(layout.dieSize * 0.12));
  ctx.font = `${fontSize}px system-ui, Arial`;
  ctx.textBaseline = 'top';

  const labelY = layout.topY + layout.dieSize + 8;
  const label1 = 'Player 1';
  const label2 = 'Player 2';

  // center each label under its die
  const textMetrics1 = ctx.measureText(label1);
  const textMetrics2 = ctx.measureText(label2);

  const center1 = layout.leftX + layout.dieSize / 2;
  const center2 = layout.rightX + layout.dieSize / 2;

  ctx.fillText(label1, center1 - textMetrics1.width / 2, labelY);
  ctx.fillText(label2, center2 - textMetrics2.width / 2, labelY);
}

function animateRoll(duration = 700) {
  const start = performance.now();
  return new Promise(resolve => {
    function frame(now) {
      const elapsed = now - start;
      const t = elapsed / duration;
      if (t < 1) {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        render(d1, d2);
        requestAnimationFrame(frame);
      } else {
        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;
        render(final1, final2);
        resolve([final1, final2]);
      }
    }
    requestAnimationFrame(frame);
  });
}

async function doRoll() {
  rollBtn.disabled = true;
  resultEl.textContent = 'Rolling...';
  scoreEl.textContent = '— : —';
  const [a, b] = await animateRoll(800);

  scoreEl.textContent = `${a} : ${b}`;

  if (a > b) {
    resultEl.innerHTML = '⚑ Player 1 Wins! (' + a + ' : ' + b + ')';
  } else if (a < b) {
    resultEl.innerHTML = 'Player 2 Wins! ⚑ (' + a + ' : ' + b + ')';
  } else {
    resultEl.innerHTML = 'Draw! (' + a + ' : ' + b + ')';
  }
  rollBtn.disabled = false;
}

// respond to size changes
function onResize() {
  setCanvasSize();
  render(1, 1);
}

window.addEventListener('resize', debounce(onResize, 120));
window.addEventListener('orientationchange', debounce(onResize, 200));
rollBtn.addEventListener('click', doRoll);

// small debounce helper
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// initial setup
onResize();
