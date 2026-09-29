(() => {
  const CFG = window.SITE_CONFIG;
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  document.body.classList.add('loading');

  // Ambient atmosphere: clouds, flowers, hearts and tiny stars.
  const sky = $('#sky');
  const floatingSymbols = ['✿', '✾', '❀', '♡', '♡', '✧', '✦'];
  for (let i = 0; i < 7; i++) {
    const cloud = document.createElement('span');
    cloud.className = 'floating-cloud';
    cloud.style.top = `${8 + Math.random() * 78}%`;
    cloud.style.width = `${130 + Math.random() * 220}px`;
    cloud.style.animationDuration = `${42 + Math.random() * 28}s`;
    cloud.style.animationDelay = `${-Math.random() * 35}s`;
    sky.appendChild(cloud);
  }
  for (let i = 0; i < 22; i++) {
    const f = document.createElement('span');
    f.className = `floating-flower${floatingSymbols[i % floatingSymbols.length] === '♡' ? ' heart' : ''}`;
    f.textContent = floatingSymbols[i % floatingSymbols.length];
    f.style.left = `${Math.random() * 100}%`;
    f.style.animationDuration = `${18 + Math.random() * 17}s`;
    f.style.animationDelay = `${-Math.random() * 28}s`;
    f.style.fontSize = `${12 + Math.random() * 13}px`;
    sky.appendChild(f);
  }

  // PIN lock
  const lock = $('#lock-screen');
  const lockCard = $('.lock-card');
  const dots = $('#pin-dots');
  const pad = $('#pin-pad');
  const err = $('#lock-error');
  $('#lock-hint').textContent = CFG.lockHint;
  let entered = '';
  const pin = String(CFG.password).replace(/\D/g, '');
  function drawDots() {
    dots.innerHTML = '';
    for (let i = 0; i < pin.length; i++) {
      const s = document.createElement('span');
      if (i < entered.length) s.className = 'on';
      dots.appendChild(s);
    }
  }
  function key(n, extra = '') {
    const b = document.createElement('button');
    b.className = `pin-key ${extra}`.trim();
    b.textContent = n;
    b.type = 'button';
    return b;
  }
  [...'123456789'].forEach(n => {
    const b = key(n);
    b.addEventListener('click', () => press(n));
    pad.appendChild(b);
  });
  pad.appendChild(key('', 'ghost'));
  const zero = key('0'); zero.addEventListener('click', () => press('0')); pad.appendChild(zero);
  const del = key('⌫', 'delete'); del.addEventListener('click', () => { entered = entered.slice(0, -1); drawDots(); }); pad.appendChild(del);
  function press(n) {
    if (entered.length >= pin.length) return;
    entered += n; drawDots();
    if (entered.length === pin.length) checkPin();
  }
  function checkPin() {
    if (entered === pin) unlock();
    else {
      err.textContent = 'Try that again ✦';
      lockCard.classList.remove('shake'); void lockCard.offsetWidth; lockCard.classList.add('shake');
      entered = ''; drawDots();
    }
  }
  window.addEventListener('keydown', e => {
    if (!lock.classList.contains('hidden')) {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') { entered = entered.slice(0, -1); drawDots(); }
    }
  });
  drawDots();

  // Dependency-free confetti.
  function burst(count = 75) {
    const host = document.createElement('div'); host.className = 'burst-host'; document.body.appendChild(host);
    const tones = ['#8f72be', '#c6a7de', '#ebbfd6', '#a8cdbd', '#ead695', '#7a5c9f'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      p.style.left = '50%'; p.style.top = '50%';
      p.style.setProperty('--dx', `${(Math.random() * 2 - 1) * 700}px`);
      p.style.setProperty('--dy', `${(Math.random() * 2 - 1) * 520}px`);
      p.style.setProperty('--r', `${Math.random() * 900 - 450}deg`);
      p.style.background = tones[i % tones.length];
      host.appendChild(p);
    }
    setTimeout(() => host.remove(), 1700);
  }

  const reveal = $('#reveal');
  function unlock() {
    err.textContent = '';
    startSong1();
    lock.classList.add('hidden');
    reveal.setAttribute('aria-hidden', 'false');
    reveal.classList.add('show');
    burst(110);
    setTimeout(() => burst(90), 360);
    setTimeout(() => {
      reveal.classList.remove('show');
      $('#site').hidden = false;
      document.body.classList.remove('loading');
      $('#site').classList.add('ready');
      requestAnimationFrame(() => $('.hero')?.classList.add('in-view'));
    }, 1750);
  }

  // Song 1 starts from the PIN gesture. Browser autoplay failures get a tiny resume chip.
  const song1 = $('#song1-audio');
  const chip = $('#audio-chip');
  const chipLabel = $('#audio-chip-label');
  song1.src = CFG.song1.src; song1.volume = 0.75;
  function startSong1() {
    song1.play().then(() => {
      chip.classList.add('playing'); chipLabel.textContent = `${CFG.song1.title} · playing`;
    }).catch(() => {
      chip.classList.remove('playing'); chipLabel.textContent = 'tap to start the soundtrack';
    });
  }
  function toggleSong1() {
    if (song1.paused) song1.play().then(() => { chip.classList.add('playing'); chipLabel.textContent = `${CFG.song1.title} · playing`; });
    else { song1.pause(); chip.classList.remove('playing'); chipLabel.textContent = `${CFG.song1.title} · paused`; }
  }
  chip.addEventListener('click', toggleSong1);
  chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSong1(); } });

  // Predictable scene entrances.
  const pageIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  }), { threshold: .22 });
  $$('.page').forEach(s => pageIO.observe(s));

  // Memories
  const memoryGrid = $('#polaroid-grid');
  const camera = $('#camera');
  const memoryCount = $('#memory-count');
  let memoryIndex = 0;
  function revealMemory() {
    if (memoryIndex >= CFG.memories.length) return;
    const item = CFG.memories[memoryIndex];
    const card = document.createElement('article');
    card.className = 'polaroid';
    card.style.setProperty('--rot', `${(Math.random() * 8 - 4).toFixed(1)}deg`);
    card.innerHTML = `<div class="polaroid-photo"><img src="${item.src}" alt="${item.caption}" loading="lazy"></div><p>${item.caption}</p>`;
    memoryGrid.appendChild(card);
    memoryIndex++;
    const left = CFG.memories.length - memoryIndex;
    memoryCount.textContent = left ? `${left} memor${left === 1 ? 'y' : 'ies'} waiting` : 'every memory revealed ✦';
    if (!left) camera.disabled = true;
    burst(memoryIndex === 1 ? 34 : 16);
  }
  camera.addEventListener('click', revealMemory);

  // Cake cutting: pointer/touch gesture + one-click fallback. Completion never depends on another section.
  const arena = $('#cake-arena'), knife = $('#knife'), meter = $('#meter-fill'), cutGuide = $('#cut-swipe');
  const cakeLeft = $('#cake-left'), cakeRight = $('#cake-right'), success = $('#cake-success');
  const hint = $('#cake-hint');
  let cakeDone = false, cutting = false, startX = 0, progress = 0;
  function updateKnife(x) {
    const r = arena.getBoundingClientRect();
    const rel = clamp(x - r.left, 0, r.width);
    knife.style.left = `${rel}px`;
    progress = clamp(rel / r.width, 0, 1);
    meter.style.width = `${Math.round(progress * 100)}%`;
    cutGuide.style.left = `${rel}px`;
  }
  function finishCake() {
    if (cakeDone) return;
    cakeDone = true; cutting = false;
    cakeLeft.classList.add('cut-left'); cakeRight.classList.add('cut-right');
    knife.classList.add('hide'); cutGuide.classList.add('show'); arena.classList.add('done');
    hint.textContent = 'Perfect. Cake officially cut ✦';
    success.hidden = false;
    burst(110);
  }
  function down(e) {
    if (cakeDone) return;
    cutting = true; startX = e.clientX;
    arena.setPointerCapture?.(e.pointerId);
    arena.classList.add('cutting'); updateKnife(e.clientX);
  }
  function move(e) {
    if (!cutting || cakeDone) return;
    updateKnife(e.clientX);
    const r = arena.getBoundingClientRect();
    if (e.clientX - r.left > r.width * .78 && e.clientX - startX > r.width * .42) finishCake();
  }
  function up() {
    if (!cakeDone) {
      cutting = false; arena.classList.remove('cutting'); knife.classList.remove('hide');
      if (progress < .78) { knife.style.left = '12%'; cutGuide.classList.remove('show'); meter.style.width = '0%'; }
    }
  }
  arena.addEventListener('pointerdown', down);
  arena.addEventListener('pointermove', move);
  arena.addEventListener('pointerup', up);
  arena.addEventListener('pointercancel', up);
  $('#cut-button').addEventListener('click', finishCake);
  requestAnimationFrame(() => updateKnife(arena.getBoundingClientRect().left + arena.getBoundingClientRect().width * 0.12));

  // Gallery + lightbox
  const gallery = $('#gallery-grid'), lightbox = $('#lightbox'), lbImg = $('#lightbox-img'), lbCap = $('#lightbox-caption');
  let galleryIndex = 0;
  CFG.gallery.forEach((item, i) => {
    const b = document.createElement('button');
    b.className = 'gallery-card';
    b.style.setProperty('--rot', `${(Math.random() * 5 - 2.5).toFixed(1)}deg`);
    b.innerHTML = `<span class="gallery-corner" aria-hidden="true"><img src="assets/decor/frame-corner.svg" alt=""></span><img src="${item.src}" alt="${item.caption}" loading="lazy"><span>${item.caption}</span><i>⤢</i>`;
    b.addEventListener('click', () => openLightbox(i)); gallery.appendChild(b);
  });
  function openLightbox(i) { galleryIndex = i; renderLightbox(); lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false'); }
  function renderLightbox() { const item = CFG.gallery[galleryIndex]; lbImg.src = item.src; lbImg.alt = item.caption; lbCap.textContent = item.caption; }
  function closeLightbox() { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); }
  $('#lightbox-close').addEventListener('click', closeLightbox);
  $('#lightbox-prev').addEventListener('click', () => { galleryIndex = (galleryIndex - 1 + CFG.gallery.length) % CFG.gallery.length; renderLightbox(); });
  $('#lightbox-next').addEventListener('click', () => { galleryIndex = (galleryIndex + 1) % CFG.gallery.length; renderLightbox(); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Candle wish ritual
  const candle = $('#candle'), wishDone = $('#wish-done'), instruction = $('#wish-instruction'); let candleOut = false;
  function extinguish() {
    if (candleOut) return;
    candleOut = true; candle.classList.add('out'); instruction.textContent = 'Wish made ✦'; wishDone.hidden = false; burst(70);
  }
  candle.addEventListener('click', extinguish);
  $('#relight').addEventListener('click', e => { e.stopPropagation(); candleOut = false; candle.classList.remove('out'); wishDone.hidden = true; instruction.textContent = CFG.wishInstruction; });

  // Envelope: rebuilt as a clear three-layer letter reveal so the sheet cannot disappear behind the flap.
  const envelope = $('#envelope'), letterText = $('#letter-text'), letterSign = $('#letter-sign'); let opened = false;
  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');
    envelope.setAttribute('aria-pressed', 'true');
    typewrite(CFG.noteText, letterText, () => letterSign.textContent = `— ${CFG.senderName}`);
    burst(42);
  });
  function typewrite(text, el, done) {
    let i = 0; el.textContent = '';
    const tick = () => { el.textContent = text.slice(0, i++); if (i <= text.length) setTimeout(tick, 15); else done?.(); };
    tick();
  }

  // Wishes
  const wishGrid = $('#wish-grid');
  CFG.wishCards.forEach((w, i) => {
    const card = document.createElement('button');
    card.className = 'wish-card'; card.type = 'button';
    card.innerHTML = `<span class="wish-front"><span class="wish-corner" aria-hidden="true"><img src="assets/decor/frame-corner.svg" alt=""></span><small>0${i + 1}</small><b>♡</b><em>tap to open</em></span><span class="wish-back"><small>for Himanya</small><strong>${w.text}</strong><i>✦</i></span>`;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    wishGrid.appendChild(card);
  });

  // Surprise video reveal: Google Drive /file/d/.../view -> /preview.
  // The normal link remains available underneath because Drive sharing / iframe
  // embedding depends on the file's public-access settings.
  const gift = $('#surprise-gift'), surprise = $('#surprise-reveal'), frame = $('#video-frame');
  const videoFallback = $('#video-fallback'), videoOpenLink = $('#video-open-link');
  function drivePreview(url) {
    const m = String(url).match(/\/d\/([\w-]+)/) || String(url).match(/[?&]id=([\w-]+)/);
    return m ? `https://drive.google.com/file/d/${m[1]}/preview` : null;
  }
  gift.addEventListener('click', () => {
    const shareUrl = String(CFG.surpriseVideoUrl || '').trim();
    const previewUrl = drivePreview(shareUrl);
    surprise.hidden = false; gift.classList.add('opened');
    if (previewUrl) {
      frame.src = previewUrl;
      videoOpenLink.href = shareUrl;
      videoFallback.hidden = false;
    } else {
      videoFallback.hidden = false;
      videoOpenLink.removeAttribute('href');
      showToast('Add a valid Google Drive sharing link in js/config.js');
    }
    setTimeout(() => surprise.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    burst(90);
  });

  $('#replay').addEventListener('click', () => location.reload());
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  function showToast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(showToast.t); showToast.t = setTimeout(() => t.classList.remove('show'), 2600); }
})();
