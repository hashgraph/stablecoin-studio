import { singleton } from 'tsyringe';
import Service from './Service.js';

@singleton()
export default class NetworkService extends Service {}
