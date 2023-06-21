/*
 *
 * Hedera Stable Coin SDK
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

export const COMMAND_METADATA = '__command__';
export const COMMAND_HANDLER_METADATA = '__commandHandler__';
export const QUERY_METADATA = '__query__';
export const QUERY_HANDLER_METADATA = '__queryHandler__';
export const TOKEN_CREATION_COST_HBAR = 60;
export const EVM_ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const HBAR_DECIMALS = 8;
export const CREATE_SC_GAS = 1900000;
export const CASHIN_GAS = 120000;
export const BURN_GAS = 70000;
export const WIPE_GAS = 70000;
export const RESCUE_GAS = 70000;
export const RESCUE_HBAR_GAS = 70000;
export const FREEZE_GAS = 65000;
export const UNFREEZE_GAS = 65000;
export const GRANT_KYC_GAS = 65000;
export const REVOKE_KYC_GAS = 65000;
export const PAUSE_GAS = 65000;
export const UNPAUSE_GAS = 65000;
export const DELETE_GAS = 65000;
export const GRANT_ROLES_GAS = 150000;
export const REVOKE_ROLES_GAS = 75000;
export const MAX_ROLES_GAS = 7000000;
export const INCREASE_SUPPLY_GAS = 50000;
export const DECREASE_SUPPLY_GAS = 50000;
export const RESET_SUPPLY_GAS = 45000;
export const UPDATE_RESERVE_ADDRESS_GAS = 45000;
export const UPDATE_TOKEN_GAS = 130000;
export const UPDATE_RESERVE_AMOUNT_GAS = 40000;
export const CHANGE_PROXY_OWNER = 40000;
export const UPDATE_PROXY_IMPLEMENTATION = 40000;

export const BALANCE_OF_GAS = 120000;
export const GET_RESERVE_ADDRESS_GAS = 120000;
export const GET_RESERVE_AMOUNT_GAS = 120000;
export const GET_ROLES_GAS = 120000;
export const HAS_ROLE_GAS = 120000;
export const GET_SUPPLY_ALLOWANCE_GAS = 120000;
export const IS_UNLIMITED_ALLOWANCE_GAS = 120000;
