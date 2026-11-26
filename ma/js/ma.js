(function () {
    'use strict';
    const root = document.querySelector('.ma-main');
    if (!root) return;
    const buttons = [...document.querySelectorAll('#group-buttons button')];
    const groups = [...document.querySelectorAll('.ma-group-content')];
    const dropdown = document.getElementById('group-dropdown');
    const toggle = document.getElementById('group-toggle');
    const options = document.getElementById('group-options');
    const value = document.getElementById('group-value');
    const select = document.getElementById('group-select');
    let company = 0;
    const memory = [0, 0, 0, 0];
    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
        options.hidden = !open;
    }
    function animate(el) {
        el.classList.remove('ma-content-enter');
        void el.offsetWidth;
        el.classList.add('ma-content-enter');
    }
    function showGroup(index, motion = true) {
        memory[company] = index;
        const selected = buttons.find(b => +b.dataset.company === company && +b.dataset.group === index);
        if (!selected) return;
        value.textContent = selected.textContent;
        select.value = String(index);
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === selected)));
        options.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
        groups.forEach(g => { g.hidden = +g.dataset.company !== company || +g.dataset.group !== index; });
        if (motion) animate(document.getElementById('business-content'));
    }
    function showCompany(index) {
        company = index;
        setOpen(false);
        buttons.forEach(b => { b.hidden = +b.dataset.company !== company; });
        options.replaceChildren();
        select.replaceChildren();
        buttons.filter(b => +b.dataset.company === company).forEach(b => {
            const i = +b.dataset.group;
            const option = document.createElement('option');
            option.value = String(i);
            option.textContent = b.textContent;
            select.append(option);
            const li = document.createElement('li');
            const mobile = document.createElement('button');
            mobile.type = 'button';
            mobile.textContent = b.textContent;
            mobile.setAttribute('aria-controls', 'business-content');
            mobile.addEventListener('click', () => {
                showGroup(i);
                setOpen(false);
                toggle.focus();
            });
            li.append(mobile);
            options.append(li);
        });
        showGroup(memory[company]);
    }
    buttons.forEach(b => b.addEventListener('click', () => showGroup(+b.dataset.group)));
    select.addEventListener('change', () => showGroup(+select.value));
    toggle.addEventListener('click', () => setOpen(options.hidden));
    toggle.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        setOpen(true);
        (options.querySelector('[aria-pressed="true"]') || options.querySelector('button'))?.focus();
    });
    dropdown.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            toggle.focus();
            return;
        }
        const items = [...options.querySelectorAll('button')], current = items.indexOf(event.target);
        if (current < 0) return;
        let next;
        if (event.key === 'ArrowDown') next = (current + 1) % items.length;
        else if (event.key === 'ArrowUp') next = (current - 1 + items.length) % items.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        if (next !== undefined) {
            event.preventDefault();
            items[next].focus();
        }
    });
    document.addEventListener('click', e => { if (!dropdown.contains(e.target)) setOpen(false); });
    dropdown.addEventListener('focusout', e => { if (!dropdown.contains(e.relatedTarget)) setOpen(false); });
    matchMedia('(max-width: 800px)').addEventListener('change', () => setOpen(false));
    function bindTabs(prefix, onSelect) {
        const tabs = [...document.querySelectorAll('[id^="' + prefix + '-tab-"]')];
        const panel = document.getElementById(prefix + '-panel');
        function choose(index, focus) {
            tabs.forEach((tab, i) => {
                const active = i === index;
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
                const icon = tab.querySelector('img[data-icon-white]');
                if (icon) icon.src = active ? icon.dataset.iconWhite : icon.dataset.iconDeep;
            });
            panel.setAttribute('aria-labelledby', tabs[index].id);
            onSelect(index);
            if (focus) tabs[index].focus();
        }
        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => choose(i, false));
            tab.addEventListener('keydown', e => {
                let next;
                if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
                else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = tabs.length - 1;
                if (next !== undefined) {
                    e.preventDefault();
                    choose(next, true);
                }
            });
        });
        choose(0, false);
    }
    bindTabs('business', showCompany);
    const stage = document.getElementById('story-stage');
    const stories = [...stage.querySelectorAll('.ma-story-item')];
    const dots = document.getElementById('story-dots');
    const previous = document.getElementById('story-prev');
    const next = document.getElementById('story-next');
    let storyCompany = 0, storyIndex = 0, visible = [];
    function showStory(requested, motion = true) {
        storyIndex = visible.length ? (requested % visible.length + visible.length) % visible.length : 0;
        previous.disabled = next.disabled = visible.length < 2;
        stage.classList.toggle('ma-story-empty', !visible.length);
        stories.forEach(item => { item.hidden = item !== visible[storyIndex]; });
        dots.replaceChildren();
        visible.forEach((item, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.setAttribute('aria-label', `第 ${i + 1} 位：${item.querySelector('h3').textContent}`);
            dot.setAttribute('aria-pressed', String(i === storyIndex));
            dot.addEventListener('click', () => {
                showStory(i);
                dots.children[i].focus();
            });
            dots.append(dot);
        });
        if (motion && visible.length) animate(visible[storyIndex]);
    }
    previous.addEventListener('click', () => showStory(storyIndex - 1));
    next.addEventListener('click', () => showStory(storyIndex + 1));
    bindTabs('stories', index => {
        storyCompany = index;
        visible = stories.filter(item => +item.dataset.company === storyCompany);
        showStory(0);
    });
    document.querySelector('.ma-story-carousel').addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            showStory(storyIndex + (e.key === 'ArrowRight' ? 1 : -1));
        }
    });
    bindStorySwipe(stage, direction => {
        if (visible.length > 1) showStory(storyIndex + direction);
    });
    // 標題、頁籤、內容以及卡片分層進場；完全離開畫面後可再次播放。
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const layers = [...root.querySelectorAll('.ma-layer')];
    const enterObserver = new IntersectionObserver(entries => entries.forEach(entry =>
    {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
    }),
    {
        threshold: .08,
        rootMargin: '0px 0px -32px 0px'
    });
    const resetObserver = new IntersectionObserver(entries => entries.forEach(entry =>
    {
        if (!entry.isIntersecting && !reduced.matches) entry.target.classList.remove('is-visible');
    }),
    {
        rootMargin: '160px 0px'
    });
    layers.forEach(layer =>
    {
        const siblings = [...layer.parentElement.children].filter(el => el.classList.contains('ma-layer'));
        layer.style.setProperty('--ma-delay', Math.min(siblings.indexOf(layer) * 90, 270) + 'ms');
        enterObserver.observe(layer);
        resetObserver.observe(layer);
    });
    root.classList.add('ma-motion-ready');
    reduced.addEventListener('change', () =>
    {
        if (reduced.matches) layers.forEach(layer => layer.classList.add('is-visible'));
    });
}());
