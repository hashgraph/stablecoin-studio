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

import Language from '../../../src/domain/language/Language';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  get: (fn): string => {
    return fn.configuration.aliasAlreadyInUse;
  },
}));

describe(`Testing ${Language.name}.ts class`, () => {
  let language: Language;

  beforeEach(() => {
    language = new Language();
  });

  it('Should be initializate', () => {
    expect(language).not.toBeNull();
  });

  it('Should return not null when request some text with params', () => {
    const allTexts = language.getText('general.title', { alias: 'Test' });

    expect(allTexts).not.toBeNull();
  });

  // eslint-disable-next-line jest/no-commented-out-tests
  /*it('Should return not null when request some array', () => {
    const allTexts = language.getArray('wizard.options');

    expect(allTexts).not.toBeNull();
  });*/

  it('Should return not null when request some array', () => {
    const allTexts = language.getArrayFromObject('wizard.mainOptions');

    expect(allTexts).not.toBeNull();
  });
});
