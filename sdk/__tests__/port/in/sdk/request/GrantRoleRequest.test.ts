import BaseError, {
  ErrorCode,
} from '../../../../../src/core/error/BaseError.js';
import { GrantRoleRequest, StableCoinRole } from '../../../../../src/index.js';
import { EXAMPLE_TOKEN, REQUEST_ACCOUNTS } from '../../../../core/core.js';

describe('🧪 SDK Grant Role Request', () => {
  it('Create simple request', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: '',
      proxyContractId: '',
      tokenId: '',
      role: undefined      
    });
    expect(request).not.toBeNull();
  });

  it('Grant cash in unlimited role and validate', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'unlimited'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Grant cash in limited role and validate', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'limited',
      amount: '100'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Grant burn role and validate', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.BURN_ROLE
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Grant wipe role and validate', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.WIPE_ROLE
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Grant pause role and validate', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.PAUSER_ROLE
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Grant rescue role and validate', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.RESCUE_ROLE
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });


  it('Grant cash in limited role and validate simple request with decimals', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'limited',
      amount: '1.456'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(0);
  });

  it('Create and validate simple invalid request', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'limited',
      amount: 'amount'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    expect(validations.length).toBeDefined();
    expect(validations.length).toBe(1);
    expect(validations[0].errors[0]).toBeInstanceOf(BaseError);
    expect(validations[0].errors[0].errorCode).toBe(ErrorCode.InvalidType);
  });

  it('Create and validate request [amount]', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: REQUEST_ACCOUNTS.testnet.accountId,
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'limited',
      amount: 'amount'
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toBe(1);
    request.amount = '1000';
    const validationsOk = request.validate();
    expect(validationsOk.length).toBe(0);
  });

  it('Create and validate request, fail with [amount, target]', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: EXAMPLE_TOKEN.tokenId,
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'limited',
      amount: 'amount',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(2);
  });
  it('Create and validate request, fail with [amount, target, tokenId]', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId',
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'limited',
      amount: 'amount',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(3);
  });

  it('Create and validate request, fail with [amount, target, tokenId, supplierType]', () => {
    const request: GrantRoleRequest = new GrantRoleRequest({
      account: {
        accountId: REQUEST_ACCOUNTS.testnet.accountId,
        privateKey: REQUEST_ACCOUNTS.testnet.privateKey,
      },
      targetId: 'targetId',
      proxyContractId: EXAMPLE_TOKEN.proxyContractId,
      tokenId: 'tokenId',
      role: StableCoinRole.CASHIN_ROLE,
      supplierType: 'supplierType',
      amount: 'amount',
    });
    expect(request).not.toBeNull();
    const validations = request.validate();
    // 
    expect(validations).not.toBeNull();
    expect(validations.length).toEqual(4);
  });  
});
