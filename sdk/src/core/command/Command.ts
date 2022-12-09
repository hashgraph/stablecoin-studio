/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ICommand {}
export class Command<T = unknown> implements ICommand {
	private $resultType!: T;
}