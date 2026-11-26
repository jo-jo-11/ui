(function () {
    'use strict';
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 所有應徵入口共用 header 的網址，正式招募網址確認後只需改一處。
    var applyLink = document.querySelector('header .btn_join');
    if (applyLink) {
        document.querySelectorAll('[data-apply-link]').forEach(function (link) {
            link.setAttribute('href', applyLink.getAttribute('href'));
        });
    }

    // 尚未確定的網址使用 #，點擊時保留目前閱讀位置。
    document.querySelectorAll('a[href="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) { event.preventDefault(); });
    });

    // 輪播圓點與循環複本會自動重建，不需手填數量。
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var track = carousel.querySelector('.learning-track');
        var container = track || carousel.querySelector('.international-slides') || carousel.querySelector('[data-slide]').parentElement;
        var dotGroup = carousel.querySelector('.carousel-dots');
        var slides = [], copies = [], dots = [], index = Number(carousel.dataset.initial || 0);
        var timer, scrollTimer, resizeFrame, moving = false, hovered = false, focused = false, inView = true;
        var interval = Number(carousel.dataset.interval) || 3000; // 國際照片自動切換間隔，單位毫秒。
        var mod = function (n) { return slides.length ? (n % slides.length + slides.length) % slides.length : 0; };
        // 國際輪播改用重疊圖層交叉淡化；不使用 hidden，否則 display:none 無法過渡。
        function fadeTo(active) {
            slides.forEach(function (slide, n) {
                slide.hidden = false;
                slide.classList.toggle('is-active', n === active);
                slide.setAttribute('aria-hidden', String(n !== active));
                slide.inert = n !== active;
            });
        }
        function controls() {
            dots.forEach(function (dot, n) { dot.setAttribute('aria-pressed', String(n === index)); });
            carousel.querySelectorAll('[data-step]').forEach(function (button) { button.disabled = slides.length < 2; });
        }
        function center(slide) { return slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2; }
        function nearest() {
            return copies.reduce(function (best, slide) {
                return !best || Math.abs(center(slide) - track.scrollLeft) < Math.abs(center(best) - track.scrollLeft) ? slide : best;
            }, null);
        }
        // 停在首尾複本時，瞬間換回完全相同的中央原件，視覺不會跳回整條起點。
        function settle() {
            if (!track || !slides.length) return;
            moving = false;
            var slide = nearest();
            index = Number(slide.dataset.logicalIndex);
            if (slide.hasAttribute('data-carousel-clone')) {
                track.scrollTo({ left: center(slides[index]) + track.scrollLeft - center(slide), behavior: 'instant' });
            }
            controls();
        }
        function select(next, animate) {
            if (!slides.length) return;
            var logical = mod(next);
            if (track) {
                var current = nearest(), position = copies.indexOf(current), target;
                if (next === index + 1 || next === index - 1) target = copies[position + (next > index ? 1 : -1)];
                if (!target || Number(target.dataset.logicalIndex) !== logical) {
                    target = copies.filter(function (slide) { return Number(slide.dataset.logicalIndex) === logical; }).reduce(function (best, slide) {
                        return !best || Math.abs(center(slide) - track.scrollLeft) < Math.abs(center(best) - track.scrollLeft) ? slide : best;
                    }, null);
                }
                moving = true;
                track.scrollTo({ left: center(target), behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant' });
                clearTimeout(scrollTimer); scrollTimer = setTimeout(settle, animate ? 700 : 0);
            } else fadeTo(logical);
            index = logical; controls(); restartAuto();
        }
        function restartAuto() {
            clearTimeout(timer);
            if (track || slides.length < 2 || hovered || focused || !inView || document.hidden || reducedMotion.matches) return;
            timer = setTimeout(function () { select(index + 1, true); }, interval);
        }
        var observer = new MutationObserver(function (records) {
            if (records.some(function (record) { return Array.from(record.addedNodes).concat(Array.from(record.removedNodes)).some(function (node) { return node.nodeType === 1 && (node.matches('[data-slide]') || node.querySelector('[data-slide]')); }); })) rebuild();
        });
        function rebuild() {
            observer.disconnect(); clearTimeout(scrollTimer); moving = false;
            container.querySelectorAll('[data-carousel-clone]').forEach(function (copy) { copy.remove(); });
            slides = Array.from(container.children).filter(function (slide) { return slide.matches('[data-slide]'); });
            index = mod(index);
            slides.forEach(function (slide, n) {
                slide.dataset.logicalIndex = n;
                var title = slide.querySelector('h3, figcaption');
                slide.setAttribute('aria-label', (n + 1) + ' / ' + slides.length + (title ? '：' + title.textContent.trim() : ''));
            });
            dotGroup.replaceChildren();
            dots = slides.map(function (_, n) {
                var dot = document.createElement('button'); dot.type = 'button'; dot.className = 'carousel-dot'; dot.dataset.index = n;
                dot.setAttribute('aria-label', (carousel.getAttribute('aria-label') || '輪播') + '：第 ' + (n + 1) + ' 張');
                dot.addEventListener('click', function () { select(n, true); }); dotGroup.append(dot); return dot;
            });
            if (track && slides.length > 1) {
                // 依視窗寬度補足左右複本；即使只剩兩張，超寬螢幕也不會露出空白。
                function clone(slide) {
                    var copy = slide.cloneNode(true); copy.setAttribute('data-carousel-clone', ''); copy.removeAttribute('data-slide');
                    copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
                    copy.removeAttribute('id'); copy.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
                    return copy;
                }
                var before = document.createDocumentFragment(), after = document.createDocumentFragment();
                var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
                var cycleWidth = slides.reduce(function (sum, slide) { return sum + slide.offsetWidth + gap; }, 0);
                var repeat = Math.max(1, Math.ceil(track.clientWidth / Math.max(1, cycleWidth)));
                for (var round = 0; round < repeat; round++) slides.forEach(function (slide) { before.append(clone(slide)); after.append(clone(slide)); });
                track.prepend(before); track.append(after);
            }
            copies = track ? Array.from(track.children) : slides;
            if (track && slides.length) track.scrollTo({ left: center(slides[index]), behavior: 'instant' });
            if (!track) fadeTo(index);
            controls(); restartAuto(); observer.observe(container, { childList: true, subtree: true });
        }
        carousel.querySelectorAll('[data-step]').forEach(function (button) {
            button.addEventListener('click', function () { if (!moving) select(index + Number(button.dataset.step), true); });
        });
        carousel.addEventListener('keydown', function (event) {
            if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && !moving) {
                event.preventDefault(); select(index + (event.key === 'ArrowRight' ? 1 : -1), true);
            }
        });
        if (track) {
            track.addEventListener('scroll', function () {
                if (!moving && copies.length) { index = Number(nearest().dataset.logicalIndex); controls(); }
                clearTimeout(scrollTimer); scrollTimer = setTimeout(settle, 160);
            }, { passive: true });
            window.addEventListener('resize', function () {
                cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(function () { if (slides.length) { moving = false; track.scrollTo({ left: center(slides[index]), behavior: 'instant' }); } });
            });
        } else {
            var touch;
            carousel.addEventListener('touchstart', function (event) { var p = event.changedTouches[0]; touch = { x: p.clientX, y: p.clientY }; }, { passive: true });
            carousel.addEventListener('touchend', function (event) { if (!touch) return; var p = event.changedTouches[0], dx = p.clientX - touch.x, dy = p.clientY - touch.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) select(index + (dx < 0 ? 1 : -1), true); touch = null; }, { passive: true });
            carousel.addEventListener('mouseenter', function () { hovered = true; restartAuto(); });
            carousel.addEventListener('mouseleave', function () { hovered = false; restartAuto(); });
            carousel.addEventListener('focusin', function () { focused = true; restartAuto(); });
            carousel.addEventListener('focusout', function (event) { focused = carousel.contains(event.relatedTarget); restartAuto(); });
            document.addEventListener('visibilitychange', restartAuto); reducedMotion.addEventListener('change', restartAuto);
            new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; restartAuto(); }).observe(carousel);
        }
        carousel.classList.add('is-enhanced'); rebuild();
    });
}());
