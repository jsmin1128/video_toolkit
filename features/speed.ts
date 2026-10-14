import type { ContentScriptContext } from '#imports';
import type { Control } from '@/core/overlay';

const STEP = 0.1;
const MIN = 0.1;
const MAX = 16;

export function createSpeedControl(ctx: ContentScriptContext): Control {
  const element = document.createElement('div');
  const slower = document.createElement('button');
  const value = document.createElement('button');
  const faster = document.createElement('button');
  element.className = 'speed';
  slower.textContent = '−';
  faster.textContent = '+';
  value.className = 'value';
  value.title = browser.i18n.getMessage('resetSpeed');
  element.append(slower, value, faster);

  let video: HTMLVideoElement | undefined;
  let chosen: number | undefined;

  function render() {
    value.textContent = format(video?.playbackRate ?? 1);
  }

  function setSpeed(speed: number) {
    chosen = Math.min(MAX, Math.max(MIN, Math.round(speed * 10) / 10));
    if (video) apply(video, chosen);
  }

  slower.addEventListener('click', () => video && setSpeed(video.playbackRate - STEP));
  faster.addEventListener('click', () => video && setSpeed(video.playbackRate + STEP));
  value.addEventListener('click', () => setSpeed(1));

  // Also show speed changes made by the site itself.
  ctx.addEventListener(
    document,
    'ratechange',
    (event) => {
      if (event.target === video) render();
    },
    { capture: true },
  );

  // Keep the chosen speed when the next video loads.
  ctx.addEventListener(
    document,
    'loadedmetadata',
    (event) => {
      if (chosen && event.target instanceof HTMLVideoElement) apply(event.target, chosen);
    },
    { capture: true },
  );

  return {
    element,
    setVideo(target) {
      video = target;
      render();
    },
  };
}

function apply(video: HTMLVideoElement, speed: number) {
  video.defaultPlaybackRate = speed;
  video.playbackRate = speed;
}

function format(speed: number) {
  return `${Math.round(speed * 100) % 10 ? speed.toFixed(2) : speed.toFixed(1)}x`;
}
