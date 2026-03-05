import { task, types } from 'hardhat/config'
import { Keccak256Query } from '@tasks'
import { keccak256 } from 'ethers'

task('keccak256', 'Prints the keccak256 hash of a string')
    .addPositionalParam('input', 'The string to be hashed', undefined, types.string)
    .setAction(async ({ input }: Keccak256Query) => {
        const hash = keccak256(Buffer.from(input, 'utf-8'))
        console.log(`The keccak256 hash of the input "${input}" is: ${hash}`)
    })
