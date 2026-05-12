// Tracker behavior — the same logic as the original index.html, but with one architectural change:
// `reviews.json` is the source of truth for "Day N done". localStorage only adds *extra* days
// the kid clicked "I finished" on before Claude has reviewed them — it never subtracts.
// This makes streak/XP survive device switch, cache clear, and the domain move.

const STORAGE_KEY = 'arnav_quest_v1';

const DAYS = JSON.parse(document.getElementById('dayData').textContent).days;
const VERIFIED = JSON.parse(document.getElementById('verifiedReviews').textContent);

const LEVELS = [
  { min: 0,    name: 'Pencil Apprentice',  next: 60   },
  { min: 60,   name: 'Word Cadet',         next: 180  },
  { min: 180,  name: 'Sentence Knight',    next: 350  },
  { min: 350,  name: 'Paragraph Mage',     next: 550  },
  { min: 550,  name: 'Spelling Sentinel',  next: 800  },
  { min: 800,  name: 'Story Captain',      next: 1100 },
  { min: 1100, name: 'Opinion Warrior',    next: 1400 },
  { min: 1400, name: 'Class 6 Champion',   next: 9999 },
];

const BADGES = [
  { id: 'first',    emoji: '🥇', name: 'First Mission',    check: s => s.completed.size >= 1 },
  { id: 'streak7',  emoji: '🔥', name: '7-Day Streak',     check: s => s.bestStreak >= 7 },
  { id: 'speed',    emoji: '⚡', name: 'Speed Demon',      check: s => s.completed.size >= 5 },
  { id: 'spell',    emoji: '🪄', name: 'Spell Caster',     check: s => s.spellWords >= 20 },
  { id: 'story',    emoji: '📖', name: 'Story Builder',    check: s => s.completed.has(10) },
  { id: 'boss',     emoji: '⚔️', name: 'Boss Slayer',      check: s => [10,20,30,40,50,60].some(d => s.completed.has(d)) },
  { id: 'comeback', emoji: '🌟', name: 'Comeback Kid',     check: s => s.usedFreeze },
  { id: 'champion', emoji: '🏆', name: 'Class 6 Champion', check: s => s.completed.size >= 60 },
];

// Verified reviews are the source of truth. Build the "verified completed" set once.
const VERIFIED_COMPLETED = new Set();
const VERIFIED_XP = {};
const VERIFIED_SPELL = (() => {
  let total = 0;
  for (const v of (VERIFIED.verified || [])) {
    if (typeof v.day === 'number' && v.day >= 1 && v.day <= 60) {
      VERIFIED_COMPLETED.add(v.day);
      if (typeof v.xp === 'number') VERIFIED_XP[v.day] = v.xp;
      if (v.metrics && typeof v.metrics.spellWordsUsed === 'number') {
        total += v.metrics.spellWordsUsed;
      }
    }
  }
  return total;
})();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  let s;
  try { s = raw ? JSON.parse(raw) : null; } catch (e) { s = null; }
  if (!s) s = { completed: [], lite: [], mood: {}, usedFreeze: false, lastActive: null };
  // `completed` in localStorage is the "I finished" clicks the kid made.
  // Final completed = local clicks ∪ verified reviews (verified wins).
  const localClicks = new Set(s.completed || []);
  const final = new Set([...VERIFIED_COMPLETED, ...localClicks]);
  s.localClicks = localClicks;
  s.completed = final;
  s.lite = new Set(s.lite || []);
  s.mood = s.mood || {};
  s.spellWords = VERIFIED_SPELL;
  return s;
}

function saveState(s) {
  // Only persist the kid's *extra* clicks beyond what's verified. Verified data lives in JSON.
  const localOnly = [...s.localClicks].filter(d => !VERIFIED_COMPLETED.has(d));
  const out = {
    completed: localOnly,
    lite: [...s.lite],
    mood: s.mood,
    usedFreeze: s.usedFreeze,
    lastActive: s.lastActive,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
}

function currentDayNumber(s) {
  for (let i = 1; i <= 60; i++) {
    if (!s.completed.has(i) && !s.lite.has(i)) return i;
  }
  return 60;
}

function computeXp(s) {
  let xp = 0;
  for (const d of s.completed) {
    if (VERIFIED_XP[d] != null) {
      xp += VERIFIED_XP[d];
    } else {
      const day = DAYS[d - 1];
      const boss = day && day.boss ? 15 : 0;
      xp += 10 + boss;
    }
  }
  for (const d of s.lite) {
    if (!s.completed.has(d)) xp += 3;
  }
  return Math.max(0, xp);
}

function computeStreak(s) {
  let last = 0;
  for (let d = 60; d >= 1; d--) { if (s.completed.has(d) || s.lite.has(d)) { last = d; break; } }
  let cur = 0;
  for (let d = last; d >= 1; d--) {
    if (s.completed.has(d) || s.lite.has(d)) cur++;
    else break;
  }
  let best = 0, run = 0;
  for (let d = 1; d <= 60; d++) {
    if (s.completed.has(d) || s.lite.has(d)) { run++; if (run > best) best = run; }
    else run = 0;
  }
  s.bestStreak = best;
  return { current: cur, best };
}

function levelOf(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) if (xp >= LEVELS[i].min) return { idx: i, ...LEVELS[i] };
  return { idx: 0, ...LEVELS[0] };
}

function phaseLabel(p) {
  return p === 1 ? 'Fluency' : p === 2 ? 'Structure' : 'Independence';
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function render() {
  const s = loadState();
  const xp = computeXp(s);
  const streak = computeStreak(s);
  const lvl = levelOf(xp);
  const today = currentDayNumber(s);
  const day = DAYS[today - 1];

  document.getElementById('topStreak').textContent = streak.current;
  document.getElementById('topXp').textContent = xp;
  document.getElementById('topLevel').textContent = lvl.idx + 1;

  document.getElementById('heroDayTitle').textContent = `Day ${day.n} — ${day.theme}`;
  document.getElementById('heroPhase').textContent = `Phase ${day.phase} · ${phaseLabel(day.phase)} · Target ${day.lines} lines${day.boss ? ' · BOSS' : ''}`;
  document.getElementById('heroPrompt').textContent = day.prompt;
  document.getElementById('heroLines').textContent = `📝 ${day.lines} lines`;
  document.getElementById('heroXp').textContent = day.boss ? '+25 XP base' : '+10 XP base';
  if (day.boss) document.getElementById('heroCard').style.background = 'linear-gradient(135deg,#FF4B4B 0%,#FF8888 100%)';
  if (s.completed.has(day.n)) {
    document.getElementById('btnDone').textContent = '✓ Marked done';
    document.getElementById('btnDone').style.opacity = 0.65;
  }

  document.getElementById('streakN').textContent = streak.current;
  document.getElementById('streakFlame').classList.toggle('cold', streak.current === 0);
  document.getElementById('streakSub').textContent =
      streak.current === 0 ? 'Start today to light it up' :
      streak.current === 1 ? "First flame! Don't let it go out 🔥" :
      streak.current < 7   ? 'Awesome, keep it going!' :
      streak.current < 30  ? 'Streak champion!' :
                              'LEGEND mode! 👑';

  document.getElementById('levelNum').textContent = lvl.idx + 1;
  document.getElementById('levelTitle').textContent = lvl.name;
  const into = xp - lvl.min;
  const span = lvl.next - lvl.min;
  const pct = lvl.next >= 9999 ? 100 : Math.min(100, Math.max(0, (into / span) * 100));
  document.getElementById('xpFill').style.width = pct + '%';
  document.getElementById('xpText').textContent = lvl.next >= 9999 ? `MAX LEVEL · ${xp} XP` : `${xp} / ${lvl.next} XP`;

  document.getElementById('statXp').textContent = xp;
  document.getElementById('statDone').textContent = s.completed.size;
  document.getElementById('statBest').textContent = streak.best;
  document.getElementById('statWords').textContent = s.spellWords;

  renderPath(s, today);
  renderBadges(s);
  renderReviews();
  renderChart(s);
}

function renderPath(s, today) {
  const grid = document.getElementById('pathGrid');
  grid.innerHTML = '';
  const activePhase = parseInt(document.querySelector('.tab.active').dataset.phase);
  const filtered = DAYS.filter(d => d.phase === activePhase);
  filtered.forEach(d => {
    const n = document.createElement('button');
    n.className = 'node';
    const lbl = d.theme.length > 10 ? d.theme.slice(0, 9) + '…' : d.theme;
    n.innerHTML = `<span class="n">${d.n}</span><span class="lbl">${lbl}</span>`;
    n.title = `Day ${d.n} · ${d.theme}\n${d.prompt}`;
    if (s.completed.has(d.n)) n.classList.add('done');
    else if (d.n === today) n.classList.add('today');
    else if (d.n < today) n.classList.add('unlocked');
    else n.classList.add('locked');
    if (d.boss) n.classList.add('boss');
    n.addEventListener('click', () => openDay(d));
    grid.appendChild(n);
  });
}

function renderBadges(s) {
  const wrap = document.getElementById('badgeGrid');
  wrap.innerHTML = '';
  BADGES.forEach(b => {
    const earned = b.check(s);
    const el = document.createElement('div');
    el.className = 'badge' + (earned ? ' earned' : '');
    el.innerHTML = `<span class="emoji">${earned ? b.emoji : '🔒'}</span><span class="name">${b.name}</span>`;
    el.title = earned ? `Earned: ${b.name}` : `Locked: ${b.name}`;
    wrap.appendChild(el);
  });
}

function renderReviews() {
  const list = document.getElementById('reviewsList');
  list.innerHTML = '';
  const verified = (VERIFIED.verified || []).slice().sort((a, b) => b.day - a.day);
  if (!verified.length) {
    list.innerHTML = `<div style="font-size:13px;color:var(--ink2);font-weight:700;text-align:center;padding:10px;">No verified reviews yet. Upload a worksheet photo to your parent's chat with Claude — verified XP and praise will appear here.</div>`;
    return;
  }
  verified.forEach(v => {
    const el = document.createElement('div');
    el.className = 'review-item';
    el.innerHTML = `
      <div class="head"><span class="day">Day ${v.day} — ${v.theme || ''}</span><span class="xp">+${v.xp} XP</span></div>
      <div class="praise">${(v.praises || []).map(p => `<b>★</b> ${escapeHtml(p)}`).join('<br>')}</div>
      ${v.next ? `<div class="next">Next: ${escapeHtml(v.next)}</div>` : ''}
    `;
    list.appendChild(el);
  });
}

let chart;
function renderChart(s) {
  const canvas = document.getElementById('xpChart');
  if (!canvas) return;
  const labels = [];
  const values = [];
  let cum = 0;
  for (let d = 1; d <= 60; d++) {
    labels.push(`D${d}`);
    if (s.completed.has(d)) {
      cum += (VERIFIED_XP[d] != null ? VERIFIED_XP[d] : (10 + (DAYS[d-1].boss ? 15 : 0)));
    } else if (s.lite.has(d)) {
      cum += 3;
    }
    values.push(cum);
  }
  if (typeof Chart === 'undefined') { drawFallbackChart(canvas, labels, values); return; }
  try {
    const ctx = canvas.getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cumulative XP',
          data: values,
          borderColor: '#58CC02',
          backgroundColor: 'rgba(88,204,2,.15)',
          fill: true, tension: 0.3, pointRadius: 0, borderWidth: 3,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { font: { family: 'Nunito', weight: '700' }, color: '#AFAFAF', maxTicksLimit: 12 }, grid: { display: false } },
          y: { ticks: { font: { family: 'Nunito', weight: '700' }, color: '#AFAFAF' }, grid: { color: '#F0F0F0' }, beginAtZero: true },
        },
      },
    });
  } catch (err) {
    drawFallbackChart(canvas, labels, values);
  }
}

function drawFallbackChart(canvas, labels, values) {
  const parent = canvas.parentElement;
  const w = parent.clientWidth || 600;
  const h = parent.clientHeight || 200;
  canvas.width = w * (window.devicePixelRatio || 1);
  canvas.height = h * (window.devicePixelRatio || 1);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  ctx.clearRect(0, 0, w, h);
  const pad = { l: 36, r: 14, t: 14, b: 24 };
  const cw = w - pad.l - pad.r;
  const ch = h - pad.t - pad.b;
  const maxV = Math.max(10, ...values);
  ctx.strokeStyle = '#F0F0F0'; ctx.lineWidth = 1;
  ctx.fillStyle = '#AFAFAF'; ctx.font = '700 11px Nunito,system-ui';
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + ch * (1 - i / 4);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillText(Math.round(maxV * i / 4), pad.l - 6, y);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let i = 0; i < labels.length; i += 10) {
    const x = pad.l + cw * (i / (labels.length - 1 || 1));
    ctx.fillText(labels[i], x, h - pad.b + 4);
  }
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad.l + cw * (i / (values.length - 1 || 1));
    const y = pad.t + ch * (1 - v / maxV);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.l + cw, pad.t + ch);
  ctx.lineTo(pad.l, pad.t + ch);
  ctx.closePath();
  ctx.fillStyle = 'rgba(88,204,2,.15)'; ctx.fill();
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad.l + cw * (i / (values.length - 1 || 1));
    const y = pad.t + ch * (1 - v / maxV);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#58CC02'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
}

function markDone(lite = false) {
  const s = loadState();
  const today = currentDayNumber(s);
  if (s.completed.has(today)) { toast('Already marked done today!'); return; }
  if (lite) s.lite.add(today); else s.localClicks.add(today);
  s.lastActive = new Date().toISOString();
  saveState(s);
  const day = DAYS[today - 1];
  const xp = lite ? 3 : (10 + (day.boss ? 15 : 0));
  showCelebration(today, day, xp, lite);
  render();
  confettiBurst(lite ? 20 : 60);
}

function openDay(d) {
  const s = loadState();
  const today = currentDayNumber(s);
  if (d.n > today) { toast("That day is locked. Finish today's mission first 🔒"); return; }
  showModal({
    icon: d.boss ? '⚔️' : '🎯',
    title: `Day ${d.n} · ${d.theme}`,
    body: `<div style="text-align:left;font-size:14px;line-height:1.5;color:var(--ink2)"><b style="color:var(--ink);font-size:15px;">Mission:</b><br>${escapeHtml(d.prompt)}<br><br><b style="color:var(--ink);font-size:15px;">Target:</b> ${d.lines} lines · <b>Phase:</b> ${d.phase} · ${d.boss ? '<span style="color:var(--red);font-weight:900;">BOSS DAY (+15 XP)</span>' : ''}</div>`,
  });
}

function showCelebration(dayN, day, xp, lite) {
  if (lite) {
    showModal({ icon: '🌟', title: 'Lite day saved!', body: `+${xp} XP · Streak protected. Tomorrow you go full mission 💪` });
  } else if (day.boss) {
    showModal({ icon: '⚔️', title: 'BOSS DEFEATED!', body: `Day ${dayN} cleared. +${xp} XP earned. You are unstoppable.` });
  } else {
    showModal({ icon: '🎉', title: 'Mission complete!', body: `+${xp} XP · Day ${dayN} done. Keep that streak burning 🔥` });
  }
}

function showModal({ icon, title, body }) {
  document.getElementById('modalIcon').textContent = icon;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modal').classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }
window.closeModal = closeModal;

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTO);
  window._toastTO = setTimeout(() => t.classList.remove('show'), 2500);
}

function confettiBurst(n) {
  const colors = ['#58CC02', '#FFC800', '#FF9600', '#1CB0F6', '#CE82FF', '#FF4B4B'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = (Math.random() * 100) + 'vw';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(c);
    const dur = 1500 + Math.random() * 1500;
    c.animate(
      [
        { transform: c.style.transform, top: '-20px' },
        { transform: `rotate(${Math.random() * 720}deg) translateY(110vh)`, top: '110vh' },
      ],
      { duration: dur, easing: 'cubic-bezier(.2,.7,.4,1)' },
    ).onfinish = () => c.remove();
  }
}

document.getElementById('btnDone').addEventListener('click', () => markDone(false));
document.getElementById('btnLite').addEventListener('click', () => markDone(true));
document.getElementById('btnStart').addEventListener('click', () => {
  const s = loadState();
  const today = currentDayNumber(s);
  toast(`Timer time! Set 20–25 min. Mission: Day ${today}`);
});
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  render();
}));
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

document.getElementById('btnReset').addEventListener('click', () => {
  if (confirm('Reset local progress? Coach reviews stay (they live in reviews.json).')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});

render();
