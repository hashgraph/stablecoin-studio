const webpack = require('webpack');

module.exports = function override(config) {
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
	});
	config.resolve.fallback = fallback;
	config.plugins = (config.plugins || []).concat([
		// TODO : Review this to ignore the warnings
		// new webpack.IgnorePlugin({
		// 	resourceRegExp: /^@hashgraph\/hedera-wallet-connect$/
		// }),
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer'],
		}),
	]);

	config.ignoreWarnings = [/Failed to parse source map/]; // this is a temporary solution until the source map issue in react-scripts is fixed
	return config;
};
