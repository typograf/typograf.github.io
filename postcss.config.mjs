import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import postcssInlineSvg from 'postcss-inline-svg';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

export default {
    plugins: [
        postcssImport,
        postcssNested,
        postcssInlineSvg,
        autoprefixer,
        cssnano,
    ]
};
