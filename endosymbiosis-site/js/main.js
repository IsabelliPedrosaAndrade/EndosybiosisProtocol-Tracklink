/* =========================================================
   ENDOSYMBIOSIS PROTOCOL — script do site
   JavaScript puro, sem bibliotecas.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  // Animações ligadas? (respeita "reduzir movimento" do sistema)
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motion = !reduceMQ.matches;
  function onMotionChange() {
    motion = !reduceMQ.matches;
    root.classList.toggle('motion', motion);
  }
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onMotionChange);
  var behavior = function () { return motion ? 'smooth' : 'auto'; };

  /* ---------------------------------------------------------
     Aviso no rodapé da tela ("LINK COPIADO" etc.)
     --------------------------------------------------------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------------------------------------------------------
     Ícones em pixel art (# = pixel aceso)
     --------------------------------------------------------- */
  var ICONS = {
    micro: [
      '.....##.....',
      '.....##.....',
      '....####....',
      '.....##.....',
      '.....##..##.',
      '.....##...#.',
      '....####..#.',
      '..........#.',
      '...######.#.',
      '.....##..#..',
      '...######...',
      '.##########.'
    ],
    drop: [
      '.....##.....',
      '.....##.....',
      '....####....',
      '....####....',
      '...######...',
      '..########..',
      '..##.#####..',
      '.##.#######.',
      '.##.#######.',
      '.##########.',
      '..########..',
      '...######...'
    ],
    bolt: [
      '......####..',
      '.....####...',
      '....####....',
      '...####.....',
      '..########..',
      '.....####...',
      '....####....',
      '...####.....',
      '..###.......',
      '.##.........',
      '##..........',
      '............'
    ],
    tube: [
      '...######...',
      '....#..#....',
      '....#..#....',
      '....#..#....',
      '....#..#....',
      '....#..#....',
      '....####....',
      '....####....',
      '....####....',
      '....####....',
      '.....##.....',
      '............'
    ],
    safe: [
      '############',
      '#..........#',
      '#.########.#',
      '#.#......#.#',
      '#.#..##..#.#',
      '#.#.#..#.###',
      '#.#.#..#.###',
      '#.#..##..#.#',
      '#.#......#.#',
      '#.########.#',
      '#..........#',
      '############'
    ],
    plant: [
      '......##....',
      '....####....',
      '...###.#....',
      '.....#..##..',
      '.##..#.###..',
      '.###.#.##...',
      '..####......',
      '.....#......',
      '..########..',
      '...######...',
      '...######...',
      '....####....'
    ],
    uv: [
      '#....#....#.',
      '.#...#...#..',
      '............',
      '..########..',
      '..#......#..',
      '..########..',
      '...######...',
      '....####....',
      '....####....',
      '....####....',
      '....####....',
      '.....##.....'
    ],
    note: [
      '#########...',
      '#.......##..',
      '#.######.##.',
      '#..........#',
      '#.########.#',
      '#..........#',
      '#.#######..#',
      '#..........#',
      '#.######...#',
      '#..........#',
      '#..........#',
      '############'
    ],
    unknown: [
      '....####....',
      '...##..##...',
      '...##..##...',
      '.......##...',
      '......##....',
      '.....##.....',
      '.....##.....',
      '............',
      '.....##.....',
      '.....##.....',
      '............',
      '............'
    ],
    drawer: [
      '############',
      '#..........#',
      '#...####...#',
      '#..........#',
      '############',
      '#..........#',
      '#...####...#',
      '#..........#',
      '############',
      '#..........#',
      '#...####...#',
      '############'
    ],
    lock: [
      '....####....',
      '...#....#...',
      '..#......#..',
      '..#......#..',
      '..#......#..',
      '############',
      '#..........#',
      '#....##....#',
      '#....##....#',
      '#.....#....#',
      '#..........#',
      '############'
    ],
    mouse: [
      '...######...',
      '..#...#..#..',
      '..#...#..#..',
      '..#...#..#..',
      '..########..',
      '..#......#..',
      '..#......#..',
      '..#......#..',
      '..#......#..',
      '...######...',
      '............',
      '............'
    ],
    keyboard: [
      '............',
      '............',
      '############',
      '#.#.#.#.#.##',
      '############',
      '##.#.#.#.#.#',
      '############',
      '#.##......##',
      '############',
      '............',
      '............',
      '............'
    ]
  };

  function iconSVG(name) {
    var rows = ICONS[name];
    if (!rows) return '';
    var w = rows[0].length, h = rows.length, d = '';
    rows.forEach(function (row, y) {
      var x = 0;
      while (x < w) {
        if (row[x] === '#') {
          var start = x;
          while (x < w && row[x] === '#') x++;
          d += 'M' + start + ' ' + y + 'h' + (x - start) + 'v1h-' + (x - start) + 'z';
        } else {
          x++;
        }
      }
    });
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><path fill="currentColor" d="' + d + '"/></svg>';
  }
  $$('[data-icon]').forEach(function (el) { el.innerHTML = iconSVG(el.getAttribute('data-icon')); });

  /* ---------------------------------------------------------
     Digitação do texto de abertura
     --------------------------------------------------------- */
  (function typeHero() {
    var el = $('.typed');
    if (!el) return;
    var out = $('.typed-out', el);
    var text = el.getAttribute('data-type') || '';
    if (!motion) { out.textContent = text; return; }
    var i = 0;
    function tick() {
      i++;
      out.textContent = text.slice(0, i);
      if (i < text.length) {
        var ch = text.charAt(i - 1);
        setTimeout(tick, ch === '.' ? 420 : 38 + Math.random() * 45);
      }
    }
    setTimeout(tick, 1300);
  })();

  /* ---------------------------------------------------------
     Janelas de mídia (vídeo ou imagem pelo data-src)
     --------------------------------------------------------- */
  var IMG_RE = /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // Vídeos só carregam e tocam quando a janela aparece; pausam quando ela sai
  var videoIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = $('video', en.target);
      if (!v) return;
      if (en.isIntersecting) {
        if (!v.getAttribute('src')) {
          // Sem animação automática: só busca as informações e mostra o botão de play
          if (!motion) v.preload = 'metadata';
          v.setAttribute('src', v.getAttribute('data-src'));
        }
        if (motion) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { threshold: 0.35 }) : null;

  function buildWindow(fig) {
    var title = fig.getAttribute('data-title') || 'REGISTRO.MP4';
    var src = (fig.getAttribute('data-src') || '').trim();
    var poster = (fig.getAttribute('data-poster') || '').trim();
    var alt = fig.getAttribute('data-alt') || '';
    var caption = fig.getAttribute('data-caption');
    var isImg = IMG_RE.test(src);

    fig.innerHTML =
      '<div class="mwin-bar" aria-hidden="true"><span class="mwin-dot"></span>' +
      '<span class="mwin-title">' + esc(title) + '</span>' +
      '<span class="mwin-btns"><i></i><i></i><i></i></span></div>' +
      '<div class="mwin-screen">' +
      '<div class="mwin-off" aria-hidden="true"><strong>SINAL AUSENTE</strong><span>aguardando gravação</span></div>' +
      '<span class="mwin-rec" aria-hidden="true"><i>●</i> ' + (isImg ? 'ARQ' : 'REC') + '</span>' +
      '<span class="mwin-stamp" aria-hidden="true">CICLO 147 · <span class="mwin-time">00:00:00</span></span>' +
      '</div>' +
      (caption ? '<figcaption>' + esc(caption) + '</figcaption>' : '');

    var screen = $('.mwin-screen', fig);
    var loaded = function () { fig.classList.add('is-loaded'); };
    if (!src) return;

    if (isImg) {
      var img = document.createElement('img');
      img.alt = alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', loaded);
      img.addEventListener('error', function () { img.remove(); });
      img.src = src;
      screen.insertBefore(img, screen.firstChild);
      return;
    }

    var v = document.createElement('video');
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'none';
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('data-src', src);
    if (alt) v.setAttribute('aria-label', alt);
    v.addEventListener('loadedmetadata', function () {
      if (!motion) v.controls = true; // sem animação automática: a pessoa aperta play se quiser
      loaded();
    });
    if (poster) {
      v.poster = poster;
      var test = new Image();
      test.onload = loaded;
      test.src = poster;
    }
    v.addEventListener('loadeddata', loaded);
    screen.insertBefore(v, screen.firstChild);
    if (videoIO) videoIO.observe(fig);
    else v.setAttribute('src', src);
  }
  $$('.mwin').forEach(buildWindow);

  // Relógio "CICLO 147 · 02:47:13" nas janelas
  var clockStart = Date.now() - (2 * 3600 + 47 * 60) * 1000;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  setInterval(function () {
    if (document.hidden) return;
    var s = Math.floor((Date.now() - clockStart) / 1000);
    var t = pad(Math.floor(s / 3600) % 24) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    $$('.mwin-time').forEach(function (el) { el.textContent = t; });
  }, 1000);

  // Foto da ficha do Aris (troca o placeholder se o arquivo existir)
  $$('.photo[data-src]').forEach(function (box) {
    var img = new Image();
    img.alt = box.getAttribute('data-alt') || '';
    img.loading = 'lazy';
    img.onload = function () { box.classList.add('is-loaded'); };
    img.onerror = function () { img.remove(); };
    img.src = box.getAttribute('data-src');
    box.appendChild(img);
  });

  /* ---------------------------------------------------------
     Textos censurados: passa o mouse ou toca para revelar
     --------------------------------------------------------- */
  $$('.redact').forEach(function (b) {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ---------------------------------------------------------
     Inventário de demonstração: clique seleciona
     --------------------------------------------------------- */
  var slots = $$('.inv-grid button.slot');
  slots.forEach(function (s) {
    s.addEventListener('click', function () {
      var on = s.getAttribute('aria-pressed') !== 'true';
      slots.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      s.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  });

  /* ---------------------------------------------------------
     Luz UV que segue o mouse/dedo
     --------------------------------------------------------- */
  var uv = $('#uvWall');
  if (uv) {
    var setUV = function (e) {
      var r = uv.getBoundingClientRect();
      uv.style.setProperty('--x', (e.clientX - r.left) + 'px');
      uv.style.setProperty('--y', (e.clientY - r.top) + 'px');
    };
    uv.addEventListener('pointermove', setUV);
    uv.addEventListener('pointerdown', setUV);
    uv.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') uv.style.setProperty('--x', '-999px');
    });
  }

  /* ---------------------------------------------------------
     Glitch rápido e raro
     --------------------------------------------------------- */
  function glitchOnce(el) {
    if (!el || !motion) return;
    el.classList.remove('is-glitching');
    void el.offsetWidth;
    el.classList.add('is-glitching');
    setTimeout(function () { el.classList.remove('is-glitching'); }, 450);
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  (function glitchLoop() {
    setTimeout(function () {
      if (motion && !document.hidden) {
        var vis = $$('.glitch:not(.glitch-loop)').filter(inView);
        if (vis.length) glitchOnce(vis[Math.floor(Math.random() * vis.length)]);
      }
      glitchLoop();
    }, 6000 + Math.random() * 8000);
  })();

  /* ---------------------------------------------------------
     Documentos e módulos deslizam para a tela ao aparecer
     --------------------------------------------------------- */
  function onRevealed(el) {
    // Os módulos do terminal passam de PENDENTE para CONCLUÍDO
    var badge = el.classList.contains('module') ? $('.badge', el) : null;
    if (badge) {
      setTimeout(function () {
        badge.textContent = 'CONCLUÍDO';
        badge.classList.add('done');
      }, motion ? 1200 : 0);
    }
  }
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        revealIO.unobserve(en.target);
        onRevealed(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); onRevealed(el); });
  }

  /* ---------------------------------------------------------
     Painel do terminal: PENDENTE → EM CURSO → CONCLUÍDO
     --------------------------------------------------------- */
  var sections = $$('main .screen');
  var navLinks = $$('[data-nav]');
  var hudN = $('#hudN');
  var hudName = $('#hudName');
  var LAST = sections.length - 1;
  var LABELS = {
    pendente: 'PENDENTE', atual: 'EM CURSO', concluido: 'CONCLUÍDO',
    bloqueado: 'BLOQUEADO', liberado: 'LIBERADO'
  };
  var current = -1;
  var maxReached = 0;

  function computeCurrent() {
    var line = window.innerHeight * 0.4;
    var idx = 0;
    sections.forEach(function (s, i) {
      if (s.getBoundingClientRect().top <= line) idx = i;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = LAST;
    return idx;
  }

  function updateNav() {
    var idx = computeCurrent();
    if (idx === current) return;
    var prev = current;
    current = idx;
    if (idx > maxReached) maxReached = idx;
    var allDone = maxReached === LAST;

    navLinks.forEach(function (a) {
      var i = Number(a.getAttribute('data-nav'));
      var st;
      if (i === LAST) st = allDone ? 'liberado' : 'bloqueado';
      else if (i === current && !allDone) st = 'atual';
      else if (i < maxReached || allDone) st = 'concluido';
      else st = 'pendente';
      a.setAttribute('data-state', st);
      $('.st', a).textContent = LABELS[st];
      if (i === current) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });

    hudN.textContent = current + 1;
    hudName.textContent = sections[current].getAttribute('data-name') || '';

    if (prev !== -1) glitchOnce($('.sec-title', sections[current]) || $('.hero-title .glitch', sections[current]));
    if (current === LAST && prev !== LAST && prev !== -1) toast('RELATÓRIO: LIBERADO');
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; updateNav(); });
  }, { passive: true });
  window.addEventListener('resize', updateNav);
  updateNav();

  /* ---------------------------------------------------------
     Navegação pelo teclado (modo apresentação)
     --------------------------------------------------------- */
  // Enquanto o teclado move a página, o "ímã" das seções fica desligado
  // (volta assim que a pessoa usa a rodinha do mouse ou o touchpad).
  function pauseSnap() { root.classList.add('no-snap'); }
  window.addEventListener('wheel', function () { root.classList.remove('no-snap'); }, { passive: true });

  function goTo(i) {
    i = Math.max(0, Math.min(LAST, i));
    pauseSnap();
    sections[i].scrollIntoView({ behavior: behavior(), block: 'start' });
  }

  function step(dir) {
    var sec = sections[Math.max(0, current)];
    var r = sec.getBoundingClientRect();
    var vh = window.innerHeight;
    // Seção mais alta que a tela: primeiro rola por dentro dela
    if (dir > 0 && r.bottom > vh + 8) {
      pauseSnap();
      window.scrollBy({ top: Math.min(vh * 0.85, r.bottom - vh), behavior: behavior() });
      return;
    }
    if (dir < 0 && r.top < -8) {
      pauseSnap();
      window.scrollBy({ top: Math.max(-vh * 0.85, r.top), behavior: behavior() });
      return;
    }
    goTo(current + dir);
  }

  /* ---------------------------------------------------------
     Tela cheia (página e jogo)
     --------------------------------------------------------- */
  function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function requestFs(el) {
    var fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!fn) return;
    try {
      var p = fn.call(el);
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* navegador recusou */ }
  }
  function exitFs() {
    var fn = document.exitFullscreen || document.webkitExitFullscreen;
    if (!fn) return;
    try {
      var p = fn.call(document);
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* nada */ }
  }

  /* ---------------------------------------------------------
     Modo apresentação (tecla P)
     --------------------------------------------------------- */
  var presentBtn = $('#presentBtn');
  function isPresenting() { return root.classList.contains('presenting'); }
  function setPresent(on) {
    var keep = Math.max(0, current);
    root.classList.toggle('presenting', on);
    presentBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    $('.lbl', presentBtn).textContent = on ? 'SAIR [ESC]' : 'APRESENTAR [P]';
    if (on) {
      if (!fsElement()) requestFs(root);
      toast('MODO APRESENTAÇÃO · ESC PARA SAIR');
    } else if (fsElement() === root) {
      exitFs();
    }
    // O tamanho dos textos muda: volta para o início da seção atual
    setTimeout(function () {
      pauseSnap();
      sections[keep].scrollIntoView({ block: 'start' });
    }, 120);
  }
  presentBtn.addEventListener('click', function () { setPresent(!isPresenting()); });

  /* ---------------------------------------------------------
     O jogo
     --------------------------------------------------------- */
  var GAME_URL = 'game/index.html';
  var stage = $('#gameStage');
  var frame = $('#gameFrame');
  var startBtn = $('#startGame');
  var fsBtn = $('#fsBtn');
  var errBox = $('#gameError');
  var started = false;
  var starting = false;

  function showError(msg) {
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  function focusGame() {
    try {
      frame.focus();
      if (frame.contentWindow) frame.contentWindow.focus();
    } catch (e) { /* nada */ }
  }

  function startGame() {
    if (started || starting) return;
    errBox.hidden = true;

    if (location.protocol === 'file:') {
      showError('O jogo não abre com dois cliques no arquivo. Abra o site pelo Live Server do VS Code ou com "npx serve".');
      return;
    }

    starting = true;
    startBtn.disabled = true;
    startBtn.textContent = 'CARREGANDO PROTOCOLO…';

    // Confere se a pasta do jogo está no lugar antes de carregar
    fetch(GAME_URL, { method: 'HEAD', cache: 'no-store' })
      .then(function (r) {
        if (!r.ok && r.status !== 405) throw new Error(String(r.status));
      })
      .then(function () {
        started = true;
        stage.classList.add('is-running');
        stage.classList.remove('is-mobile');
        frame.removeAttribute('tabindex');
        frame.addEventListener('load', focusGame, { once: true });
        frame.setAttribute('src', GAME_URL);
        focusGame();
      })
      .catch(function () {
        showError('ARQUIVO DO JOGO NÃO ENCONTRADO. Confira se o index.html do jogo está direto dentro da pasta game/.');
        startBtn.disabled = false;
        startBtn.textContent = '▶ INICIAR PROTOCOLO';
      })
      .then(function () { starting = false; });
  }

  startBtn.addEventListener('click', startGame);

  fsBtn.addEventListener('click', function () {
    if (fsElement() === stage) { exitFs(); return; }
    requestFs(stage);          // precisa ser no mesmo clique
    startGame();
  });

  // Ao entrar/sair da tela cheia
  var lastFs = null;
  var hintTimer;
  function onFsChange() {
    var el = fsElement();
    if (el === stage) {
      fsBtn.textContent = '⛶ Sair da tela cheia';
      stage.classList.remove('hint-off');
      clearTimeout(hintTimer);
      hintTimer = setTimeout(function () { stage.classList.add('hint-off'); }, 4500);
      if (started) focusGame();
    }
    if (lastFs === stage && el !== stage) {
      fsBtn.textContent = '⛶ Tela cheia';
      if (started) setTimeout(focusGame, 60);
    }
    // ESC na tela cheia da página encerra o modo apresentação
    if (!el && lastFs === root && isPresenting()) setPresent(false);
    lastFs = el;
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  // Celular / tablet sem mouse: mostra o aviso de acesso negado
  var mobileMQ = window.matchMedia('(hover: none) and (pointer: coarse), (max-width: 699px)');
  function applyMobile() {
    if (!started) stage.classList.toggle('is-mobile', mobileMQ.matches);
  }
  if (mobileMQ.addEventListener) mobileMQ.addEventListener('change', applyMobile);
  applyMobile();

  $('#tryAnyway').addEventListener('click', function () {
    stage.classList.remove('is-mobile');
    startGame();
  });

  /* ---------------------------------------------------------
     Copiar link / Compartilhar
     --------------------------------------------------------- */
  function siteUrl() { return location.href.split('#')[0]; }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function copyLink() {
    var url = siteUrl();
    var done = function (ok) { toast(ok ? 'LINK COPIADO' : 'COPIE O LINK: ' + url); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(fallbackCopy(url)); });
    } else {
      done(fallbackCopy(url));
    }
  }
  $$('[data-copy]').forEach(function (b) { b.addEventListener('click', copyLink); });

  if (navigator.share) {
    $$('[data-share]').forEach(function (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        navigator.share({
          title: 'Endosymbiosis Protocol — Tracklink',
          text: 'Ciclo 147. Três pendências. Assine o relatório. (Jogue no computador.)',
          url: siteUrl()
        }).catch(function () {});
      });
    });
  }

  /* ---------------------------------------------------------
     Atalhos de teclado
     --------------------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;

    var a = document.activeElement;
    // Foco no jogo (ou jogo em tela cheia): não mexe em nada
    if (a === frame || fsElement() === stage) return;
    if (a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) return;

    var k = e.key;
    var onControl = a && a !== document.body && /^(BUTTON|A|SUMMARY)$/.test(a.tagName);

    if (k === 'p' || k === 'P') {
      e.preventDefault();
      setPresent(!isPresenting());
    } else if (k === 'Escape') {
      if (isPresenting() && !fsElement()) setPresent(false);
    } else if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey && !onControl)) {
      e.preventDefault();
      step(1);
    } else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey && !onControl)) {
      e.preventDefault();
      step(-1);
    } else if (k === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (k === 'End') {
      e.preventDefault();
      goTo(LAST);
    }
  });

  // Ano no rodapé
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
