import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import postcssConfig from './postcss.config.mjs';

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
                compact: false,
            }),
            css({
                output: 'index.css',
                extract: true,
                config: false,
                plugins: postcssConfig.plugins,
            }),
            terser({
                output: {
                    ascii_only: false,
                },
            })
        ],
    }
];
