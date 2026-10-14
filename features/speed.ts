import type { ContentScriptContext } from '#imports';
import type { Control } from '@/core/overlay';

const STEP = 0.1;
const MIN = 0.1;
const MAX = 16;
const PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

let chosen: number | undefined;

// Keep the chosen speed when the next video loads.
export function keepSpeed(ctx: ContentScriptContext) {
  ctx.addEventListener(
    document,
    'loadedmetadata',
    (event) => {
      if (chosen && event.target instanceof HTMLVideoElement) apply(event.target, chosen);
    },
    { capture: true },
  );
}

export function createSpeedControl(): Control {
  const element = document.createElement('div');
  const slower = document.createElement('button');
  const value = document.createElement('button');
  const faster = document.createElement('button');
  const table = document.createElement('div');
  const grid = document.createElement('div');
  const cells = new Map<number, HTMLButtonElement>();

  for (const speed of PRESETS) {
    const cell = document.createElement('button');
    cell.textContent = format(speed);
    cell.addEventListener('click', () => {
      setSpeed(speed);
      table.hidden = true;
    });
    cells.set(speed, cell);
  }

  element.className = 'speed';
  slower.textContent = '−';
  faster.textContent = '+';
  value.className = 'value';
  value.title = browser.i18n.getMessage('chooseSpeed');
  table.className = 'table';
  table.hidden = true;
  grid.className = 'grid';
  grid.append(...cells.values());
  table.append(grid);
  element.append(slower, value, faster, table);

  let video: HTMLVideoElement | undefined;

  function render() {
    const speed = video?.playbackRate ?? 1;
    value.textContent = `${format(speed)}x`;
    for (const [preset, cell] of cells) {
      cell.classList.toggle('current', Math.abs(preset - speed) < 0.001);
    }
  }

  function setSpeed(speed: number) {
    if (!video) return;
    chosen = Math.min(MAX, Math.max(MIN, Math.round(speed * 100) / 100));
    apply(video, chosen);
    render();
  }

  slower.addEventListener('click', () => video && setSpeed(video.playbackRate - STEP));
  faster.addEventListener('click', () => video && setSpeed(video.playbackRate + STEP));
  value.addEventListener('click', () => {
    table.hidden = !table.hidden;
  });
  element.addEventListener('mouseleave', () => {
    table.hidden = true;
  });

  return {
    element,
    update(target) {
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
  return Math.round(speed * 100) % 10 ? speed.toFixed(2) : speed.toFixed(1);
}
