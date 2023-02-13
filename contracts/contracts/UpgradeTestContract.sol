// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './Interfaces/IUpgradeTestContract.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

/**
 * Original
 * hierarchy : parentContract_1 -> parentContract_2 -> parentContract_3 -> parentContract_4 -> upgradeTestContract
 *
 *  */
abstract contract parentContract_1 {
    int256 _reserveAmount;
    address _admin;
    uint256[48] private __gap;
}

abstract contract parentContract_2 is parentContract_1 {
    uint256 someOtherVble;
    uint256[49] private __gap;
}

abstract contract parentContract_3 is parentContract_2 {}

abstract contract parentContract_4 is parentContract_3 {
    uint256[50] private __gap;
}

contract upgradeTestContract is
    IUpgradeTestContract,
    Initializable,
    parentContract_4
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Wrong 1: state variable shifted down (parentContract_1)
abstract contract parentContract_1_Wrong_1 {
    uint256 _test; // this variable is shifting down all the others
    int256 _reserveAmount;
    address _admin;
    uint256 _test_2;
    uint256[46] private __gap;
}

abstract contract parentContract_2_Wrong_1 is parentContract_1_Wrong_1 {
    uint256 someOtherVble;
    uint256[49] private __gap;
}

abstract contract parentContract_3_Wrong_1 is parentContract_2_Wrong_1 {}

abstract contract parentContract_4_Wrong_1 is parentContract_3_Wrong_1 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Wrong_1 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Wrong_1
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Wrong 2: gap reduced only by 1 when 2 state vbles have been added (parentContract_1)
abstract contract parentContract_1_Wrong_2 {
    int256 _reserveAmount;
    address _admin;
    uint256 _test; // new variable
    uint256 _test_2; // new variable
    uint256[47] private __gap; // gap was reduced only by 1 instead of 2
}

abstract contract parentContract_2_Wrong_2 is parentContract_1_Wrong_2 {
    uint256 someOtherVble;
    uint256[49] private __gap;
}

abstract contract parentContract_3_Wrong_2 is parentContract_2_Wrong_2 {}

abstract contract parentContract_4_Wrong_2 is parentContract_3_Wrong_2 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Wrong_2 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Wrong_2
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Wrong 3: state variable renamed (parentContract_1)
abstract contract parentContract_1_Wrong_3 {
    int256 _reserveAmount;
    address _adminRenamed; // this variable has been renamed
    uint256[48] private __gap;
}

abstract contract parentContract_2_Wrong_3 is parentContract_1_Wrong_3 {
    uint256 someOtherVble;
    uint256[49] private __gap;
}

abstract contract parentContract_3_Wrong_3 is parentContract_2_Wrong_3 {}

abstract contract parentContract_4_Wrong_3 is parentContract_3_Wrong_3 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Wrong_3 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Wrong_3
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;

    modifier isAdmin() {
        require(
            _adminRenamed == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _adminRenamed = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount_NewName(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_adminRenamed, admin);
        _adminRenamed = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Wrong 4: gap reduced without variables been added (parentContract_1)
abstract contract parentContract_1_Wrong_4 {
    int256 _reserveAmount;
    address _admin;
    uint256[46] private __gap; // gap was reduced by 2 without any variable been added.
}

abstract contract parentContract_2_Wrong_4 is parentContract_1_Wrong_4 {
    uint256 someOtherVble;
    uint256[49] private __gap;
}

abstract contract parentContract_3_Wrong_4 is parentContract_2_Wrong_4 {}

abstract contract parentContract_4_Wrong_4 is parentContract_3_Wrong_4 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Wrong_4 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Wrong_4
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount_NewName(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Wrong 5: contract added to the inheritance in between parentContract_1 and parentContract_2
abstract contract parentContract_between_Wrong_5 is parentContract_1 {
    uint256 someOtherVble_extra;
    uint256[20] private __gap_extra;
}

abstract contract parentContract_2_Wrong_5 is parentContract_between_Wrong_5 {
    uint256 someOtherVble;
    uint256[28] private __gap;
}

abstract contract parentContract_3_Wrong_5 is parentContract_2_Wrong_5 {}

abstract contract parentContract_4_Wrong_5 is parentContract_3_Wrong_5 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Wrong_5 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Wrong_5
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Wrong 6: contract added to the inheritance in between parentContract_3 and parentContract_4,  even if gap is properly split among the parent contracts, it is considerd an error....
abstract contract parentContract_3_Wrong_6 is parentContract_2 {
    uint256[20] private __gap;
}

abstract contract parentContract_between_Wrong_6 is parentContract_3_Wrong_6 {
    uint256 injectedVariable;
    uint256[19] private __gap;
}

abstract contract parentContract_4_Wrong_6 is parentContract_between_Wrong_6 {
    uint256[10] private __gap;
}

contract upgradeTestContract_Wrong_6 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Wrong_6
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;
    uint256 someOtherVble_2_bis; // new variable

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount_NewName(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Correct 3: contract added to the inheritance in between parentContract_3 and parentContract_4,  it does not contain any state so it is ok
abstract contract parentContract_between_Correct_3 is parentContract_3 {

}

abstract contract parentContract_4_Correct_3 is
    parentContract_between_Correct_3
{
    uint256[50] private __gap;
}

contract upgradeTestContract_Correct_3 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Correct_3
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;
    uint256 someOtherVble_2_bis; // new variable

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount_NewName(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Correct 2: variables added to both parent contracts and main contract and gaps reduced accordingly
abstract contract parentContract_1_Correct_2 {
    int256 _reserveAmount;
    address _admin;
    uint256 _test; // new variable
    uint256 _test_2; // new variable
    uint256[46] private __gap; // gap reduced by 2
}

abstract contract parentContract_2_Correct_2 is parentContract_1_Correct_2 {
    uint256 someOtherVble;
    uint256 someOtherVble_bis; // new variable
    uint256[48] private __gap; // gap reduced by one
}

abstract contract parentContract_3_Correct_2 is parentContract_2_Correct_2 {}

abstract contract parentContract_4_Correct_2 is parentContract_3_Correct_2 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Correct_2 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Correct_2
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;
    uint256 someOtherVble_2_bis; // new variable

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount_NewName(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}

// Correct 1: variables added to parent contract (parentContract_1) and main contract and gap reduced accordingly
abstract contract parentContract_1_Correct_1 {
    int256 _reserveAmount;
    address _admin;
    uint256 _test; // new variable
    uint256 _test_2; // new variable
    uint256[46] private __gap; // gap reduced by two
}

abstract contract parentContract_2_Correct_1 is parentContract_1_Correct_1 {
    uint256 someOtherVble;
    uint256[49] private __gap;
}

abstract contract parentContract_3_Correct_1 is parentContract_2_Correct_1 {}

abstract contract parentContract_4_Correct_1 is parentContract_3_Correct_1 {
    uint256[50] private __gap;
}

contract upgradeTestContract_Correct_1 is
    IUpgradeTestContract,
    Initializable,
    parentContract_4_Correct_1
{
    uint8 private constant _DECIMALS = 2;
    uint80 private constant _ROUND_ID = 0;

    uint256 someOtherVble_2;
    uint256 someOtherVble_2_bis; // new variable

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    // modifier to check that an address is not 0
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) internal pure {
        require(addr != address(0), 'Provided address is 0');
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(
        int256 initialReserve,
        address admin
    ) external initializer checkAddressIsNotZero(admin) {
        _reserveAmount = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount_NewName(int256 newValue) external isAdmin {
        emit AmountChanged(_reserveAmount, newValue);
        _reserveAmount = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(
        address admin
    ) external isAdmin checkAddressIsNotZero(admin) {
        emit AdminChanged(_admin, admin);
        _admin = admin;
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
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
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
        revert('Not implemented');
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _ROUND_ID,
            _reserveAmount,
            block.timestamp,
            block.timestamp,
            _ROUND_ID
        );
    }
}
