/* ==========================================================================
   ADAM MISIURA - PIXEL PORTFOLIO ENGINE (Pure Vanilla JS)
   - Retro 8-bit Web Audio SFX Synthesizer (Zero external MP3 needed)
   - Interactive Starfield & Matrix Pixel Background
   - RPG Dialogue Typewriter
   - Lightbox Gallery for WTE & Project Screenshots (Easy to replace images!)
   - Mini-Game: "Flappy Pixel"
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. 8-BIT CHIPTUNE SOUND SYNTHESIZER (Web Audio API - Off by default)
     -------------------------------------------------------------------------- */
  let sfxEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playTone(freq, type, duration, vol = 0.08) {
    if (!sfxEnabled) return;
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playCoinSfx() {
    if (!sfxEnabled) return;
    playTone(987.77, 'square', 0.08, 0.07); // B5
    setTimeout(() => playTone(1318.51, 'square', 0.22, 0.07), 80); // E6
  }

  function playBlipSfx() {
    if (!sfxEnabled) return;
    playTone(520, 'square', 0.045, 0.04);
  }

  function playLaserSfx() {
    if (!sfxEnabled) return;
    playTone(880, 'sawtooth', 0.06, 0.06);
    setTimeout(() => playTone(440, 'sawtooth', 0.09, 0.06), 45);
  }

  // Toggle buttons in HUD
  const sfxBtn = document.getElementById('toggle-sfx');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      sfxBtn.classList.toggle('active-toggle', sfxEnabled);
      sfxBtn.innerHTML = sfxEnabled
        ? '<i class="fas fa-volume-up"></i> SFX: ON'
        : '<i class="fas fa-volume-mute"></i> SFX: OFF';
      if (sfxEnabled) playCoinSfx();
    });
  }

  const crtBtn = document.getElementById('toggle-crt');
  if (crtBtn) {
    crtBtn.addEventListener('click', () => {
      document.body.classList.toggle('crt-enabled');
      const isOn = document.body.classList.contains('crt-enabled');
      crtBtn.classList.toggle('active-toggle', isOn);
      crtBtn.innerHTML = isOn
        ? '<i class="fas fa-tv"></i> CRT: ON'
        : '<i class="fas fa-tv"></i> CRT: OFF';
      playBlipSfx();
    });
  }

  // Attach subtle hover blip to buttons and nav links
  document.querySelectorAll('.pixel-btn, .hud-nav a, .social-pixel-btn').forEach((el) => {
    el.addEventListener('mouseenter', () => playBlipSfx());
  });

  /* --------------------------------------------------------------------------
     2. RPG DIALOGUE TYPEWRITER
     -------------------------------------------------------------------------- */
  const dialogues = [
    'Cześć! Jestem doświadczonym fullstackiem aplikacji webowych i mobilnych — ponad 12 lat w IT, 5 lat z React Native i 2 lata z NestJS.',
    'Tworzę flagowy produkt ogrodniczy Plantiano.pl (RN 0.86, React 19, NestJS, AI) oraz systemy B2B.',
    'Zagraj w moje gry przeglądarkowe: PixelWalk i MicroMetropolis lub posłuchaj moich utworów na Spotify!',
    'Kliknij dowolny monitor CRT lub screen projektu poniżej, aby powiększyć podgląd.'
  ];
  let currentDialogueIdx = 0;
  let charIdx = 0;
  const twTarget = document.getElementById('typewriter-box');
  const nextDialogueBtn = document.getElementById('next-dialogue-btn');

  function typeStep() {
    if (!twTarget) return;
    const text = dialogues[currentDialogueIdx];
    if (charIdx <= text.length) {
      twTarget.textContent = text.slice(0, charIdx);
      charIdx++;
      setTimeout(typeStep, 28);
    }
  }

  if (twTarget) {
    typeStep();
  }

  if (nextDialogueBtn) {
    nextDialogueBtn.addEventListener('click', () => {
      playCoinSfx();
      currentDialogueIdx = (currentDialogueIdx + 1) % dialogues.length;
      charIdx = 0;
      typeStep();
    });
  }

  /* --------------------------------------------------------------------------
     3. UNIVERSAL PIXEL LIGHTBOX MODAL (single screens & grouped galleries)
     -------------------------------------------------------------------------- */
  const modal = document.getElementById('pixel-lightbox');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const modalCounter = document.getElementById('lightbox-counter');
  const btnPrev = document.getElementById('lightbox-prev');
  const btnNext = document.getElementById('lightbox-next');
  const btnClose = document.getElementById('lightbox-close');

  let activeGallery = [];
  let activeIndex = 0;

  function openGalleryModal(items, startIndex) {
    if (!modal || !items.length) return;
    activeGallery = items;
    activeIndex = startIndex;
    updateModalView();
    modal.classList.add('open');
    playCoinSfx();
  }

  function updateModalView() {
    const item = activeGallery[activeIndex];
    if (!item) return;
    modalImg.src = item.src;
    modalImg.alt = item.caption || 'Podgląd ekranu';
    modalCaption.textContent = item.caption || 'Podgląd ekranu projektu';
    modalCounter.textContent = `SCREEN ${activeIndex + 1} / ${activeGallery.length}`;
    if (activeGallery.length <= 1) {
      btnPrev.style.display = 'none';
      btnNext.style.display = 'none';
    } else {
      btnPrev.style.display = 'block';
      btnNext.style.display = 'block';
    }
  }

  function closeGalleryModal() {
    if (!modal) return;
    modal.classList.remove('open');
    playBlipSfx();
  }

  function changeSlide(delta) {
    if (!activeGallery.length) return;
    activeIndex = (activeIndex + delta + activeGallery.length) % activeGallery.length;
    updateModalView();
    playBlipSfx();
  }

  if (btnPrev) btnPrev.addEventListener('click', () => changeSlide(-1));
  if (btnNext) btnNext.addEventListener('click', () => changeSlide(1));
  if (btnClose) btnClose.addEventListener('click', closeGalleryModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGalleryModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeGalleryModal();
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
  });

  // Bind any single/project screenshot with [data-lightbox-group]
  const projectScreens = Array.from(document.querySelectorAll('[data-lightbox-src]'));
  projectScreens.forEach((el) => {
    el.addEventListener('click', () => {
      const group = el.getAttribute('data-lightbox-group');
      if (group) {
        const groupEls = Array.from(document.querySelectorAll(`[data-lightbox-group="${group}"]`));
        const groupItems = groupEls.map((g) => ({
          src: g.getAttribute('data-lightbox-src'),
          caption: g.getAttribute('data-lightbox-caption')
        }));
        const startIdx = groupEls.indexOf(el);
        openGalleryModal(groupItems, Math.max(0, startIdx));
      } else {
        openGalleryModal(
          [
            {
              src: el.getAttribute('data-lightbox-src'),
              caption: el.getAttribute('data-lightbox-caption')
            }
          ],
          0
        );
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. ANIMATED PIXEL STARFIELD BACKGROUND
     -------------------------------------------------------------------------- */
  const starCanvas = document.getElementById('starfield-canvas');
  if (starCanvas) {
    const sCtx = starCanvas.getContext('2d');
    let stars = [];

    function resizeStarfield() {
      starCanvas.width = window.innerWidth;
      starCanvas.height = window.innerHeight;
      stars = Array.from({ length: 75 }, () => ({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        size: Math.random() > 0.75 ? 3 : 2,
        speed: 0.15 + Math.random() * 0.45,
        color: ['#00f5d4', '#ffbe0b', '#ff2a85', '#9b5de5', '#ffffff'][
          Math.floor(Math.random() * 5)
        ]
      }));
    }

    function drawStars() {
      sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      for (const st of stars) {
        sCtx.fillStyle = st.color;
        sCtx.fillRect(Math.floor(st.x), Math.floor(st.y), st.size, st.size);
        st.y -= st.speed;
        if (st.y < 0) {
          st.y = starCanvas.height;
          st.x = Math.random() * starCanvas.width;
        }
      }
      requestAnimationFrame(drawStars);
    }

    window.addEventListener('resize', resizeStarfield);
    resizeStarfield();
    drawStars();
  }

  /* --------------------------------------------------------------------------
     5. BONUS MINI-GAME: FLAPPY PIXEL
     -------------------------------------------------------------------------- */
  const arcadeCanvas = document.getElementById('arcade-canvas');
  const scoreEl = document.getElementById('arcade-score');
  const bestEl = document.getElementById('arcade-best');
  const champNameEl = document.getElementById('arcade-champ-name');
  const resetArcadeBtn = document.getElementById('arcade-reset-btn');
  const recordForm = document.getElementById('arcade-record-form');
  const nameInput = document.getElementById('arcade-name-input');

  if (arcadeCanvas) {
    const ctx = arcadeCanvas.getContext('2d');
    const W = arcadeCanvas.width;
    const H = arcadeCanvas.height;
    const GROUND_H = 64;
    const BIRD_X = 148;
    const BIRD_R = 13;
    const PIPE_W = 54;
    const GAP = 132;
    const SPEED = 2.55;
    const GRAVITY = 0.28;
    const FLAP = -6.05;
    const SPAWN_MS = 1450;
    const CHAMP_KEY = 'flappy-pixel-champion';

    let mode = 'ready';
    let awaitingName = false;
    let birdY = H / 2;
    let birdVy = 0;
    let pipes = [];
    let score = 0;
    let champion = loadChampion();
    let lastSpawn = 0;
    let groundX = 0;
    let bobT = 0;

    function loadChampion() {
      try {
        const raw = localStorage.getItem(CHAMP_KEY);
        if (!raw) return { name: '', score: 0 };
        const data = JSON.parse(raw);
        const scoreVal = Number(data.score) || 0;
        const name = String(data.name || '').trim();
        return { name, score: scoreVal };
      } catch (err) {
        return { name: '', score: 0 };
      }
    }

    function saveChampion(name, champScore) {
      champion = { name, score: champScore };
      localStorage.setItem(CHAMP_KEY, JSON.stringify(champion));
      setHud();
    }

    function sanitizeName(value) {
      return String(value || '')
        .replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ _-]/g, '')
        .trim()
        .slice(0, 12)
        .toUpperCase();
    }

    function padScore(n) {
      return String(n).padStart(5, '0');
    }

    function setHud() {
      if (scoreEl) scoreEl.textContent = padScore(score);
      if (bestEl) bestEl.textContent = padScore(champion.score);
      if (champNameEl) champNameEl.textContent = champion.name || '---';
    }

    function openRecordForm() {
      awaitingName = true;
      if (!recordForm || !nameInput) {
        saveChampion('GRACZ', score);
        awaitingName = false;
        return;
      }
      recordForm.hidden = false;
      nameInput.value = '';
      setTimeout(() => nameInput.focus(), 30);
    }

    function closeRecordForm() {
      awaitingName = false;
      if (recordForm) recordForm.hidden = true;
    }

    function resetGame(keepMode) {
      birdY = H / 2;
      birdVy = 0;
      pipes = [];
      score = 0;
      lastSpawn = 0;
      groundX = 0;
      mode = keepMode || 'ready';
      setHud();
    }

    function flap() {
      if (awaitingName) return;
      if (mode === 'ready') {
        mode = 'play';
        lastSpawn = performance.now() - SPAWN_MS + 400;
      }
      if (mode === 'dead') {
        resetGame('play');
        lastSpawn = performance.now() - SPAWN_MS + 500;
      }
      if (mode === 'play') {
        birdVy = FLAP;
        playBlipSfx();
      }
    }

    function spawnPipe() {
      const margin = 36;
      const minGapY = margin + GAP / 2;
      const maxGapY = H - GROUND_H - margin - GAP / 2;
      pipes.push({
        x: W + 10,
        gapY: minGapY + Math.random() * (maxGapY - minGapY),
        scored: false
      });
    }

    function birdHitbox() {
      return {
        x: BIRD_X - BIRD_R + 3,
        y: birdY - BIRD_R + 3,
        w: BIRD_R * 2 - 6,
        h: BIRD_R * 2 - 6
      };
    }

    function hitsPipe(p) {
      const b = birdHitbox();
      const topH = p.gapY - GAP / 2;
      const botY = p.gapY + GAP / 2;
      const inX = b.x + b.w > p.x && b.x < p.x + PIPE_W;
      if (!inX) return false;
      return b.y < topH || b.y + b.h > botY;
    }

    function drawSky() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#4ec0ca');
      g.addColorStop(1, '#70c5ce');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      [[80, 70, 46], [250, 50, 38], [480, 90, 52], [640, 40, 34]].forEach(([cx, cy, r]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.7, cy + 6, r * 0.72, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function drawPipe(p) {
      const topH = p.gapY - GAP / 2;
      const botY = p.gapY + GAP / 2;
      const botH = H - GROUND_H - botY;

      function pipeBody(x, y, w, h, cap) {
        ctx.fillStyle = '#73bf2e';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#9ae05c';
        ctx.fillRect(x + 6, y, 8, h);
        ctx.fillStyle = '#2e7d14';
        ctx.fillRect(x + w - 8, y, 8, h);
        ctx.strokeStyle = '#16380a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        if (cap === 'bottom') {
          ctx.fillStyle = '#5aa623';
          ctx.fillRect(x - 4, y + h - 18, w + 8, 18);
          ctx.strokeRect(x - 3, y + h - 17, w + 6, 16);
        }
        if (cap === 'top') {
          ctx.fillStyle = '#5aa623';
          ctx.fillRect(x - 4, y, w + 8, 18);
          ctx.strokeRect(x - 3, y + 1, w + 6, 16);
        }
      }

      pipeBody(p.x, 0, PIPE_W, topH, 'top');
      pipeBody(p.x, botY, PIPE_W, botH, 'bottom');
    }

    function drawGround() {
      const y = H - GROUND_H;
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, y, W, GROUND_H);
      ctx.fillStyle = '#5ee270';
      ctx.fillRect(0, y, W, 14);
      ctx.fillStyle = '#4ec157';
      for (let x = -((groundX | 0) % 24); x < W; x += 24) {
        ctx.fillRect(x, y + 4, 12, 6);
      }
      ctx.fillStyle = '#c2a14a';
      for (let x = -((groundX | 0) % 18); x < W; x += 18) {
        ctx.fillRect(x, y + 22, 10, 8);
      }
      ctx.strokeStyle = '#3d2a10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    function drawBird() {
      const x = BIRD_X;
      const y = birdY;
      const tilt = Math.max(-0.5, Math.min(0.7, birdVy / 8));
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(tilt);

      ctx.fillStyle = '#f7d44a';
      ctx.fillRect(-12, -10, 24, 20);
      ctx.fillStyle = '#e8b51a';
      ctx.fillRect(-12, 2, 24, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(2, -8, 8, 8);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(6, -5, 3, 3);
      ctx.fillStyle = '#f08a28';
      ctx.fillRect(10, -2, 10, 6);
      ctx.fillStyle = '#d96b12';
      ctx.fillRect(10, 1, 10, 3);
      ctx.fillStyle = '#f5e27a';
      const wing = Math.sin(bobT / 80) > 0 ? -8 : 2;
      ctx.fillRect(-10, wing, 14, 7);

      ctx.restore();
    }

    function drawOverlay() {
      ctx.fillStyle = 'rgba(8, 10, 20, 0.45)';
      ctx.fillRect(0, H / 2 - 58, W, 110);
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffbe0b';
      if (mode === 'ready') {
        ctx.font = 'bold 22px "Press Start 2P", monospace';
        ctx.fillText('FLAPPY PIXEL', W / 2, H / 2 - 12);
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('KLIKNIJ / SPACJA', W / 2, H / 2 + 22);
      } else if (!awaitingName) {
        ctx.fillText('GAME OVER', W / 2, H / 2 - 12);
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('KLIKNIJ ABY GRAĆ DALEJ', W / 2, H / 2 + 22);
      }
    }

    function step(now) {
      bobT = now;
      if (mode === 'play') {
        birdVy += GRAVITY;
        birdY += birdVy;
        groundX += SPEED;

        if (now - lastSpawn > SPAWN_MS) {
          spawnPipe();
          lastSpawn = now;
        }

        for (const p of pipes) {
          p.x -= SPEED;
          if (!p.scored && p.x + PIPE_W < BIRD_X) {
            p.scored = true;
            score += 1;
            setHud();
            playCoinSfx();
          }
        }
        pipes = pipes.filter((p) => p.x + PIPE_W > -20);

        const hitGround = birdY + BIRD_R >= H - GROUND_H;
        const hitCeil = birdY - BIRD_R <= 0;
        if (hitGround || hitCeil || pipes.some(hitsPipe)) {
          mode = 'dead';
          playLaserSfx();
          if (score > champion.score) {
            openRecordForm();
          }
        }
      } else if (mode === 'ready') {
        birdY = H / 2 + Math.sin(now / 220) * 8;
        groundX += 1.2;
      }

      drawSky();
      pipes.forEach(drawPipe);
      drawGround();
      drawBird();
      if (mode !== 'play') drawOverlay();

      requestAnimationFrame(step);
    }

    function onPointer(e) {
      e.preventDefault();
      flap();
    }

    arcadeCanvas.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      const section = document.getElementById('arcade');
      if (section) {
        const r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
      }
      e.preventDefault();
      flap();
    });

    if (recordForm) {
      recordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nick = sanitizeName(nameInput ? nameInput.value : '') || 'GRACZ';
        saveChampion(nick, score);
        closeRecordForm();
        playCoinSfx();
      });
    }

    if (resetArcadeBtn) {
      resetArcadeBtn.addEventListener('click', () => {
        closeRecordForm();
        resetGame('ready');
        playCoinSfx();
      });
    }

    setHud();
    requestAnimationFrame(step);
  }
})();
