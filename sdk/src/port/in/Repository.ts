export default class Repository<T> {
	constructor() {
		this._data = new Array<T>();
	}

	private _data: Array<T>;
	public get data(): Array<T> {
		return this._data;
	}
	public set data(value: Array<T>) {
		this._data = value;
	}
}
