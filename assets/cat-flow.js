import { prepareWithSegments, layoutNextLine, layoutWithLines } from './vendor/pretext/layout.js';

const area = document.querySelector('#cat-flow');

async function startCatFlow() {
    if (!area) return;
    await document.fonts.ready;

    const original = area.querySelector('.cat-flow-original');
    const blocks = [...original.children];
    const layer = area.querySelector('.cat-flow-lines');
    const handle = area.querySelector('.cat-flow-handle');
    const tools = document.querySelector('.cat-flow-tools');
    const reset = tools.querySelector('.cat-flow-reset');
    let prepared = [];
    function measureBlocks() {
        prepared = blocks.map((block, index) => {
            const style = getComputedStyle(block);
            const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const letterSpacing = parseFloat(style.letterSpacing) || 0;
            return {
                text: prepareWithSegments(block.textContent, font, { letterSpacing }),
                font,
                letterSpacing,
                lineHeight: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2,
                colour: style.color,
                gap: index < 2 ? 24 : 16,
            };
        });
    }
    const catSize = 104;
    const mask = new Image();
    mask.src = new URL('./reference-cat-mask.svg', import.meta.url).href;
    await mask.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = catSize;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(mask, 0, 0, catSize, catSize);
    const pixels = context.getImageData(0, 0, catSize, catSize).data;
    const silhouette = Array.from({ length: catSize }, (_, y) => {
        let left = catSize;
        let right = -1;
        for (let x = 0; x < catSize; x++) {
            if (pixels[(y * catSize + x) * 4 + 3] > 32) {
                left = Math.min(left, x);
                right = x;
            }
        }
        return { left, right };
    });
    const position = { x: 0, y: 0 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let drag = null;

    function clampPosition() {
        position.x = Math.max(0, Math.min(width - catSize, position.x));
        position.y = Math.max(0, Math.min(height - catSize, position.y));
    }

    function lineSlots(y, lineHeight) {
        const padding = 5;
        const first = Math.max(0, Math.floor(y - position.y - padding));
        const last = Math.min(catSize, Math.ceil(y + lineHeight - position.y + padding));
        let left = catSize;
        let right = -1;
        for (let row = first; row < last; row++) {
            left = Math.min(left, silhouette[row].left);
            right = Math.max(right, silhouette[row].right);
        }
        if (right < 0) return [{ left: 0, width }];
        const before = Math.max(0, position.x + left - padding);
        const after = Math.min(width, position.x + right + 1 + padding);
        return [{ left: 0, width: before }, { left: after, width: width - after }]
            .filter(slot => slot.width >= 60);
    }

    function render() {
        frame = 0;
        clampPosition();
        handle.style.transform = `translate(${position.x}px, ${position.y}px)`;
        const fragment = document.createDocumentFragment();
        let y = 0;

        for (let paragraph = 0; paragraph < prepared.length; paragraph++) {
            const block = prepared[paragraph];
            const lineHeight = block.lineHeight;
            let cursor = { segmentIndex: 0, graphemeIndex: 0 };
            while (true) {
                let exhausted = false;
                let placed = false;
                for (const slot of lineSlots(y, lineHeight)) {
                    const line = layoutNextLine(block.text, cursor, slot.width);
                    if (!line) { exhausted = true; break; }
                    const span = document.createElement('span');
                    span.className = 'cat-flow-line';
                    span.style.font = block.font;
                    span.style.lineHeight = `${lineHeight}px`;
                    span.style.letterSpacing = `${block.letterSpacing}px`;
                    span.style.color = block.colour;
                    span.textContent = line.text;
                    span.style.left = `${slot.left}px`;
                    span.style.top = `${y}px`;
                    fragment.append(span);
                    placed = true;
                    cursor = line.end;
                }
                if (exhausted) {
                    if (placed) y += lineHeight;
                    break;
                }
                y += lineHeight;
            }
            y += block.gap;
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
        const fraction = width ? position.x / Math.max(1, width - catSize) : 0;
        width = nextWidth;
        measureBlocks();
        height = prepared.reduce((sum, block) => sum + layoutWithLines(block.text, width, block.lineHeight).height + block.gap, 0) + 24;
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
        position.x = 0;
        position.y = 0;
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
