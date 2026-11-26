/** 網站微互動調整入口（秒數與位移集中於此及 css/home.css 的「首頁動態效果」區段）。
 * anchorMin/Max：錨點移動時間（毫秒）；photoTravel：照片視差幅度（CSS px）。
 * 手機保留全部效果，照片位移較小；只有目前可見照片會更新。
 * 區塊完全離開後可再次進場；背景離開畫面暫停；系統「減少動態效果」直接顯示內容。
 */
(function()
{
    'use strict';
    const MOTION = {
        anchorMin: 1100,
        anchorMax: 2000,
        photoTravel: 18,
        mobilePhotoTravel: 8
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'),
        mobile = matchMedia('(max-width: 800px)');
    const header = document.getElementById('header');
    let anchorFrame = 0,
        scrollFrame = 0;

    function stopAnchor()
    {
        cancelAnimationFrame(anchorFrame);
        anchorFrame = 0;
        document.documentElement.classList.remove('is-anchor-moving');
    }

    function scrollToSection(target, hash)
    {
        stopAnchor();
        const gap = (header ? header.getBoundingClientRect().height : 0) - 60;
        const end = Math.min(document.documentElement.scrollHeight - innerHeight, Math.max(0, target.getBoundingClientRect().top + scrollY - gap));
        const start = scrollY,
            distance = end - start,
            duration = Math.min(MOTION.anchorMax, Math.max(MOTION.anchorMin, Math.abs(distance) * .3)),
            began = performance.now();
        if (hash && location.hash !== hash) history.pushState(null, '', hash);

        function finish()
        {
            stopAnchor();
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target.focus(
            {
                preventScroll: true
            });
        }
        if (reduced.matches)
        {
            window.scrollTo(
            {
                top: end,
                behavior: 'instant'
            });
            finish();
            return;
        }
        document.documentElement.classList.add('is-anchor-moving');

        function tick(now)
        {
            const t = Math.min(1, (now - began) / duration),
                k = 1 - Math.pow(1 - t, 4);
            window.scrollTo(
            {
                top: start + distance * k,
                behavior: 'instant'
            });
            if (t < 1) anchorFrame = requestAnimationFrame(tick);
            else finish();
        }
        anchorFrame = requestAnimationFrame(tick);
    }
    // 同頁連結才攔截；跨頁連結、開新分頁操作保留原生行為。
    document.addEventListener('click', event =>
    {
        const link = event.target.closest('a[href]'),
            topButton = event.target.closest('#gotop');
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (topButton)
        {
            event.preventDefault();
            scrollToSection(document.getElementById('hero'));
            return;
        }
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash || url.hash === '#') return;
        let target;
        try
        {
            target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        }
        catch (_)
        {
            return;
        }
        if (!target) return;
        event.preventDefault();
        requestAnimationFrame(() => scrollToSection(target, url.hash));
    });
    ['wheel', 'touchstart', 'keydown'].forEach(type => addEventListener(type, event =>
    {
        if (type !== 'keydown' || ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', 'Escape', ' '].includes(event.key)) stopAnchor();
    },
    {
        passive: true
    }));

    function updateOffset()
    {
        document.documentElement.style.setProperty('--anchor-offset', ((header ? header.getBoundingClientRect().height : 0) + 16) + 'px');
    }
    updateOffset();
    if (header) new ResizeObserver(updateOffset).observe(header);
    const revealTargets = document.querySelectorAll('.section-heading, .project-picture, .international-carousel, .plan-card, .project-stories article, .international-copy, .fintech-copy, .fintech-chapter figure, .learning-carousel, .apply-content');
    // 雙向重播：進入視窗內 40px 才播放，完全離開視窗外 120px 才重置。
    // 兩個觀察範圍形成緩衝，避免停在邊緣反覆閃動；不在可見範圍播放退場。
    let lastRevealY = scrollY,
        revealDirection = 1;
    addEventListener('scroll', () =>
    {
        const current = scrollY;
        if (Math.abs(current - lastRevealY) > 1) revealDirection = current > lastRevealY ? 1 : -1;
        lastRevealY = current;
    },
    {
        passive: true
    });
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry =>
    {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (!el.classList.contains('is-revealed'))
        {
            el.style.setProperty('--reveal-direction', String(revealDirection));
            el.classList.add('is-revealed');
            el.dataset.revealCount = String(Number(el.dataset.revealCount || 0) + 1);
        }
    }),
    {
        threshold: .12,
        rootMargin: '-40px 0px -40px 0px'
    });
    const resetRevealObserver = new IntersectionObserver(entries => entries.forEach(entry =>
    {
        if (entry.isIntersecting || reduced.matches) return;
        const el = entry.target;
        el.classList.remove('is-revealed');
        // 在畫面上方的內容從上方浮入，下方的內容從下方浮入。
        el.style.setProperty('--reveal-direction', entry.boundingClientRect.bottom < 0 ? '-1' : '1');
    }),
    {
        threshold: 0,
        rootMargin: '120px 0px 120px 0px'
    });
    revealTargets.forEach(el =>
    {
        el.classList.add('motion-reveal');
        if (el.matches('.plan-card')) el.style.setProperty('--reveal-delay', (Array.from(el.parentElement.children).indexOf(el) % 3) * 90 + 'ms');
        revealObserver.observe(el);
        resetRevealObserver.observe(el);
    });
    // 照片視差使用獨立 translate，不覆蓋圖片原本的裁切或 Hover scale。
    const activePhotos = new Set();
    const photos = document.querySelectorAll('.fintech-chapter figure > img, .project-picture');

    function paintPhotos()
    {
        scrollFrame = 0;
        activePhotos.forEach(img =>
        {
            const r = img.parentElement.getBoundingClientRect();
            const progress = Math.max(-1, Math.min(1, (innerHeight / 2 - r.top - r.height / 2) / (innerHeight / 2 + r.height / 2)));
            img.style.setProperty('--photo-y', reduced.matches ? '0px' : (progress * (mobile.matches ? MOTION.mobilePhotoTravel : MOTION.photoTravel)).toFixed(2) + 'px');
        });
    }

    function schedulePhotos()
    {
        if (!scrollFrame && activePhotos.size) scrollFrame = requestAnimationFrame(paintPhotos);
    }
    const photoObserver = new IntersectionObserver(entries => entries.forEach(e =>
    {
        if (e.isIntersecting) activePhotos.add(e.target);
        else activePhotos.delete(e.target);
        schedulePhotos();
    }));
    photos.forEach(img =>
    {
        img.classList.add('motion-photo');
        photoObserver.observe(img);
    });
    addEventListener('scroll', schedulePhotos,
    {
        passive: true
    });
    addEventListener('resize', schedulePhotos,
    {
        passive: true
    });
    // 頁尾背景光跟著區塊可見性暫停。
    const apply = document.querySelector('.apply-section');
    if (apply)
    {
        new IntersectionObserver(entries => apply.classList.toggle('is-ambient-visible', entries[0].isIntersecting && !document.hidden)).observe(apply);
    }
    const hero = document.getElementById('hero');
    let heroVisible = true,
        heroResume = false;

    function syncHero()
    {
        const api = window.heroAnimation;
        if (!api || new URLSearchParams(location.search).has('frame') || new URLSearchParams(location.search).has('debug')) return;
        if (!heroVisible || document.hidden)
        {
            heroResume = heroResume || api.getState().playing || (document.hidden && heroVisible && !reduced.matches);
            api.pause();
        }
        else if (heroResume && !reduced.matches)
        {
            heroResume = false;
            api.play();
        }
    }
    if (hero) new IntersectionObserver(entries =>
    {
        heroVisible = entries[0].isIntersecting;
        syncHero();
    }).observe(hero);
    document.addEventListener('visibilitychange', () =>
    {
        syncHero();
        if (apply)
        {
            const r = apply.getBoundingClientRect();
            apply.classList.toggle('is-ambient-visible', !document.hidden && r.bottom > 0 && r.top < innerHeight);
        }
    });
    reduced.addEventListener('change', () =>
    {
        stopAnchor();
        if (reduced.matches) revealTargets.forEach(el => el.classList.add('is-revealed'));
        schedulePhotos();
    });
    if (location.hash)
    {
        const hash = location.hash;
        addEventListener('load', () =>
        {
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (target) scrollToSection(target);
        },
        {
            once: true
        });
    }
}());
