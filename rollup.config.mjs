import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

export default [
    {
        input: 'src/index.ts',
        output: {
            format: 'iife',
            file: './dist/index.js'
        },
        plugins: [
            typescript(),
            nodeResolve(),
            commonjs(),
            babel({
                babelHelpers: 'bundled',
                presets: ['@babel/preset-env'],
            }),
            css({
                output: 'index.css',
                extract: true,
            }),
            terser()
        ],
    }
];
