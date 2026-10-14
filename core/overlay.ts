import type { ContentScriptContext } from '#imports';
import css from './overlay.css?inline';

export interface Control {
  element: HTMLElement;
  setVideo(video: HTMLVideoElement): void;
}

const HIDE_DELAY = 2500;
const MIN_VIDEO_WIDTH = 200;

export function createOverlay(ctx: ContentScriptContext, controls: Control[]) {
  const host = document.createElement('video-toolkit');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  const panel = document.createElement('div');
  style.textContent = css;
  panel.className = 'panel';
  panel.hidden = true;
  panel.append(...controls.map((control) => control.element));
  shadow.append(style, panel);

  // Keep focus on the page and keep clicks from reaching the site's player.
  panel.addEventListener('mousedown', (event) => event.preventDefault());
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick']) {
    panel.addEventListener(type, (event) => event.stopPropagation());
  }

  let video: HTMLVideoElement | undefined;
  let hovering = false;
  let hideTimer: number | undefined;

  function show(target: HTMLVideoElement) {
    if (target !== video) {
      video = target;
      for (const control of controls) control.setVideo(target);
    }

    const parent = document.fullscreenElement ?? document.body;
    if (host.parentNode !== parent) parent.append(host);

    const rect = target.getBoundingClientRect();
    panel.style.left = `${rect.left + rect.width / 2}px`;
    panel.style.top = `${Math.max(rect.top, 0) + 16}px`;
    panel.hidden = false;

    clearTimeout(hideTimer);
    if (!hovering) hideTimer = ctx.setTimeout(hide, HIDE_DELAY);
  }

  function hide() {
    panel.hidden = true;
  }

  panel.addEventListener('mouseenter', () => {
    hovering = true;
    clearTimeout(hideTimer);
  });
  panel.addEventListener('mouseleave', () => {
    hovering = false;
    hideTimer = ctx.setTimeout(hide, HIDE_DELAY);
  });

  ctx.addEventListener(
    document,
    'mousemove',
    (event) => {
      const target = findVideoAt(event.clientX, event.clientY);
      if (target) show(target);
      else if (!hovering) hide();
    },
    { capture: true },
  );
  ctx.addEventListener(document, 'fullscreenchange', hide);
  ctx.onInvalidated(() => host.remove());
}

function findVideoAt(x: number, y: number) {
  for (const video of document.querySelectorAll('video')) {
    const rect = video.getBoundingClientRect();
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (inside && rect.width >= MIN_VIDEO_WIDTH) return video;
  }
}
