import { createOverlay } from '@/core/overlay';
import { createPipButton } from '@/features/pip';
import { createSpeedControl, keepSpeed } from '@/features/speed';
import { createSubtitlePipButton } from '@/features/subtitle-pip';

export default defineContentScript({
  matches: ['*://*.netflix.com/*'],
  main(ctx) {
    keepSpeed(ctx);
    createOverlay(ctx, [createSpeedControl(), createPipButton(), createSubtitlePipButton()]);
  },
});
