import type { ContentScriptContext } from '#imports';
import controlsCss from './controls.css?inline';
import css from './overlay.css?inline';
import { findVideoAt } from './video';

export interface Control {
  element: HTMLElement;
  // Called every time the controls are shown for a video.
  update(video: HTMLVideoElement): void;
}

const HIDE_DELAY = 2500;

export function createOverlay(ctx: ContentScriptContext, controls: Control[]) {
  const host = document.createElement('video-toolkit');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  const panel = document.createElement('div');
  style.textContent = controlsCss + css;
  panel.className = 'panel';
  panel.hidden = true;
  panel.append(...controls.map((control) => control.element));
  shadow.append(style, panel);

  // Keep focus on the page and keep clicks from reaching the site's player.
  panel.addEventListener('mousedown', (event) => event.preventDefault());
  for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'dblclick']) {
    panel.addEventListener(type, (event) => event.stopPropagation());
  }

  const videos = document.getElementsByTagName('video');
  let hovering = false;
  let hideTimer: number | undefined;

  function show(video: HTMLVideoElement) {
    const fullscreen = document.fullscreenElement;
    // Nothing can be drawn over a <video> that is fullscreen by itself.
    if (fullscreen instanceof HTMLVideoElement) return;

    for (const control of controls) control.update(video);

    const parent = fullscreen ?? document.body;
    if (host.parentNode !== parent) parent.append(host);

    const rect = video.getBoundingClientRect();
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
      if (videos.length === 0) return;
      const video = findVideoAt(videos, event.clientX, event.clientY, host);
      if (video) show(video);
      else if (!hovering) hide();
    },
    { capture: true },
  );
  ctx.addEventListener(document, 'fullscreenchange', hide);
  ctx.onInvalidated(() => host.remove());
}
