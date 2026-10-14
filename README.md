# Video Toolkit

A Chrome extension for watching videos. It works on most video sites.

[한국어](README.ko.md)

## Features

Move the mouse over a video to show the controls.

- Speed: `−` and `+` change the speed by 0.1x. Click the speed to pick from 0.25x to 2x.
- PiP: opens the browser's picture-in-picture window.
- Subtitle PiP: opens the video with its subtitles in a small window that stays on top. The window has play/pause, 10-second skip and speed controls. Subtitles are shown on Netflix, YouTube and sites that use the browser's built-in subtitles. Not available for videos embedded from another site.

## Install

1. Download `video-toolkit-<version>-chrome.zip` from [Releases](../../releases/latest) and unzip it to a folder you will keep.
2. Open `chrome://extensions` and turn on Developer mode.
3. Click "Load unpacked" and select the unzipped folder.

To update, unzip the new version into the same folder and click the reload button on the extension card. Refresh any open video tabs after installing or updating.

## Development

Requires Node.js 22 or later.

```sh
npm install
npm run dev
```

Load `.output/chrome-mv3-dev` with "Load unpacked". While `npm run dev` is running, changes are reloaded automatically.

- `npm run build`: production build in `.output/chrome-mv3`
- `npm run zip`: production zip in `.output`
- `npm run check`: type check
