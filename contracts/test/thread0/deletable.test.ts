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
    StableCoinTokenMock,
    StableCoinTokenMock__factory,
} from '@contracts'
import {
    DeployFullInfrastructureCommand,
    MESSAGES,
    ONE_TOKEN,
    ROLES,
    validateTxResponse,
    ValidateTxResponseCommand,
} from '@scripts'
import {
  deployStableCoinInTests,
  deployFullInfrastructureInTests,
  GAS_LIMIT
} from '@test/shared'

describe('➡️ Delete Tests', function () {
    const TOKEN_WAS_DELETED = 179;

    // Contracts
    let stableCoinProxyAddress: string
    let deletableFacet: DeletableFacet
    let rolesFacet: RolesFacet
    let cashInFacet: CashInFacet
    let tokenAddress: string
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

        const { ...deployedContracts } = await deployFullInfrastructureInTests(
            await DeployFullInfrastructureCommand.newInstance({
                signer: operator,
                useDeployed: false,
                useEnvironment: true,
            })
        )
        ;({ stableCoinProxyAddress, tokenAddress } = await deployStableCoinInTests({
            signer: operator,
            businessLogicResolverProxyAddress: deployedContracts.businessLogicResolver.proxyAddress!,
            stableCoinFactoryProxyAddress: deployedContracts.stableCoinFactoryFacet.proxyAddress!,
        }))

        await StableCoinTokenMock__factory.connect(tokenAddress, operator)
          .setStableCoinAddress(stableCoinProxyAddress);

        await setFacets(stableCoinProxyAddress)
    })

    it("Account without DELETE role can't delete a token", async function () {
        deletableFacet = deletableFacet.connect(nonOperator)

        await expect(deletableFacet.deleteToken({
          gasLimit: GAS_LIMIT.hederaTokenManager.deleteToken,
        })).to.be.revertedWithCustomError(deletableFacet, "AccountHasNoRole")
          .withArgs(nonOperator, ROLES.delete.hash)
    })

    it('Account with DELETE role can delete a token', async function () {
        // We first grant delete role to account
        deletableFacet = deletableFacet.connect(operator)

        await expect (rolesFacet.grantRole(ROLES.delete.hash, nonOperator.address, {
            gasLimit: GAS_LIMIT.hederaTokenManager.grantRole,
        })).to.emit(rolesFacet, "RoleGranted")
            .withArgs(ROLES.delete.hash, nonOperator.address, operator.address)

        // We check that the token exists by minting 1
        await expect(cashInFacet.mint(operator.address, ONE_TOKEN, {
          gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.emit(cashInFacet, "TokensMinted")
          .withArgs(operator.address, tokenAddress, ONE_TOKEN, operator.address)


        // Delete the token
        deletableFacet = deletableFacet.connect(nonOperator)
        await expect(deletableFacet.deleteToken({
          gasLimit: GAS_LIMIT.hederaTokenManager.deleteToken,
        })).to.emit(deletableFacet, "TokenDeleted")
          .withArgs(tokenAddress)

        // We check that the token does not exist by unsucessfully trying to mint 1
        await expect(cashInFacet.mint(nonOperator.address, ONE_TOKEN, {
          gasLimit: GAS_LIMIT.hederaTokenManager.mint,
        })).to.be.revertedWithCustomError(cashInFacet, "ResponseCodeInvalid")
          .withArgs(TOKEN_WAS_DELETED)


        //! The status CANNOT BE reverted since we deleted the token
    })
})
