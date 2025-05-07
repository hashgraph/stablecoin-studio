import { Signer } from 'ethers'
import {
    BusinessLogicResolver,
    DiamondFacet,
    StableCoinFactoryFacet,
    HederaTokenManagerFacet,
    HederaReserveFacet,
    BurnableFacet,
    CashInFacet,
    CustomFeesFacet,
    DeletableFacet,
    FreezableFacet,
    HoldManagementFacet,
    KYCFacet,
    PausableFacet,
    RescuableFacet,
    ReserveFacet,
    RoleManagementFacet,
    RolesFacet,
    SupplierAdminFacet,
    TokenOwnerFacet,
    WipeableFacet,
} from '@typechain'
import { DeployContractResult } from '@scripts'

export interface DeployScsContractListResultParams {
    businessLogicResolver: DeployContractResult<BusinessLogicResolver>
    diamondFacet: DeployContractResult<DiamondFacet>
    stableCoinFactoryFacet: DeployContractResult<StableCoinFactoryFacet>
    hederaTokenManagerFacet: DeployContractResult<HederaTokenManagerFacet>
    hederaReserveFacet: DeployContractResult<HederaReserveFacet>
    burnableFacet: DeployContractResult<BurnableFacet>
    cashInFacet: DeployContractResult<CashInFacet>
    customFeesFacet: DeployContractResult<CustomFeesFacet>
    deletableFacet: DeployContractResult<DeletableFacet>
    freezableFacet: DeployContractResult<FreezableFacet>
    holdManagementFacet: DeployContractResult<HoldManagementFacet>
    kycFacet: DeployContractResult<KYCFacet>
    pausableFacet: DeployContractResult<PausableFacet>
    rescuableFacet: DeployContractResult<RescuableFacet>
    reserveFacet: DeployContractResult<ReserveFacet>
    roleManagementFacet: DeployContractResult<RoleManagementFacet>
    rolesFacet: DeployContractResult<RolesFacet>
    supplierAdminFacet: DeployContractResult<SupplierAdminFacet>
    tokenOwnerFacet: DeployContractResult<TokenOwnerFacet>
    wipeableFacet: DeployContractResult<WipeableFacet>
    deployer?: Signer
}

export default class DeployScsContractListResult {
    public businessLogicResolver: DeployContractResult<BusinessLogicResolver>
    public diamondFacet: DeployContractResult<DiamondFacet>
    public stableCoinFactoryFacet: DeployContractResult<StableCoinFactoryFacet>
    public hederaTokenManagerFacet: DeployContractResult<HederaTokenManagerFacet>
    public hederaReserveFacet: DeployContractResult<HederaReserveFacet>
    public burnableFacet: DeployContractResult<BurnableFacet>
    public cashInFacet: DeployContractResult<CashInFacet>
    public customFeesFacet: DeployContractResult<CustomFeesFacet>
    public deletableFacet: DeployContractResult<DeletableFacet>
    public freezableFacet: DeployContractResult<FreezableFacet>
    public holdManagementFacet: DeployContractResult<HoldManagementFacet>
    public kycFacet: DeployContractResult<KYCFacet>
    public pausableFacet: DeployContractResult<PausableFacet>
    public rescuableFacet: DeployContractResult<RescuableFacet>
    public reserveFacet: DeployContractResult<ReserveFacet>
    public roleManagementFacet: DeployContractResult<RoleManagementFacet>
    public rolesFacet: DeployContractResult<RolesFacet>
    public supplierAdminFacet: DeployContractResult<SupplierAdminFacet>
    public tokenOwnerFacet: DeployContractResult<TokenOwnerFacet>
    public wipeableFacet: DeployContractResult<WipeableFacet>
    public deployer?: Signer

    constructor({
        businessLogicResolver,
        diamondFacet,
        hederaTokenManagerFacet,
        stableCoinFactoryFacet,
        hederaReserveFacet,
        burnableFacet,
        cashInFacet,
        customFeesFacet,
        deletableFacet,
        freezableFacet,
        holdManagementFacet,
        kycFacet,
        pausableFacet,
        rescuableFacet,
        reserveFacet,
        roleManagementFacet,
        rolesFacet,
        supplierAdminFacet,
        tokenOwnerFacet,
        wipeableFacet,
        deployer,
    }: DeployScsContractListResultParams) {
        this.businessLogicResolver = businessLogicResolver
        this.diamondFacet = diamondFacet
        this.hederaTokenManagerFacet = hederaTokenManagerFacet
        this.stableCoinFactoryFacet = stableCoinFactoryFacet
        this.hederaReserveFacet = hederaReserveFacet
        this.burnableFacet = burnableFacet
        this.cashInFacet = cashInFacet
        this.customFeesFacet = customFeesFacet
        this.deletableFacet = deletableFacet
        this.freezableFacet = freezableFacet
        this.holdManagementFacet = holdManagementFacet
        this.kycFacet = kycFacet
        this.pausableFacet = pausableFacet
        this.rescuableFacet = rescuableFacet
        this.reserveFacet = reserveFacet
        this.roleManagementFacet = roleManagementFacet
        this.rolesFacet = rolesFacet
        this.supplierAdminFacet = supplierAdminFacet
        this.tokenOwnerFacet = tokenOwnerFacet
        this.wipeableFacet = wipeableFacet
        this.deployer = deployer
    }
}
