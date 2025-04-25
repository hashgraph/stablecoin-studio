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
import { DeployContractWithFactoryResult } from '@scripts'

export interface DeployScsContractListResultParams {
    businessLogicResolver: DeployContractWithFactoryResult<BusinessLogicResolver>
    diamondFacet: DeployContractWithFactoryResult<DiamondFacet>
    stableCoinFactoryFacet: DeployContractWithFactoryResult<StableCoinFactoryFacet>
    hederaTokenManagerFacet: DeployContractWithFactoryResult<HederaTokenManagerFacet>
    hederaReserveFacet: DeployContractWithFactoryResult<HederaReserveFacet>
    burnableFacet: DeployContractWithFactoryResult<BurnableFacet>
    cashInFacet: DeployContractWithFactoryResult<CashInFacet>
    customFeesFacet: DeployContractWithFactoryResult<CustomFeesFacet>
    deletableFacet: DeployContractWithFactoryResult<DeletableFacet>
    freezableFacet: DeployContractWithFactoryResult<FreezableFacet>
    holdManagementFacet: DeployContractWithFactoryResult<HoldManagementFacet>
    kycFacet: DeployContractWithFactoryResult<KYCFacet>
    pausableFacet: DeployContractWithFactoryResult<PausableFacet>
    rescuableFacet: DeployContractWithFactoryResult<RescuableFacet>
    reserveFacet: DeployContractWithFactoryResult<ReserveFacet>
    roleManagementFacet: DeployContractWithFactoryResult<RoleManagementFacet>
    rolesFacet: DeployContractWithFactoryResult<RolesFacet>
    supplierAdminFacet: DeployContractWithFactoryResult<SupplierAdminFacet>
    tokenOwnerFacet: DeployContractWithFactoryResult<TokenOwnerFacet>
    wipeableFacet: DeployContractWithFactoryResult<WipeableFacet>
    deployer?: Signer
}

export default class DeployAtsContractsResult {
    public readonly businessLogicResolver: DeployContractWithFactoryResult<BusinessLogicResolver>
    public readonly diamondFacet: DeployContractWithFactoryResult<DiamondFacet>
    public readonly stableCoinFactoryFacet: DeployContractWithFactoryResult<StableCoinFactoryFacet>
    public readonly hederaTokenManagerFacet: DeployContractWithFactoryResult<HederaTokenManagerFacet>
    public readonly hederaReserveFacet: DeployContractWithFactoryResult<HederaReserveFacet>
    public readonly burnableFacet: DeployContractWithFactoryResult<BurnableFacet>
    public readonly cashInFacet: DeployContractWithFactoryResult<CashInFacet>
    public readonly customFeesFacet: DeployContractWithFactoryResult<CustomFeesFacet>
    public readonly deletableFacet: DeployContractWithFactoryResult<DeletableFacet>
    public readonly freezableFacet: DeployContractWithFactoryResult<FreezableFacet>
    public readonly holdManagementFacet: DeployContractWithFactoryResult<HoldManagementFacet>
    public readonly kycFacet: DeployContractWithFactoryResult<KYCFacet>
    public readonly pausableFacet: DeployContractWithFactoryResult<PausableFacet>
    public readonly rescuableFacet: DeployContractWithFactoryResult<RescuableFacet>
    public readonly reserveFacet: DeployContractWithFactoryResult<ReserveFacet>
    public readonly roleManagementFacet: DeployContractWithFactoryResult<RoleManagementFacet>
    public readonly rolesFacet: DeployContractWithFactoryResult<RolesFacet>
    public readonly supplierAdminFacet: DeployContractWithFactoryResult<SupplierAdminFacet>
    public readonly tokenOwnerFacet: DeployContractWithFactoryResult<TokenOwnerFacet>
    public readonly wipeableFacet: DeployContractWithFactoryResult<WipeableFacet>
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
