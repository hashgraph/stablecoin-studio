import {
  Balance,
  BigDecimal,
  CheckSupplierLimitRequest,
  DecreaseSupplierAllowanceRequest,
  GetAccountsWithRolesRequest,
  GetRolesRequest,
  GetSupplierAllowanceRequest,
  GrantMultiRolesRequest,
  GrantRoleRequest,
  HasRoleRequest,
  IncreaseSupplierAllowanceRequest,
  ResetSupplierAllowanceRequest,
  RevokeMultiRolesRequest,
  RevokeRoleRequest,
  Role,
  StableCoinRole,
  StableCoinRoleLabel,
} from '@hashgraph-dev/stablecoin-npm-sdk';
import RoleStableCoinService from '../../../../src/app/service/stablecoin/RoleStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import colors from 'colors';

const service = new RoleStableCoinService();
const language: Language = new Language();

describe(`Testing RoleStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance giveSupplierRoleStableCoin', async () => {
    jest.spyOn(Role, 'grantRole').mockImplementation();
    const grantRoleRequest = new GrantRoleRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      role: StableCoinRole.KYC_ROLE,
    });

    await service.giveSupplierRoleStableCoin(grantRoleRequest);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.grantRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance checkCashInRoleStableCoin as unlimited', async () => {
    jest.spyOn(Role, 'isUnlimited').mockResolvedValue(true);
    jest.spyOn(Role, 'isLimited').mockImplementation();
    const request = new CheckSupplierLimitRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      supplierType: 'unlimited',
    });
    await service.checkCashInRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.isUnlimited).toHaveBeenCalledTimes(1);
    expect(Role.isLimited).not.toHaveBeenCalled();
  });

  it('Should instance checkCashInRoleStableCoin as limited', async () => {
    jest.spyOn(Role, 'isLimited').mockResolvedValue(true);
    jest.spyOn(Role, 'isUnlimited').mockImplementation();
    const request = new CheckSupplierLimitRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      supplierType: 'limited',
    });
    await service.checkCashInRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.isLimited).toHaveBeenCalledTimes(1);
    expect(Role.isUnlimited).not.toHaveBeenCalled();
  });

  it('Should instance increaseLimitSupplierRoleStableCoin', async () => {
    jest.spyOn(Role, 'increaseAllowance').mockImplementation();
    const request = new IncreaseSupplierAllowanceRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      amount: 'amount',
    });
    await service.increaseLimitSupplierRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.increaseAllowance).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance decreaseLimitSupplierRoleStableCoin', async () => {
    jest.spyOn(Role, 'decreaseAllowance').mockImplementation();
    const request = new DecreaseSupplierAllowanceRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      amount: 'amount',
    });
    await service.decreaseLimitSupplierRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.decreaseAllowance).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance resetLimitSupplierRoleStableCoin', async () => {
    jest.spyOn(Role, 'resetAllowance').mockImplementation();
    const request = new ResetSupplierAllowanceRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
    });
    await service.resetLimitSupplierRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.resetAllowance).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance grantRoleStableCoin', async () => {
    jest.spyOn(Role, 'grantRole').mockImplementation();
    const request = new GrantRoleRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      role: StableCoinRole.KYC_ROLE,
    });
    await service.grantRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.grantRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance revokeRoleStableCoin', async () => {
    jest.spyOn(Role, 'revokeRole').mockImplementation();
    const request = new RevokeRoleRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      role: StableCoinRole.KYC_ROLE,
    });
    await service.revokeRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.revokeRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance grantMultiRolesStableCoin', async () => {
    jest.spyOn(Role, 'grantMultiRoles').mockImplementation();
    const request = new GrantMultiRolesRequest({
      tokenId: 'tokenId',
      targetsId: ['targetId'],
      roles: [StableCoinRole.KYC_ROLE],
    });
    await service.grantMultiRolesStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.grantMultiRoles).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance revokeMultiRolesStableCoin', async () => {
    jest.spyOn(Role, 'revokeMultiRoles').mockImplementation();
    const request = new RevokeMultiRolesRequest({
      tokenId: 'tokenId',
      targetsId: ['targetId'],
      roles: [StableCoinRole.KYC_ROLE],
    });
    await service.revokeMultiRolesStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.revokeMultiRoles).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });

  it('Should instance hasRole', async () => {
    jest.spyOn(Role, 'hasRole').mockResolvedValue(true);
    const request = new HasRoleRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      role: StableCoinRole.KYC_ROLE,
    });
    const hasRole = await service.hasRole(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.hasRole).toHaveBeenCalledTimes(1);
    expect(hasRole).toEqual(true);
  });

  it('Should instance hasRoleStableCoin as true', async () => {
    jest.spyOn(Role, 'hasRole').mockResolvedValue(true);
    const request = new HasRoleRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      role: StableCoinRole.KYC_ROLE,
    });
    await service.hasRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.hasRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('roleManagement.accountHasRole')
        .replace('${address}', request.targetId)
        .replace(
          '${role}',
          colors.yellow(StableCoinRoleLabel.get(request.role)),
        ) + '\n',
    );
  });

  it('Should instance hasRoleStableCoin as false', async () => {
    jest.spyOn(Role, 'hasRole').mockResolvedValue(false);
    const request = new HasRoleRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
      role: StableCoinRole.KYC_ROLE,
    });
    await service.hasRoleStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.hasRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('roleManagement.accountNotHasRole')
        .replace('${address}', request.targetId)
        .replace(
          '${role}',
          colors.yellow(StableCoinRoleLabel.get(request.role)),
        ) + '\n',
    );
  });

  it('Should instance getSupplierAllowance', async () => {
    jest
      .spyOn(Role, 'getAllowance')
      .mockResolvedValue(new Balance(new BigDecimal('10')));
    const request = new GetSupplierAllowanceRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
    });
    await service.getSupplierAllowance(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.getAllowance).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language
        .getText('roleManagement.getAmountAllowance')
        .replace('${address}', request.targetId)
        .replace('${amount}', colors.yellow('10')) + '\n',
    );
  });

  it('Should instance getRolesWithoutPrinting', async () => {
    jest
      .spyOn(Role, 'getRoles')
      .mockResolvedValue([
        StableCoinRole.DEFAULT_ADMIN_ROLE,
        StableCoinRole.WITHOUT_ROLE,
      ]);
    const request = new GetRolesRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
    });
    const roles = await service.getRolesWithoutPrinting(request);

    expect(service).not.toBeNull();
    expect(Role.getRoles).toHaveBeenCalledTimes(1);
    expect(roles).toEqual([StableCoinRole.DEFAULT_ADMIN_ROLE]);
  });

  it('Should instance getRoles with roles', async () => {
    jest
      .spyOn(Role, 'getRoles')
      .mockResolvedValue([
        StableCoinRole.DEFAULT_ADMIN_ROLE,
        StableCoinRole.WITHOUT_ROLE,
      ]);
    const request = new GetSupplierAllowanceRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
    });
    const roles = await service.getRoles(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.getRoles).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
    expect(console.log).toHaveBeenCalledWith(
      colors.yellow(StableCoinRoleLabel.get(StableCoinRole.DEFAULT_ADMIN_ROLE)),
    );
    expect(roles).toEqual([
      StableCoinRole.DEFAULT_ADMIN_ROLE,
      StableCoinRole.WITHOUT_ROLE,
    ]);
  });

  it('Should instance getRoles without roles', async () => {
    jest
      .spyOn(Role, 'getRoles')
      .mockResolvedValue([StableCoinRole.WITHOUT_ROLE]);
    const request = new GetSupplierAllowanceRequest({
      tokenId: 'tokenId',
      targetId: 'targetId',
    });
    const roles = await service.getRoles(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.getRoles).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
    expect(console.log).toHaveBeenCalledWith(
      colors.red(language.getText('roleManagement.noRoles')),
    );
    expect(roles).toEqual([StableCoinRole.WITHOUT_ROLE]);
  });

  it('Should instance getAccountsWithRole with roles', async () => {
    jest
      .spyOn(Role, 'getAccountsWithRole')
      .mockResolvedValue(['account_1', 'account_2']);
    const request = new GetAccountsWithRolesRequest({
      tokenId: 'tokenId',
      roleId: 'roleId',
    });
    const accounts = await service.getAccountsWithRole(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.getAccountsWithRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
    expect(console.log).toHaveBeenCalledWith(colors.yellow('account_1'));
    expect(accounts).toEqual(['account_1', 'account_2']);
  });

  it('Should instance getAccountsWithRole without roles', async () => {
    jest.spyOn(Role, 'getAccountsWithRole').mockResolvedValue([]);
    const request = new GetAccountsWithRolesRequest({
      tokenId: 'tokenId',
      roleId: 'roleId',
    });
    const accounts = await service.getAccountsWithRole(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(Role.getAccountsWithRole).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
    expect(console.log).toHaveBeenCalledWith(
      colors.red(language.getText('roleManagement.noRoles')),
    );
    expect(accounts).toEqual([]);
  });
});
