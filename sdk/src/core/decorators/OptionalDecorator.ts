import 'reflect-metadata';
import { IndexableObject } from '../types.js';

const OPTIONAL_KEYS = Symbol('optionalKeys');

export function OptionalKey(): (target: object, propertyKey: string) => void {
	return registerProperty;
}

function registerProperty(target: object, propertyKey: string): void {
	let properties: string[] = Reflect.getMetadata(OPTIONAL_KEYS, target);

	if (properties) {
		properties.push(propertyKey);
	} else {
		properties = [propertyKey];
		Reflect.defineMetadata(OPTIONAL_KEYS, properties, target);
	}
}

export function getOptionalKeys(origin: IndexableObject): IndexableObject {
	const properties: string[] =
		Reflect.getMetadata(OPTIONAL_KEYS, origin) ?? [];
	const result: IndexableObject = {};
	properties.forEach((key) => (result[key] = origin[key]));
	return result;
}
