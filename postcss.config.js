module.exports = {
    plugins: [
        require('postcss-import'),
        require('postcss-nested'),
        require('postcss-inline-svg'),
        require('autoprefixer'),
        require('cssnano'),
    ]
};
