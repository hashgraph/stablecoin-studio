/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


import 'reflect-metadata';

// Mock tsyringe and Injectable before any other imports to prevent DI
// circular dependency issues when loading TransactionService.
jest.mock('tsyringe', () => ({
    singleton: () => (cls: unknown) => cls,
    registry: () => (cls: unknown) => cls,
    injectable: () => (cls: unknown) => cls,
    inject: () => () => undefined,
    delay: (fn: () => unknown) => fn(),
    container: {
        register: jest.fn(),
        resolve: jest.fn(),
        resolveAll: jest.fn(),
    },
}));

jest.mock('../../../src/core/Injectable', () => ({
    __esModule: true,
    default: {
        resolve: () => ({}),
        lazyResolve: () => ({}),
        TOKENS: { COMMAND_HANDLER: Symbol(), QUERY_HANDLER: Symbol(), TRANSACTION_HANDLER: 'TransactionHandler' },
        register: () => {},
        registerCommandHandler: () => {},
        registerTransactionHandler: () => {},
        resolveTransactionHandler: () => {},
        registerTransactionAdapterInstances: () => [],
        getQueryHandlers: () => [],
        getCommandHandlers: () => [],
        isWeb: () => false,
    },
}));

import { ethers } from 'ethers';
import {
    CashInFacet__factory,
    BurnableFacet__factory,
    WipeableFacet__factory,
    FreezableFacet__factory,
    KYCFacet__factory,
    PausableFacet__factory,
    RescuableFacet__factory,
    HoldManagementFacet__factory,
    SupplierAdminFacet__factory,
    RoleManagementFacet__factory,
    CustomFeesFacet__factory,
    HederaTokenManagerFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import TransactionService from '../../../src/app/service/TransactionService';
import Hex from '../../../src/core/Hex';

// Helper: encodes a function call and returns it as a Uint8Array
function encode(
    iface: ethers.Interface,
    fn: string,
    params: unknown[],
): Uint8Array {
    const hex = iface.encodeFunctionData(fn, params);
    return Hex.toUint8Array(hex.slice(2)); // strip '0x' prefix
}

const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001';

describe('TransactionService.decodeFunctionCall', () => {
    describe('HederaTokenManagerFacet — regression', () => {
        it('decodes an existing function from HederaTokenManagerFacet', () => {
            const iface = new ethers.Interface(
                HederaTokenManagerFacet__factory.abi,
            );
            const fragment = iface.fragments.find(
                (f) => f.type === 'function',
            );
            if (!fragment || fragment.type !== 'function') return;
            const fn = fragment as ethers.FunctionFragment;
            const params = fn.inputs.map((input) =>
                input.type === 'bytes32'
                    ? ethers.ZeroHash
                    : input.type === 'uint256'
                      ? BigInt(0)
                      : DUMMY_ADDRESS,
            );
            const bytes = encode(iface, fn.name, params);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe(fn.name);
        });
    });

    describe('CashInFacet', () => {
        it('decodes mint(address, uint256)', () => {
            const iface = new ethers.Interface(CashInFacet__factory.abi);
            const bytes = encode(iface, 'mint', [DUMMY_ADDRESS, BigInt(1000)]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('mint');
        });
    });

    describe('BurnableFacet', () => {
        it('decodes burn(uint256)', () => {
            const iface = new ethers.Interface(BurnableFacet__factory.abi);
            const bytes = encode(iface, 'burn', [BigInt(500)]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('burn');
        });
    });

    describe('WipeableFacet', () => {
        it('decodes wipe(address, uint256)', () => {
            const iface = new ethers.Interface(WipeableFacet__factory.abi);
            const bytes = encode(iface, 'wipe', [DUMMY_ADDRESS, BigInt(200)]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('wipe');
        });
    });

    describe('FreezableFacet', () => {
        it('decodes freeze(address)', () => {
            const iface = new ethers.Interface(FreezableFacet__factory.abi);
            const bytes = encode(iface, 'freeze', [DUMMY_ADDRESS]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('freeze');
        });

        it('decodes unfreeze(address)', () => {
            const iface = new ethers.Interface(FreezableFacet__factory.abi);
            const bytes = encode(iface, 'unfreeze', [DUMMY_ADDRESS]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('unfreeze');
        });
    });

    describe('KYCFacet', () => {
        it('decodes grantKyc(address)', () => {
            const iface = new ethers.Interface(KYCFacet__factory.abi);
            const bytes = encode(iface, 'grantKyc', [DUMMY_ADDRESS]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('grantKyc');
        });

        it('decodes revokeKyc(address)', () => {
            const iface = new ethers.Interface(KYCFacet__factory.abi);
            const bytes = encode(iface, 'revokeKyc', [DUMMY_ADDRESS]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('revokeKyc');
        });
    });

    describe('PausableFacet', () => {
        it('decodes pause()', () => {
            const iface = new ethers.Interface(PausableFacet__factory.abi);
            const bytes = encode(iface, 'pause', []);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('pause');
        });

        it('decodes unpause()', () => {
            const iface = new ethers.Interface(PausableFacet__factory.abi);
            const bytes = encode(iface, 'unpause', []);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('unpause');
        });
    });

    describe('RescuableFacet', () => {
        it('decodes rescue(int64)', () => {
            const iface = new ethers.Interface(RescuableFacet__factory.abi);
            const bytes = encode(iface, 'rescue', [BigInt(100)]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('rescue');
        });
    });

    describe('HoldManagementFacet', () => {
        it('decodes createHold(tuple)', () => {
            const iface = new ethers.Interface(HoldManagementFacet__factory.abi);
            const hold = {
                amount: BigInt(100),
                expirationTimestamp: BigInt(9999999999),
                escrow: DUMMY_ADDRESS,
                to: DUMMY_ADDRESS,
                data: '0x',
            };
            const bytes = encode(iface, 'createHold', [hold]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('createHold');
        });

        it('decodes executeHold(_holdIdentifier, _to, _amount)', () => {
            const iface = new ethers.Interface(HoldManagementFacet__factory.abi);
            const bytes = encode(iface, 'executeHold', [
                { tokenHolder: DUMMY_ADDRESS, holdId: BigInt(1) },
                DUMMY_ADDRESS,
                BigInt(100),
            ]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('executeHold');
        });
    });

    describe('SupplierAdminFacet', () => {
        it('decodes the first public function in the ABI', () => {
            const iface = new ethers.Interface(SupplierAdminFacet__factory.abi);
            const fn = iface.fragments.find(
                (f) => f.type === 'function',
            ) as ethers.FunctionFragment;
            const params = fn.inputs.map((input) =>
                input.type === 'uint256' ? BigInt(100) : DUMMY_ADDRESS,
            );
            const bytes = encode(iface, fn.name, params);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe(fn.name);
        });
    });

    describe('RoleManagementFacet', () => {
        it('decodes grantRoles(bytes32[], address[], uint256[])', () => {
            const iface = new ethers.Interface(RoleManagementFacet__factory.abi);
            const bytes = encode(iface, 'grantRoles', [
                [ethers.ZeroHash],
                [DUMMY_ADDRESS],
                [BigInt(0)],
            ]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('grantRoles');
        });
    });

    describe('CustomFeesFacet', () => {
        it('decodes updateTokenCustomFees(tuple[], tuple[])', () => {
            const iface = new ethers.Interface(CustomFeesFacet__factory.abi);
            const bytes = encode(iface, 'updateTokenCustomFees', [[], []]);
            const result = TransactionService.decodeFunctionCall(bytes);
            expect(result).not.toBeNull();
            expect(result?.name).toBe('updateTokenCustomFees');
        });
    });

    describe('Edge cases', () => {
        it('returns null when the selector does not exist in any ABI', () => {
            const unknown = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0, 0, 0, 0]);
            const result = TransactionService.decodeFunctionCall(unknown);
            expect(result).toBeNull();
        });

        it('returns null for an empty Uint8Array', () => {
            const result = TransactionService.decodeFunctionCall(new Uint8Array(0));
            expect(result).toBeNull();
        });
    });
});
