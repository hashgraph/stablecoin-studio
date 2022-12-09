import LogService from '../../../../src_old/app/service/log/LogService.js.js';

describe('🧪 [SERVICE] LogService', () => {
  let logService: LogService;

  beforeAll(async () => {
    logService = new LogService();
  });
  it('Instantiate the class', () => {
    expect(logService).not.toBeNull();
    expect(LogService.instance).not.toBeNull();
  });
});
