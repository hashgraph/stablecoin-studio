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
