(() => {
    const tabs = [...document.querySelectorAll('.ta-tabs [role="tab"]')];
    function selectTab(index, focus = false) {
        tabs.forEach((tab, i) => {
            const selected = i === index;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
        });
        if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(index));
        tab.addEventListener('keydown', event => {
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            selectTab(next, true);
        });
    });
    const stories = [...document.querySelectorAll('.ta-story')];
    const storyTabs = [...document.querySelectorAll('.ta-story-tabs [role="tab"]')];
    const groups = ['fintech', 'ai', 'security'];
    const panel = document.getElementById('ta-stories-panel');
    const dots = document.getElementById('ta-story-dots');
    let group = 0;
    let current = 0;
    let visibleStories = [];

    function showStory(index) {
        current = (index + visibleStories.length) % visibleStories.length;
        stories.forEach(story => {
            story.hidden = story !== visibleStories[current];
        });
        [...dots.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    }
    function selectStoryTab(index, focus = false) {
        group = index;
        storyTabs.forEach((tab, i) => {
            const selected = i === group;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', storyTabs[group].id);
        visibleStories = stories.filter(story => story.dataset.group === groups[group]);
        dots.replaceChildren();
        visibleStories.forEach((story, i) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('aria-label', `查看${story.querySelector('h3').textContent}的心得`);
            button.addEventListener('click', () => showStory(i));
            dots.append(button);
        });
        showStory(0);
        if (focus) storyTabs[group].focus();
    }
    storyTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectStoryTab(index));
        tab.addEventListener('keydown', event => {
            let next;
            if (event.key === 'ArrowRight') next = (index + 1) % storyTabs.length;
            else if (event.key === 'ArrowLeft') next = (index + storyTabs.length - 1) % storyTabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = storyTabs.length - 1;
            else return;
            event.preventDefault();
            selectStoryTab(next, true);
        });
    });
    document.getElementById('ta-story-prev').addEventListener('click', () => showStory(current - 1));
    document.getElementById('ta-story-next').addEventListener('click', () => showStory(current + 1));
    bindStorySwipe(panel.querySelector('.ma-story-stage'), direction => {
        if (visibleStories.length > 1) showStory(current + direction);
    });
    selectStoryTab(0);
})();
