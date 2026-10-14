import type { Control } from '@/core/overlay';

const ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="2" y="4" width="20" height="16" rx="2" />
  <rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
</svg>`;

export function createPipButton(): Control {
  const element = document.createElement('button');
  element.title = browser.i18n.getMessage('pip');
  element.innerHTML = ICON;

  let video: HTMLVideoElement | undefined;

  element.addEventListener('click', () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (video) {
      // Some sites, like Netflix, turn PiP off on their video.
      video.disablePictureInPicture = false;
      video.requestPictureInPicture();
    }
  });

  return {
    element,
    update(target) {
      video = target;
    },
  };
}
