import { english } from '../../resources/config/language.js';
import * as lodash from 'lodash';
import BaseEntity from '../BaseEntity.js';

/**
 * Language
 */
export default class Language extends BaseEntity {
  private lang: any;

  constructor() {
    super();
    this.lang = english;
  }

  public getText(attribute: string, params?: object): string {
    const str = lodash.get(this.lang, attribute);

    if (!params) return str;

    const parts = str.split(/\$\{(?!\d)[\wæøåÆØÅ]*\}/);
    const args = str.match(/[^{\\}]+(?=})/g) || [];
    const parameters = args.map(
      (argument: string) =>
        params[argument] ||
        (params[argument] === undefined ? '' : params[argument]),
    );

    return String.raw({ raw: parts }, ...parameters);
  }

  public getArrayFromObject(attribute: string): Array<string> {
    const values = [];

    let obj = this.lang;

    if(!obj || attribute === '') return values;

    attribute.split(".").forEach(item => {
      obj = obj[item];
    });

    const objKeys = Object.keys(obj);

    objKeys.forEach(key => {
      values.push(lodash.get(this.lang, attribute + "." + key));
    });

    return values;
  }
}
