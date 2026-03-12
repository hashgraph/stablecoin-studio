const webpack = require('webpack');
const path = require('path');

module.exports = {
	webpack: function override(config) {
		config.resolve.modules = [
			path.resolve(__dirname, 'node_modules'),
			'node_modules',
		];
		config.resolve.alias = {
			...config.resolve.alias,
			// @notabene/pii-sdk uses axios.interceptors at module load time which
			// fails in the browser due to ESM/CJS interop issues. The SDK is only
			// used server-side (Fireblocks), so we stub it out in the browser bundle.
			'@notabene/pii-sdk': false,
		};
		// @svgr/webpack@5.x generates ESM code with `import * as React from 'react'`
		// using the classic JSX transform. Webpack 5 strict harmony analysis treats CJS
		// modules (React) as having no static exports, causing build errors.
		// Downgrade these from errors to warnings since the runtime behavior is correct.
		config.module = config.module || {};
		config.module.parser = {
			...(config.module.parser || {}),
			javascript: {
				...((config.module.parser || {}).javascript || {}),
				exportsPresence: 'warn',
			},
		};
		const fallback = config.resolve.fallback || {};
		Object.assign(fallback, {
			crypto: require.resolve('crypto-browserify'),
			stream: require.resolve('stream-browserify'),
			assert: require.resolve('assert/'),
			http: require.resolve('stream-http'),
			https: require.resolve('https-browserify'),
			os: require.resolve('os-browserify'),
			url: require.resolve('url'),
			path: require.resolve('path-browserify'),
			zlib: require.resolve('browserify-zlib'),
			fs: false,
			vm: false,
			process: false,
		});
		config.resolve.fallback = fallback;
		config.plugins = (config.plugins || [])
			.concat([
				new webpack.ProvidePlugin({
					process: 'process/browser',
					Buffer: ['buffer', 'Buffer'],
				}),
			])
			.concat([
				new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
					const mod = resource.request.replace(/^node:/, '');
					switch (mod) {
						case 'buffer':
							resource.request = 'buffer';
							break;
						case 'stream':
							resource.request = 'readable-stream';
							break;
						default:
							throw new Error(`Not found ${mod}`);
					}
				}),
			]);
		config.ignoreWarnings = [/Failed to parse source map/]; // this is a temporary solution until the source map issue in react-scripts is fixed
		return config;
	},
	jest: function (config) {
		config.watchPlugins = [];
		return config;
	},
};
