/* eslint-disable @typescript-eslint/no-explicit-any */
export type ABI = Record<string, any>;

export default class Contract {
	constructor(public address: string, public abi: object[], public name: string) {}
}
