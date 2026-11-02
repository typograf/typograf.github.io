module.exports = {
    plugins: [
        require('postcss-import'),
        require('postcss-nested').default,
        require('postcss-inline-svg'),
        require('autoprefixer'),
        require('cssnano'),
    ]
};
