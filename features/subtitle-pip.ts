import controlsCss from '@/core/controls.css?inline';
import type { Control } from '@/core/overlay';
import { createSpeedControl } from '@/features/speed';
import css from './subtitle-pip.css?inline';

declare const documentPictureInPicture: {
  window: Window | null;
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
};

// Netflix draws its subtitles in this element.
const SUBTITLES = '.player-timedtext';
const WIDTH = 480;

const ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <rect x="10" y="10" width="10" height="8" rx="1" fill="currentColor" stroke="none" />
  <path d="M12 15h6" stroke="#000" stroke-width="1.5" />
</svg>`;
const PLAY = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>`;
const PAUSE = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z" /></svg>`;

export function createSubtitlePipButton(): Control {
  const element = document.createElement('button');
  element.title = browser.i18n.getMessage('subtitlePip');
  element.innerHTML = ICON;

  let video: HTMLVideoElement | undefined;

  element.addEventListener('click', () => {
    if (documentPictureInPicture.window) documentPictureInPicture.window.close();
    else if (video) openWindow(video);
  });

  return {
    element,
    update(target) {
      video = target;
    },
  };
}

async function openWindow(video: HTMLVideoElement) {
  const height = video.videoWidth ? Math.round((WIDTH * video.videoHeight) / video.videoWidth) : 270;
  const pip = await documentPictureInPicture.requestWindow({ width: WIDTH, height });
  const closed = new AbortController();

  const style = pip.document.createElement('style');
  const subtitle = pip.document.createElement('div');
  const controls = pip.document.createElement('div');
  const speed = createSpeedControl();
  style.textContent = controlsCss + css;
  subtitle.className = 'subtitle';
  controls.className = 'controls';
  controls.append(createPlayButton(video, closed.signal), speed.element);
  speed.update(video);

  const placeholder = document.createComment('video-toolkit');
  video.before(placeholder);
  pip.document.head.append(style);
  pip.document.body.append(video, subtitle, controls);

  pip.document.body.addEventListener('click', (event) => {
    if (!controls.contains(event.target as Node)) togglePlay(video);
  });

  const update = () => {
    const text = document.querySelector<HTMLElement>(SUBTITLES)?.innerText ?? '';
    if (subtitle.textContent !== text) subtitle.textContent = text;
  };
  const observer = new MutationObserver(update);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  update();

  pip.addEventListener('pagehide', () => {
    closed.abort();
    observer.disconnect();
    placeholder.replaceWith(video);
  });
}

function createPlayButton(video: HTMLVideoElement, signal: AbortSignal) {
  const button = document.createElement('button');
  const render = () => {
    button.innerHTML = video.paused ? PLAY : PAUSE;
  };
  button.addEventListener('click', () => togglePlay(video));
  video.addEventListener('play', render, { signal });
  video.addEventListener('pause', render, { signal });
  render();
  return button;
}

function togglePlay(video: HTMLVideoElement) {
  if (video.paused) video.play();
  else video.pause();
}
