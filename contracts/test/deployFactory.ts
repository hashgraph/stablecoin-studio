import '@hashgraph/hardhat-hethers'
import { expect } from 'chai'
import { deployFactory } from '../scripts/deployFactory'

export const deployAFactory = () => {
    describe('Deploy a Factory', function () {
        it('Deploys the factory', async function () {
            await deployFactory()
            expect(true).to.equals(true)
        })
    })
}
