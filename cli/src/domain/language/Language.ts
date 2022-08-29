import { english } from '../../resources/config/language.js';
import * as lodash from 'lodash';
import BaseEntity from '../BaseEntity.js';

/**
 * Language
 */
export default class Language extends BaseEntity {
  private lang: unknown;

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

  public getArray(attribute: string): Array<string> {
    return lodash.get(this.lang, attribute);
  }
}
