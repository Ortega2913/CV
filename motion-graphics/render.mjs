import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Usage: node render.mjs [compositionId] [outputFileName]
const COMPOSITION_ID = process.argv[2] || 'GethsemaneMotionGraphics';
const OUTPUT_NAME = process.argv[3] || 'output_motion_graphics.mp4';
const outputFile = path.join(__dirname, '..', OUTPUT_NAME);

console.log('Bundling Remotion project...');

const bundled = await bundle({
  entryPoint: path.join(__dirname, 'src', 'index.ts'),
  webpackOverride: (config) => config,
});

console.log('Bundle complete:', bundled);
console.log('Selecting composition...');

const CHROME_PATH = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const composition = await selectComposition({
  serveUrl: bundled,
  id: COMPOSITION_ID,
  browserExecutable: CHROME_PATH,
  chromeMode: 'chrome-for-testing',
});

console.log(`Rendering ${composition.durationInFrames} frames at ${composition.fps}fps...`);

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: 'h264',
  outputLocation: outputFile,
  browserExecutable: CHROME_PATH,
  chromeMode: 'chrome-for-testing',
  onProgress: ({ progress }) => {
    process.stdout.write(`\rRendering: ${Math.round(progress * 100)}%`);
  },
  chromiumOptions: {
    disableWebSecurity: true,
    headless: true,
  },
  concurrency: 2,
});

console.log(`\nDone! Output: ${outputFile}`);
