import { commanderService } from '../../../../src/index.js';

describe(`Testing CommanderService class`, () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation();
  jest.useFakeTimers();
  it('Should instance', async () => {
    commanderService.start();

    expect(commanderService).not.toBeNull();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
