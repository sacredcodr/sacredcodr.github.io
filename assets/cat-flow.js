import { prepareWithSegments, layoutNextLine, layoutWithLines } from './vendor/pretext/layout.js';

const area = document.querySelector('#cat-flow');

async function startCatFlow() {
    if (!area) return;
    await document.fonts.ready;

    const original = area.querySelector('.cat-flow-original');
    const paragraphs = [...original.querySelectorAll('p')];
    const layer = area.querySelector('.cat-flow-lines');
    const handle = area.querySelector('.cat-flow-handle');
    const tools = document.querySelector('.cat-flow-tools');
    const reset = tools.querySelector('.cat-flow-reset');
    const style = getComputedStyle(paragraphs[0]);
    const lineHeight = parseFloat(style.lineHeight);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const prepared = paragraphs.map(p => prepareWithSegments(p.textContent, font));
    const catSize = 104;
    const position = { x: 0, y: 48 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let drag = null;

    function clampPosition() {
        position.x = Math.max(0, Math.min(width - catSize, position.x));
        position.y = Math.max(0, Math.min(height - catSize, position.y));
    }

    function render() {
        frame = 0;
        clampPosition();
        handle.style.transform = `translate(${position.x}px, ${position.y}px)`;
        const fragment = document.createDocumentFragment();
        let y = 0;

        for (let paragraph = 0; paragraph < prepared.length; paragraph++) {
            let cursor = { segmentIndex: 0, graphemeIndex: 0 };
            while (true) {
                let left = 0;
                let available = width;
                // Reserve the cat's silhouette plus room around its ears and face.
                const overlaps = y + lineHeight > position.y - 8 && y < position.y + catSize + 8;
                if (overlaps) {
                    const leftSpace = Math.max(0, position.x - 14);
                    const rightStart = Math.min(width, position.x + catSize + 14);
                    if (leftSpace >= width - rightStart) available = leftSpace;
                    else { left = rightStart; available = width - rightStart; }
                    if (available < 100) { y += lineHeight; continue; }
                }

                const line = layoutNextLine(prepared[paragraph], cursor, available);
                if (!line) break;
                const span = document.createElement('span');
                span.className = `cat-flow-line${paragraph ? ' muted' : ''}`;
                span.textContent = line.text + ' ';
                span.style.left = `${left}px`;
                span.style.top = `${y}px`;
                fragment.append(span);
                cursor = line.end;
                y += lineHeight;
            }
            y += 16;
        }
        layer.replaceChildren(fragment);
        area.style.height = `${Math.max(height, y)}px`;
    }

    function schedule() {
        if (!frame) frame = requestAnimationFrame(render);
    }

    function resize() {
        const nextWidth = area.clientWidth;
        if (!nextWidth || nextWidth === width) return;
        const fraction = width ? position.x / Math.max(1, width - catSize) : 1;
        width = nextWidth;
        height = prepared.reduce((sum, text) => sum + layoutWithLines(text, width, lineHeight).height + 16, 0) + catSize;
        position.x = fraction * (width - catSize);
        render();
    }

    handle.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        drag = { id: event.pointerId, x: event.clientX - position.x, y: event.clientY - position.y };
        handle.setPointerCapture(event.pointerId);
        handle.classList.add('dragging');
    });
    handle.addEventListener('pointermove', event => {
        if (!drag || drag.id !== event.pointerId) return;
        position.x = event.clientX - drag.x;
        position.y = event.clientY - drag.y;
        schedule();
    });
    function endDrag() {
        drag = null;
        handle.classList.remove('dragging');
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
    handle.addEventListener('lostpointercapture', endDrag);
    function resetPosition() {
        position.x = width - catSize;
        position.y = 48;
        schedule();
    }
    reset.addEventListener('click', resetPosition);
    handle.addEventListener('keydown', event => {
        const step = event.shiftKey ? 32 : 12;
        if (event.key === 'ArrowLeft') position.x -= step;
        else if (event.key === 'ArrowRight') position.x += step;
        else if (event.key === 'ArrowUp') position.y -= step;
        else if (event.key === 'ArrowDown') position.y += step;
        else if (event.key === 'Escape' || event.key === 'Home') { resetPosition(); event.preventDefault(); return; }
        else return;
        event.preventDefault();
        schedule();
    });

    resize();
    area.classList.add('cat-flow-ready');
    handle.hidden = false;
    tools.hidden = false;
    new ResizeObserver(resize).observe(area);
}

startCatFlow().catch(error => console.warn('Cat interaction unavailable:', error));
