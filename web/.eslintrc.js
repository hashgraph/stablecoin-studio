module.exports = {
	env: {
		browser: true,
		es2021: true,
		jest: true,
	},
	extends: [
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'standard',
		'eslint-config-prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['react', '@typescript-eslint'],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-redeclare': 'error',
		'no-useless-constructor': 'off',
		'@typescript-eslint/consistent-type-imports': 'error',
		'react/prop-types': 'off',
		'import/no-duplicates': 'error',
	},
};
