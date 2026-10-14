// Runs inside Netflix's page so it can use Netflix's own player.
// Netflix playback breaks if video.currentTime is changed directly.

interface NetflixPlayer {
  getCurrentTime(): number;
  seek(time: number): void;
}

declare global {
  interface Window {
    netflix?: {
      appContext: {
        state: {
          playerApp: {
            getAPI(): {
              videoPlayer: {
                getAllPlayerSessionIds(): string[];
                getVideoPlayerBySessionId(id: string): NetflixPlayer | undefined;
              };
            };
          };
        };
      };
    };
  }
}

export default defineContentScript({
  matches: ['*://*.netflix.com/*'],
  world: 'MAIN',
  main() {
    document.addEventListener('video-toolkit:seek', (event) => {
      const seconds = (event as CustomEvent<number>).detail;
      const player = getPlayer();
      if (!player) {
        console.warn('[Video Toolkit] Netflix player not found');
        return;
      }
      player.seek(Math.max(0, player.getCurrentTime() + seconds * 1000));
    });
  },
});

function getPlayer() {
  const videoPlayer = window.netflix?.appContext.state.playerApp.getAPI().videoPlayer;
  const ids = videoPlayer?.getAllPlayerSessionIds() ?? [];
  const id = ids.find((id) => id.startsWith('watch')) ?? ids.at(-1);
  return id === undefined ? undefined : videoPlayer?.getVideoPlayerBySessionId(id);
}
