/* 基礎訓練 Lottie 動畫，載入完成後顯示向量圖。 */
(() => {
    document.querySelectorAll('.tma-mentor-animation').forEach(host => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!window.lottie || motion.matches) return;

    const fallback = host.querySelector('img');
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;inset:0;visibility:hidden';
    container.setAttribute('aria-hidden', 'true');
    host.appendChild(container);
    const animation = window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: false,
        path: host.dataset.animation
    });
    function restore() {
        fallback.style.visibility = '';
        container.remove();
        animation.destroy();
    }
    animation.addEventListener('DOMLoaded', () => {
        if (motion.matches) {
            restore();
            return;
        }
        container.style.visibility = 'visible';
        fallback.style.visibility = 'hidden';
        animation.play();
    });
    animation.addEventListener('data_failed', restore);
    motion.addEventListener('change', event => {
        if (event.matches) restore();
    });
    });
})();
