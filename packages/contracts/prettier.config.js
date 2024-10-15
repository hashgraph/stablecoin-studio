// prettier.config.js or .prettierrc.js
module.exports = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    overrides: [
        {
            files: 'contracts/**/*.sol',
            options: {
                compiler: '0.8.16',
            },
        },
    ],
}
