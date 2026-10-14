import { createOverlay } from '@/core/overlay';
import { createPipButton } from '@/features/pip';
import { createSpeedControl } from '@/features/speed';

export default defineContentScript({
  matches: ['*://*.netflix.com/*'],
  main(ctx) {
    createOverlay(ctx, [createSpeedControl(ctx), createPipButton()]);
  },
});
