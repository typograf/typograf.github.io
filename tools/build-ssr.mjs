import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dirname, isAbsolute, resolve } from 'node:path';
import typescript from 'typescript';

const bundle = await rollup({
    input: 'src/ssr.tsx',
    external: id => !id.startsWith('.') && !isAbsolute(id),
    plugins: [
        {
            name: 'ignore-ssr-css',
            resolveId(source, importer) {
                if (source.endsWith('.css') && importer) return resolve(dirname(importer), source);
            },
            load(id) {
                if (id.endsWith('.css')) return '';
            },
        },
        nodeResolve({ extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'] }),
        {
            name: 'transpile-ssr-typescript',
            transform(code, id) {
                if (!/\.tsx?$/.test(id)) return;
                return typescript.transpileModule(code, {
                    fileName: id,
                    compilerOptions: {
                        module: typescript.ModuleKind.ESNext,
                        target: typescript.ScriptTarget.ES2022,
                        jsx: typescript.JsxEmit.ReactJSX,
                        jsxImportSource: 'preact',
                    },
                }).outputText;
            },
        },
    ],
});

try {
    await bundle.write({ file: 'dist/ssr.mjs', format: 'esm' });
} finally {
    await bundle.close();
}
