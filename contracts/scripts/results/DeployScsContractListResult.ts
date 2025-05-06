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
    public readonly businessLogicResolver: DeployContractResult<BusinessLogicResolver>
    public readonly diamondFacet: DeployContractResult<DiamondFacet>
    public readonly stableCoinFactoryFacet: DeployContractResult<StableCoinFactoryFacet>
    public readonly hederaTokenManagerFacet: DeployContractResult<HederaTokenManagerFacet>
    public readonly hederaReserveFacet: DeployContractResult<HederaReserveFacet>
    public readonly burnableFacet: DeployContractResult<BurnableFacet>
    public readonly cashInFacet: DeployContractResult<CashInFacet>
    public readonly customFeesFacet: DeployContractResult<CustomFeesFacet>
    public readonly deletableFacet: DeployContractResult<DeletableFacet>
    public readonly freezableFacet: DeployContractResult<FreezableFacet>
    public readonly holdManagementFacet: DeployContractResult<HoldManagementFacet>
    public readonly kycFacet: DeployContractResult<KYCFacet>
    public readonly pausableFacet: DeployContractResult<PausableFacet>
    public readonly rescuableFacet: DeployContractResult<RescuableFacet>
    public readonly reserveFacet: DeployContractResult<ReserveFacet>
    public readonly roleManagementFacet: DeployContractResult<RoleManagementFacet>
    public readonly rolesFacet: DeployContractResult<RolesFacet>
    public readonly supplierAdminFacet: DeployContractResult<SupplierAdminFacet>
    public readonly tokenOwnerFacet: DeployContractResult<TokenOwnerFacet>
    public readonly wipeableFacet: DeployContractResult<WipeableFacet>
    public readonly deployer?: Signer

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
