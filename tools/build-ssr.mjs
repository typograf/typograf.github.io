import { build } from 'esbuild';

await build({
    entryPoints: ['src/ssr.tsx'],
    outfile: 'dist/ssr.mjs',
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    jsx: 'automatic',
    jsxImportSource: 'preact',
    loader: { '.css': 'empty', '.svg': 'empty' },
});
