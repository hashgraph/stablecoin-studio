import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { GetStableCoinDetails } from '../../../../../src/index.js';
import { logValidation } from '../../../../core/core.js';

describe('🧪 SDK GetStableCoinDetails Request', () => {
  it('Create simple request', () => {
    const request: GetStableCoinDetails = new GetStableCoinDetails({
      id: '0.0.48826175',
    });
    expect(request).not.toBeNull();
  });

  it('GetListStableCoin and validate', () => {
    const request: GetStableCoinDetails = new GetStableCoinDetails({
      id: '0.0.48826175',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: GetStableCoinDetails = new GetStableCoinDetails({
      id: '00.48826175',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(
      ErrorCode.InvalidIdFormatHedera,
    );
  });
});
