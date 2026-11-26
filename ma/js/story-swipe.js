function bindStorySwipe(stage, changeStory) {
    let start;

    stage.addEventListener('pointerdown', event => {
        if (start || !event.isPrimary || event.button !== 0) return;
        start = { id: event.pointerId, x: event.clientX, y: event.clientY };
        stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointerup', event => {
        if (event.pointerId !== start?.id) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        start = undefined;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            changeStory(dx < 0 ? 1 : -1);
        }
    });

    function clearPointer(event) {
        if (event.pointerId === start?.id) start = undefined;
    }

    stage.addEventListener('pointercancel', clearPointer);
    stage.addEventListener('lostpointercapture', clearPointer);
    stage.addEventListener('dragstart', event => event.preventDefault());
}
