// Retro pixel cursor effects: mouse trail + click sparks + hover ring + card tilt
(function () {
    // Skip all effects for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const COLORS = ['#3c6234', '#ffffff', '#6a9c5f'];
    const TRAIL_SPACING = 24; // ms between spawned trail pixels
    const TRAIL_LIFETIME = 400; // ms

    let lastTrailTime = 0;

    // --- Hover ring that snaps to interactive elements ---
    const ring = document.createElement('div');
    ring.className = 'hover-ring';
    document.body.appendChild(ring);

    function moveRing(x, y) {
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
    }

    // --- Mouse move: trail + ring position ---
    document.addEventListener('mousemove', (e) => {
        moveRing(e.clientX, e.clientY);

        const now = performance.now();
        if (now - lastTrailTime > TRAIL_SPACING) {
            lastTrailTime = now;
            spawnTrailPixel(e.clientX, e.clientY);
        }
    });

    function spawnTrailPixel(x, y) {
        const px = document.createElement('div');
        px.className = 'pixel-trail';
        px.style.left = (x - 3) + 'px';
        px.style.top = (y - 3) + 'px';
        px.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        document.body.appendChild(px);

        requestAnimationFrame(() => {
            px.style.opacity = '0';
            px.style.transform = `translateY(${8 + Math.random() * 10}px) scale(0.4)`;
        });

        setTimeout(() => px.remove(), TRAIL_LIFETIME);
    }

    // --- Hover ring activation on interactive elements ---
    const interactiveSelector = 'a, button, .card, .login-text-btn, input, [onclick]';
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(interactiveSelector);
        if (target) {
            ring.classList.add('active');
            // Square ring for cards, rounder for buttons/links
            if (target.classList.contains('card')) {
                ring.style.borderRadius = '6px';
                ring.style.width = '32px';
                ring.style.height = '32px';
            } else {
                ring.style.borderRadius = '50%';
                ring.style.width = '26px';
                ring.style.height = '26px';
            }
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector) && !e.relatedTarget?.closest(interactiveSelector)) {
            ring.classList.remove('active');
        }
    });

    // --- Click spark burst ---
    document.addEventListener('mousedown', (e) => {
        const sparkCount = 8;
        for (let i = 0; i < sparkCount; i++) {
            spawnSpark(e.clientX, e.clientY, i, sparkCount);
        }
        ring.style.transform = 'translate(-50%, -50%) scale(1.4)';
        setTimeout(() => {
            ring.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 120);
    });

    function spawnSpark(x, y, i, total) {
        const spark = document.createElement('div');
        spark.className = 'click-spark';
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        document.body.appendChild(spark);

        const angle = (i / total) * Math.PI * 2;
        const distance = 20 + Math.random() * 16;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        spark.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
        ], {
            duration: 350 + Math.random() * 150,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
        });

        setTimeout(() => spark.remove(), 550);
    }

    // --- Card tilt effect (subtle 3D lean toward cursor) ---
    const TILT_MAX = 6; // degrees
    const cards = document.querySelectorAll('.card');
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    if (!isCoarsePointer) {
        cards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('tilting');
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width;
                const relY = (e.clientY - rect.top) / rect.height;
                const rotateY = (relX - 0.5) * TILT_MAX * 2;
                const rotateX = (0.5 - relY) * TILT_MAX * 2;
                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('tilting');
                card.style.transform = '';
            });
        });
    }

    // Hide effects on touch devices (no real cursor)
    if (isCoarsePointer) {
        ring.style.display = 'none';
    }
})();