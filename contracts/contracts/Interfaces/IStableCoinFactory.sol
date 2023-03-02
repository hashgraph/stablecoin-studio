// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './IHederaERC20.sol';

interface IStableCoinFactory {
    event Deployed(DeployedStableCoin);

    struct KeysStruct {
        // Key id as defined for the Hedera Tokens
        uint256 keyType;
        // Public Key bytes of the EOA that will be assigned to the key Role
        // If "0x" (empty bytes) the stable coin proxy will be selected
        bytes publicKey;
        // If the PublicKey is an EOA (not empty) indicates whether it is an ED25519 or ECDSA key
        bool isED25519;
    }

    struct TokenStruct {
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        int64 tokenMaxSupply;
        int64 tokenInitialSupply;
        int32 tokenDecimals;
        address autoRenewAccountAddress;
        address treasuryAddress;
        address reserveAddress;
        int256 reserveInitialAmount;
        bool createReserve;
        bool grantKYCToOriginalSender;
        KeysStruct[] keys;
        IHederaERC20.RolesStruct[] roles;
        IHederaERC20.CashinRoleStruct cashinRole;
    }

    struct DeployedStableCoin {
        address stableCoinProxy;
        address stableCoinProxyAdmin;
        address stableCoinContractAddress;
        address tokenAddress;
        address reserveProxy;
        address reserveProxyAdmin;
    }

    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    ) external payable returns (DeployedStableCoin memory);

    function getHederaERC20Address() external view returns (address[] memory);

    function addHederaERC20Version(address newAddress) external returns (bool);

    function editHederaERC20Address(
        uint256 index,
        address newAddress
    ) external returns (bool);

    function changeAdmin(address newAddress) external returns (bool);

    function removeHederaERC20Address(uint256 index) external returns (bool);
}
