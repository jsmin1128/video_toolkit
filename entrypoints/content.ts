import { createOverlay } from '@/core/overlay';
import { createPipButton } from '@/features/pip';
import { createSpeedControl, keepSpeed } from '@/features/speed';
import { createSubtitlePipButton } from '@/features/subtitle-pip';

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true,
  main(ctx) {
    keepSpeed(ctx);
    const controls = [createSpeedControl(), createPipButton()];
    // Chrome opens the subtitle PiP window only from the top page, not from iframes.
    if (window === window.top) controls.push(createSubtitlePipButton());
    createOverlay(ctx, controls);
  },
});
