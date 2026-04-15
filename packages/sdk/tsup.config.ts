import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: './src/index.ts',
    },
    outDir: 'dist/esm',
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    // Externalize the contracts as it is a peer workspace package.
    external: ['@hashgraph/stablecoin-npm-contracts'],
    // Bundle other @hashgraph and @hiero-ledger packages to avoid ESM resolution issues in broken dependencies.
    // Specifying @hiero-ledger/sdk as noExternal as requested by the user.
    noExternal: [
      /^@hashgraph\/(?!stablecoin-npm-contracts)/,
      /^@hiero-ledger\//,
      'tsyringe',
      'reflect-metadata'
    ],
    target: 'es2022',
    outExtension({ format }) {
      return {
        js: format === 'esm' ? '.mjs' : '.js',
      };
    },
  },
  {
    entry: {
      index: './src/index.ts',
    },
    outDir: 'dist/cjs',
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    external: ['@hashgraph/stablecoin-npm-contracts'],
    noExternal: [
      /^@hashgraph\/(?!stablecoin-npm-contracts)/,
      /^@hiero-ledger\//,
      'tsyringe',
      'reflect-metadata'
    ],
    target: 'node16',
  },
]);
