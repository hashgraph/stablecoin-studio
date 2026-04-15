import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'typechain-types/index.ts',
		factories: 'typechain-types/factories/index.ts',
	},
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	target: 'es2022',
	external: ['ethers'],
});
