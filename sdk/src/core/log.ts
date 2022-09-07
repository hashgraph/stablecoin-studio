export const log = (
	obj: unknown,
	options?: {
		newLine?: boolean;
		clear?: boolean;
		args?: unknown[];
	},
): void => {
	console.log(
		`
            ${options?.clear ? '\r' : ''}
            ${options?.newLine ? '\t' : ''}
        `,
		obj,
		...(options?.args ?? []),
	);
};
