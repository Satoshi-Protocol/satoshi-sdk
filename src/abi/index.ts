import b2_borrowerOperationsABI from './b2/BorrowerOperations.sol/BorrowerOperations.json';
import b2_debtTokenABI from './b2/DebtToken.sol/DebtToken.json';
import b2_multiCollateralHintHelpersABI from './b2/MultiCollateralHintHelpers.sol/MultiCollateralHintHelpers.json';
import b2_multiTroveGetterABI from './b2/MultiTroveGetter.sol/MultiTroveGetter.json';
import b2_NexusYieldManagerABI from './b2/NexusYieldManager.sol/NexusYieldManager.json';
import b2_OSHITokenABI from './b2/OSHIToken.sol/OSHIToken.json';
import b2_priceFeedAggregatorABI from './b2/PriceFeedAggregator.sol/PriceFeedAggregator.json';
import b2_rewardManagerABI from './b2/RewardManager.sol/RewardManager.json';
import b2_peripheryABI from './b2/SatoshiPeriphery.sol/SatoshiPeriphery.json';
import b2_sortedTrovesABI from './b2/SortedTroves.sol/SortedTroves.json';
import b2_stabilityPoolABI from './b2/StabilityPool.sol/StabilityPool.json';
import b2_troveManagerABI from './b2/TroveManager.sol/TroveManager.json';
import bevm_borrowerOperationsABI from './bevm/BorrowerOperations.sol/BorrowerOperations.json';
import bevm_debtTokenABI from './bevm/DebtToken.sol/DebtToken.json';
import bevm_multiCollateralHintHelpersABI from './bevm/MultiCollateralHintHelpers.sol/MultiCollateralHintHelpers.json';
import bevm_multiTroveGetterABI from './bevm/MultiTroveGetter.sol/MultiTroveGetter.json';
import bevm_NexusYieldManagerABI from './bevm/NexusYieldManager.sol/NexusYieldManager.json';
import bevm_OSHITokenABI from './bevm/OSHIToken.sol/OSHIToken.json';
import bevm_priceFeedAggregatorABI from './bevm/PriceFeedAggregator.sol/PriceFeedAggregator.json';
import bevm_rewardManagerABI from './bevm/RewardManager.sol/RewardManager.json';
import bevm_satoshiBORouterABI from './bevm/SatoshiBORouter.sol/SatoshiBORouter.json';
import bevm_sortedTrovesABI from './bevm/SortedTroves.sol/SortedTroves.json';
import bevm_stabilityPoolABI from './bevm/StabilityPool.sol/StabilityPool.json';
import bevm_troveManagerABI from './bevm/TroveManager.sol/TroveManager.json';
import bitlayer_borrowerOperationsABI from './bitlayer/BorrowerOperations.sol/BorrowerOperations.json';
import bitlayer_debtTokenABI from './bitlayer/DebtToken.sol/DebtToken.json';
import bitlayer_multiCollateralHintHelpersABI from './bitlayer/MultiCollateralHintHelpers.sol/MultiCollateralHintHelpers.json';
import bitlayer_multiTroveGetterABI from './bitlayer/MultiTroveGetter.sol/MultiTroveGetter.json';
import bitlayer_NexusYieldManagerABI from './bitlayer/NexusYieldManager.sol/NexusYieldManager.json';
import bitlayer_OSHITokenABI from './bitlayer/OSHIToken.sol/OSHIToken.json';
import bitlayer_priceFeedAggregatorABI from './bitlayer/PriceFeedAggregator.sol/PriceFeedAggregator.json';
import bitlayer_rewardManagerABI from './bitlayer/RewardManager.sol/RewardManager.json';
import bitlayer_peripheryABI from './bitlayer/SatoshiPeriphery.sol/SatoshiPeriphery.json';
import bitlayer_sortedTrovesABI from './bitlayer/SortedTroves.sol/SortedTroves.json';
import bitlayer_stabilityPoolABI from './bitlayer/StabilityPool.sol/StabilityPool.json';
import bitlayer_troveManagerABI from './bitlayer/TroveManager.sol/TroveManager.json';
import bob_borrowerOperationsABI from './bob/BorrowerOperations.sol/BorrowerOperations.json';
import bob_debtTokenABI from './bob/DebtToken.sol/DebtToken.json';
import bob_multiCollateralHintHelpersABI from './bob/MultiCollateralHintHelpers.sol/MultiCollateralHintHelpers.json';
import bob_multiTroveGetterABI from './bob/MultiTroveGetter.sol/MultiTroveGetter.json';
import bob_NexusYieldManagerABI from './bob/NexusYieldManager.sol/NexusYieldManager.json';
import bob_OSHITokenABI from './bob/OSHIToken.sol/OSHIToken.json';
import bob_priceFeedAggregatorABI from './bob/PriceFeedAggregator.sol/PriceFeedAggregator.json';
import bob_rewardManagerABI from './bob/RewardManager.sol/RewardManager.json';
import bob_peripheryABI from './bob/SatoshiPeriphery.sol/SatoshiPeriphery.json';
import bob_sortedTrovesABI from './bob/SortedTroves.sol/SortedTroves.json';
import bob_stabilityPoolABI from './bob/StabilityPool.sol/StabilityPool.json';
import bob_troveManagerABI from './bob/TroveManager.sol/TroveManager.json';
import core_borrowerOperationsABI from './core/BorrowerOperations.sol/BorrowerOperations.json';
import core_debtTokenABI from './core/DebtToken.sol/DebtToken.json';
import core_multiCollateralHintHelpersABI from './core/MultiCollateralHintHelpers.sol/MultiCollateralHintHelpers.json';
import core_multiTroveGetterABI from './core/MultiTroveGetter.sol/MultiTroveGetter.json';
import core_NexusYieldManagerABI from './core/NexusYieldManager.sol/NexusYieldManager.json';
import core_OSHITokenABI from './core/OSHIToken.sol/OSHIToken.json';
import core_priceFeedAggregatorABI from './core/PriceFeedAggregator.sol/PriceFeedAggregator.json';
import core_rewardManagerABI from './core/RewardManager.sol/RewardManager.json';
import core_peripheryABI from './core/SatoshiPeriphery.sol/SatoshiPeriphery.json';
import core_sortedTrovesABI from './core/SortedTroves.sol/SortedTroves.json';
import core_stabilityPoolABI from './core/StabilityPool.sol/StabilityPool.json';
import core_troveManagerABI from './core/TroveManager.sol/TroveManager.json';
import _wbtcABI from './wbtc.json';

export const wbtcABI = _wbtcABI;

export const B2_ABI: ABIConfig = {
  BORROWER_OPERATIONS: b2_borrowerOperationsABI.abi,
  DEBT_TOKEN: b2_debtTokenABI.abi,
  MULTI_COLLATERAL_HINT_HELPERS: b2_multiCollateralHintHelpersABI.abi,
  MULTI_TROVE_GETTER: b2_multiTroveGetterABI.abi,
  OSHI_TOKEN: b2_OSHITokenABI.abi,
  PRICE_FEED_AGGREGATOR: b2_priceFeedAggregatorABI.abi,
  REWARD_MANAGER: b2_rewardManagerABI.abi,
  SATOSHI_PERIPHERY: b2_peripheryABI.abi,
  SORTED_TROVES: b2_sortedTrovesABI.abi,
  STABILITY_POOL: b2_stabilityPoolABI.abi,
  TROVE_MANAGER: b2_troveManagerABI.abi,
  NEXUS_YIELD_MANAGER: b2_NexusYieldManagerABI.abi,
};

export const BEVM_ABI = {
  BORROWER_OPERATIONS: bevm_borrowerOperationsABI.abi,
  DEBT_TOKEN: bevm_debtTokenABI.abi,
  MULTI_COLLATERAL_HINT_HELPERS: bevm_multiCollateralHintHelpersABI.abi,
  MULTI_TROVE_GETTER: bevm_multiTroveGetterABI.abi,
  OSHI_TOKEN: bevm_OSHITokenABI.abi,
  PRICE_FEED_AGGREGATOR: bevm_priceFeedAggregatorABI.abi,
  REWARD_MANAGER: bevm_rewardManagerABI.abi,
  SATOSHI_PERIPHERY: bevm_satoshiBORouterABI.abi, //! Special case
  SORTED_TROVES: bevm_sortedTrovesABI.abi,
  STABILITY_POOL: bevm_stabilityPoolABI.abi,
  TROVE_MANAGER: bevm_troveManagerABI.abi,
  NexusYieldManager: bevm_NexusYieldManagerABI.abi,
};

export const BITLAYER_ABI: ABIConfig = {
  BORROWER_OPERATIONS: bitlayer_borrowerOperationsABI.abi,
  DEBT_TOKEN: bitlayer_debtTokenABI.abi,
  MULTI_COLLATERAL_HINT_HELPERS: bitlayer_multiCollateralHintHelpersABI.abi,
  MULTI_TROVE_GETTER: bitlayer_multiTroveGetterABI.abi,
  OSHI_TOKEN: bitlayer_OSHITokenABI.abi,
  PRICE_FEED_AGGREGATOR: bitlayer_priceFeedAggregatorABI.abi,
  REWARD_MANAGER: bitlayer_rewardManagerABI.abi,
  SATOSHI_PERIPHERY: bitlayer_peripheryABI.abi,
  SORTED_TROVES: bitlayer_sortedTrovesABI.abi,
  STABILITY_POOL: bitlayer_stabilityPoolABI.abi,
  TROVE_MANAGER: bitlayer_troveManagerABI.abi,
  NEXUS_YIELD_MANAGER: bitlayer_NexusYieldManagerABI.abi,
};

export const BOB_ABI: ABIConfig = {
  BORROWER_OPERATIONS: bob_borrowerOperationsABI.abi,
  DEBT_TOKEN: bob_debtTokenABI.abi,
  MULTI_COLLATERAL_HINT_HELPERS: bob_multiCollateralHintHelpersABI.abi,
  MULTI_TROVE_GETTER: bob_multiTroveGetterABI.abi,
  OSHI_TOKEN: bob_OSHITokenABI.abi,
  PRICE_FEED_AGGREGATOR: bob_priceFeedAggregatorABI.abi,
  REWARD_MANAGER: bob_rewardManagerABI.abi,
  SATOSHI_PERIPHERY: bob_peripheryABI.abi,
  SORTED_TROVES: bob_sortedTrovesABI.abi,
  STABILITY_POOL: bob_stabilityPoolABI.abi,
  TROVE_MANAGER: bob_troveManagerABI.abi,
  NEXUS_YIELD_MANAGER: bob_NexusYieldManagerABI.abi,
};

export const CORE_ABI = {
  BORROWER_OPERATIONS: core_borrowerOperationsABI.abi,
  DEBT_TOKEN: core_debtTokenABI.abi,
  MULTI_COLLATERAL_HINT_HELPERS: core_multiCollateralHintHelpersABI.abi,
  MULTI_TROVE_GETTER: core_multiTroveGetterABI.abi,
  OSHI_TOKEN: core_OSHITokenABI.abi,
  PRICE_FEED_AGGREGATOR: core_priceFeedAggregatorABI.abi,
  REWARD_MANAGER: core_rewardManagerABI.abi,
  SATOSHI_PERIPHERY: core_peripheryABI.abi,
  SORTED_TROVES: core_sortedTrovesABI.abi,
  STABILITY_POOL: core_stabilityPoolABI.abi,
  TROVE_MANAGER: core_troveManagerABI.abi,
  NexusYieldManager: core_NexusYieldManagerABI.abi,
};

export type ABIConfig = {
  BORROWER_OPERATIONS: any;
  DEBT_TOKEN: any;
  MULTI_COLLATERAL_HINT_HELPERS: any;
  MULTI_TROVE_GETTER: any;
  OSHI_TOKEN: any;
  PRICE_FEED_AGGREGATOR: any;
  REWARD_MANAGER: any;
  SATOSHI_PERIPHERY: any;
  SORTED_TROVES: any;
  STABILITY_POOL: any;
  TROVE_MANAGER: any;
  NEXUS_YIELD_MANAGER: any;
};

export const SatoshiABIConfigMap = {
  BEVM_ABI,
  CORE_ABI,
  BOB_ABI,
  BITLAYER_ABI,
  B2_ABI,
};

export default SatoshiABIConfigMap;
