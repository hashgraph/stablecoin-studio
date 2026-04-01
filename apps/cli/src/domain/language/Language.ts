/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { english } from '../../resources/config/language.js';
import * as lodash from 'lodash';
import BaseEntity from '../BaseEntity.js';

/**
 * Language
 */
export default class Language extends BaseEntity {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    if (!obj || attribute === '') return values;

    attribute.split('.').forEach((item) => {
      obj = obj[item];
    });

    const objKeys = Object.keys(obj);

    objKeys.forEach((key) => {
      values.push(lodash.get(this.lang, attribute + '.' + key));
    });

    return values;
  }
}
