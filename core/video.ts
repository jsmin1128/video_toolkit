const MIN_WIDTH = 200;

// The video under the mouse that can actually be seen.
export function findVideoAt(videos: HTMLCollectionOf<HTMLVideoElement>, x: number, y: number, ignore?: Element) {
  for (const video of videos) {
    const rect = video.getBoundingClientRect();
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (inside && rect.width >= MIN_WIDTH && isShown(video) && !isClipped(video, x, y) && !isCovered(video, x, y, ignore)) {
      return video;
    }
  }
}

// Loaded, and not hidden with CSS.
function isShown(video: HTMLVideoElement) {
  return video.readyState > 0 && video.checkVisibility({ opacityProperty: true, visibilityProperty: true });
}

// A parent that hides its overflow, like a carousel showing one slide at a time, cuts the video off here.
// The overflow of <body> and <html> scrolls the page instead of cutting anything off.
function isClipped(video: HTMLVideoElement, x: number, y: number) {
  let position = getComputedStyle(video).position;
  for (let parent = video.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
    // A fixed box is cut off by no parent, an absolute one only by positioned parents.
    if (position === 'fixed') return false;
    const style = getComputedStyle(parent);
    if (position === 'absolute' && style.position === 'static') continue;
    position = style.position;
    if (style.display === 'contents' || style.display === 'inline') continue;
    const rect = parent.getBoundingClientRect();
    if (style.overflowX !== 'visible' && (x < rect.left || x > rect.right)) return true;
    if (style.overflowY !== 'visible' && (y < rect.top || y > rect.bottom)) return true;
  }
  return false;
}

// Something from outside the video's player, like an image or a panel, is drawn over it.
function isCovered(video: HTMLVideoElement, x: number, y: number, ignore?: Element) {
  for (const element of document.elementsFromPoint(x, y)) {
    if (element === ignore) continue;
    if (element.contains(video) || inSamePlayer(element, video)) return false;
    if (isOpaque(element)) return true;
  }
  return false;
}

// The element shares a parent with the video that is not much bigger than the video: the player.
function inSamePlayer(element: Element, video: HTMLVideoElement) {
  let parent = video.parentElement;
  while (parent && !parent.contains(element)) parent = parent.parentElement;
  return parent !== null && area(parent) <= area(video) * 4;
}

function isOpaque(element: Element) {
  if (
    element instanceof HTMLImageElement ||
    element instanceof HTMLCanvasElement ||
    element instanceof HTMLVideoElement ||
    element instanceof HTMLIFrameElement
  ) {
    return true;
  }
  const style = getComputedStyle(element);
  if (Number(style.opacity) < 0.5) return false;
  if (style.backgroundImage !== 'none') return true;
  const alpha = style.backgroundColor.match(/[\d.]+/g)?.[3] ?? '1';
  return Number(alpha) >= 0.5;
}

function area(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width * rect.height;
}
