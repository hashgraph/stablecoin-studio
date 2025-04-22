// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IHederaReserve} from './Interfaces/IHederaReserve.sol';
import {Common} from './core/Common.sol';
import {_HEDERA_RESERVE_RESOLVER_KEY} from './constants/resolverKeys.sol';
import {HederaReserveStorageWrapper} from './HederaReserveStorageWrapper.sol';
import {IStaticFunctionSelectors} from './resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract HederaReserveFacet is IStaticFunctionSelectors, IHederaReserve, HederaReserveStorageWrapper, Common {
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;
    uint256 private constant _VERSION_ID = 1;

    /**
     * @dev Checks if the calling account is the HederaReserve contract admin
     *
     */
    modifier isAdmin() {
        if (_hederaReserveDataStorage().admin != msg.sender) revert OnlyAdmin(msg.sender);
        _;
    }

    /**
     * @dev Constructor required to avoid Initializer attack on logic contract
     *
     */
    constructor() {
        _disableInitializers(_HEDERA_RESERVE_RESOLVER_KEY);
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer(_HEDERA_RESERVE_RESOLVER_KEY) addressIsNotZero(admin) {
        HederaReserveDataStorage storage hederaReserveDataStorage = _hederaReserveDataStorage();
        hederaReserveDataStorage.reserveAmount = initialReserve;
        hederaReserveDataStorage.admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount(int256 newValue) external isAdmin {
        HederaReserveDataStorage storage hederaReserveDataStorage = _hederaReserveDataStorage();
        emit AmountChanged(hederaReserveDataStorage.reserveAmount, newValue);
        hederaReserveDataStorage.reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(address admin) external isAdmin addressIsNotZero(admin) {
        HederaReserveDataStorage storage hederaReserveDataStorage = _hederaReserveDataStorage();
        emit AdminChanged(hederaReserveDataStorage.admin, admin);
        hederaReserveDataStorage.admin = admin;
    }

    /**
     *  @dev Decimals of the reserve
     *
     *  @return The decimals
     */
    function decimals() external pure returns (uint8) {
        return _DECIMALS;
    }

    /**
     *  @dev Description of the reserve
     *
     *  @return The description
     */
    function description() external pure returns (string memory) {
        return 'Example Hedera Reserve for ChainLink';
    }

    /**
     *  @dev Version of the reserve
     *
     *  @return The current version
     */
    function version() external pure returns (uint256) {
        return _VERSION_ID;
    }

    /**
     * @dev Gets a value from a specific round
     *
     */
    function getRoundData(
        uint80 /* _roundId */
    )
        external
        pure
        returns (
            uint80 /* roundId */,
            int256 /* answer */,
            uint256 /* startedAt */,
            uint256 /* updatedAt */,
            uint80 /* answeredInRound */
        )
    {
        revert NotImplemented();
    }

    /**
     *  @dev Gets the latest round data
     */
    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (
            _ROUND_ID,
            _hederaReserveDataStorage().reserveAmount,
            block.timestamp, // solhint-disable-line not-rely-on-time
            block.timestamp, // solhint-disable-line not-rely-on-time
            _ROUND_ID
        );
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HEDERA_RESERVE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initialize.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setAmount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setAdmin.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decimals.selector;
        staticFunctionSelectors_[selectorIndex++] = this.description.selector;
        staticFunctionSelectors_[selectorIndex++] = this.version.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoundData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.latestRoundData.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHederaReserve).interfaceId;
    }
}
