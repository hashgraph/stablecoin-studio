import { expect } from 'chai'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import {
    CashInFacet,
    CashInFacet__factory,
    DeletableFacet,
    DeletableFacet__factory,
    RolesFacet,
    RolesFacet__factory,
} from '@contracts'
import {
    deployFullInfrastructure,
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    ROLES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import { deployStableCoinInTests, GAS_LIMIT } from '@test/shared'

describe('➡️ Delete Tests', function () {
    // Contracts
    let stableCoinProxyAddress: string
    let deletableFacet: DeletableFacet
    let rolesFacet: RolesFacet
    let cashInFacet: CashInFacet
    // Accounts
    let operator: SignerWithAddress
    let nonOperator: SignerWithAddress

    async function setFacets(address: string) {
        deletableFacet = DeletableFacet__factory.connect(address, operator)
        rolesFacet = RolesFacet__factory.connect(address, operator)
        cashInFacet = CashInFacet__factory.connect(address, operator)
    }

    before(async () => {
        // mute | mock console.log
        console.log = () => {} // eslint-disable-line
        console.info(MESSAGES.deploy.info.deployFullInfrastructureInTests)
        ;[operator, nonOperator] = await ethers.getSigners()

        const { ...deployedContracts } = await deployFullInfrastructure(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        ;({ stableCoinProxyAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: deployedContracts.businessLogicResolver.proxyAddress!,
            stableCoinFactoryProxyAddress: deployedContracts.stableCoinFactoryFacet.proxyAddress!,
        }))

        await setFacets(stableCoinProxyAddress)
    })

    it("Account without DELETE role can't delete a token", async function () {
        const response = await deletableFacet.connect(nonOperator).deleteToken({
            gasLimit: GAS_LIMIT.hederaTokenManager.deleteToken,
        })
        await expect(validateTxResponse(new ValidateTxResponseCommand({ txResponse: response }))).to.be.rejectedWith(
            Error
        )
    })

    it('Account with DELETE role can delete a token', async function () {
        // We first grant delete role to account
        const grantRoleResponse = await rolesFacet.grantRole(ROLES.delete, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: grantRoleResponse }))
        // We check that the token exists by minting 1
        const mintResponse = await cashInFacet.mint(operator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse }))
        // Delete the token
        const deleteResponse = await deletableFacet.connect(nonOperator).deleteToken({
            gasLimit: GAS_LIMIT.hederaTokenManager.deleteToken,
        })
        await validateTxResponse(new ValidateTxResponseCommand({ txResponse: deleteResponse }))
        // We check that the token does not exist by unsucessfully trying to mint 1
        const mintResponse2 = await cashInFacet.mint(nonOperator.address, ONE_TOKEN, {
            gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })
        await expect(
            validateTxResponse(new ValidateTxResponseCommand({ txResponse: mintResponse2 }))
        ).to.be.rejectedWith(Error)

        //! The status CANNOT BE reverted since we deleted the token
    })
})
