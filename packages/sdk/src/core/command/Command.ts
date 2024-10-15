/* eslint-disable @typescript-eslint/no-empty-interface */
export interface BaseCommand {}
export class Command<T = unknown> implements BaseCommand {
	resultType!: T;
}
