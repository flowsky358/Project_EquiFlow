/* ═══════════════════════════════════════════════════════════
   PROJECT EQUIFLOW — Shared Transition & Graphics Layer
   transitions.js
   Runs on every page after DOM is ready.
═══════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouch  = window.matchMedia('(hover: none)').matches;

    /* ── PAGE LOAD FADE-IN ──────────────────────────────── */
    const loader = document.createElement('div');
    loader.id = 'pef-page-loader';
    document.body.appendChild(loader);
    window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('out'), 80);
        setTimeout(() => loader.remove(), 700);
    });

    /* ═══════════════════════════════════════════════════════
       1. CANVAS PARTICLE NETWORK — hero sections
    ═══════════════════════════════════════════════════════ */
    const heroSelectors = [
        '.hero', '.vol-hero', '.chap-hero', '.partner-hero',
        '.mission-hero', '.prog-hero', '.donate-hero'
    ];

    heroSelectors.forEach(sel => {
        const hero = document.querySelector(sel);
        if (!hero) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'pef-particle-canvas';
        // Insert behind everything else in the hero
        hero.insertBefore(canvas, hero.firstChild);

        const ctx = canvas.getContext('2d');
        let W, H, RAF;
        const PARTICLE_COUNT = isMobile ? 30 : 55;
        const CONNECT_DIST   = isMobile ? 90 : 140;
        const MOUSE_DIST     = 180;
        const mouse = { x: null, y: null };
        let particles = [];

        class Particle {
            constructor() { this.reset(true); }
            reset(random) {
                this.x  = random ? Math.random() * W : (Math.random() < 0.5 ? 0 : W);
                this.y  = random ? Math.random() * H : Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.r  = Math.random() * 1.6 + 0.8;
                this.alpha = Math.random() * 0.4 + 0.35;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                // Soft bounce
                if (this.x < 0) { this.x = 0; this.vx *= -1; }
                if (this.x > W) { this.x = W; this.vx *= -1; }
                if (this.y < 0) { this.y = 0; this.vy *= -1; }
                if (this.y > H) { this.y = H; this.vy *= -1; }
            }
        }

        function resize() {
            W = canvas.width  = hero.offsetWidth;
            H = canvas.height = hero.offsetHeight;
        }

        function initParticles() {
            particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            // Draw edges between close particles
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b  = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d < CONNECT_DIST) {
                        const alpha = (1 - d / CONNECT_DIST) * 0.28;
                        ctx.globalAlpha = alpha;
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth   = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }

                // Draw edge to mouse position
                if (mouse.x !== null) {
                    const dx = a.x - mouse.x;
                    const dy = a.y - mouse.y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d < MOUSE_DIST) {
                        const alpha = (1 - d / MOUSE_DIST) * 0.55;
                        ctx.globalAlpha = alpha;
                        ctx.strokeStyle = 'rgba(255,189,171,1)';
                        ctx.lineWidth   = 0.9;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }

                // Draw particle
                ctx.globalAlpha = a.alpha;
                ctx.fillStyle   = 'rgba(255,255,255,0.9)';
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                ctx.fill();

                a.update();
            }

            ctx.globalAlpha = 1;
            RAF = requestAnimationFrame(draw);
        }

        // Mouse tracking
        hero.addEventListener('mousemove', e => {
            const r = hero.getBoundingClientRect();
            mouse.x = e.clientX - r.left;
            mouse.y = e.clientY - r.top;
        }, { passive: true });
        hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

        // Handle visibility (stop when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(RAF);
            else RAF = requestAnimationFrame(draw);
        });

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        }, { passive: true });

        resize();
        initParticles();
        draw();
    });

    /* ── 2. CUSTOM CURSOR — removed per design preference ── */

    /* ═══════════════════════════════════════════════════════
       3. MAGNETIC BUTTONS
    ═══════════════════════════════════════════════════════ */
    if (!isTouch && !isMobile) {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r  = btn.getBoundingClientRect();
                const x  = (e.clientX - r.left - r.width  / 2) * 0.3;
                const y  = (e.clientY - r.top  - r.height / 2) * 0.3;
                btn.style.transform  = `translate(${x}px, ${y}px)`;
                btn.style.transition = 'transform 0.1s ease';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform  = '';
                btn.style.transition = 'transform 0.55s ' + ease;
            });
        });
    }

    /* ═══════════════════════════════════════════════════════
       4. BUTTON CLICK RIPPLE
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.btn').forEach(btn => {
        if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.addEventListener('click', e => {
            const r      = btn.getBoundingClientRect();
            const size   = Math.max(r.width, r.height) * 2.2;
            const ripple = document.createElement('span');
            ripple.className = 'pef-ripple-el';
            ripple.style.cssText = `
                width:${size}px; height:${size}px;
                left:${e.clientX - r.left - size / 2}px;
                top:${e.clientY - r.top  - size / 2}px;
            `;
            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    /* ═══════════════════════════════════════════════════════
       5. 3D CARD TILT — all cards across all pages
    ═══════════════════════════════════════════════════════ */
    if (!isTouch && !isMobile) {
        const TILT_SELECTORS = [
            '.mvg-bento-card', '.about-feat', '.belief-item',
            '.involved-card',  '.step-card',  '.role-card',
            '.vol-role-card',  '.chap-step',  '.perk-card',
            '.part-tier',      '.prog-card',  '.what-feat',
            '.impact-box',     '.faq-item',   '.trust-badge',
            '.ways-card',      '.team-card',
        ].join(', ');

        document.querySelectorAll(TILT_SELECTORS).forEach(card => {
            if (card.dataset.pefTilt) return;
            card.dataset.pefTilt = '1';
            card.classList.add('pef-tilt-card');

            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width  - 0.5;
                const y = (e.clientY - r.top)  / r.height - 0.5;
                card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
                card.style.transform  = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.025) translateY(-4px)`;
                card.style.boxShadow  = `${-x * 18}px ${y * 12}px 40px rgba(0,0,0,0.11)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.55s ' + ease + ', box-shadow 0.55s ' + ease;
                card.style.transform  = '';
                card.style.boxShadow  = '';
            });
        });
    }

    /* ═══════════════════════════════════════════════════════
       6. SECTION PROGRESS DOTS (right rail)
    ═══════════════════════════════════════════════════════ */
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (sections.length >= 2) {
        const rail = document.createElement('nav');
        rail.id = 'pef-section-dots';
        rail.setAttribute('aria-label', 'Section navigation');

        sections.forEach(s => {
            const dot = document.createElement('a');
            dot.className    = 'pef-sdot';
            dot.href         = '#' + s.id;
            dot.dataset.label = s.dataset.navLabel ||
                s.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            dot.setAttribute('aria-label', dot.dataset.label);
            rail.appendChild(dot);
        });
        document.body.appendChild(rail);

        const dotEls = Array.from(rail.querySelectorAll('.pef-sdot'));
        const dotObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const idx = sections.indexOf(e.target);
                    dotEls.forEach((d, i) => d.classList.toggle('active', i === idx));
                }
            });
        }, { threshold: 0.4, rootMargin: '-15% 0px -15% 0px' });

        sections.forEach(s => dotObserver.observe(s));
    }

    /* ═══════════════════════════════════════════════════════
       7. HERO MOUSE PARALLAX — decorative elements move with cursor
    ═══════════════════════════════════════════════════════ */
    heroSelectors.forEach(sel => {
        const hero = document.querySelector(sel);
        if (!hero || isTouch) return;

        const decoItems = hero.querySelectorAll('.hd-sparkle, .hero-deco svg, .deco-icon');

        hero.addEventListener('mousemove', e => {
            const r  = hero.getBoundingClientRect();
            const dx = (e.clientX - r.left  - r.width  / 2) / r.width;
            const dy = (e.clientY - r.top   - r.height / 2) / r.height;

            decoItems.forEach((el, i) => {
                const depth = ((i % 4) + 1) * 7;
                el.style.transform += ''; // re-trigger style
                el.style.translate = `${dx * depth}px ${dy * depth}px`;
                el.style.transition = 'translate 0.4s ease';
            });
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            decoItems.forEach(el => {
                el.style.translate   = '0px 0px';
                el.style.transition = 'translate 0.9s ' + ease;
            });
        });
    });

    /* ═══════════════════════════════════════════════════════
       8. SOLID CORAL on em tags inside headings
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('h1 em, h2 em').forEach(em => {
        em.classList.add('pef-shimmer-em');
    });

    /* ═══════════════════════════════════════════════════════
       9. ANIMATED GRADIENT BACKGROUND on .stats-band, .cta-banner
    ═══════════════════════════════════════════════════════ */
    document.querySelectorAll('.cta-banner').forEach(el => el.classList.add('pef-glow-section'));

    /* ═══════════════════════════════════════════════════════
       10. ANIMATED COUNTER — for pages that don't have it yet
    ═══════════════════════════════════════════════════════ */
    function animCounter(el) {
        if (el.dataset.pefDone) return;
        el.dataset.pefDone = '1';
        const raw    = el.dataset.target;
        const isNum  = /^[\d.]+$/.test(String(raw));
        if (!isNum) return;
        const end    = parseFloat(raw);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const dur    = 1900;
        const t0     = performance.now();
        function step(now) {
            const p   = Math.min((now - t0) / dur, 1);
            const ep  = 1 - Math.pow(1 - p, 4);
            const val = end * ep;
            el.textContent = prefix + (Number.isInteger(end) ? Math.round(val) : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { animCounter(e.target); counterObs.unobserve(e.target); }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

    /* ═══════════════════════════════════════════════════════
       11. SCROLL REVEAL — enhanced stagger for all pages
    ═══════════════════════════════════════════════════════ */
    const allRevealSels = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .reveal-clip';
    if (!document.querySelector('.reveal.active')) {
        // Only run if the page doesn't already have its own reveal logic
        const revObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const delay = +(e.target.dataset.delay || 0);
                    setTimeout(() => e.target.classList.add('active'), delay);
                    revObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(allRevealSels).forEach(el => {
            const sibs = el.parentElement.querySelectorAll(allRevealSels);
            if (sibs.length > 1 && !el.dataset.delay) {
                el.dataset.delay = ([...sibs].indexOf(el)) * 100;
            }
            revObs.observe(el);
        });
    }

    /* ═══════════════════════════════════════════════════════
       12. SCROLL PROGRESS BAR — for pages that don't have one
    ═══════════════════════════════════════════════════════ */
    if (!document.getElementById('scroll-progress')) {
        const bar = document.createElement('div');
        bar.style.cssText = `
            position:fixed; top:0; left:0; height:3px; width:0%;
            background: linear-gradient(90deg, #96D4D4, #FFBDAB, #96D4D4);
            background-size: 200% auto;
            z-index: 9000; pointer-events: none;
            animation: pef-shimmer 3s linear infinite;
            transition: width 0.1s linear;
        `;
        document.body.appendChild(bar);
        window.addEventListener('scroll', () => {
            const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
            bar.style.width = pct + '%';
        }, { passive: true });
    }

})();
