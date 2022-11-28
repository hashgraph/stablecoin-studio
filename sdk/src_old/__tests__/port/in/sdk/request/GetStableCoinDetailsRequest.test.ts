import BaseError, {
  ErrorCode,
} from '../../../../../src_old/core/error/BaseError.js.js';
import { GetStableCoinDetailsRequest } from '../../../../../src_old/index.js.js';
import { logValidation } from '../../../../core/core.js';

describe('🧪 SDK GetStableCoinDetailsRequest', () => {
  it('Create simple request', () => {
    const request: GetStableCoinDetailsRequest =
      new GetStableCoinDetailsRequest({
        id: '0.0.48826175',
      });
    expect(request).not.toBeNull();
  });

  it('GetListStableCoinRequest and validate', () => {
    const request: GetStableCoinDetailsRequest =
      new GetStableCoinDetailsRequest({
        id: '0.0.48826175',
      });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: GetStableCoinDetailsRequest =
      new GetStableCoinDetailsRequest({
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
