import { Signer } from 'ethers'
import {
    BusinessLogicResolver,
    HederaReserveFacet,
    BurnableFacet,
    CashInFacet,
    CustomFeesFacet,
    DeletableFacet,
    FreezableFacet,
    HoldManagementFacet,
    KYCFacet,
    PausableFacet,
    ReserveFacet,
    RoleManagementFacet,
    RolesFacet,
    SupplierAdminFacet,
    TokenOwnerFacet,
    WipeableFacet,
    DiamondFacet,
} from '@typechain'
import { DeployContractWithFactoryResult } from '../index'

export interface DeployScsContractsResultParams {
    businessLogicResolver: DeployContractWithFactoryResult<BusinessLogicResolver>
    hederaReserveFacet: DeployContractWithFactoryResult<HederaReserveFacet>
    burnableFacet: DeployContractWithFactoryResult<BurnableFacet>
    cashInFacet: DeployContractWithFactoryResult<CashInFacet>
    customFeesFacet: DeployContractWithFactoryResult<CustomFeesFacet>
    deletableFacet: DeployContractWithFactoryResult<DeletableFacet>
    freezableFacet: DeployContractWithFactoryResult<FreezableFacet>
    holdManagementFacet: DeployContractWithFactoryResult<HoldManagementFacet>
    kycFacet: DeployContractWithFactoryResult<KYCFacet>
    pausableFacet: DeployContractWithFactoryResult<PausableFacet>
    reserveFacet: DeployContractWithFactoryResult<ReserveFacet>
    roleManagementFacet: DeployContractWithFactoryResult<RoleManagementFacet>
    rolesFacet: DeployContractWithFactoryResult<RolesFacet>
    supplierAdminFacet: DeployContractWithFactoryResult<SupplierAdminFacet>
    tokenOwnerFacet: DeployContractWithFactoryResult<TokenOwnerFacet>
    wipeableFacet: DeployContractWithFactoryResult<WipeableFacet>
    diamondFacet: DeployContractWithFactoryResult<DiamondFacet>
    deployer?: Signer
}

export default class DeployScsContractsResult {
    public readonly businessLogicResolver: DeployContractWithFactoryResult<BusinessLogicResolver>
    public readonly hederaReserveFacet: DeployContractWithFactoryResult<HederaReserveFacet>
    public readonly burnableFacet: DeployContractWithFactoryResult<BurnableFacet>
    public readonly cashInFacet: DeployContractWithFactoryResult<CashInFacet>
    public readonly customFeesFacet: DeployContractWithFactoryResult<CustomFeesFacet>
    public readonly deletableFacet: DeployContractWithFactoryResult<DeletableFacet>
    public readonly freezableFacet: DeployContractWithFactoryResult<FreezableFacet>
    public readonly holdManagementFacet: DeployContractWithFactoryResult<HoldManagementFacet>
    public readonly kycFacet: DeployContractWithFactoryResult<KYCFacet>
    public readonly pausableFacet: DeployContractWithFactoryResult<PausableFacet>
    public readonly reserveFacet: DeployContractWithFactoryResult<ReserveFacet>
    public readonly roleManagementFacet: DeployContractWithFactoryResult<RoleManagementFacet>
    public readonly rolesFacet: DeployContractWithFactoryResult<RolesFacet>
    public readonly supplierAdminFacet: DeployContractWithFactoryResult<SupplierAdminFacet>
    public readonly tokenOwnerFacet: DeployContractWithFactoryResult<TokenOwnerFacet>
    public readonly wipeableFacet: DeployContractWithFactoryResult<WipeableFacet>
    public readonly diamondFacet: DeployContractWithFactoryResult<DiamondFacet>
    public readonly deployer?: Signer

    constructor({
        businessLogicResolver,
        hederaReserveFacet,
        burnableFacet,
        cashInFacet,
        customFeesFacet,
        deletableFacet,
        freezableFacet,
        holdManagementFacet,
        kycFacet,
        pausableFacet,
        reserveFacet,
        roleManagementFacet,
        rolesFacet,
        supplierAdminFacet,
        tokenOwnerFacet,
        wipeableFacet,
        diamondFacet,
        deployer,
    }: DeployScsContractsResultParams) {
        this.businessLogicResolver = businessLogicResolver
        this.hederaReserveFacet = hederaReserveFacet
        this.burnableFacet = burnableFacet
        this.cashInFacet = cashInFacet
        this.customFeesFacet = customFeesFacet
        this.deletableFacet = deletableFacet
        this.freezableFacet = freezableFacet
        this.holdManagementFacet = holdManagementFacet
        this.kycFacet = kycFacet
        this.pausableFacet = pausableFacet
        this.reserveFacet = reserveFacet
        this.roleManagementFacet = roleManagementFacet
        this.rolesFacet = rolesFacet
        this.supplierAdminFacet = supplierAdminFacet
        this.tokenOwnerFacet = tokenOwnerFacet
        this.wipeableFacet = wipeableFacet
        this.diamondFacet = diamondFacet
        // Deployer
        this.deployer = deployer
    }
}
