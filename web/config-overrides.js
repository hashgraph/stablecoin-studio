const webpack = require('webpack');

module.exports = function override(config, env) {
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
};

module.exports.devServer = function(configFunction) {
        return function(proxy, allowedHost) {
                const config = configFunction(proxy, allowedHost);
                config.allowedHosts = 'all';
                return config;
        };
};
