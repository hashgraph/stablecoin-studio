import { singleton, inject } from 'tsyringe';
import { Environment } from '../../domain/context/network/Environment.js';
import Service from './Service.js';

export interface NetworkProps {
	environment: Environment;
	mirrorNode?: string;
	rpcNode?: string;
	consensusNodes?: string;
}

@singleton()
export default class NetworkService extends Service implements NetworkProps {
	private _environment: Environment;
	private _mirrorNode?: string | undefined;
	private _rpcNode?: string | undefined;
	private _consensusNodes?: string | undefined;

	public set environment(value: Environment) {
		this._environment = value;
	}

	public get environment(): Environment {
		return this._environment;
	}

	public get mirrorNode(): string | undefined {
		return this._mirrorNode;
	}

	public set mirrorNode(value: string | undefined) {
		this._mirrorNode = value;
	}

	public get rpcNode(): string | undefined {
		return this._rpcNode;
	}

	public set rpcNode(value: string | undefined) {
		this._rpcNode = value;
	}

	public get consensusNodes(): string | undefined {
		return this._consensusNodes;
	}

	public set consensusNodes(value: string | undefined) {
		this._consensusNodes = value;
	}

	constructor(@inject('NetworkProps') props?: NetworkProps) {
		super();
		Object.assign(this, props);
	}
}
