// Builds two bundles: the extension host (Node/CommonJS) and the Topics webview
// (browser/IIFE). Pass --dev for sourcemaps and no minification.
import { build } from 'esbuild';

const dev = process.argv.includes('--dev');
const common = { bundle: true, minify: !dev, sourcemap: dev, logLevel: 'info' };

await build({
  ...common,
  entryPoints: ['src/extension.ts'],
  platform: 'node',
  format: 'cjs',
  external: ['vscode'],
  outfile: 'dist/extension.js',
});

await build({
  ...common,
  entryPoints: ['src/webview/main.ts'],
  platform: 'browser',
  format: 'iife',
  outfile: 'dist/webview.js',
});
