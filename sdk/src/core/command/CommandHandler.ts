/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command } from "./Command.js";

export interface CommandHandler<
	TCommand extends Command = any,
	TResult = any,
> {
	execute(command: TCommand): Promise<TResult>;
}
