import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { Contract } from "web3-eth-contract";
import type { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { ethers } from "ethers";
import BN from "bn.js";

import { Dispatcher } from "flux";
import EventEmitter from "events";

import stores from ".";
import { formatCurrency } from "../utils/utils";
import {
  ACTIONS,
  CONTRACTLIST,
  MAX_UINT256,
  ZERO_ADDRESS,
  NATIVE_TOKEN_LIST,
  W_NATIVE_ADDRESS_LIST,
  TOKEN_LIST,
} from "./constants/constants";
import tokenlistTest from "../testnet-token-list.json";
import tokenlistMain from "../mainnet-token-list.json";
import type {
  BaseAsset,
  Pair,
  RouteAsset,
  VeToken,
  Vote,
  VestNFT,
  AllEarned,
  Bribe,
} from "./types/types";
import { TransactionReceipt } from "@ethersproject/providers";
import { GOV_TOKEN_ADDRESS } from "./constants/contractsTestnet";

import { supportedChainIdList } from "./connectors/connectors";

let CONTRACTS;
let W_NATIVE_ADDRESS;
let NATIVE_TOKEN;
let tokenlist;

class Store {
  dispatcher: Dispatcher<any>;
  emitter: EventEmitter;
  store: {
    baseAssets: BaseAsset[];
    routeAssets: RouteAsset[];
    pairtokenAssets: BaseAsset[];
    govToken: Omit<BaseAsset, "local"> & { balanceOf: string };
    veToken: VeToken;
    pairs: Pair[];
    vestNFTs: VestNFT[];
    rewards: {
      bribes: any[];
      fees: any[];
      rewards: any[];
      veDist: any[];
    };
    updateDate: number;
    tokenPrices: Map<string, number>;
    tvl: number;
    tbv: number;
    circulatingSupply: number;
    marketCap: number;
  };

  constructor(dispatcher: Dispatcher<any>, emitter: EventEmitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;

    this.store = {
      baseAssets: [],
      routeAssets: [],
      pairtokenAssets: [],
      govToken: null,
      veToken: null,
      pairs: [],
      vestNFTs: [],
      rewards: {
        bribes: [],
        fees: [],
        rewards: [],
        veDist: [],
      },
      updateDate: 0,
      tokenPrices: new Map(),
      tvl: 0,
      tbv: 0,
      circulatingSupply: 0,
      marketCap: 0,
    };

    dispatcher.register(
      function (this: Store, payload) {
        switch (payload.type) {
          case ACTIONS.CONFIGURE_SS:
            const currentChain = stores.accountStore.getStore("chainId");
            const isChainSupported =
              supportedChainIdList.includes(currentChain);
            if (isChainSupported) {
              CONTRACTS = CONTRACTLIST[currentChain];
              W_NATIVE_ADDRESS = W_NATIVE_ADDRESS_LIST[currentChain];
              NATIVE_TOKEN = NATIVE_TOKEN_LIST[currentChain];
              tokenlist = TOKEN_LIST[currentChain];
            } else {
              CONTRACTS = CONTRACTLIST[169];
              W_NATIVE_ADDRESS = W_NATIVE_ADDRESS_LIST[169];
              NATIVE_TOKEN = NATIVE_TOKEN_LIST[169];
            }
            //console.log("configure");
            this.configure(payload);
            break;
          case ACTIONS.GET_BALANCES:
            const chainInvalid = stores.accountStore.getStore("chainInvalid");
            const account = stores.accountStore.getStore("account");
            ////console.log("account", account);
            if (!chainInvalid && account.address) {
              this.getBalances(payload);
            }
            break;
          case ACTIONS.SEARCH_ASSET:
            this.searchBaseAsset(payload);
            break;
          // case ACTIONS.BASE_ASSETS_UPDATED:
          // case ACTIONS.UPDATED:
          //   this.updateSwapAssets();
          //   break;

          // LIQUIDITY
          case ACTIONS.CREATE_PAIR_AND_STAKE:
            this.createPairStake(payload);
            break;
          case ACTIONS.CREATE_PAIR_AND_DEPOSIT:
            this.createPairDeposit(payload);
            break;
          case ACTIONS.ADD_LIQUIDITY:
            this.addLiquidity(payload);
            break;
          case ACTIONS.STAKE_LIQUIDITY:
            this.stakeLiquidity(payload);
            break;
          case ACTIONS.ADD_LIQUIDITY_AND_STAKE:
            this.addLiquidityAndStake(payload);
            break;
          case ACTIONS.QUOTE_ADD_LIQUIDITY:
            this.quoteAddLiquidity(payload);
            break;
          case ACTIONS.GET_LIQUIDITY_BALANCES:
            this.getLiquidityBalances(payload);
            break;
          case ACTIONS.REMOVE_NONE_GAUGE_LIQUIDITY:
            this.removeNoneGaugeLiquidity(payload);
            break;
          case ACTIONS.REMOVE_LIQUIDITY:
            this.removeLiquidity(payload);
            break;
          case ACTIONS.UNSTAKE_AND_REMOVE_LIQUIDITY:
            this.unstakeAndRemoveLiquidity(payload);
            break;
          case ACTIONS.QUOTE_REMOVE_LIQUIDITY:
            this.quoteRemoveLiquidity(payload);
            break;
          case ACTIONS.UNSTAKE_LIQUIDITY:
            this.unstakeLiquidity(payload);
            break;
          case ACTIONS.CREATE_GAUGE:
            this.createGauge(payload);
            break;
          case ACTIONS.SLP_REMOVE_NONE_GAUGE_LIQUIDITY:
            this.slpRemoveNoneGaugeLiquidity(payload);
            break;
          case ACTIONS.SLP_LIQUIDITY:
            this.slpLiquidity(payload);
            break;
          case ACTIONS.SLP_ADD_LIQUIDITY_AND_STAKE:
            this.slpaddLiquidityAndStake(payload);
            break;
          case ACTIONS.SLP_REMOVE_LIQUIDITY:
            this.slpRemoveLiquidity(payload);
            break;
          case ACTIONS.SLP_UNSTAKE_AND_REMOVE_LIQUIDITY:
            this.slpUnstakeAndRemoveLiquidity(payload);
            break;

          // SWAP
          case ACTIONS.QUOTE_SWAP:
            this.quoteSwap(payload);
            break;
          case ACTIONS.SWAP:
            this.swap(payload);
            break;

          // VESTING
          case ACTIONS.GET_VEST_NFTS:
            this.getVestNFTs(payload);
            break;
          case ACTIONS.CREATE_VEST:
            this.createVest(payload);
            break;
          case ACTIONS.INCREASE_VEST_AMOUNT:
            this.increaseVestAmount(payload);
            break;
          case ACTIONS.INCREASE_VEST_DURATION:
            this.increaseVestDuration(payload);
            break;
          case ACTIONS.WITHDRAW_VEST:
            this.withdrawVest(payload);
            break;
          case ACTIONS.WRAP_UNWRAP:
            this.wrapOrUnwrap(payload);
            break;

          //VOTE
          case ACTIONS.VOTE:
            this.vote(payload);
            break;
          case ACTIONS.GET_VEST_VOTES:
            this.getVestVotes(payload);
            break;
          case ACTIONS.CREATE_BRIBE:
            this.createBribe(payload);
            break;
          case ACTIONS.GET_VEST_BALANCES:
            this.getVestBalances(payload);
            break;
          case ACTIONS.UPDATE_EPOCH_PERIOD:
            this.updateEpochPeriod();
            break;

          //REWARDS
          case ACTIONS.GET_REWARD_BALANCES:
            this.getRewardBalances(payload);
            break;
          case ACTIONS.GET_BRIBE_BALANCES:
            this.getBribeBalance(payload);
            break;
          case ACTIONS.GET_FEE_BALANCES:
            this.getFeeBalance(payload);
            break;
          case ACTIONS.GET_DIST_BALANCES:
            this.getDistBalances();
            break;
          case ACTIONS.GET_LP_BALANCES:
            this.getLpBalance();
            break;
          case ACTIONS.GET_ALL_TOKEN_VOTE_BALANCES:
            this.getAllTokenVoteBalance();
            break;
          case ACTIONS.CLAIM_BRIBE:
            this.claimBribes(payload);
            break;
          case ACTIONS.CLAIM_PAIR_FEES:
            this.claimFees(payload);
            break;
          case ACTIONS.CLAIM_REWARD:
            this.claimRewards(payload);
            break;
          case ACTIONS.CLAIM_VE_DIST:
            this.claimVeDist(payload);
            break;
          case ACTIONS.CLAIM_ALL_REWARDS:
            this.claimAllRewards(payload);
            break;
        }
      }.bind(this)
    );
  }

  getStore = <K extends keyof Store["store"]>(index: K) => {
    return this.store[index];
  };

  setStore = (obj: { [key: string]: any }) => {
    this.store = { ...this.store, ...obj };
    return this.emitter.emit(ACTIONS.STORE_UPDATED);
  };

  getNFTByID = async (id) => {
    try {
      const vestNFTs = this.getStore("vestNFTs");
      let theNFT = vestNFTs.filter((vestNFT) => {
        return vestNFT.id == id;
      });

      if (theNFT.length > 0) {
        return theNFT[0];
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const veToken = this.getStore("veToken");
      const govToken = this.getStore("govToken");

      const vestingContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      const nftsLength = await vestingContract.methods
        .balanceOf(account.address)
        .call();

      const arr = Array.from({ length: parseInt(nftsLength) }, (_, idx) => idx);

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const calls = arr.map((idx) => ({
        target: CONTRACTS.VE_TOKEN_ADDRESS,
        callData: vestingContract.methods
          .tokenOfOwnerByIndex(account.address, idx)
          .encodeABI(),
      }));

      const aggregateRes1 = await multicallContract.methods
        .aggregate(calls)
        .call();

      const nftIds = aggregateRes1.returnData.map((data) => parseInt(data, 16));
      const calls2 = nftIds.flatMap((idx) => [
        {
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods.locked(idx).encodeABI(),
        },
        {
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods.balanceOfNFT(idx).encodeABI(),
        },
      ]);

      const aggregateRes2 = await multicallContract.methods
        .aggregate(calls2)
        .call();

      const locked = aggregateRes2.returnData.filter(
        (_, index) => index % 2 === 0
      );
      const balanceOfNFT = aggregateRes2.returnData.filter(
        (_, index) => index % 2 !== 0
      );

      const parsedLocked = locked.map((data) => {
        const amountHex = data.slice(2, 66);
        const endHex = data.slice(71);
        const amountDec = new BigNumber(amountHex, 16)
          .div(10 ** govToken.decimals)
          .toFixed(govToken.decimals);
        const endDec = parseInt(endHex, 16);
        return { amount: amountDec, end: endDec };
      });

      const parsedBalanceOfNFT = balanceOfNFT.map((data) => {
        return new BigNumber(data, 16)
          .div(10 ** veToken.decimals)
          .toFixed(veToken.decimals);
      });

      const nfts = nftIds.map((id, idx) => {
        return {
          id: id,
          lockEnds: parsedLocked[idx].end,
          lockAmount: parsedLocked[idx].amount,
          lockValue: parsedBalanceOfNFT[idx],
        };
      });

      this.setStore({ vestNFTs: nfts });

      theNFT = nfts.filter((nft) => {
        return nft.id == id;
      });

      if (theNFT.length > 0) {
        return theNFT[0];
      }

      return null;
    } catch (ex) {
      ////////console.log(ex);
      return null;
    }
  };

  _updateVestNFTByID = async (id) => {
    try {
      const vestNFTs = this.getStore("vestNFTs");
      let theNFT = vestNFTs.filter((vestNFT) => {
        return vestNFT.id == id;
      });

      if (theNFT.length == 0) {
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const veToken = this.getStore("veToken");
      const govToken = this.getStore("govToken");

      const vestingContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      const locked = await vestingContract.methods.locked(id).call();
      const lockValue = await vestingContract.methods.balanceOfNFT(id).call();
      const newVestNFTs: VestNFT[] = vestNFTs.map((nft) => {
        if (nft.id == id) {
          return {
            id: id,
            lockEnds: locked.end,
            lockAmount: BigNumber(locked.amount)
              .div(10 ** govToken.decimals)
              .toFixed(govToken.decimals),
            lockValue: BigNumber(lockValue)
              .div(10 ** veToken.decimals)
              .toFixed(veToken.decimals),
          };
        }

        return nft;
      });

      this.setStore({ vestNFTs: newVestNFTs });
      this.emitter.emit(ACTIONS.UPDATED);
      //console.log("_updateVestNFTByID");
      return null;
    } catch (ex) {
      ////////console.log(ex);
      return null;
    }
  };

  // getPairByAddress = async (pairAddress) => {
  //   try {
  //     const web3 = await stores.accountStore.getWeb3Provider();
  //     if (!web3) {
  //       //////console.warn("web3 not found");
  //       return null;
  //     }
  //     const account = stores.accountStore.getStore("account");
  //     if (!account) {
  //       //////console.warn("account not found");
  //       return null;
  //     }

  //     const pairs = this.getStore("pairs");

  //     let thePair: any = pairs.filter((pair) => {
  //       return pair.address.toLowerCase() == pairAddress.toLowerCase();
  //     });
  //     if (thePair.length > 0) {
  //       const pc = new web3.eth.Contract(
  //         CONTRACTS.PAIR_ABI as AbiItem[],
  //         pairAddress
  //       );

  //       const multicallContract = new web3.eth.Contract(
  //         CONTRACTS.MULTICALL_ABI as AbiItem[],
  //         CONTRACTS.MULTICALL_ADDRESS
  //       );

  //       const calls = [
  //         {
  //           target: pairAddress,
  //           callData: pc.methods.totalSupply().encodeABI()
  //         },
  //         {
  //           target: pairAddress,
  //           callData: pc.methods.reserve0().encodeABI()
  //         },
  //         {
  //           target: pairAddress,
  //           callData: pc.methods.reserve1().encodeABI()
  //         },
  //         {
  //           target: pairAddress,
  //           callData: pc.methods.balanceOf(account.address).encodeABI()
  //         },
  //       ];

  //       const aggregateRes1 = await multicallContract.methods.aggregate(calls).call();

  //       const { hexToNumberString } = require('web3-utils');

  //       const totalSupply= hexToNumberString(aggregateRes1.returnData[0], 0);
  //       const reserve0= hexToNumberString(aggregateRes1.returnData[1], 0);
  //       const reserve1= hexToNumberString(aggregateRes1.returnData[2], 0);
  //       const balanceOf= hexToNumberString(aggregateRes1.returnData[3], 0);

  //       const returnPair = thePair[0];
  //       returnPair.balance = BigNumber(balanceOf)
  //         .div(10 ** returnPair.decimals)
  //         .toFixed(parseInt(returnPair.decimals));
  //       returnPair.totalSupply = BigNumber(totalSupply)
  //         .div(10 ** returnPair.decimals)
  //         .toFixed(parseInt(returnPair.decimals));
  //       returnPair.reserve0 = BigNumber(reserve0)
  //         .div(10 ** returnPair.token0.decimals)
  //         .toFixed(parseInt(returnPair.token0.decimals));
  //       returnPair.reserve1 = BigNumber(reserve1)
  //         .div(10 ** returnPair.token1.decimals)
  //         .toFixed(parseInt(returnPair.token1.decimals));
  //       return returnPair;
  //     }

  //     const pairContract = new web3.eth.Contract(
  //       CONTRACTS.PAIR_ABI as AbiItem[],
  //       pairAddress
  //     );
  //     const gaugesContract = new web3.eth.Contract(
  //       CONTRACTS.VOTER_ABI as AbiItem[],
  //       CONTRACTS.VOTER_ADDRESS
  //     );

  //     const [totalWeight] = await Promise.all([
  //       gaugesContract.methods.totalWeight().call(),
  //     ]);

  //     const [
  //       token0,
  //       token1,
  //       totalSupply,
  //       symbol,
  //       reserve0,
  //       reserve1,
  //       decimals,
  //       balanceOf,
  //       stable,
  //       gaugeAddress,
  //       gaugeWeight,
  //       // claimable0,
  //       // claimable1,
  //     ] = await Promise.all([
  //       pairContract.methods.token0().call(),
  //       pairContract.methods.token1().call(),
  //       pairContract.methods.totalSupply().call(),
  //       pairContract.methods.symbol().call(),
  //       pairContract.methods.reserve0().call(),
  //       pairContract.methods.reserve1().call(),
  //       pairContract.methods.decimals().call(),
  //       pairContract.methods.balanceOf(account.address).call(),
  //       pairContract.methods.stable().call(),
  //       gaugesContract.methods.gauges(pairAddress).call(),
  //       gaugesContract.methods.weights(pairAddress).call(),
  //       // pairContract.methods.claimable0(account.address).call(),
  //       // pairContract.methods.claimable1(account.address).call(),
  //     ]);

  //     const token0Contract = new web3.eth.Contract(
  //       CONTRACTS.ERC20_ABI as AbiItem[],
  //       token0
  //     );
  //     const token1Contract = new web3.eth.Contract(
  //       CONTRACTS.ERC20_ABI as AbiItem[],
  //       token1
  //     );

  //     const [
  //       token0Symbol,
  //       token0Decimals,
  //       token0Balance,
  //       token1Symbol,
  //       token1Decimals,
  //       token1Balance,
  //     ] = await Promise.all([
  //       token0Contract.methods.symbol().call(),
  //       token0Contract.methods.decimals().call(),
  //       token0Contract.methods.balanceOf(account.address).call(),
  //       token1Contract.methods.symbol().call(),
  //       token1Contract.methods.decimals().call(),
  //       token1Contract.methods.balanceOf(account.address).call(),
  //     ]);

  //     thePair = {
  //       address: pairAddress,
  //       symbol: symbol,
  //       decimals: parseInt(decimals),
  //       stable,
  //       token0: {
  //         address: token0,
  //         symbol: token0Symbol,
  //         balance: BigNumber(token0Balance)
  //           .div(10 ** token0Decimals)
  //           .toFixed(parseInt(token0Decimals)),
  //         decimals: parseInt(token0Decimals),
  //       },
  //       token1: {
  //         address: token1,
  //         symbol: token1Symbol,
  //         balance: BigNumber(token1Balance)
  //           .div(10 ** token1Decimals)
  //           .toFixed(parseInt(token1Decimals)),
  //         decimals: parseInt(token1Decimals),
  //       },
  //       balance: BigNumber(balanceOf)
  //         .div(10 ** decimals)
  //         .toFixed(parseInt(decimals)),
  //       totalSupply: BigNumber(totalSupply)
  //         .div(10 ** decimals)
  //         .toFixed(parseInt(decimals)),
  //       reserve0: BigNumber(reserve0)
  //         .div(10 ** token0Decimals)
  //         .toFixed(parseInt(token0Decimals)),
  //       reserve1: BigNumber(reserve1)
  //         .div(10 ** token1Decimals)
  //         .toFixed(parseInt(token1Decimals)),
  //       // claimable0: BigNumber(claimable0)
  //       //   .div(10 ** token0Decimals)
  //       //   .toFixed(parseInt(token0Decimals)),
  //       // claimable1: BigNumber(claimable1)
  //       //   .div(10 ** token1Decimals)
  //       //   .toFixed(parseInt(token1Decimals)),
  //     };

  //     if (gaugeAddress !== ZERO_ADDRESS) {
  //       const gaugeContract = new web3.eth.Contract(
  //         CONTRACTS.GAUGE_ABI as AbiItem[],
  //         gaugeAddress
  //       );

  //       const [totalSupply, gaugeBalance, bribeAddress] = await Promise.all([
  //         gaugeContract.methods.totalSupply().call(),
  //         gaugeContract.methods.balanceOf(account.address).call(),
  //         gaugesContract.methods.bribes(gaugeAddress).call(),
  //       ]);

  //       const bribeContract = new web3.eth.Contract(
  //         CONTRACTS.IT_BRIBE_FACTORY_ABI as AbiItem[],
  //         thePair.gauge.fees_address
  //       );

  //       const tokensLength = await bribeContract.methods
  //         .rewardsListLength()
  //         .call();
  //       const arry = Array.from(
  //         { length: parseInt(tokensLength) },
  //         (v, i) => i
  //       );

  //       const bribes = await Promise.all(
  //         arry.map(async (idx) => {
  //           const tokenAddress = await bribeContract.methods
  //             .rewards(idx)
  //             .call();
  //           const token = await this.getBaseAsset(tokenAddress);

  //           const [rewardRate] = await Promise.all([
  //             bribeContract.methods.rewardRate(tokenAddress).call(),
  //           ]);

  //           return {
  //             token: token,
  //             rewardAmount: BigNumber(rewardRate)
  //               .times(86400)
  //               .div(10 ** token.decimals)
  //               .toFixed(token.decimals),
  //           };
  //         })
  //       );

  //       thePair.gauge = {
  //         address: gaugeAddress,
  //         bribeAddress: bribeAddress,
  //         decimals: 18,
  //         balance: BigNumber(gaugeBalance)
  //           .div(10 ** 18)
  //           .toFixed(18),
  //         totalSupply: BigNumber(totalSupply)
  //           .div(10 ** 18)
  //           .toFixed(18),
  //         weight: BigNumber(gaugeWeight)
  //           .div(10 ** 18)
  //           .toFixed(18),
  //         weightPercent: BigNumber(gaugeWeight)
  //           .times(100)
  //           .div(totalWeight)
  //           .toFixed(2),
  //         bribes: bribes,
  //       };
  //     }

  //     pairs.push(thePair);
  //     this.setStore({ pairs: pairs });

  //     return thePair;
  //   } catch (ex) {
  //     ////////console.log(ex);
  //     return null;
  //   }
  // };

  // When it comes to new pair, it will be added to the store "pairs"

  getPair = async (addressA, addressB, stab, symbolA, symbolB) => {
    if (symbolA === NATIVE_TOKEN.symbol) {
      addressA = W_NATIVE_ADDRESS;
    }
    if (symbolB === NATIVE_TOKEN.symbol) {
      addressB = W_NATIVE_ADDRESS;
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      //////console.warn("web3 not found");
      return null;
    }
    const account = stores.accountStore.getStore("account");
    if (!account) {
      //////console.warn("account not found");
      return null;
    }

    const pairs = this.getStore("pairs");

    let thePair: any = pairs.filter((pair) => {
      return (
        (pair.token0.address.toLowerCase() == addressA.toLowerCase() &&
          pair.token1.address.toLowerCase() == addressB.toLowerCase() &&
          pair.stable == stab) ||
        (pair.token0.address.toLowerCase() == addressB.toLowerCase() &&
          pair.token1.address.toLowerCase() == addressA.toLowerCase() &&
          pair.stable == stab)
      );
    });

    //console.log("thePair", thePair);

    if (thePair.length > 0) {
      const pc = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI as AbiItem[],
        thePair[0].address
      );

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const calls2 = [
        {
          target: thePair[0].address,
          callData: pc.methods.totalSupply().encodeABI(),
        },
        {
          target: thePair[0].address,
          callData: pc.methods.reserve0().encodeABI(),
        },
        {
          target: thePair[0].address,
          callData: pc.methods.reserve1().encodeABI(),
        },
        {
          target: thePair[0].address,
          callData: pc.methods.balanceOf(account.address).encodeABI(),
        },
      ];

      const aggregateRes2 = await multicallContract.methods
        .aggregate(calls2)
        .call();

      const hexValues = aggregateRes2.returnData;

      const totalSupply = web3.eth.abi.decodeParameter("uint256", hexValues[0]);
      const reserve0 = web3.eth.abi.decodeParameter("uint256", hexValues[1]);
      const reserve1 = web3.eth.abi.decodeParameter("uint256", hexValues[2]);
      const balanceOf = web3.eth.abi.decodeParameter("uint256", hexValues[3]);

      const returnPair = thePair[0];
      returnPair.balance = BigNumber(String(balanceOf))
        .div(10 ** returnPair.decimals)
        .toFixed(parseInt(returnPair.decimals));
      returnPair.totalSupply = BigNumber(String(totalSupply))
        .div(10 ** returnPair.decimals)
        .toFixed(parseInt(returnPair.decimals));
      returnPair.reserve0 = BigNumber(String(reserve0))
        .div(10 ** returnPair.token0.decimals)
        .toFixed(parseInt(returnPair.token0.decimals));
      returnPair.reserve1 = BigNumber(String(reserve1))
        .div(10 ** returnPair.token1.decimals)
        .toFixed(parseInt(returnPair.token1.decimals));

      return returnPair;
    }

    const factoryContract = new web3.eth.Contract(
      CONTRACTS.FACTORY_ABI as AbiItem[],
      CONTRACTS.FACTORY_ADDRESS
    );
    const pairAddress = await factoryContract.methods
      .getPair(addressA, addressB, stab)
      .call();

    if (pairAddress && pairAddress != ZERO_ADDRESS) {
      const pairContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI as AbiItem[],
        pairAddress
      );
      const gaugesContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      );

      const [totalWeight] = await Promise.all([
        gaugesContract.methods.totalWeight().call(),
      ]);

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const calls2 = [
        {
          target: pairAddress,
          callData: pairContract.methods.token0().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.token1().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.totalSupply().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.symbol().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.reserve0().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.reserve1().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.decimals().encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.balanceOf(account.address).encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods.stable().encodeABI(),
        },
        {
          target: CONTRACTS.VOTER_ADDRESS,
          callData: gaugesContract.methods.gauges(pairAddress).encodeABI(),
        },
        {
          target: CONTRACTS.VOTER_ADDRESS,
          callData: gaugesContract.methods.weights(pairAddress).encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods
            .claimable0(account.address)
            .encodeABI(),
        },
        {
          target: pairAddress,
          callData: pairContract.methods
            .claimable1(account.address)
            .encodeABI(),
        },
      ];

      const aggregateRes2 = await multicallContract.methods
        .aggregate(calls2)
        .call();

      const hexValues = aggregateRes2.returnData;

      const token0 = web3.eth.abi.decodeParameter("address", hexValues[0]);
      const token1 = web3.eth.abi.decodeParameter("address", hexValues[1]);
      const totalSupply = web3.eth.abi.decodeParameter("uint256", hexValues[2]);
      const symbol = web3.eth.abi.decodeParameter("string", hexValues[3]);
      const reserve0 = web3.eth.abi.decodeParameter("uint256", hexValues[4]);
      const reserve1 = web3.eth.abi.decodeParameter("uint256", hexValues[5]);
      const decimals = web3.eth.abi.decodeParameter("uint8", hexValues[6]);
      const balanceOf = web3.eth.abi.decodeParameter("uint256", hexValues[7]);
      const stable = web3.eth.abi.decodeParameter("bool", hexValues[8]);
      const gaugeAddress = web3.eth.abi.decodeParameter(
        "address",
        hexValues[9]
      );
      const gaugeWeight = web3.eth.abi.decodeParameter(
        "uint256",
        hexValues[10]
      );
      const claimable0 = web3.eth.abi.decodeParameter("uint256", hexValues[11]);
      const claimable1 = web3.eth.abi.decodeParameter("uint256", hexValues[12]);

      const token0Contract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        String(token0)
      );
      const token1Contract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        String(token1)
      );

      const calls = [
        {
          target: String(token0),
          callData: token0Contract.methods.symbol().encodeABI(),
        },
        {
          target: String(token0),
          callData: token0Contract.methods.decimals().encodeABI(),
        },
        {
          target: String(token0),
          callData: token0Contract.methods
            .balanceOf(account.address)
            .encodeABI(),
        },
        {
          target: String(token1),
          callData: token1Contract.methods.symbol().encodeABI(),
        },
        {
          target: String(token1),
          callData: token1Contract.methods.decimals().encodeABI(),
        },
        {
          target: String(token1),
          callData: token1Contract.methods
            .balanceOf(account.address)
            .encodeABI(),
        },
      ];

      const aggregateRes = await multicallContract.methods
        .aggregate(calls)
        .call();

      const hexValues2 = aggregateRes.returnData;

      const token0Symbol = web3.eth.abi.decodeParameter(
        "string",
        hexValues2[0]
      );
      const token0Decimals = web3.eth.abi.decodeParameter(
        "uint8",
        hexValues2[1]
      );
      const token0Balance = web3.eth.abi.decodeParameter(
        "uint256",
        hexValues2[2]
      );
      const token1Symbol = web3.eth.abi.decodeParameter(
        "string",
        hexValues2[3]
      );
      const token1Decimals = web3.eth.abi.decodeParameter(
        "uint8",
        hexValues2[4]
      );
      const token1Balance = web3.eth.abi.decodeParameter(
        "uint256",
        hexValues2[5]
      );

      // const [
      //   token0Symbol,
      //   token0Decimals,
      //   token0Balance,
      //   token1Symbol,
      //   token1Decimals,
      //   token1Balance,
      // ]

      thePair = {
        address: pairAddress,
        symbol: symbol,
        decimals: parseInt(String(decimals)),
        stable,
        token0: {
          address: token0,
          symbol: token0Symbol,
          balance: BigNumber(String(token0Balance))
            .div(10 ** Number(token0Decimals))
            .toFixed(Number(token0Decimals)),
          decimals: Number(token0Decimals),
        },
        token1: {
          address: token1,
          symbol: token1Symbol,
          balance: BigNumber(String(token1Balance))
            .div(10 ** Number(token1Decimals))
            .toFixed(Number(token1Decimals)),
          decimals: Number(token1Decimals),
        },
        balance: BigNumber(String(balanceOf))
          .div(10 ** Number(decimals))
          .toFixed(parseInt(String(decimals))),
        totalSupply: BigNumber(String(totalSupply))
          .div(10 ** Number(decimals))
          .toFixed(parseInt(String(decimals))),
        reserve0: BigNumber(String(reserve0))
          .div(10 ** Number(token0Decimals))
          .toFixed(Number(token0Decimals)),
        reserve1: BigNumber(String(reserve1))
          .div(10 ** Number(token1Decimals))
          .toFixed(Number(token1Decimals)),
        claimable0: BigNumber(String(claimable0))
          .div(10 ** Number(token0Decimals))
          .toFixed(Number(token0Decimals)),
        claimable1: BigNumber(String(claimable1))
          .div(10 ** Number(token1Decimals))
          .toFixed(Number(token1Decimals)),
      };

      if (String(gaugeAddress) !== ZERO_ADDRESS) {
        const gaugeContract = new web3.eth.Contract(
          CONTRACTS.GAUGE_ABI as AbiItem[],
          String(gaugeAddress)
        );

        const calls3 = [
          {
            target: String(gaugeAddress),
            callData: gaugeContract.methods.totalSupply().encodeABI(),
          },
          {
            target: String(gaugeAddress),
            callData: gaugeContract.methods
              .balanceOf(account.address)
              .encodeABI(),
          },
          {
            target: String(gaugeAddress),
            callData: gaugeContract.methods.external_bribe().encodeABI(),
          },
          {
            target: String(gaugeAddress),
            callData: gaugeContract.methods.internal_bribe().encodeABI(),
          },
        ];

        const aggregateRes3 = await multicallContract.methods
          .aggregate(calls3)
          .call();

        const hexValues3 = aggregateRes3.returnData;

        const totalSupply = web3.eth.abi.decodeParameter(
          "uint256",
          hexValues3[0]
        );
        const gaugeBalance = web3.eth.abi.decodeParameter(
          "uint256",
          hexValues3[1]
        );
        const bribeAddress = web3.eth.abi.decodeParameter(
          "address",
          hexValues3[2]
        );
        const feeAddress = web3.eth.abi.decodeParameter(
          "address",
          hexValues3[3]
        );
        const bribes = await this.getBribeInfo(web3, String(gaugeAddress));

        thePair.gauge = {
          address: gaugeAddress,
          bribe_address: bribeAddress,
          fees_address: feeAddress,
          decimals: 18,
          balance: BigNumber(String(gaugeBalance))
            .div(10 ** 18)
            .toFixed(18),
          totalSupply: BigNumber(String(totalSupply))
            .div(10 ** 18)
            .toFixed(18),
          weight: BigNumber(String(gaugeWeight))
            .div(10 ** 18)
            .toFixed(18),
          weightPercent: BigNumber(String(gaugeWeight))
            .times(100)
            .div(totalWeight)
            .toFixed(2),
          bribes: bribes,
        };
      }

      pairs.push(thePair);
      this.setStore({ pairs: pairs });

      return thePair;
    }

    return null;
  };

  getLocalAssets = () => {
    try {
      let localBaseAssets = [];
      const localBaseAssetsString = localStorage.getItem("stableSwap-assets");
      if (localBaseAssetsString && localBaseAssetsString !== "") {
        localBaseAssets = JSON.parse(localBaseAssetsString);
      }

      return localBaseAssets;
    } catch (ex) {
      ////////console.log(ex);
      return [];
    }
  };

  getBaseAsset = async (token, save?, getBalance?) => {
    try {
      const baseAssets = this.getStore("baseAssets");
      const tokens = token;
      const theBaseAsset = baseAssets.filter((as) => {
        return as.address.toLowerCase() === token.address.toLowerCase();
      });
      if (theBaseAsset.length > 0) {
        return theBaseAsset[0];
      }
      ////console.log("Base address", token);
      // not found, so we search the blockchain for it.
      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }
      ////console.log("11111");
      const baseAssetContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        token.address
      );
      ////console.log("22222");
      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );
      ////console.log("33333");
      // const calls = [
      //   {
      //     target: token.address,
      //     callData: baseAssetContract.methods.symbol().encodeABI(),
      //   },
      //   {
      //     target: token.address,
      //     callData: baseAssetContract.methods.decimals().encodeABI(),
      //   },
      //   {
      //     target: token.address,
      //     callData: baseAssetContract.methods.name().encodeABI(),
      //   },
      // ];
      // const aggregateRes1 = await multicallContract.methods
      //   .aggregate(calls)
      //   .call();
      ////console.log("55555");
      // const hexValues = aggregateRes1.returnData;
      // const name = web3.eth.abi.decodeParameter("string", hexValues[0]);
      // const symbol = web3.eth.abi.decodeParameter("string", hexValues[1]);
      // const decimals = web3.eth.abi.decodeParameter("uint8", hexValues[2]);
      ////console.log("checkcheck");
      // const newBaseAsset: BaseAsset = {
      //   address: token.address,
      //   symbol: String(symbol),
      //   name: String(name),
      //   decimals: Number(decimals),
      //   logoURI: null,
      //   local: true,
      //   balance: null,
      //   isWhitelisted: false,
      // };
      //console.log("token symbol", token.symbol);
      tokens.isWhitelisted = false;

      if (getBalance) {
        const account = stores.accountStore.getStore("account");
        if (account) {
          const balanceOf = await baseAssetContract.methods
            .balanceOf(account.address)
            .call();
          tokens.balance = BigNumber(balanceOf)
            .div(10 ** token.decimals)
            .toFixed(token.decimals);
        }
      }

      //only save when a user adds it. don't for when we lookup a pair and find he asset.
      if (save) {
        let localBaseAssets = this.getLocalAssets();
        localBaseAssets = [...localBaseAssets, token];
        localStorage.setItem(
          "stableSwap-assets",
          JSON.stringify(localBaseAssets)
        );

        const baseAssets = this.getStore("baseAssets");
        const storeBaseAssets = [...baseAssets, token];
        this.setStore({ baseAssets: storeBaseAssets });
        this.emitter.emit(ACTIONS.BASE_ASSETS_UPDATED, storeBaseAssets);
      }
      return tokens;
    } catch (ex) {
      ////////console.log(ex);
      // this.emitter.emit(ACTIONS.ERROR, ex)
      return null;
    }
  };

  // DISPATCHER FUNCTIONS
  configure = async (payload) => {
    const start = Date.now();
    try {
      const account = stores.accountStore.getStore("account");
      this.setStore({ govToken: this._getGovTokenBase() });
      this.setStore({ veToken: this._getVeTokenBase() });
      this.setStore({ baseAssets: await this._getBaseAssets() });
      this.setStore({ updateDate: await stores.helper.getActivePeriod() });
      this.setStore({ pairs: await this._getPairs() });
      this.setStore({ pairtokenAssets: await this._getPairTokenAssets() });
      //this.setStore({ routeAssets: await this._getRouteAssets() });
      // this.setStore({ tvl: await stores.helper.getCurrentTvl() });
      // this.setStore({
      //   circulatingSupply: await stores.helper.getCirculatingSupply(), // TODO move to api
      // });
      // this.setStore({
      //   marketCap: await stores.helper.getMarketCap(), // TODO move to api
      // });
      ////console.log("config Pairs", this.getStore("pairs"));
      const isSupported = stores.accountStore.getStore("chainInvalid");
      this.emitter.emit(ACTIONS.UPDATED);
      if (!account.address || isSupported) {
        this.emitter.emit(ACTIONS.CONFIGURE_DONE);
      }
      this.emitter.emit(ACTIONS.CONFIGURED_SS);
      setTimeout(() => {
        this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
      }, 1);
      const end = Date.now();
      //console.log("configue time ", (end - start) / 1000);
    } catch (ex) {
      ////////console.log(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getBaseAssets = async () => {
    try {
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_API}/api/v1/assets`,
      //   {
      //     method: 'get',
      //     headers: {
      //       Authorization: `Basic ${process.env.NEXT_PUBLIC_API_TOKEN}`
      //     }
      //   }
      // )
      // const baseAssetsCall = await response.json()
      let baseAssets = tokenlist;

      // const set = new Set<string>(baseAssets.map((asset) => asset.symbol));
      // if (!set.has(NATIVE_TOKEN.symbol)) baseAssets.unshift(NATIVE_TOKEN);

      // baseAssets.unshift(NATIVE_TOKEN)

      let localBaseAssets = this.getLocalAssets();
      return [...baseAssets, ...localBaseAssets];
    } catch (ex) {
      ////////console.log(ex);
      return [];
    }
  };

  // _getRouteAssets = async () => {
  //   try {
  //     const host =
  //       window.location.hostname === "localhost"
  //         ? "http://43.200.19.230:8003/api/v1/configuration"
  //         : "/del/api/v1/configuration";
  //     const response = await fetch(host);
  //     const data = await response.json();
  //     const routeAssetsCall = data.data;
  //     //console.log("routeAssetsCall", routeAssetsCall)
  //     //console.log("baseAssets",this.getStore("baseAssets"))
  //     //console.log("pairtokenAssets",this.getStore("pairtokenAssets"))
  //     return routeAssetsCall;
  //   } catch (ex) {
  //     ////////console.log(ex);
  //     return [];
  //   }
  // };

  _getPairs = async () => {
    const start = Date.now();

    try {
      let pairs: Pair[] = [];
      const prices = new Map();
      // const isPairs = this.getStore("pairs")
      // if (isPairs.length > 0) {
      //   ////console.log("retuirn ispairs",isPairs)
      //   return isPairs
      // }
      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }
      const factoryContract = new web3.eth.Contract(
        CONTRACTS.FACTORY_ABI as AbiItem[],
        CONTRACTS.FACTORY_ADDRESS
      );
      const voterContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      );

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const allPairsLength = await factoryContract.methods
        .allPairsLength()
        .call();
      ////console.log("allPairsLength", allPairsLength)
      const calls = Array.from({ length: allPairsLength }, (_, idx) => ({
        target: CONTRACTS.FACTORY_ADDRESS,
        callData: factoryContract.methods.allPairs(idx).encodeABI(),
      }));

      const aggregateRes1 = await multicallContract.methods
        .aggregate(calls)
        .call();

      const returnData = aggregateRes1.returnData;

      const pairlist = returnData.map(
        (hexValue) => "0x" + hexValue.substring(26)
      );

      const calls2 = pairlist.map((pair) => {
        const pairContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair
        );

        const symbol = pairContract.methods.symbol().encodeABI();
        const decimals = pairContract.methods.decimals().encodeABI();
        const stable = pairContract.methods.stable().encodeABI();
        const token0_address = pairContract.methods.token0().encodeABI();
        const token1_address = pairContract.methods.token1().encodeABI();
        const gauge_address = voterContract.methods.gauges(pair).encodeABI();
        const reserves = pairContract.methods.getReserves().encodeABI();

        return [
          {
            target: pair,
            callData: symbol,
          },
          {
            target: pair,
            callData: decimals,
          },
          {
            target: pair,
            callData: stable,
          },
          {
            target: pair,
            callData: token0_address,
          },
          {
            target: pair,
            callData: token1_address,
          },
          {
            target: CONTRACTS.VOTER_ADDRESS,
            callData: gauge_address,
          },
          {
            target: pair,
            callData: reserves,
          },
        ];
      });

      const flattenedCalls = [].concat(...calls2);

      const aggregateRes2 = await multicallContract.methods
        .aggregate(flattenedCalls)
        .call();

      const hexValues = aggregateRes2.returnData;
      const ps = await Promise.all(
        pairlist.map(async (pair, index) => {
          const start = Date.now();
          const cnt = index * 7;
          const symbol = web3.eth.abi.decodeParameter("string", hexValues[cnt]);

          const encodedData = [
            hexValues[cnt + 1],
            hexValues[cnt + 2],
            hexValues[cnt + 3],
            hexValues[cnt + 4],
            hexValues[cnt + 5],
          ];
          const encodedDataString =
            "0x" + encodedData.map((value) => value.slice(2)).join("");
          const types = ["uint8", "bool", "address", "address", "address"];
          const others = web3.eth.abi.decodeParameters(
            types,
            encodedDataString
          );

          const types1 = ["uint256", "uint256", "uint256"];
          const encodedData2 = hexValues[cnt + 6];
          const reserves = web3.eth.abi.decodeParameters(types1, encodedData2);
          const repairs: Pair = {
            address: pair,
            symbol: symbol.slice(5),
            decimals: Number(others[0]),
            stable: others[1],
            token0_address: others[2],
            token1_address: others[3],
            gauge_address: others[4],
          };
          const token0 = await this.getTokenInfo(web3, repairs.token0_address);
          const token1 = await this.getTokenInfo(web3, repairs.token1_address);
          prices.set(token0.address.toLowerCase(), token0.price);
          prices.set(token1.address.toLowerCase(), token1.price);

          repairs.token0 = token0;
          repairs.token1 = token1;

          repairs.reserve0 = reserves[0] / 10 ** token0.decimals;
          repairs.reserve1 = reserves[1] / 10 ** token1.decimals;

          let tvl = 0;
          if (token0.price && token0.price !== 0) {
            tvl += repairs.reserve0 * token0.price;
            //////////console.log("token0 tvl", tvl);
          }
          if (token1.price && token1.price !== 0) {
            tvl += repairs.reserve1 * token1.price;
            //////////console.log("token1 tvl", tvl);
          }

          if (tvl !== 0 && (token0.price === 0 || token1.price === 0)) {
            tvl = tvl * 2;
            //////////console.log("token2 tvl", tvl);
          }
          ////console.log("pair tvl", tvl);
          repairs.tvl = tvl;

          if (repairs.gauge_address.toLowerCase() === ZERO_ADDRESS) {
            repairs.gauge_address = "";
          } else {
            const gauge = await this.getGaugeInfo(
              web3,
              repairs.gauge_address,
              pair
            );
            repairs.gauge = gauge;
          }
          ////console.log("repairs", repairs);
          pairs.push(repairs);
          const end = Date.now();
          ////////console.log("time of all", (end - start) / 1000);
        })
      );

      this.setStore({ tokenPrices: prices });
      //console.log("tokenPrices", prices);
      const end = Date.now();
      //console.log("time in _getpairs", (end - start) / 1000);
      return pairs;
    } catch (ex) {
      ////////console.log(ex);
      return [];
    }
  };

  getTokenInfo = async (web3, address) => {
    const tokenContract = new web3.eth.Contract(
      CONTRACTS.TOKEN_ABI as AbiItem[],
      address
    );

    const multicallContract = new web3.eth.Contract(
      CONTRACTS.MULTICALL_ABI as AbiItem[],
      CONTRACTS.MULTICALL_ADDRESS
    );

    const routerContract = new web3.eth.Contract(
      CONTRACTS.ROUTER_ABI as AbiItem[],
      CONTRACTS.ROUTER_ADDRESS
    );

    const calls = [
      {
        target: address,
        callData: tokenContract.methods.name().encodeABI(),
      },
      {
        target: address,
        callData: tokenContract.methods.symbol().encodeABI(),
      },
      {
        target: address,
        callData: tokenContract.methods.decimals().encodeABI(),
      },
    ];

    const aggregateRes1 = await multicallContract.methods
      .aggregate(calls)
      .call();

    const hexValues = aggregateRes1.returnData;
    const name = web3.eth.abi.decodeParameter("string", hexValues[0]);
    const symbol = web3.eth.abi.decodeParameter("string", hexValues[1]);
    const decimals = web3.eth.abi.decodeParameter("uint8", hexValues[2]);
    let logoURL = "";

    const token: RouteAsset = {
      name: String(name),
      price: 0,
      address: address,
      symbol: String(symbol),
      decimals: Number(decimals),
    };

    if (token.symbol) {
      let modifiedSymbol = token.symbol.toLowerCase();

      if (modifiedSymbol.startsWith("test")) {
        modifiedSymbol = modifiedSymbol.slice(4);
        logoURL = `https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/${modifiedSymbol}.jpg`;
      } else if (modifiedSymbol === "easy") {
        logoURL = "/tokens/govToken-logo.png";
      } else if (modifiedSymbol === "weth") {
        logoURL = "/tokens/weth.png";
      } else {
        logoURL = `https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/${modifiedSymbol}.jpg`;
      }
    }
    token.logoURI = logoURL;
    ////console.log("Number(decimals)", Number(decimals));
    token.price = await stores.helper.getTokenPrice(token);
    ////console.log("token.price", token.price, token.symbol);
    return token;
  };

  getGaugeInfo = async (web3, address, pair_add) => {
    const contracts = {
      gauge: new web3.eth.Contract(CONTRACTS.GAUGE_ABI as AbiItem[], address),
      multicall: new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      ),
      voter: new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      ),
      minter: new web3.eth.Contract(
        CONTRACTS.MINTER_ABI as AbiItem[],
        CONTRACTS.MINTER_ADDRESS
      ),
      veToken: new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      ),
    };

    const calls = [
      {
        target: address,
        callData: contracts.gauge.methods
          .rewardRate(CONTRACTS.GOV_TOKEN_ADDRESS)
          .encodeABI(),
      },
      {
        target: address,
        callData: contracts.gauge.methods.external_bribe().encodeABI(),
      },
      {
        target: address,
        callData: contracts.gauge.methods.internal_bribe().encodeABI(),
      },
    ];

    const aggregateRes1 = await contracts.multicall.methods
      .aggregate(calls)
      .call();
    const hexValues = aggregateRes1.returnData;

    const rewardRate = web3.eth.abi.decodeParameter("uint256", hexValues[0]);
    const external_bribe = web3.eth.abi.decodeParameter(
      "address",
      hexValues[1]
    );
    const internal_bribe = web3.eth.abi.decodeParameter(
      "address",
      hexValues[2]
    );
    const reward = ((Number(rewardRate) / 10 ** 18) * 86400) / 168;

    // const [bribe, Fee] = await Promise.all([
    //   this.getBribeInfo(external_bribe),
    //   this.getFeeInfo(address, pair_add),
    // ]);

    //const Fee = this.getFeeInfo(address, pair_add)

    const gauge: Pair["gauge"] = {
      // exists only if gauge_address is not empty
      decimals: 18,
      tbv: 0,
      votes: 0,
      address: address,
      total_supply: 0,
      totalSupply: "",
      bribe_address: String(external_bribe),
      fees_address: String(internal_bribe),
      fees: 0,
      reward: reward,
      bribes: [],
    };

    return gauge;
  };

  getBribeInfo = async (web3, address) => {
    const start = Date.now();

    //////console.log("bribe add in info", address)
    const bribeContract = new web3.eth.Contract(
      CONTRACTS.WE_BRIBE_FACTORY_ABI as AbiItem[],
      address
    );

    const multicallContract = new web3.eth.Contract(
      CONTRACTS.MULTICALL_ABI as AbiItem[],
      CONTRACTS.MULTICALL_ADDRESS
    );

    const tokenLen = parseInt(
      await bribeContract.methods.rewardsListLength().call()
    );

    const calls = Array.from({ length: tokenLen }, (_, idx) => ({
      target: address,
      callData: bribeContract.methods.rewards(idx).encodeABI(),
    }));

    const aggregateRes1 = await multicallContract.methods
      .aggregate(calls)
      .call();
    const BribeList = aggregateRes1.returnData.map(
      (hexValue) => "0x" + hexValue.substring(26)
    );
    //////console.log("BribeList", BribeList, address)
    const calls2 = BribeList.map((Bribe) => ({
      target: address,
      callData: bribeContract.methods.left(Bribe).encodeABI(),
    }));

    const aggregateRes2 = await multicallContract.methods
      .aggregate(calls2)
      .call();

    const bribeLeft = aggregateRes2.returnData.map((bribe) =>
      web3.eth.abi.decodeParameter("uint256", bribe)
    );
    //////console.log("bribeLeft", bribeLeft)
    const resultPromises = bribeLeft.map(async (bribeAmount, idx) => {
      //if (bribeAmount > 0) {
      const token = await this.getTokenInfo(web3, BribeList[idx]);
      const rewardAmount = bribeAmount / 10 ** token.decimals;

      return [token, rewardAmount];
      //}
    });
    //////console.log("resultPromises", resultPromises)
    const result = await Promise.all(resultPromises);
    //////console.log("resultresult", result)
    const filteredResult = result.filter((item) => item !== undefined);
    const end = Date.now();
    //////console.log("time in Bribe: ", (end - start) / 1000);
    return filteredResult.map((res) => ({
      token: res[0],
      rewardAmount: res[1],
    }));
  };

  getFeeInfo = async (web3, address, pair_add) => {
    if (!web3) return; //////console.warn("web3 not found", null);

    const gaugeContract = new web3.eth.Contract(
      CONTRACTS.GAUGE_ABI as AbiItem[],
      address
    );
    const pairContract = new web3.eth.Contract(
      CONTRACTS.PAIR_ABI as AbiItem[],
      pair_add
    );
    const multicallContract = new web3.eth.Contract(
      CONTRACTS.MULTICALL_ABI as AbiItem[],
      CONTRACTS.MULTICALL_ADDRESS
    );

    const calls = [
      { target: address, callData: gaugeContract.methods.fees0().encodeABI() },
      { target: address, callData: gaugeContract.methods.fees1().encodeABI() },
      { target: pair_add, callData: pairContract.methods.token0().encodeABI() },
      { target: pair_add, callData: pairContract.methods.token1().encodeABI() },
    ];

    const aggregateRes1 = await multicallContract.methods
      .aggregate(calls)
      .call();
    const hexValues = aggregateRes1.returnData;

    const fee0 = web3.eth.abi.decodeParameter("uint256", hexValues[0]);
    const fee1 = web3.eth.abi.decodeParameter("uint256", hexValues[1]);
    const token0_address = web3.eth.abi.decodeParameter(
      "address",
      hexValues[2]
    );
    const token1_address = web3.eth.abi.decodeParameter(
      "address",
      hexValues[3]
    );

    const token0Contract = new web3.eth.Contract(
      CONTRACTS.TOKEN_ABI as AbiItem[],
      String(token0_address)
    );
    const token1Contract = new web3.eth.Contract(
      CONTRACTS.TOKEN_ABI as AbiItem[],
      String(token1_address)
    );

    const [token0_decimals, token1_decimals] = await Promise.all([
      token0Contract.methods.decimals().call(),
      token1Contract.methods.decimals().call(),
    ]);

    const routerContract = new web3.eth.Contract(
      CONTRACTS.ROUTER_ABI as AbiItem[],
      CONTRACTS.ROUTER_ADDRESS
    );

    let token0Price, token1Price;

    if (
      token0_address.toLowerCase() ===
      CONTRACTS.STABLE_TOKEN_ADDRESS.toLowerCase()
    ) {
      token0Price = 1;
      const token1PriceRes = await routerContract.methods
        .getAmountOut(
          BigNumber(1 * 10 ** token1_decimals).toFixed(),
          token1_address,
          CONTRACTS.STABLE_TOKEN_ADDRESS
        )
        .call();
      token1Price = token1PriceRes.amount / 10 ** 6;
    } else if (
      token1_address.toLowerCase() ===
      CONTRACTS.STABLE_TOKEN_ADDRESS.toLowerCase()
    ) {
      token1Price = 1;
      const token0PriceRes = await routerContract.methods
        .getAmountOut(
          BigNumber(1 * 10 ** token0_decimals).toFixed(),
          token0_address,
          CONTRACTS.STABLE_TOKEN_ADDRESS
        )
        .call();
      token0Price = token0PriceRes.amount / 10 ** 6;
    } else {
      const [token0PriceRes, token1PriceRes] = await Promise.all([
        routerContract.methods
          .getAmountOut(
            BigNumber(1 * 10 ** token0_decimals).toFixed(),
            token0_address,
            CONTRACTS.STABLE_TOKEN_ADDRESS
          )
          .call(),
        routerContract.methods
          .getAmountOut(
            BigNumber(1 * 10 ** token1_decimals).toFixed(),
            token1_address,
            CONTRACTS.STABLE_TOKEN_ADDRESS
          )
          .call(),
      ]);
      token0Price = token0PriceRes.amount / 10 ** 6;
      token1Price = token1PriceRes.amount / 10 ** 6;
    }

    const fee =
      (Number(fee0) / 10 ** token0_decimals) * token0Price +
      (Number(fee1) / 10 ** token1_decimals) * token1Price;

    return fee;
  };

  getPairTokenInfo = async (address) => {
    const baseAssets = this.getStore("baseAssets");

    const foundAsset = baseAssets.find((asset) => asset.address === address);

    if (foundAsset) {
      return foundAsset;
    } else {
      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const tokenContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        address
      );

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const owner = stores.accountStore.getStore("account");

      if (owner && owner.address) {
        const calls = [
          {
            target: address,
            callData: tokenContract.methods.symbol().encodeABI(),
          },
          {
            target: address,
            callData: tokenContract.methods
              .balanceOf(owner.address)
              .encodeABI(),
          },
          {
            target: address,
            callData: tokenContract.methods.name().encodeABI(),
          },
          {
            target: address,
            callData: tokenContract.methods.decimals().encodeABI(),
          },
        ];

        const aggregateRes1 = await multicallContract.methods
          .aggregate(calls)
          .call();

        const hexValues = aggregateRes1.returnData;

        const symbol = web3.eth.abi.decodeParameter("string", hexValues[0]);
        const balance = web3.eth.abi.decodeParameter("uint256", hexValues[1]);
        const name = web3.eth.abi.decodeParameter("string", hexValues[2]);
        const decimals = web3.eth.abi.decodeParameter("uint8", hexValues[3]);

        let logoURL = "";
        let modifiedSymbol = symbol.toLowerCase();
        if (symbol.startsWith("test")) {
          modifiedSymbol = modifiedSymbol.slice(4);
          logoURL = `https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/${modifiedSymbol}.jpg`;
        } else if (symbol.toLowerCase() === "easy") {
          logoURL = "/tokens/govToken-logo.png";
        } else {
          logoURL = `https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/${modifiedSymbol.toLowerCase()}.jpg`;
        }
        const balanceOf = new BigNumber(String(balance))
          .div(10 ** Number(decimals))
          .toFixed(Number(decimals));
        const newBaseAsset: BaseAsset = {
          address: address,
          symbol: String(symbol),
          name: String(name),
          decimals: Number(decimals),
          logoURI: logoURL,
          local: true,
          balance: balanceOf,
          isWhitelisted: false,
        };
        return newBaseAsset;
      }
    }
  };

  _getPairTokenAssets = async () => {
    try {
      const baseAssets = this.getStore("baseAssets");
      const pairs = this.getStore("pairs");
      const set = new Set();

      pairs.forEach((pair) => {
        set.add(pair.token0.address);
        set.add(pair.token1.address);
      });

      const uniqueAddresses = Array.from(set);

      const promises = uniqueAddresses.map(async (address) => {
        return await this.getPairTokenInfo(address);
      });

      const baseAssetsWeSwap = baseAssets.filter(
        (asset) => asset.symbol === "ETH"
      );

      const results = await Promise.all(promises);
      const weth = results.filter((asset) => asset.symbol === "WETH");
      if (weth.length === 0) {
        const baseWeth = baseAssets.filter((asset) => asset.symbol === "WETH");
        return [...baseAssetsWeSwap, ...baseWeth, ...results];
      }
      return [...baseAssetsWeSwap, ...results];
    } catch (ex) {
      ////////console.log(ex);
      return [];
    }
  };

  updateSwapAssets = () => {
    const baseAssets = this.getStore("baseAssets");
    const pairs = this.getStore("pairs");
    const set = new Set<string>();
    set.add(NATIVE_TOKEN.symbol);
    pairs.forEach((pair) => {
      set.add(pair.token0.address.toLowerCase());
      set.add(pair.token1.address.toLowerCase());
    });

    const baseAssetsWeSwap = baseAssets.filter((asset) =>
      set.has(asset.address.toLowerCase())
    );
    this.setStore({ swapAssets: baseAssetsWeSwap });
    this.emitter.emit(ACTIONS.SWAP_ASSETS_UPDATED, baseAssetsWeSwap);
  };

  _getGovTokenBase = () => {
    return {
      address: CONTRACTS.GOV_TOKEN_ADDRESS,
      name: CONTRACTS.GOV_TOKEN_NAME,
      symbol: CONTRACTS.GOV_TOKEN_SYMBOL,
      decimals: CONTRACTS.GOV_TOKEN_DECIMALS,
      logoURI: CONTRACTS.GOV_TOKEN_LOGO,
    };
  };

  _getVeTokenBase = () => {
    return {
      address: CONTRACTS.VE_TOKEN_ADDRESS,
      name: CONTRACTS.VE_TOKEN_NAME,
      symbol: CONTRACTS.VE_TOKEN_SYMBOL,
      decimals: CONTRACTS.VE_TOKEN_DECIMALS,
      logoURI: CONTRACTS.VE_TOKEN_LOGO,
    };
  };

  getBalances = async (payload) => {
    try {
      const start = Date.now();
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const currentChain = stores.accountStore.getStore("chainId");

      if (currentChain === 169) {
        this._getGovTokenInfo(web3, account);
        this._getBaseAssetInfo(web3, account);
        await this._getPairInfo(web3, account);
        this.emitter.emit(ACTIONS.CONFIGURE_DONE);
        const end = Date.now();
        // console.log("time in 169", (end - start) / 1000);
      } else {
        this._getGovTokenInfo(web3, account);
        this._getVestNFTs(web3, account);
        this._getBaseAssetInfo(web3, account);
        await this._getPairInfo(web3, account);
        this.emitter.emit(ACTIONS.CONFIGURE_DONE);
        const end = Date.now();
        //console.log("time", (end - start) / 1000);
      }
    } catch (ex) {
      //console.log(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getVestNFTs = async (web3, account) => {
    try {
      const veToken = this.getStore("veToken");
      const govToken = this.getStore("govToken");

      const vestingContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      const nftsLength = await vestingContract.methods
        .balanceOf(account.address)
        .call();

      const arr = Array.from({ length: parseInt(nftsLength) }, (_, idx) => idx);

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const calls = arr.map((idx) => ({
        target: CONTRACTS.VE_TOKEN_ADDRESS,
        callData: vestingContract.methods
          .tokenOfOwnerByIndex(account.address, idx)
          .encodeABI(),
      }));

      const aggregateRes1 = await multicallContract.methods
        .aggregate(calls)
        .call();

      const nftIds = aggregateRes1.returnData.map((data) => parseInt(data, 16));
      const calls2 = nftIds.flatMap((idx) => [
        {
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods.locked(idx).encodeABI(),
        },
        {
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods.balanceOfNFT(idx).encodeABI(),
        },
      ]);

      const aggregateRes2 = await multicallContract.methods
        .aggregate(calls2)
        .call();

      const locked = aggregateRes2.returnData.filter(
        (_, index) => index % 2 === 0
      );
      const balanceOfNFT = aggregateRes2.returnData.filter(
        (_, index) => index % 2 !== 0
      );

      const parsedLocked = locked.map((data) => {
        const amountHex = data.slice(2, 66);
        const endHex = data.slice(71);
        const amountDec = new BigNumber(amountHex, 16)
          .div(10 ** govToken.decimals)
          .toFixed(govToken.decimals);
        const endDec = parseInt(endHex, 16);
        return { amount: amountDec, end: endDec };
      });

      const parsedBalanceOfNFT = balanceOfNFT.map((data) => {
        return new BigNumber(data, 16)
          .div(10 ** veToken.decimals)
          .toFixed(veToken.decimals);
      });

      const nfts = nftIds.map((id, idx) => {
        return {
          id: id,
          lockEnds: parsedLocked[idx].end,
          lockAmount: parsedLocked[idx].amount,
          lockValue: parsedBalanceOfNFT[idx],
        };
      });

      this.setStore({ vestNFTs: nfts });
      this.emitter.emit(ACTIONS.UPDATED);
    } catch (ex) {
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getGovTokenInfo = async (web3, account) => {
    try {
      const govToken = this.getStore("govToken");
      if (!govToken) {
        //////console.warn("govToken not found");
        return null;
      }
      const govTokenContract = new web3.eth.Contract(
        CONTRACTS.GOV_TOKEN_ABI,
        CONTRACTS.GOV_TOKEN_ADDRESS
      );

      const [balanceOf] = await Promise.all([
        govTokenContract.methods.balanceOf(account.address).call(),
      ]);
      govToken.balanceOf = balanceOf;
      govToken.balance = BigNumber(balanceOf)
        .div(10 ** govToken.decimals)
        .toFixed(18);

      this.setStore({ govToken });
      //console.log("_getGovTokenInfo");
      this.emitter.emit(ACTIONS.UPDATED);

      //this._getVestNFTs(web3, account);
    } catch (ex) {
      ////////console.log(ex);
    }
  };

  //TODO: make it works on backend
  _getPairInfo = async (web3, account, overridePairs?) => {
    try {
      let pairs: Pair[] = [];

      if (overridePairs) {
        pairs = overridePairs;
      } else {
        pairs = this.getStore("pairs");
      }

      const gaugesContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI,
        CONTRACTS.VOTER_ADDRESS
      );

      const totalWeight = await gaugesContract.methods.totalWeight().call();
      ////console.log("pairs in getPairinfo", pairs);
      const ps = await Promise.all(
        pairs.map(async (pair) => {
          try {
            const pairContract = new web3.eth.Contract(
              CONTRACTS.PAIR_ABI,
              pair.address
            );

            // const token0 = await this.getBaseAsset(
            //   pair.token0.address,
            //   true,
            //   true
            // );
            // const token1 = await this.getBaseAsset(
            //   pair.token1.address,
            //   true,
            //   true
            // );

            const token0 = await this.getBaseAsset(pair.token0, false, true);
            const token1 = await this.getBaseAsset(pair.token1, false, true);

            ////console.log("tokens", token0.symbol, token1.symbol, token0, token1);
            const multicallContract = new web3.eth.Contract(
              CONTRACTS.MULTICALL_ABI as AbiItem[],
              CONTRACTS.MULTICALL_ADDRESS
            );

            const calls = [
              {
                target: pair.address,
                callData: pairContract.methods.totalSupply().encodeABI(),
              },
              {
                target: pair.address,
                callData: pairContract.methods.getReserves().encodeABI(),
              },
              {
                target: pair.address,
                callData: pairContract.methods
                  .balanceOf(account.address)
                  .encodeABI(),
              },
              {
                target: pair.address,
                callData: pairContract.methods
                  .claimable0(account.address)
                  .encodeABI(),
              },
              {
                target: pair.address,
                callData: pairContract.methods
                  .claimable1(account.address)
                  .encodeABI(),
              },
              {
                target: pair.address,
                callData: pairContract.methods.fees().encodeABI(),
              },
            ];

            const aggregateRes1 = await multicallContract.methods
              .aggregate(calls)
              .call();
            const hexValues = aggregateRes1.returnData;

            const types1 = ["uint256", "uint256", "uint256"];
            const totalSupply = web3.eth.abi.decodeParameter(
              "uint256",
              hexValues[0]
            );
            const reserves = web3.eth.abi.decodeParameters(
              types1,
              hexValues[1]
            );
            const balanceOf = web3.eth.abi.decodeParameter(
              "uint256",
              hexValues[2]
            );
            const claimable0 = web3.eth.abi.decodeParameter(
              "uint256",
              hexValues[3]
            );
            const claimable1 = web3.eth.abi.decodeParameter(
              "uint256",
              hexValues[4]
            );
            const Pairfees = web3.eth.abi.decodeParameter(
              "address",
              hexValues[5]
            );

            const token0Contract = new web3.eth.Contract(
              CONTRACTS.ERC20_ABI as AbiItem[],
              pair.token0.address
            );
            const token1Contract = new web3.eth.Contract(
              CONTRACTS.ERC20_ABI as AbiItem[],
              pair.token1.address
            );

            // if (pair.gauge) {
            //   const gaugeContract = new web3.eth.Contract(
            //     CONTRACTS.GAUGE_ABI as AbiItem[],
            //     pair.gauge_address
            //   );
            //   const calls2 = [
            //     {
            //       target: pair.address,
            //       callData: pairContract.methods.claimable0(pair.gauge_address).encodeABI(),
            //     },
            //     {
            //       target: pair.address,
            //       callData: pairContract.methods.claimable1(pair.gauge_address).encodeABI(),
            //     },
            //   ];
            //   const aggregateRes2 = await multicallContract.methods
            //   .aggregate(calls2).call();
            //   const hexValues2 = aggregateRes2.returnData;
            //   const bal0 = parseInt(hexValues2[0], 16)
            //   const bal1 = parseInt(hexValues2[1], 16)
            //   ////////console.log("bal0bal0", bal0, bal1, pair.symbol)
            //   ////////console.log("bal0bal0", hexValues2[0], hexValues2[1], pair.symbol)
            //   const res0 = await pairContract.methods.claimable1(pair.gauge_address).call()
            //   ////////console.log("res0", res0)
            // }

            let pair_white = false;
            if (token0.isWhitelisted && token1.isWhitelisted) {
              pair_white = true;
            }

            const tokenPrices = stores.stableSwapStore.getStore("tokenPrices");
            const price0 = tokenPrices.get(pair.token0.address.toLowerCase());
            const price1 = tokenPrices.get(pair.token1.address.toLowerCase());

            // const calls2 = [
            //   {
            //     target: token0.address,
            //     callData: token0Contract.methods
            //       .balanceOf(Pairfees)
            //       .encodeABI(),
            //   },
            //   {
            //     target: token1.address,
            //     callData: token1Contract.methods
            //       .balanceOf(Pairfees)
            //       .encodeABI(),
            //   },
            // ];
            // const aggregateRes2 = await multicallContract.methods
            //   .aggregate(calls2)
            //   .call();
            // const hexValues2 = aggregateRes2.returnData;
            // const bal0 = web3.eth.abi.decodeParameter("uint256", hexValues2[0]);
            // const bal1 = web3.eth.abi.decodeParameter("uint256", hexValues2[1]);

            // const host =
            //   window.location.hostname === "localhost"
            //     ? `http://localhost:8000/getTotalFee/${pair.address}` //`http://43.200.19.230:8000/getTotalFee/${pair.address}`
            //     : `/del/getTotalFee/${pair.address}`;

            // const response = await fetch(host);
            // const data = await response.json();
            // const totalFee0 = data.totalFee0 / 10 ** token0.decimals;
            // const totalFee1 = data.totalFee1 / 10 ** token1.decimals;
            // const startTime = data.startTime;
            // const currentTimestamp = Math.floor(Date.now() / 1000);
            // const time = (currentTimestamp - startTime) / 86400;
            // if (pair.gauge) {
            //   const govPrice = tokenPrices.get(
            //     CONTRACTS.GOV_TOKEN_ADDRESS.toLowerCase()
            //   );
            //   // pair.apr =
            //   //   ((pair.gauge.reward * govPrice) / pair.tvl) * 100 * 365;
            //   pair.apr =
            //     (((totalFee0 * price0 + totalFee1 * price1) / pair.tvl) *
            //       100 *
            //       365) /
            //     time;
            //   pair.gauge.fees = totalFee0 * price0 + totalFee1 * price1;
            // } else {
            //   pair.apr =
            //     (((totalFee0 * price0 + totalFee1 * price1) / pair.tvl) *
            //       100 *
            //       365) /
            //     time;
            // }

            pair.token0 = token0 != null ? token0 : pair.token0;
            pair.token1 = token1 != null ? token1 : pair.token1;
            pair.balance = BigNumber(balanceOf)
              .div(10 ** pair.decimals)
              .toFixed(pair.decimals);
            pair.totalSupply = BigNumber(totalSupply)
              .div(10 ** pair.decimals)
              .toFixed(pair.decimals);
            pair.reserve0 = BigNumber(reserves[0])
              .div(10 ** pair.token0.decimals)
              .toFixed(pair.token0.decimals);
            pair.reserve1 = BigNumber(reserves[1])
              .div(10 ** pair.token1.decimals)
              .toFixed(pair.token1.decimals);
            pair.claimable0 = BigNumber(claimable0)
              .div(10 ** pair.token0.decimals)
              .toFixed(pair.token0.decimals);
            pair.claimable1 = BigNumber(claimable1)
              .div(10 ** pair.token1.decimals)
              .toFixed(pair.token1.decimals);
            pair.pair_iswhitelisted = pair_white;
            return pair;
          } catch (ex) {
            ////////console.log("EXCEPTION 1");
            ////////console.log("pair", pair);
            ////////console.log(ex);
            return pair;
          }
        })
      );

      this.setStore({ pairs: ps });
      ////////console.log("_getPairInfo");
      //this.emitter.emit(ACTIONS.UPDATED);

      // TODO make api calculate valid token prices and send it pack to us so we can just assign it
      const tokensPricesMap = new Map<string, RouteAsset>();
      for (const pair of ps) {
        if (pair.gauge?.bribes) {
          for (const bribe of pair.gauge.bribes) {
            if (bribe.token) {
              tokensPricesMap.set(
                bribe.token.address.toLowerCase(),
                bribe.token
              );
            }
          }
        }
      }

      // TODO understand api token prices
      // stores.helper.setTokenPricesMap(tokensPricesMap);
      await Promise.all(
        [...tokensPricesMap.values()].map(
          async (token) => await stores.helper.updateTokenPrice(token)
        )
      );
      ////console.log("priceMap", tokensPricesMap);
      const ps1 = await Promise.all(
        ps.map(async (pair) => {
          try {
            if (pair.gauge && pair.gauge.address !== ZERO_ADDRESS) {
              const gaugeContract = new web3.eth.Contract(
                CONTRACTS.GAUGE_ABI,
                pair.gauge.address
              );
              const routerContract = new web3.eth.Contract(
                CONTRACTS.ROUTER_ABI as AbiItem[],
                CONTRACTS.ROUTER_ADDRESS
              );
              const minterContract = new web3.eth.Contract(
                CONTRACTS.MINTER_ABI as AbiItem[],
                CONTRACTS.MINTER_ADDRESS
              );
              const veContract = new web3.eth.Contract(
                CONTRACTS.VE_TOKEN_ABI as AbiItem[],
                CONTRACTS.VE_TOKEN_ADDRESS
              );
              const multicallContract = new web3.eth.Contract(
                CONTRACTS.MULTICALL_ABI as AbiItem[],
                CONTRACTS.MULTICALL_ADDRESS
              );

              ////console.log("bribe add", pair.symbol, pair.gauge.bribe_address);
              const bribere = await this.getBribeInfo(
                web3,
                pair.gauge.bribe_address
              );
              pair.gauge.bribes = bribere;
              ////console.log("bribere", bribere, pair.symbol);

              const calls = [
                {
                  target: pair.gauge.address,
                  callData: gaugeContract.methods.totalSupply().encodeABI(),
                },
                {
                  target: pair.gauge.address,
                  callData: gaugeContract.methods
                    .balanceOf(account.address)
                    .encodeABI(),
                },
                {
                  target: CONTRACTS.VOTER_ADDRESS,
                  callData: gaugesContract.methods
                    .weights(pair.address)
                    .encodeABI(),
                },
                {
                  target: CONTRACTS.MINTER_ADDRESS,
                  callData: minterContract.methods
                    .weekly_emission()
                    .encodeABI(),
                },
                {
                  target: CONTRACTS.VE_TOKEN_ADDRESS,
                  callData: veContract.methods.supply().encodeABI(),
                },
              ];

              const aggregateRes1 = await multicallContract.methods
                .aggregate(calls)
                .call();
              const hexValues = aggregateRes1.returnData;

              const totalSupply = web3.eth.abi.decodeParameter(
                "uint256",
                hexValues[0]
              );
              const gaugeBalance = web3.eth.abi.decodeParameter(
                "uint256",
                hexValues[1]
              );
              const gaugeWeight = web3.eth.abi.decodeParameter(
                "uint256",
                hexValues[2]
              );
              const weekly = web3.eth.abi.decodeParameter(
                "uint256",
                hexValues[3]
              );
              const supply = web3.eth.abi.decodeParameter(
                "uint256",
                hexValues[4]
              );

              const growth = await minterContract.methods
                .calculate_growth(weekly)
                .call();

              const apr = ((growth * 52) / Number(supply)) * 100;

              const bribes = pair.gauge.bribes.map((bribe) => {
                return [bribe.rewardAmount, bribe.token.price];
              });

              let votingApr = 0;
              const votes = BigNumber(gaugeWeight)
                .div(10 ** 18)
                .toNumber();

              const totalUSDValueOfBribes = bribes.reduce((acc, bribe) => {
                return acc + bribe[1] * bribe[0];
              }, 0);

              if (totalUSDValueOfBribes > 0) {
                const perVote = totalUSDValueOfBribes + pair.gauge.fees;
                const perVotePerYear = perVote * 52.179;
                const tokenPrices =
                  stores.stableSwapStore.getStore("tokenPrices");
                const govPrice = tokenPrices.get(
                  CONTRACTS.GOV_TOKEN_ADDRESS.toLowerCase()
                );
                if (govPrice > 0) {
                  votingApr =
                    votes > 0 ? (perVotePerYear / (votes * govPrice)) * 100 : 0;
                } else {
                  votingApr = 0;
                }
              }
              //console.log("VotingApr", votingApr, pair.gauge.fees, pair.symbol);
              pair.gauge.balance = BigNumber(gaugeBalance)
                .div(10 ** 18)
                .toFixed(18);
              pair.gauge.total_supply = BigNumber(totalSupply)
                .div(10 ** 18)
                .toNumber();
              ////console.log("totalSupply", totalSupply, BigNumber(totalSupply).div(10 ** 18).toNumber())
              pair.gauge.totalSupply = // String(Number(totalSupply) / 10 ** 18);
                pair.gauge.reserve0 =
                  Number(pair.totalSupply) > 0
                    ? BigNumber(pair.reserve0)
                        .times(pair.gauge.total_supply)
                        .div(pair.totalSupply)
                        .toFixed(pair.token0.decimals)
                    : "0";
              pair.gauge.reserve1 =
                Number(pair.totalSupply) > 0
                  ? BigNumber(pair.reserve1)
                      .times(pair.gauge.total_supply)
                      .div(pair.totalSupply)
                      .toFixed(pair.token1.decimals)
                  : "0";
              pair.gauge.weight = BigNumber(gaugeWeight)
                .div(10 ** 18)
                .toFixed(18);
              pair.gauge.weightPercent = BigNumber(gaugeWeight)
                .times(100)
                .div(totalWeight)
                .toFixed(2);
              pair.gauge.votingApr = apr + votingApr;
            }
            ////console.log("pair", pair.symbol, pair.gauge?.total_supply, pair.gauge?.balance)
            return pair;
          } catch (ex) {
            ////////console.log("EXCEPTION 2");
            ////////console.log(pair);
            ////////console.log(ex);
            return pair;
          }
        })
      );
      this.setStore({ pairs: ps1 });
      //console.log("_getPairInfo");
      this.emitter.emit(ACTIONS.UPDATED);
    } catch (ex) {
      ////////console.log(ex);
    }
  };

  _getBaseAssetInfo = async (web3, account) => {
    try {
      const baseAssets = this.getStore("baseAssets");
      if (!baseAssets) {
        //////console.warn("baseAssets not found");
        return null;
      }

      const voterContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI,
        CONTRACTS.VOTER_ADDRESS
      );
      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const baseAssetsBalances = await Promise.all(
        baseAssets.map(async (asset) => {
          try {
            if (asset.symbol === NATIVE_TOKEN.symbol) {
              let bal = await web3.eth.getBalance(account.address);

              return {
                balanceOf: bal,
                isWhitelisted: true,
              };
            }

            const assetContract = new web3.eth.Contract(
              CONTRACTS.ERC20_ABI,
              asset.address
            );

            const calls = [
              // {
              //   target: address,
              //   callData: tokenContract.methods.name().encodeABI(),
              // },
              {
                target: CONTRACTS.VOTER_ADDRESS,
                callData: voterContract.methods
                  .isWhitelisted(asset.address)
                  .encodeABI(),
              },
              {
                target: asset.address,
                callData: assetContract.methods
                  .balanceOf(account.address)
                  .encodeABI(),
              },
            ];

            const aggregateRes1 = await multicallContract.methods
              .aggregate(calls)
              .call();

            const hexValues = aggregateRes1.returnData;

            const isWhitelisted = web3.eth.abi.decodeParameter(
              "bool",
              hexValues[0]
            );
            const balanceOf = web3.eth.abi.decodeParameter(
              "uint256",
              hexValues[1]
            );

            return {
              balanceOf: balanceOf,
              isWhitelisted: isWhitelisted,
            };
          } catch (ex) {
            ////////console.log("EXCEPTION 3");
            ////////console.log(asset);
            ////////console.log(ex);
            return {
              balanceOf: "0",
              isWhitelisted: false,
            };
          }
        })
      );

      for (let i = 0; i < baseAssets.length; i++) {
        baseAssets[i].balance = BigNumber(baseAssetsBalances[i].balanceOf)
          .div(10 ** baseAssets[i].decimals)
          .toFixed(baseAssets[i].decimals);
        baseAssets[i].isWhitelisted = baseAssetsBalances[i].isWhitelisted;
      }

      this.setStore({ baseAssets });
      //console.log("_getBaseAssetInfo");
      this.emitter.emit(ACTIONS.UPDATED);
    } catch (ex) {
      ////////console.log(ex);
    }
  };

  searchBaseAsset = async (payload) => {
    try {
      let localBaseAssets = [];
      const localBaseAssetsString = localStorage.getItem("stableSwap-assets");
      if (localBaseAssetsString && localBaseAssetsString !== "") {
        localBaseAssets = JSON.parse(localBaseAssetsString);
      }

      const theBaseAsset = localBaseAssets.filter((as) => {
        return (
          as.address.toLowerCase() === payload.content.address.toLowerCase()
        );
      });
      if (theBaseAsset.length > 0) {
        this.emitter.emit(ACTIONS.ASSET_SEARCHED, theBaseAsset);
        return;
      }
      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }
      const baseAssetContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        payload.content.address
      );

      const [symbol, decimals, name] = await Promise.all([
        baseAssetContract.methods.symbol().call(),
        baseAssetContract.methods.decimals().call(),
        baseAssetContract.methods.name().call(),
      ]);

      const newBaseAsset = {
        address: payload.content.address,
        symbol: symbol,
        name: name,
        decimals: parseInt(decimals),
      };

      localBaseAssets = [...localBaseAssets, newBaseAsset];
      localStorage.setItem(
        "stableSwap-assets",
        JSON.stringify(localBaseAssets)
      );

      const baseAssets = this.getStore("baseAssets");
      const storeBaseAssets = [...baseAssets, ...localBaseAssets];

      this.setStore({ baseAssets: storeBaseAssets });

      this.emitter.emit(ACTIONS.ASSET_SEARCHED, newBaseAsset);
    } catch (ex) {
      ////////console.log(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  createPairStake = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const {
        token0,
        token1,
        amount0,
        amount1,
        isStable: stable,
        slippage,
      } = payload.content;

      let toki0 = token0.address;
      let toki1 = token1.address;
      if (token0.symbol === NATIVE_TOKEN.symbol) {
        toki0 = W_NATIVE_ADDRESS;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        toki1 = W_NATIVE_ADDRESS;
      }

      const factoryContract = new web3.eth.Contract(
        CONTRACTS.FACTORY_ABI as AbiItem[],
        CONTRACTS.FACTORY_ADDRESS
      );
      const pairFor = await factoryContract.methods
        .getPair(toki0, toki1, stable)
        .call();

      if (pairFor && pairFor != ZERO_ADDRESS) {
        await context.updatePairsCall(web3, account);
        this.emitter.emit(ACTIONS.ERROR, "Pair already exists");
        return null;
      }

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID();
      let allowance1TXID = this.getTXUUID();
      let depositTXID = this.getTXUUID();
      let createGaugeTXID = this.getTXUUID();
      let stakeAllowanceTXID = this.getTXUUID();
      let stakeTXID = this.getTXUUID();

      //DOD A CHECK FOR IF THE POOL ALREADY EXISTS
      const transactions = [];
      let allowance0 = "0";
      let allowance1 = "0";

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Create liquidity pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your pool allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
        if (token0.isWhitelisted && token1.isWhitelisted) {
          const createGauge = {
            uuid: createGaugeTXID,
            description: `Create gauge`,
            status: "WAITING",
          };
          transactions.splice(2, 0, createGauge);
        }
      } else if (token1.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Create liquidity pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your pool allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
        if (token0.isWhitelisted && token1.isWhitelisted) {
          const createGauge = {
            uuid: createGaugeTXID,
            description: `Create gauge`,
            status: "WAITING",
          };
          transactions.splice(2, 0, createGauge);
        }
      } else {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Create liquidity pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your pool allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
        if (token0.isWhitelisted && token1.isWhitelisted) {
          const createGauge = {
            uuid: createGaugeTXID,
            description: `Create gauge`,
            status: "WAITING",
          };
          transactions.splice(3, 0, createGauge);
        }
      }

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Create liquidity pool for ${token0.symbol}/${token1.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Pool Created",
        transactions: transactions,
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      if (token0.symbol !== NATIVE_TOKEN.symbol) {
        allowance0 = await this._getDepositAllowance(web3, token0, account);
        if (BigNumber(allowance0).lt(amount0)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allow the router to spend your ${token0.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allowance on ${token0.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance0 = MAX_UINT256;
      }

      if (token1.symbol !== NATIVE_TOKEN.symbol) {
        allowance1 = await this._getDepositAllowance(web3, token1, account);
        if (BigNumber(allowance1).lt(amount1)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allow the router to spend your ${token1.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allowance on ${token1.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance1 = MAX_UINT256;
      }

      let gasPrice = await stores.accountStore.getGasPrice();
      const allowanceCallsPromises = [];
      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token0.address
        );
        const amount = BigNumber(amount0)
          .times(10 ** token0.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance0TXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      if (BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token1.address
        );

        const amount = BigNumber(amount1)
          .times(10 ** token1.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance1TXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });
        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT DEPOSIT TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const sendAmount0 = BigNumber(amount0)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1 = BigNumber(amount1)
        .times(10 ** token1.decimals)
        .toFixed(0);
      const deadline = "" + moment().add(60, "seconds").unix();
      const sendAmount0Min = BigNumber(amount0)
        .times(sendSlippage)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1Min = BigNumber(amount1)
        .times(sendSlippage)
        .times(10 ** token1.decimals)
        .toFixed(0);
      let func = "addLiquidity";
      let params = [
        token0.address,
        token1.address,
        stable,
        sendAmount0,
        sendAmount1,
        sendAmount0Min,
        sendAmount1Min,
        account.address,
        deadline,
      ];
      let sendValue = null;
      if (token0.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token1.address,
          stable,
          sendAmount1,
          sendAmount1Min,
          sendAmount0Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount0;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token0.address,
          stable,
          sendAmount0,
          sendAmount0Min,
          sendAmount1Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount1;
      }
      //console.log("func", func);
      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );
      this._callContractWait(
        web3,
        routerContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        depositTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          // GET PAIR FOR NEWLY CREATED LIQUIDITY POOL
          let tok0 = token0.address;
          let tok1 = token1.address;
          if (token0.symbol === NATIVE_TOKEN.symbol) {
            tok0 = W_NATIVE_ADDRESS;
          }
          if (token1.symbol === NATIVE_TOKEN.symbol) {
            tok1 = W_NATIVE_ADDRESS;
          }
          const pairFor = await factoryContract.methods
            .getPair(tok0, tok1, stable)
            .call();

          // SUBMIT CREATE GAUGE TRANSACTION
          const gaugesContract = new web3.eth.Contract(
            CONTRACTS.VOTER_ABI as AbiItem[],
            CONTRACTS.VOTER_ADDRESS
          );

          this._callContractWait(
            web3,
            gaugesContract,
            "createGauge",
            [pairFor],
            account,
            gasPrice,
            null,
            null,
            createGaugeTXID,
            async (err) => {
              if (err) {
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              const gaugeAddress = await gaugesContract.methods
                .gauges(pairFor)
                .call();

              const pairContract = new web3.eth.Contract(
                CONTRACTS.PAIR_ABI as AbiItem[],
                pairFor
              );
              const gaugeContract = new web3.eth.Contract(
                CONTRACTS.GAUGE_ABI as AbiItem[],
                gaugeAddress
              );
              const multicallContract = new web3.eth.Contract(
                CONTRACTS.MULTICALL_ABI as AbiItem[],
                CONTRACTS.MULTICALL_ADDRESS
              );

              const calls2 = [
                {
                  target: pairFor,
                  callData: pairContract.methods
                    .balanceOf(account.address)
                    .encodeABI(),
                },
                {
                  target: pairFor,
                  callData: pairContract.methods.decimals().encodeABI(),
                },
                {
                  target: pairFor,
                  callData: pairContract.methods.symbol().encodeABI(),
                },
              ];

              const aggregateRes2 = await multicallContract.methods
                .aggregate(calls2)
                .call();

              const hexValues = aggregateRes2.returnData;

              const balanceOf = web3.eth.abi.decodeParameter(
                "uint256",
                hexValues[0]
              );
              const decimals = web3.eth.abi.decodeParameter(
                "uint8",
                hexValues[1]
              );
              const symbol = web3.eth.abi.decodeParameter(
                "string",
                hexValues[2]
              );
              const pair = {
                address: pairFor,
                decimals: Number(decimals),
                symbol: symbol,
                gauge: {
                  address: gaugeAddress,
                },
              };

              const stakeAllowance = await this._getStakeAllowance(
                web3,
                pair,
                account
              );

              if (
                BigNumber(stakeAllowance).lt(
                  BigNumber(String(balanceOf))
                    .div(10 ** pair.decimals)
                    .toFixed(18)
                )
              ) {
                this.emitter.emit(ACTIONS.TX_STATUS, {
                  uuid: stakeAllowanceTXID,
                  description: `Allow the router to spend your ${pair.symbol}`,
                });
              } else {
                this.emitter.emit(ACTIONS.TX_STATUS, {
                  uuid: stakeAllowanceTXID,
                  description: `Allowance on ${pair.symbol} sufficient`,
                  status: "DONE",
                });
              }

              const allowanceCallsPromise = [];
              const amount = BigNumber(String(balanceOf))
                .times(10 ** pair.decimals)
                .toFixed(0);
              if (
                BigNumber(stakeAllowance).lt(
                  BigNumber(String(balanceOf))
                    .div(10 ** pair.decimals)
                    .toFixed(18)
                )
              ) {
                const stakePromise = new Promise<void>((resolve, reject) => {
                  context._callContractWait(
                    web3,
                    pairContract,
                    "approve",
                    [gaugeAddress, balanceOf],
                    account,
                    gasPrice,
                    null,
                    null,
                    stakeAllowanceTXID,
                    (err) => {
                      if (err) {
                        reject(err);
                        return this.emitter.emit(ACTIONS.ERROR, err);
                      }

                      resolve();
                    }
                  );
                });

                allowanceCallsPromise.push(stakePromise);
              }

              const done = await Promise.all(allowanceCallsPromise);

              gasPrice = await stores.accountStore.getGasPrice();

              this._callContractWait(
                web3,
                gaugeContract,
                "deposit",
                [balanceOf, 0],
                account,
                gasPrice,
                null,
                null,
                stakeTXID,
                async (err) => {
                  if (err) {
                    return this.emitter.emit(ACTIONS.ERROR, err);
                  }

                  await context.updatePairsCall(web3, account);
                  this.emitter.emit(ACTIONS.PAIR_CREATED, pairFor);
                  context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
                }
              );
            }
          );
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  createPairDeposit = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const chainId = stores.accountStore.getStore("chainId");

      const {
        token0,
        token1,
        amount0,
        amount1,
        isStable: stable,
        slippage,
      } = payload.content;

      let toki0 = token0.address;
      let toki1 = token1.address;
      if (token0.symbol === NATIVE_TOKEN.symbol) {
        toki0 = W_NATIVE_ADDRESS;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        toki1 = W_NATIVE_ADDRESS;
      }

      const factoryContract = new web3.eth.Contract(
        CONTRACTS.FACTORY_ABI as AbiItem[],
        CONTRACTS.FACTORY_ADDRESS
      );
      const pairFor = await factoryContract.methods
        .getPair(toki0, toki1, stable)
        .call();

      if (pairFor && pairFor != ZERO_ADDRESS) {
        await context.updatePairsCall(web3, account);
        this.emitter.emit(ACTIONS.ERROR, "Pair already exists");
        return null;
      }

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID();
      let allowance1TXID = this.getTXUUID();
      let depositTXID = this.getTXUUID();
      let createGaugeTXID = this.getTXUUID();

      //DOD A CHECK FOR IF THE POOL ALREADY EXISTS
      const transactions = [];

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Create liquidity pool`,
            status: "WAITING",
          }
        );
      } else if (token1.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Create liquidity pool`,
            status: "WAITING",
          }
        );
      } else {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Create liquidity pool`,
            status: "WAITING",
          }
        );
      }

      if (token0.isWhitelisted && token1.isWhitelisted && chainId !== 169) {
        transactions.push({
          uuid: createGaugeTXID,
          description: `Create gauge`,
          status: "WAITING",
        });
      }

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Create liquidity pool for ${token0.symbol}/${token1.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Pool Created",
        transactions: transactions,
      });

      let allowance0 = "0";
      let allowance1 = "0";

      // CHECK ALLOWANCES AND SET TX DISPLAY
      if (token0.symbol !== NATIVE_TOKEN.symbol) {
        allowance0 = await this._getDepositAllowance(web3, token0, account);
        if (BigNumber(allowance0).lt(amount0)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allow the router to spend your ${token0.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allowance on ${token0.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance0 = MAX_UINT256;
      }

      if (token1.symbol !== NATIVE_TOKEN.symbol) {
        allowance1 = await this._getDepositAllowance(web3, token1, account);
        if (BigNumber(allowance1).lt(amount1)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allow the router to spend your ${token1.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allowance on ${token1.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance1 = MAX_UINT256;
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      const tokenContract2 = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        token0.address
      );

      if (BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token0.address
        );

        const amount = BigNumber(amount0)
          .times(10 ** token0.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, String(amount)],
            account,
            gasPrice,
            null,
            null,
            allowance0TXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const tokenContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        token1.address
      );

      if (BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token1.address
        );

        const amount = BigNumber(amount1)
          .times(10 ** token1.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance1TXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT DEPOSIT TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const sendAmount0 = BigNumber(amount0)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1 = BigNumber(amount1)
        .times(10 ** token1.decimals)
        .toFixed(0);
      const deadline = "" + moment().add(60, "seconds").unix();
      const sendAmount0Min = BigNumber(amount0)
        .times(sendSlippage)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1Min = BigNumber(amount1)
        .times(sendSlippage)
        .times(10 ** token1.decimals)
        .toFixed(0);
      let func = "addLiquidity";
      let params = [
        token0.address,
        token1.address,
        stable,
        sendAmount0,
        sendAmount1,
        sendAmount0Min,
        sendAmount1Min,
        account.address,
        deadline,
      ];
      let sendValue = null;

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token1.address,
          stable,
          sendAmount1,
          sendAmount1Min,
          sendAmount0Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount0;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token0.address,
          stable,
          sendAmount0,
          sendAmount0Min,
          sendAmount1Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount1;
      }

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );
      this._callContractWait(
        web3,
        routerContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        depositTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          //GET PAIR FOR NEWLY CREATED LIQUIDITY POOL
          if (token0.isWhitelisted && token1.isWhitelisted) {
            let tok0 = token0.address;
            let tok1 = token1.address;
            if (token0.symbol === NATIVE_TOKEN.symbol) {
              tok0 = W_NATIVE_ADDRESS;
            }
            if (token1.symbol === NATIVE_TOKEN.symbol) {
              tok1 = W_NATIVE_ADDRESS;
            }
            const pairFor = await factoryContract.methods
              .getPair(tok0, tok1, stable)
              .call();

            // SUBMIT CREATE GAUGE TRANSACTION
            const gaugesContract = new web3.eth.Contract(
              CONTRACTS.VOTER_ABI as AbiItem[],
              CONTRACTS.VOTER_ADDRESS
            );
            this._callContractWait(
              web3,
              gaugesContract,
              "createGauge",
              [pairFor],
              account,
              gasPrice,
              null,
              null,
              createGaugeTXID,
              async (err) => {
                if (err) {
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                await context.updatePairsCall(web3, account);

                this.emitter.emit(ACTIONS.PAIR_CREATED, pairFor);
                context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
              }
            );
          } else {
            await context.updatePairsCall(web3, account);

            this.emitter.emit(ACTIONS.PAIR_CREATED, pairFor);
            context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
          }
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  updatePairsCall = async (web3, account) => {
    try {
      this.setStore({ pairs: await this._getPairs() });
      await this._getPairInfo(web3, account);
    } catch (ex) {
      ////////console.log(ex);
    }
  };

  sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  getTXUUID = () => {
    return uuidv4();
  };

  slpLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, single, amount, swapMin, slippage } = payload.content;
      //console.log("swapMinswapMin", swapMin);
      let allowanceTXID = this.getTXUUID();
      let depositTXID = this.getTXUUID();

      const transactions = [];
      let allowance = "0";
      if (single.symbol !== NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowanceTXID,
            description: `Checking your ${single.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          }
        );
      } else {
        transactions.push({
          uuid: depositTXID,
          description: `Deposit tokens in the pool`,
          status: "WAITING",
        });
      }

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Add liquidity to ${pair.symbol}`,
        verb: "Liquidity Added",
        type: "Liquidity",
        transactions: transactions,
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      if (single.symbol !== NATIVE_TOKEN.symbol) {
        allowance = await this._getDepositAllowance(web3, single, account, 1);

        if (BigNumber(allowance).lt(amount)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowanceTXID,
            description: `Allow the SLP to spend your ${single.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowanceTXID,
            description: `Allowance on ${single.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance = MAX_UINT256;
      }

      const allowanceCallsPromises = [];
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          single.address
        );
        const amount1 = BigNumber(amount)
          .times(10 ** single.decimals)
          .toFixed(0);
        const gasPrice = await stores.accountStore.getGasPrice();
        const tokenPromise = await new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.SLP_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      // SUBMIT DEPOSIT TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).times(100).toFixed();
      //const swapsli = BigNumber(100).minus(swapslippage).div(100).toFixed();
      const sendAmount = BigNumber(amount)
        .times(10 ** single.decimals)
        .toFixed();

      // Need to be Fixed, It should be tokenAmountOutMin
      // const sendAmountMin = BigNumber(amount)
      //   .times(swapsli)
      //   .times(10 ** single.decimals)
      //   .toFixed(0);

      const slpContract = new web3.eth.Contract(
        CONTRACTS.SLP_ABI as AbiItem[],
        CONTRACTS.SLP_ADDRESS
      );

      let func = "slpInToken";
      let params = [
        single.address,
        sendAmount,
        pair.address,
        swapMin,
        sendSlippage,
      ];
      let sendValue = null;

      if (single.symbol === NATIVE_TOKEN.symbol) {
        func = "slpInETH";
        params = [pair.address, swapMin, sendSlippage];
        sendValue = sendAmount;
      }
      ////console.log("slpContract", func, params, swapMin, sendSlippage);
      ////console.log("add", CONTRACTS.SLP_ADDRESS);
      const gasPrice = await stores.accountStore.getGasPrice();
      this._callContractWait(
        web3,
        slpContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        depositTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_ADDED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  slpaddLiquidityAndStake = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, single, amount, swapMin, slippage } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let depositTXID = this.getTXUUID();
      let stakeAllowanceTXID = this.getTXUUID();
      let stakeTXID = this.getTXUUID();

      const transactions = [];
      let allowance = "0";

      if (single.symbol !== NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowanceTXID,
            description: `Checking your ${single.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
      } else {
        transactions.push(
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
      }

      ////console.log("single", single);
      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Add liquidity to ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Added",
        transactions: transactions,
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      if (single.symbol !== NATIVE_TOKEN.symbol) {
        allowance = await this._getDepositAllowance(web3, single, account, 1);

        if (BigNumber(allowance).lt(amount)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowanceTXID,
            description: `Allow the SLP to spend your ${single.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowanceTXID,
            description: `Allowance on ${single.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance = MAX_UINT256;
      }

      const gasPrice = await stores.accountStore.getGasPrice();
      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          single.address
        );

        const amount1 = BigNumber(amount)
          .times(10 ** single.decimals)
          .toFixed(0);
        const tokenPromise = await new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.SLP_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      // SUBMIT DEPOSIT TRANSACTION
      // SUBMIT DEPOSIT TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).times(100).toFixed();
      const sendAmount = BigNumber(amount)
        .times(10 ** single.decimals)
        .toFixed();

      // TEST TXQ

      const slpContract = new web3.eth.Contract(
        CONTRACTS.SLP_ABI as AbiItem[],
        CONTRACTS.SLP_ADDRESS
      );
      const gaugeContract = new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );
      const pairContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI as AbiItem[],
        pair.address
      );

      let func = "slpInToken";
      let params = [
        single.address,
        sendAmount,
        pair.address,
        swapMin,
        sendSlippage,
      ];
      let sendValue = null;

      if (single.symbol === NATIVE_TOKEN.symbol) {
        func = "slpInETH";
        params = [pair.address, swapMin, sendSlippage];
        sendValue = sendAmount;
      }

      const beforebalanceOf = await pairContract.methods
        .balanceOf(account.address)
        .call();

      this._callContractWait(
        web3,
        slpContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        depositTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
          const stakeAllowance = await this._getStakeAllowance(
            web3,
            pair,
            account
          );

          const balanceOf = await pairContract.methods
            .balanceOf(account.address)
            .call();

          const balanceAmount = balanceOf - beforebalanceOf;
          const amount1 = BigNumber(balanceAmount).toFixed(0);
          if (
            BigNumber(stakeAllowance).lt(
              BigNumber(balanceAmount)
                .div(10 ** pair.decimals)
                .toFixed(pair.decimals)
            )
          ) {
            this.emitter.emit(ACTIONS.TX_STATUS, {
              uuid: stakeAllowanceTXID,
              description: `Allow the router to spend your ${pair.symbol}`,
            });
          } else {
            this.emitter.emit(ACTIONS.TX_STATUS, {
              uuid: stakeAllowanceTXID,
              description: `Allowance on ${pair.symbol} sufficient`,
              status: "DONE",
            });
          }

          if (
            BigNumber(stakeAllowance).lt(
              BigNumber(balanceAmount)
                .div(10 ** pair.decimals)
                .toFixed(pair.decimals)
            )
          ) {
            //check is it have to approve anytime

            const stakePromise = new Promise<void>((resolve, reject) => {
              context._callContractWait(
                web3,
                pairContract,
                "approve",
                [pair.gauge.address, amount1],
                account,
                gasPrice,
                null,
                null,
                stakeAllowanceTXID,
                (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  resolve();
                }
              );
            });

            allowanceCallsPromises.push(stakePromise);
          }

          const done = await Promise.all(allowanceCallsPromises);

          this._callContractWait(
            web3,
            gaugeContract,
            "deposit",
            [amount1, 0],
            account,
            gasPrice,
            null,
            null,
            stakeTXID,
            (err) => {
              if (err) {
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              this._getPairInfo(web3, account);

              this.emitter.emit(ACTIONS.ADD_LIQUIDITY_AND_STAKED);
              context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
            }
          );
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  slpRemoveNoneGaugeLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, token, amount, slippage, swapMin } = payload.content;

      let allowanceTXID = this.getTXUUID();
      let withdrawTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Remove liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Removed",
        transactions: [
          {
            uuid: allowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: withdrawTXID,
            description: `Withdraw tokens from the pool`,
            status: "WAITING",
          },
        ],
      });

      const allowance = await this._getWithdrawAllowance(
        web3,
        pair,
        account,
        CONTRACTS.SLP_ADDRESS
      );
      if (BigNumber(allowance).lt(pair.balance)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the router to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }
      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];
      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair.address
        );
        const amount1 = BigNumber(amount)
          .times(10 ** pair.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.SLP_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                ////////console.log(err);
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);
      const sendAmount = BigNumber(amount)
        .times(10 ** pair.decimals)
        .toFixed(0);
      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      // const sendMinAmountOut = BigNumber(sendAmount)
      //   .times(sendSlippage)
      //   .toFixed(0);
      // //console.log("sendMinAmountOut", sendMinAmountOut);
      //console.log("sendAmount", sendAmount, amount);
      const slpContract = new web3.eth.Contract(
        CONTRACTS.SLP_ABI as AbiItem[],
        CONTRACTS.SLP_ADDRESS
      );
      let func = "slpOutToken";
      let params = [pair.address, token.address, sendAmount, swapMin];

      if (token.symbol === NATIVE_TOKEN.symbol) {
        func = "slpOutETH";
        params = [pair.address, sendAmount, swapMin];
      }
      this._callContractWait(
        web3,
        slpContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        withdrawTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_REMOVED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  slpRemoveLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, token, swapMin } = payload.content;

      let allowanceTXID = this.getTXUUID();
      let withdrawTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Remove liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Removed",
        transactions: [
          {
            uuid: allowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: withdrawTXID,
            description: `Withdraw tokens from the pool`,
            status: "WAITING",
          },
        ],
      });

      const allowance = await this._getWithdrawAllowance(
        web3,
        pair,
        account,
        CONTRACTS.SLP_ADDRESS
      );
      if (BigNumber(allowance).lt(pair.balance)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the router to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }
      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];
      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(pair.balance)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair.address
        );
        const amount1 = BigNumber(pair.balance)
          .times(10 ** pair.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.SLP_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                ////////console.log(err);
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);
      const sendAmount = BigNumber(pair.balance)
        .times(10 ** pair.decimals)
        .toFixed(0);

      const slpContract = new web3.eth.Contract(
        CONTRACTS.SLP_ABI as AbiItem[],
        CONTRACTS.SLP_ADDRESS
      );
      let func = "slpOutToken";
      let params = [pair.address, token.address, sendAmount, swapMin];

      if (token.symbol === NATIVE_TOKEN.symbol) {
        func = "slpOutETH";
        params = [pair.address, sendAmount, swapMin];
      }
      this._callContractWait(
        web3,
        slpContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        withdrawTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_REMOVED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  slpUnstakeAndRemoveLiquidity = async (payload) => {
    try {
      const context = this;
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, amount, swapMin, tokenToReceive } = payload.content;

      // let allowanceTXID = this.getTXUUID();
      // {
      //   uuid: allowanceTXID,
      //   description: `Checking your ${pair.symbol} allowance`,
      //   status: "WAITING",
      // },

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let withdrawTXID = this.getTXUUID();
      let slpallowTXID = this.getTXUUID();
      let unstakeTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Remove liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Removed",
        transactions: [
          {
            uuid: slpallowTXID,
            description: `Checking your ${pair.symbol} allowance from SLP`,
            status: "WAITING",
          },
          {
            uuid: unstakeTXID,
            description: `Unstake LP tokens from the gauge`,
            status: "WAITING",
          },
          {
            uuid: withdrawTXID,
            description: `Withdraw tokens from the pool`,
            status: "WAITING",
          },
        ],
      });

      // // CHECK ALLOWANCES AND SET TX DISPLAY
      // const allowance = await this._getWithdrawAllowance(
      //   web3,
      //   pair,
      //   account,
      //   CONTRACTS.ROUTER_ADDRESS
      // );

      // if (BigNumber(allowance).lt(amount)) {
      //   this.emitter.emit(ACTIONS.TX_STATUS, {
      //     uuid: allowanceTXID,
      //     description: `Allow the SLP to spend your ${pair.symbol}`,
      //   });
      // } else {
      //   this.emitter.emit(ACTIONS.TX_STATUS, {
      //     uuid: allowanceTXID,
      //     description: `Allowance on ${pair.symbol} sufficient`,
      //     status: "DONE",
      //   });
      // }

      const gasPrice = await stores.accountStore.getGasPrice();

      //const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      // if (BigNumber(allowance).lt(amount)) {
      //   const tokenContract = new web3.eth.Contract(
      //     CONTRACTS.PAIR_ABI as AbiItem[],
      //     pair.address
      //   );

      //   const amount1 = BigNumber(amount)
      //     .times(10 ** pair.decimals)
      //     .toFixed(0);
      //   const tokenPromise = new Promise<void>((resolve, reject) => {
      //     context._callContractWait(
      //       web3,
      //       tokenContract,
      //       "approve",
      //       [CONTRACTS.ROUTER_ADDRESS, amount1],
      //       account,
      //       gasPrice,
      //       null,
      //       null,
      //       allowanceTXID,
      //       (err) => {
      //         if (err) {
      //           reject(err);
      //           return this.emitter.emit(ACTIONS.ERROR, err);
      //         }

      //         resolve();
      //       }
      //     );
      //   });

      //   allowanceCallsPromises.push(tokenPromise);
      // }

      // const done = await Promise.all(allowanceCallsPromises);

      const allowance2 = await this._getWithdrawAllowance(
        web3,
        pair,
        account,
        CONTRACTS.SLP_ADDRESS
      );

      if (BigNumber(allowance2).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: slpallowTXID,
          description: `Allow the SLP to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: slpallowTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }

      const allowanceCallsPromises2 = [];

      if (BigNumber(allowance2).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair.address
        );

        const amount1 = BigNumber(amount)
          .times(10 ** pair.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.SLP_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            slpallowTXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises2.push(tokenPromise);
      }

      const done2 = await Promise.all(allowanceCallsPromises2);

      // SUBMIT DEPOSIT TRANSACTION
      const sendAmount = BigNumber(amount)
        .times(10 ** pair.decimals)
        .toFixed(0);

      const gaugeContract = await new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );

      await this._callContractWait(
        web3,
        gaugeContract,
        "withdraw",
        [sendAmount],
        account,
        gasPrice,
        null,
        null,
        unstakeTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          const slpContract = new web3.eth.Contract(
            CONTRACTS.SLP_ABI as AbiItem[],
            CONTRACTS.SLP_ADDRESS
          );

          let func = "slpOutToken";
          let params = [
            pair.address,
            tokenToReceive.address,
            sendAmount,
            swapMin,
          ];

          if (tokenToReceive.symbol === NATIVE_TOKEN.symbol) {
            func = "slpOutETH";
            params = [pair.address, sendAmount, swapMin];
          }

          this._callContractWait(
            web3,
            slpContract,
            func,
            params,
            account,
            gasPrice,
            null,
            null,
            withdrawTXID,
            (err) => {
              if (err) {
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              this._getPairInfo(web3, account);

              this.emitter.emit(ACTIONS.LIQUIDITY_REMOVED);
              context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
            }
          );
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  addLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      ////console.log("web3 in addliauidity", web3);

      const { token0, token1, amount0, amount1, minLiquidity, pair, slippage } =
        payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID();
      let allowance1TXID = this.getTXUUID();
      let depositTXID = this.getTXUUID();

      const transactions = [];

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          }
        );
      } else if (token1.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          }
        );
      } else {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          }
        );
      }

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Add liquidity to ${pair.symbol}`,
        verb: "Liquidity Added",
        type: "Liquidity",
        transactions: transactions,
      });

      let allowance0 = "0";
      let allowance1 = "0";

      if (token0.symbol !== NATIVE_TOKEN.symbol) {
        allowance0 = await this._getDepositAllowance(web3, token0, account);
        if (BigNumber(allowance0).lt(amount0)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allow the router to spend your ${token0.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allowance on ${token0.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance0 = MAX_UINT256;
      }

      if (token1.symbol !== NATIVE_TOKEN.symbol) {
        allowance1 = await this._getDepositAllowance(web3, token1, account);
        if (BigNumber(allowance1).lt(amount1)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allow the router to spend your ${token1.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allowance on ${token1.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance1 = MAX_UINT256;
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token0.address
        );

        const amount = BigNumber(amount0)
          .times(10 ** token0.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance0TXID,
            (err) => {
              if (err) {
                ////////console.log(err);
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      if (BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token1.address
        );

        const amount = BigNumber(amount1)
          .times(10 ** token1.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance1TXID,
            (err) => {
              if (err) {
                ////////console.log(err);
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT DEPOSIT TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const sendAmount0 = BigNumber(amount0)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1 = BigNumber(amount1)
        .times(10 ** token1.decimals)
        .toFixed(0);
      const deadline = "" + moment().add(60, "seconds").unix();
      const sendAmount0Min = BigNumber(amount0)
        .times(sendSlippage)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1Min = BigNumber(amount1)
        .times(sendSlippage)
        .times(10 ** token1.decimals)
        .toFixed(0);

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );
      let func = "addLiquidity";
      let params = [
        token0.address,
        token1.address,
        pair.stable,
        sendAmount0,
        sendAmount1,
        sendAmount0Min,
        sendAmount1Min,
        account.address,
        deadline,
      ];
      let sendValue = null;

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token1.address,
          pair.stable,
          sendAmount1,
          sendAmount1Min,
          sendAmount0Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount0;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token0.address,
          pair.stable,
          sendAmount0,
          sendAmount0Min,
          sendAmount1Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount1;
      }

      this._callContractWait(
        web3,
        routerContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        depositTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_ADDED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  stakeLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair } = payload.content;

      let stakeAllowanceTXID = this.getTXUUID();
      let stakeTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Stake ${pair.symbol} in the gauge`,
        type: "Liquidity",
        verb: "Liquidity Staked",
        transactions: [
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          },
        ],
      });

      const stakeAllowance = await this._getStakeAllowance(web3, pair, account);

      const pairContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI as AbiItem[],
        pair.address
      );
      const balanceOf = await pairContract.methods
        .balanceOf(account.address)
        .call();

      if (
        BigNumber(stakeAllowance).lt(
          BigNumber(balanceOf).div(10 ** pair.decimals)
          // .toFixed(pair.decimals)
        )
      ) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: stakeAllowanceTXID,
          description: `Allow the router to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: stakeAllowanceTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      if (
        BigNumber(stakeAllowance).lt(
          BigNumber(balanceOf)
            .div(10 ** pair.decimals)
            .toFixed(pair.decimals)
        )
      ) {
        const stakePromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            pairContract,
            "approve",
            [pair.gauge.address, balanceOf],
            account,
            gasPrice,
            null,
            null,
            stakeAllowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(stakePromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      const gaugeContract = new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );

      this._callContractWait(
        web3,
        gaugeContract,
        "deposit",
        [balanceOf, 0],
        account,
        gasPrice,
        null,
        null,
        stakeTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_STAKED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  addLiquidityAndStake = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { token0, token1, amount0, amount1, minLiquidity, pair, slippage } =
        payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowance0TXID = this.getTXUUID();
      let allowance1TXID = this.getTXUUID();
      let depositTXID = this.getTXUUID();
      let stakeAllowanceTXID = this.getTXUUID();
      let stakeTXID = this.getTXUUID();

      const transactions = [];

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
      } else if (token1.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
      } else {
        transactions.push(
          {
            uuid: allowance0TXID,
            description: `Checking your ${token0.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: allowance1TXID,
            description: `Checking your ${token1.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: depositTXID,
            description: `Deposit tokens in the pool`,
            status: "WAITING",
          },
          {
            uuid: stakeAllowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: stakeTXID,
            description: `Stake LP tokens in the gauge`,
            status: "WAITING",
          }
        );
      }

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Add liquidity to ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Added",
        transactions: transactions,
      });

      let allowance0 = "0";
      let allowance1 = "0";

      // CHECK ALLOWANCES AND SET TX DISPLAY
      if (token0.symbol !== NATIVE_TOKEN.symbol) {
        allowance0 = await this._getDepositAllowance(web3, token0, account);
        if (BigNumber(allowance0).lt(amount0)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allow the router to spend your ${token0.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance0TXID,
            description: `Allowance on ${token0.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance0 = MAX_UINT256;
      }

      if (token1.symbol !== NATIVE_TOKEN.symbol) {
        allowance1 = await this._getDepositAllowance(web3, token1, account);
        if (BigNumber(allowance1).lt(amount1)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allow the router to spend your ${token1.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowance1TXID,
            description: `Allowance on ${token1.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        allowance1 = MAX_UINT256;
      }

      const gasPrice = await stores.accountStore.getGasPrice();
      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance0).lt(amount0)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token0.address
        );

        const amount = BigNumber(amount0)
          .times(10 ** token0.decimals)
          .toFixed(0);
        const tokenPromise = await new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance0TXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      if (BigNumber(allowance1).lt(amount1)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          token1.address
        );

        const amount = BigNumber(amount1)
          .times(10 ** token1.decimals)
          .toFixed(0);
        const tokenPromise = await new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount],
            account,
            gasPrice,
            null,
            null,
            allowance1TXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      // SUBMIT DEPOSIT TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const sendAmount0 = BigNumber(amount0)
        .times(10 ** Number(token0.decimals))
        .toFixed(0);
      const sendAmount1 = BigNumber(amount1)
        .times(10 ** token1.decimals)
        .toFixed(0);
      const deadline = "" + moment().add(60, "seconds").unix();
      const sendAmount0Min = BigNumber(amount0)
        .times(sendSlippage)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1Min = BigNumber(amount1)
        .times(sendSlippage)
        .times(10 ** token1.decimals)
        .toFixed(0);

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );
      const gaugeContract = new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );
      const pairContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI as AbiItem[],
        pair.address
      );

      let func = "addLiquidity";
      let params = [
        token0.address,
        token1.address,
        pair.stable,
        sendAmount0,
        sendAmount1,
        sendAmount0Min,
        sendAmount1Min,
        account.address,
        deadline,
      ];
      let sendValue = null;

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token1.address,
          pair.stable,
          sendAmount1,
          sendAmount1Min,
          sendAmount0Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount0;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        func = "addLiquidityETH";
        params = [
          token0.address,
          pair.stable,
          sendAmount0,
          sendAmount0Min,
          sendAmount1Min,
          account.address,
          deadline,
        ];
        sendValue = sendAmount1;
      }

      this._callContractWait(
        web3,
        routerContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        depositTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
          const stakeAllowance = await this._getStakeAllowance(
            web3,
            pair,
            account
          );

          if (BigNumber(stakeAllowance).lt(minLiquidity)) {
            this.emitter.emit(ACTIONS.TX_STATUS, {
              uuid: stakeAllowanceTXID,
              description: `Allow the router to spend your ${pair.symbol}`,
            });
          } else {
            this.emitter.emit(ACTIONS.TX_STATUS, {
              uuid: stakeAllowanceTXID,
              description: `Allowance on ${pair.symbol} sufficient`,
              status: "DONE",
            });
          }

          const amount1 = BigNumber(minLiquidity)
            .times(10 ** pair.decimals)
            .toFixed(0);
          if (BigNumber(stakeAllowance).lt(BigNumber(minLiquidity))) {
            //check is it have to approve anytime
            const stakePromise = await new Promise<void>((resolve, reject) => {
              context._callContractWait(
                web3,
                pairContract,
                "approve",
                [pair.gauge.address, amount1],
                account,
                gasPrice,
                null,
                null,
                stakeAllowanceTXID,
                (err) => {
                  if (err) {
                    reject(err);
                    return this.emitter.emit(ACTIONS.ERROR, err);
                  }

                  resolve();
                }
              );
            });

            allowanceCallsPromises.push(stakePromise);
          }

          const done = await Promise.all(allowanceCallsPromises);

          this._callContractWait(
            web3,
            gaugeContract,
            "deposit",
            [amount1, 0],
            account,
            gasPrice,
            null,
            null,
            stakeTXID,
            (err) => {
              if (err) {
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              this._getPairInfo(web3, account);

              this.emitter.emit(ACTIONS.ADD_LIQUIDITY_AND_STAKED);
              context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
            }
          );
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getDepositAllowance = async (web3, token, account, flag = 0) => {
    try {
      const tokenContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI,
        token.address
      );

      if (flag == 1) {
        const allowance = await tokenContract.methods
          .allowance(account.address, CONTRACTS.SLP_ADDRESS)
          .call();
        return BigNumber(allowance)
          .div(10 ** token.decimals)
          .toFixed(token.decimals);
      }

      const allowance = await tokenContract.methods
        .allowance(account.address, CONTRACTS.ROUTER_ADDRESS)
        .call();
      return BigNumber(allowance)
        .div(10 ** token.decimals)
        .toFixed(token.decimals);
    } catch (ex) {
      ////console.error(ex);
      return null;
    }
  };

  _getStakeAllowance = async (web3, pair, account) => {
    try {
      const tokenContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI,
        pair.address
      );
      const allowance = await tokenContract.methods
        .allowance(account.address, pair.gauge.address)
        .call();
      return BigNumber(allowance)
        .div(10 ** pair.decimals)
        .toFixed(18);
    } catch (ex) {
      ////console.error(ex);
      return null;
    }
  };

  _getWithdrawAllowance = async (web3, pair, account, address) => {
    try {
      const tokenContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI,
        pair.address
      );
      const allowance = await tokenContract.methods
        .allowance(account.address, address)
        .call();
      return BigNumber(allowance).div(10 ** pair.decimals);
      // .toFixed(pair.decimals);
    } catch (ex) {
      ////console.error(ex);
      return null;
    }
  };

  quoteAddLiquidity = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, token0, token1, amount0, amount1 } = payload.content;

      if (!pair || !token0 || !token1 || amount0 == "" || amount1 == "") {
        return null;
      }

      const gasPrice = await stores.accountStore.getGasPrice();
      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );

      const sendAmount0 = BigNumber(amount0)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1 = BigNumber(amount1)
        .times(10 ** token1.decimals)
        .toFixed(0);

      let addy0 = token0.address;
      let addy1 = token1.address;

      if (token0.symbol === NATIVE_TOKEN.symbol) {
        addy0 = W_NATIVE_ADDRESS;
      }
      if (token1.symbol === NATIVE_TOKEN.symbol) {
        addy1 = W_NATIVE_ADDRESS;
      }

      const res = await routerContract.methods
        .quoteAddLiquidity(addy0, addy1, pair.stable, sendAmount0, sendAmount1)
        .call();

      const returnVal = {
        inputs: {
          token0,
          token1,
          amount0,
          amount1,
        },
        output: BigNumber(res.liquidity)
          .div(10 ** pair.decimals)
          .toFixed(pair.decimals),
      };
      this.emitter.emit(ACTIONS.QUOTE_ADD_LIQUIDITY_RETURNED, returnVal);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  getLiquidityBalances = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair } = payload.content;

      if (!pair) {
        return;
      }

      const token0Contract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        pair.token0.address
      );
      const token1Contract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI as AbiItem[],
        pair.token1.address
      );
      const pairContract = new web3.eth.Contract(
        CONTRACTS.PAIR_ABI as AbiItem[],
        pair.address
      );

      const balanceCalls = [
        token0Contract.methods.balanceOf(account.address).call(),
        token1Contract.methods.balanceOf(account.address).call(),
        pairContract.methods.balanceOf(account.address).call(),
      ];

      if (pair.gauge) {
        const gaugeContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          pair.gauge.address
        );
        balanceCalls.push(
          gaugeContract.methods.balanceOf(account.address).call()
        );
        // balanceCalls.push(gaugeContract.methods.earned(incentiveAddress, account.address).call())
      }

      const [
        token0Balance,
        token1Balance,
        poolBalance,
        gaugeBalance /*, earned*/,
      ] = await Promise.all(balanceCalls);

      const returnVal = {
        token0: BigNumber(token0Balance)
          .div(10 ** pair.token0.decimals)
          .toFixed(pair.token0.decimals),
        token1: BigNumber(token1Balance)
          .div(10 ** pair.token1.decimals)
          .toFixed(pair.token1.decimals),
        pool: BigNumber(poolBalance)
          .div(10 ** 18)
          .toFixed(18),
        gauge: null,
      };

      if (pair.gauge) {
        returnVal.gauge = gaugeBalance
          ? BigNumber(gaugeBalance)
              .div(10 ** 18)
              .toFixed(18)
          : null;
        // returnVal.earned = BigNumber(earned).div(10**incentiveAsset.decimals).toFixed(incentiveAsset.decimals),
      }

      this.emitter.emit(ACTIONS.GET_LIQUIDITY_BALANCES_RETURNED, returnVal);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  removeNoneGaugeLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { token0, token1, pair, amountA, amountB, amount, slippage } =
        payload.content;
      //console.log("removeNoneGaugeLiquidity");
      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let withdrawTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Remove liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Removed",
        transactions: [
          {
            uuid: allowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: withdrawTXID,
            description: `Withdraw tokens from the pool`,
            status: "WAITING",
          },
        ],
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getWithdrawAllowance(
        web3,
        pair,
        account,
        CONTRACTS.ROUTER_ADDRESS
      );

      if (BigNumber(allowance).lt(pair.balance)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the router to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair.address
        );

        const amount1 = BigNumber(amount)
          .times(10 ** pair.decimals)
          .toFixed(0);

        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                ////////console.log(err);
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT WITHDRAW TRANSACTION
      const sendAmount = BigNumber(amount)
        .times(10 ** pair.decimals)
        .toFixed(0);

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );

      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      //console.log("amountA, amountB", amountA, amountB);
      const amountAmin = BigNumber(amountA)
        .times(sendSlippage)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const amountBmin = BigNumber(amountB)
        .times(sendSlippage)
        .times(10 ** token1.decimals)
        .toFixed(0);

      const deadline = "" + moment().add(60, "seconds").unix();
      //console.log("sendAmount0Min", amountAmin);
      //console.log("sendAmount1Min", amountBmin);
      this._callContractWait(
        web3,
        routerContract,
        "removeLiquidity",
        [
          token0.address,
          token1.address,
          pair.stable,
          sendAmount,
          amountAmin,
          amountBmin,
          account.address,
          deadline,
        ],
        account,
        gasPrice,
        null,
        null,
        withdrawTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_REMOVED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  removeLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { token0, token1, pair, slippage } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let withdrawTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Remove liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Removed",
        transactions: [
          {
            uuid: allowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: withdrawTXID,
            description: `Withdraw tokens from the pool`,
            status: "WAITING",
          },
        ],
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getWithdrawAllowance(
        web3,
        pair,
        account,
        CONTRACTS.ROUTER_ADDRESS
      );

      if (BigNumber(allowance).lt(pair.balance)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the router to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(pair.balance)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair.address
        );

        const amount1 = BigNumber(pair.balance)
          .times(10 ** pair.decimals)
          .toFixed(0);

        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                ////////console.log(err);
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT WITHDRAW TRANSACTION
      const sendAmount = BigNumber(pair.balance)
        .times(10 ** pair.decimals)
        .toFixed(0);

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );

      const quoteRemove = await routerContract.methods
        .quoteRemoveLiquidity(
          token0.address,
          token1.address,
          pair.stable,
          sendAmount
        )
        .call();

      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const deadline = "" + moment().add(60, "seconds").unix();
      const sendAmount0Min = BigNumber(quoteRemove.amountA)
        .times(sendSlippage)
        .toFixed(0);
      const sendAmount1Min = BigNumber(quoteRemove.amountB)
        .times(sendSlippage)
        .toFixed(0);
      //console.log("sendAmount0Min", sendAmount0Min);
      //console.log("sendAmount1Min", sendAmount1Min);
      this._callContractWait(
        web3,
        routerContract,
        "removeLiquidity",
        [
          token0.address,
          token1.address,
          pair.stable,
          sendAmount,
          sendAmount0Min,
          sendAmount1Min,
          account.address,
          deadline,
        ],
        account,
        gasPrice,
        null,
        null,
        withdrawTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_REMOVED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  unstakeAndRemoveLiquidity = async (payload) => {
    try {
      const context = this;
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { token0, token1, amount, amount0, amount1, pair, slippage } =
        payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let withdrawTXID = this.getTXUUID();
      let unstakeTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Remove liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Removed",
        transactions: [
          {
            uuid: unstakeTXID,
            description: `Unstake LP tokens from the gauge`,
            status: "WAITING",
          },
          {
            uuid: allowanceTXID,
            description: `Checking your ${pair.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: withdrawTXID,
            description: `Withdraw tokens from the pool`,
            status: "WAITING",
          },
        ],
      });

      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const sendAmount = BigNumber(amount)
        .times(10 ** pair.decimals)
        .toFixed(0);
      const deadline = "" + moment().add(60, "seconds").unix();
      const sendAmount0Min = BigNumber(amount0)
        .times(sendSlippage)
        .times(10 ** token0.decimals)
        .toFixed(0);
      const sendAmount1Min = BigNumber(amount1)
        .times(sendSlippage)
        .times(10 ** token1.decimals)
        .toFixed(0);

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );
      const gaugeContract = new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );

      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        gaugeContract,
        "withdraw",
        [sendAmount],
        account,
        gasPrice,
        null,
        null,
        unstakeTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
        }
      );

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getWithdrawAllowance(
        web3,
        pair,
        account,
        CONTRACTS.ROUTER_ADDRESS
      );

      if (BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the router to spend your ${pair.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${pair.symbol} sufficient`,
          status: "DONE",
        });
      }

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.PAIR_ABI as AbiItem[],
          pair.address
        );

        const amount1 = BigNumber(amount)
          .times(10 ** pair.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return this.emitter.emit(ACTIONS.ERROR, err);
              }
              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT DEPOSIT TRANSACTION
      this._callContractWait(
        web3,
        routerContract,
        "removeLiquidity",
        [
          token0.address,
          token1.address,
          pair.stable,
          sendAmount,
          sendAmount0Min,
          sendAmount1Min,
          account.address,
          deadline,
        ],
        account,
        gasPrice,
        null,
        null,
        withdrawTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.REMOVE_LIQUIDITY_AND_UNSTAKED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  unstakeLiquidity = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { amount, pair } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let unstakeTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Unstake liquidity from ${pair.symbol}`,
        type: "Liquidity",
        verb: "Liquidity Unstaked",
        transactions: [
          {
            uuid: unstakeTXID,
            description: `Unstake LP tokens from the gauge`,
            status: "WAITING",
          },
        ],
      });

      const gasPrice = await stores.accountStore.getGasPrice();

      // SUBMIT DEPOSIT TRANSACTION
      const sendAmount = BigNumber(amount)
        .times(10 ** pair.decimals)
        .toFixed(0);

      const gaugeContract = new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );

      this._callContractWait(
        web3,
        gaugeContract,
        "withdraw",
        [sendAmount],
        account,
        gasPrice,
        null,
        null,
        unstakeTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.LIQUIDITY_UNSTAKED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  quoteRemoveLiquidity = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, token0, token1, withdrawAmount } = payload.content;

      if (!pair || !token0 || !token1 || withdrawAmount == "") {
        return null;
      }

      const gasPrice = await stores.accountStore.getGasPrice();
      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );

      const sendWithdrawAmount = BigNumber(withdrawAmount)
        .times(10 ** pair.decimals)
        .toFixed(0);

      const res = await routerContract.methods
        .quoteRemoveLiquidity(
          token0.address,
          token1.address,
          pair.stable,
          sendWithdrawAmount
        )
        .call();

      const returnVal = {
        inputs: {
          token0,
          token1,
          withdrawAmount,
        },
        output: {
          amount0: BigNumber(res.amountA)
            .div(10 ** token0.decimals)
            .toFixed(token0.decimals),
          amount1: BigNumber(res.amountB)
            .div(10 ** token1.decimals)
            .toFixed(token1.decimals),
        },
      };
      this.emitter.emit(ACTIONS.QUOTE_REMOVE_LIQUIDITY_RETURNED, returnVal);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  createGauge = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let createGaugeTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Create liquidity gauge for ${pair.token0.symbol}/${pair.token1.symbol}`,
        type: "Liquidity",
        verb: "Gauge Created",
        transactions: [
          {
            uuid: createGaugeTXID,
            description: `Create gauge`,
            status: "WAITING",
          },
        ],
      });

      const gasPrice = await stores.accountStore.getGasPrice();

      const gaugesContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      );
      this._callContractWait(
        web3,
        gaugesContract,
        "createGauge",
        [pair.address],
        account,
        gasPrice,
        null,
        null,
        createGaugeTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          await this.updatePairsCall(web3, account);

          this.emitter.emit(ACTIONS.CREATE_GAUGE_RETURNED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  quoteSwap = async (payload) => {
    // TEST TXQ
    try {
      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const pairtokenAssets = this.getStore("pairtokenAssets");
      // route assets are USDC, WETH and ARETE
      const routeAssets = pairtokenAssets.slice(1);
      const { fromAsset, toAsset, fromAmount } = payload.content;

      // TEST TXQ

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );
      const sendFromAmount = BigNumber(fromAmount)
        .times(10 ** fromAsset.decimals)
        .toFixed();

      if (
        !fromAsset ||
        !toAsset ||
        !fromAmount ||
        !fromAsset.address ||
        !toAsset.address ||
        fromAmount === ""
      ) {
        return null;
      }

      let addy0 = fromAsset.address;
      let addy1 = toAsset.address;

      if (fromAsset.symbol === NATIVE_TOKEN.symbol) {
        addy0 = W_NATIVE_ADDRESS;
      }
      if (toAsset.symbol === NATIVE_TOKEN.symbol) {
        addy1 = W_NATIVE_ADDRESS;
      }

      const includesRouteAddress = routeAssets.filter((asset) => {
        return (
          asset.address.toLowerCase() == addy0.toLowerCase() ||
          asset.address.toLowerCase() == addy1.toLowerCase()
        );
      });

      let amountOuts = [];
      //////////console.log("amountOutsBase", amountOuts)
      //////////console.log("routerAsset", routeAssets)
      //////////console.log("includesRouteAddress", includesRouteAddress)
      // FIXME we should have tryAggregate here so to filter not existing routes instead of this hardcore
      if (includesRouteAddress.length === 0) {
        amountOuts = await routeAssets
          .map((routeAsset) => {
            if (routeAsset.symbol === "WETH") {
              return [
                // {
                //   routes: [
                //     {
                //       from: addy0,
                //       to: routeAsset.address,
                //       stable: true,
                //     },
                //     {
                //       from: routeAsset.address,
                //       to: addy1,
                //       stable: true,
                //     },
                //   ],
                //   routeAsset: routeAsset,
                // },
                {
                  routes: [
                    {
                      from: addy0,
                      to: routeAsset.address,
                      stable: false,
                    },
                    {
                      from: routeAsset.address,
                      to: addy1,
                      stable: false,
                    },
                  ],
                  routeAsset: routeAsset,
                },
                {
                  routes: [
                    {
                      from: addy0,
                      to: routeAsset.address,
                      stable: true,
                    },
                    {
                      from: routeAsset.address,
                      to: addy1,
                      stable: false,
                    },
                  ],
                  routeAsset: routeAsset,
                },
                {
                  routes: [
                    {
                      from: addy0,
                      to: routeAsset.address,
                      stable: false,
                    },
                    {
                      from: routeAsset.address,
                      to: addy1,
                      stable: true,
                    },
                  ],
                  routeAsset: routeAsset,
                },
              ];
            }
            return [
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: true,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: true,
                  },
                ],
                routeAsset: routeAsset,
              },
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: false,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: false,
                  },
                ],
                routeAsset: routeAsset,
              },
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: true,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: false,
                  },
                ],
                routeAsset: routeAsset,
              },
              {
                routes: [
                  {
                    from: addy0,
                    to: routeAsset.address,
                    stable: false,
                  },
                  {
                    from: routeAsset.address,
                    to: addy1,
                    stable: true,
                  },
                ],
                routeAsset: routeAsset,
              },
            ];
          })
          .flat();
      }
      //////////console.log("amountOutsamountOuts", amountOuts)
      amountOuts.push({
        routes: [
          {
            from: addy0,
            to: addy1,
            stable: true,
          },
        ],
        routeAsset: null,
      });

      amountOuts.push({
        routes: [
          {
            from: addy0,
            to: addy1,
            stable: false,
          },
        ],
        routeAsset: null,
      });
      const calls = amountOuts.map(async (route) => {
        return await routerContract.methods
          .getAmountsOut(sendFromAmount, route.routes)
          .call();
      });

      const receiveAmounts = await Promise.all(calls);
      //console.log("receiveAmounts", receiveAmounts);
      for (let i = 0; i < receiveAmounts.length; i++) {
        amountOuts[i].receiveAmounts = receiveAmounts[i];
        //console.log("amountOuts", amountOuts[i]);
        // TEST TXQ

        // amountOuts[i].finalValue = String(
        //   ethers.utils.parseUnits(
        //     receiveAmounts[i][receiveAmounts[i].length - 1],
        //     toAsset.decimals
        //   )
        // );

        amountOuts[i].finalValue = String(
          receiveAmounts[i][receiveAmounts[i].length - 1]
        );
        // .div(10 ** toAsset.decimals)
        // .toFixed(toAsset.decimals)
      }

      const bestAmountOut = amountOuts
        .filter((ret) => {
          return ret != null;
        })
        .reduce((best, current) => {
          if (!best) {
            return current;
          }
          return BigNumber(best.finalValue).gt(current.finalValue)
            ? best
            : current;
          // return BigNumber(best.finalValue).gt(current.finalValue)
          //   ? ethers.utils.formatUnits(
          //       ethers.utils.parseUnits(
          //         best.finalValue,
          //         toAsset.decimals
          //       ),
          //       toAsset.decimals
          //     )
          //   : ethers.utils.formatUnits(
          //       ethers.utils.parseUnits(
          //         current.finalValue,
          //         toAsset.decimals
          //       ),
          //       toAsset.decimals
          //     );
        }, 0);

      if (!bestAmountOut) {
        this.emitter.emit(
          ACTIONS.ERROR,
          "No valid route found to complete swap"
        );
        return null;
      }
      bestAmountOut.finalValue = BigNumber(bestAmountOut.finalValue)
        .div(10 ** toAsset.decimals)
        .toFixed();
      //console.log("bestAmountOut", bestAmountOut);
      let totalRatio = "1";
      for (let i = 0; i < bestAmountOut.routes.length; i++) {
        if (bestAmountOut.routes[i].stable == true) {
        } else {
          const reserves = await routerContract.methods
            .getReserves(
              bestAmountOut.routes[i].from,
              bestAmountOut.routes[i].to,
              bestAmountOut.routes[i].stable
            )
            .call();
          let amountIn = "0";
          let amountOut = "0";

          if (i == 0) {
            amountIn = sendFromAmount;
            amountOut = bestAmountOut.receiveAmounts[i + 1];
          } else {
            amountIn = bestAmountOut.receiveAmounts[i];
            amountOut = bestAmountOut.receiveAmounts[i + 1];
          }
          //console.log("amountIn", amountIn, amountOut);
          const amIn = BigNumber(amountIn).div(reserves.reserveA);
          const amOut = BigNumber(amountOut).div(reserves.reserveB);
          const ratio = BigNumber(amOut).div(amIn);
          totalRatio = BigNumber(totalRatio).times(ratio).toFixed(18);
          //console.log("totalRatio", totalRatio);
        }
      }

      const priceImpact = BigNumber(1).minus(totalRatio).times(100).toFixed(18);
      const returnValue = {
        inputs: {
          fromAmount: fromAmount,
          fromAsset: fromAsset,
          toAsset: toAsset,
        },
        output: bestAmountOut,
        priceImpact: priceImpact,
      };
      // TEST TXQ
      ////////console.log("returnValue in quoteswap", returnValue);
      //console.log("returnValue", returnValue);
      this.emitter.emit(ACTIONS.QUOTE_SWAP_RETURNED, returnValue);

      return returnValue;
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.QUOTE_SWAP_RETURNED, null);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  swap = async (payload) => {
    try {
      const context = this;

      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { fromAsset, toAsset, fromAmount, toAmount, quote, slippage } =
        payload.content;

      // TEST SWAP

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let swapTXID = this.getTXUUID();

      const transactions = [];

      if (fromAsset.symbol === NATIVE_TOKEN.symbol) {
        transactions.push(
          {
            uuid: swapTXID,
            description: `Swap ${formatCurrency(fromAmount)} ${
              fromAsset.symbol
            } for ${toAsset.symbol}`,
            status: "WAITING",
          },
        );
      }
      else {
        transactions.push(
          {
            uuid: allowanceTXID,
            description: `Checking your ${fromAsset.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: swapTXID,
            description: `Swap ${formatCurrency(fromAmount)} ${
              fromAsset.symbol
            } for ${toAsset.symbol}`,
            status: "WAITING",
          },
        );
      }

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Swap ${fromAsset.symbol} for ${toAsset.symbol}`,
        type: "Swap",
        verb: "Swap Successful",
        transactions: transactions
      });

      let allowance = "0";

      // CHECK ALLOWANCES AND SET TX DISPLAY
      if (fromAsset.symbol !== NATIVE_TOKEN.symbol) {
        allowance = await this._getSwapAllowance(web3, fromAsset, account);
        if (BigNumber(allowance).lt(fromAmount)) {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowanceTXID,
            description: `Allow the router to spend your ${fromAsset.symbol}`,
          });
        } else {
          this.emitter.emit(ACTIONS.TX_STATUS, {
            uuid: allowanceTXID,
            description: `Allowance on ${fromAsset.symbol} sufficient`,
            status: "DONE",
          });
        }
      } else {
        // TEST SWAP

        allowance = MAX_UINT256;
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${fromAsset.symbol} sufficient`,
          status: "DONE",
        });
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(fromAmount)) {
        // TEST SWAP

        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          fromAsset.address
        );

        const amount1 = BigNumber(fromAmount)
          .times(10 ** fromAsset.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          context._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.ROUTER_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            }
          );
        });

        // const a = await web3.eth.getFeeHistory(10, "pending", [
        //   10,
        // ]).catch((err) => {
        //   ////////console.log("Cannot fetch fee history",err);
        // });
        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT SWAP TRANSACTION
      const sendSlippage = BigNumber(100).minus(slippage).div(100);
      const sendFromAmount = BigNumber(fromAmount)
        .times(10 ** fromAsset.decimals)
        .toFixed(0);
      const sendMinAmountOut = BigNumber(quote.output.finalValue)
        .times(10 ** toAsset.decimals)
        .times(sendSlippage)
        .toFixed(0);
      const deadline = "" + moment().add(60, "seconds").unix();

      const routerContract = new web3.eth.Contract(
        CONTRACTS.ROUTER_ABI as AbiItem[],
        CONTRACTS.ROUTER_ADDRESS
      );

      let func = "swapExactTokensForTokens";
      let params = [
        sendFromAmount,
        sendMinAmountOut,
        quote.output.routes,
        account.address,
        deadline,
      ];
      let sendValue = null;

      if (fromAsset.symbol === NATIVE_TOKEN.symbol) {
        func = "swapExactETHForTokens";
        params = [
          sendMinAmountOut,
          quote.output.routes,
          account.address,
          deadline,
        ];
        sendValue = sendFromAmount;
      }
      if (toAsset.symbol === NATIVE_TOKEN.symbol) {
        func = "swapExactTokensForETH";
      }

      this._callContractWait(
        web3,
        routerContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        swapTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getSpecificAssetInfo(web3, account, fromAsset.address);
          this._getSpecificAssetInfo(web3, account, toAsset.address);
          this._getPairInfo(web3, account);

          this.emitter.emit(ACTIONS.SWAP_RETURNED);
          context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  wrapOrUnwrap = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { fromAsset, toAsset, fromAmount } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let wrapUnwrapTXID = this.getTXUUID();
      let isWrap;
      let tx;
      if (fromAsset.symbol === "WETH" && toAsset.symbol === "ETH") {
        isWrap = false;
        tx = {
          title: `Unwrap WETH for ETH`,
          type: "Unwrap",
          verb: "Unwrap Successful",
          transactions: [
            {
              uuid: wrapUnwrapTXID,
              description: `Unwrap ${formatCurrency(fromAmount)} WETH for ETH`,
              status: "WAITING",
            },
          ],
        };
      } else if (fromAsset.symbol === "ETH" && toAsset.symbol === "WETH") {
        isWrap = true;
        tx = {
          title: `Wrap ETH for WETH`,
          type: "Wrap",
          verb: "Wrap Successful",
          transactions: [
            {
              uuid: wrapUnwrapTXID,
              description: `Wrap ${formatCurrency(fromAmount)} ETH for WETH`,
              status: "WAITING",
            },
          ],
        };
      } else {
        throw new Error("Wrap Unwrap assets are wrong");
      }

      this.emitter.emit(ACTIONS.TX_ADDED, tx);

      // SUBMIT WRAP_UNWRAP TRANSACTION
      const sendFromAmount = BigNumber(fromAmount)
        .times(10 ** 18)
        .toFixed(0);

      const wethContract = new web3.eth.Contract(
        CONTRACTS.WETH_ABI as AbiItem[],
        W_NATIVE_ADDRESS
      );

      let func = "withdraw";
      let params = [sendFromAmount];
      let sendValue = null;

      if (isWrap) {
        func = "deposit";
        params = [];
        sendValue = sendFromAmount;
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        wethContract,
        func,
        params,
        account,
        gasPrice,
        null,
        null,
        wrapUnwrapTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getSpecificAssetInfo(web3, account, fromAsset.address);
          this._getSpecificAssetInfo(web3, account, toAsset.address);

          this.emitter.emit(ACTIONS.WRAP_UNWRAP_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        },
        sendValue
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getSpecificAssetInfo = async (web3, account, assetAddress) => {
    try {
      const baseAssets = this.getStore("baseAssets");
      if (!baseAssets) {
        //////console.warn("baseAssets not found");
        return null;
      }

      const ba = await Promise.all(
        baseAssets.map(async (asset) => {
          if (asset.address.toLowerCase() === assetAddress.toLowerCase()) {
            if (asset.symbol === NATIVE_TOKEN.symbol) {
              let bal = await web3.eth.getBalance(account.address);
              asset.balance = BigNumber(bal)
                .div(10 ** asset.decimals)
                .toFixed(asset.decimals);
            } else {
              const assetContract = new web3.eth.Contract(
                CONTRACTS.ERC20_ABI,
                asset.address
              );

              const [balanceOf] = await Promise.all([
                assetContract.methods.balanceOf(account.address).call(),
              ]);

              asset.balance = BigNumber(balanceOf)
                .div(10 ** asset.decimals)
                .toFixed(asset.decimals);
            }
          }

          return asset;
        })
      );

      this.setStore({ baseAssets: ba });
      //console.log("_getSpecificAssetInfo");
      this.emitter.emit(ACTIONS.UPDATED);
    } catch (ex) {
      ////////console.log(ex);
      return null;
    }
  };

  _getSwapAllowance = async (web3, token, account) => {
    try {
      const tokenContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI,
        token.address
      );
      const allowance = await tokenContract.methods
        .allowance(account.address, CONTRACTS.ROUTER_ADDRESS)
        .call();
      return BigNumber(allowance)
        .div(10 ** token.decimals)
        .toFixed(token.decimals);
    } catch (ex) {
      ////console.error(ex);
      return null;
    }
  };

  getVestNFTs = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const veToken = this.getStore("veToken");
      const govToken = this.getStore("govToken");

      const vestingContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      const nftsLength = await vestingContract.methods
        .balanceOf(account.address)
        .call();

      const arr = Array.from({ length: parseInt(nftsLength) }, (_, idx) => idx);

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const calls = arr.map((idx) => ({
        target: CONTRACTS.VE_TOKEN_ADDRESS,
        callData: vestingContract.methods
          .tokenOfOwnerByIndex(account.address, idx)
          .encodeABI(),
      }));

      const aggregateRes1 = await multicallContract.methods
        .aggregate(calls)
        .call();

      const nftIds = aggregateRes1.returnData.map((data) => parseInt(data, 16));
      const calls2 = nftIds.flatMap((idx) => [
        {
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods.locked(idx).encodeABI(),
        },
        {
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods.balanceOfNFT(idx).encodeABI(),
        },
      ]);

      const aggregateRes2 = await multicallContract.methods
        .aggregate(calls2)
        .call();

      const locked = aggregateRes2.returnData.filter(
        (_, index) => index % 2 === 0
      );
      const balanceOfNFT = aggregateRes2.returnData.filter(
        (_, index) => index % 2 !== 0
      );

      const parsedLocked = locked.map((data) => {
        const amountHex = data.slice(2, 66);
        const endHex = data.slice(71);
        const amountDec = new BigNumber(amountHex, 16)
          .div(10 ** govToken.decimals)
          .toFixed(govToken.decimals);
        const endDec = parseInt(endHex, 16);
        return { amount: amountDec, end: endDec };
      });

      const parsedBalanceOfNFT = balanceOfNFT.map((data) => {
        return new BigNumber(data, 16)
          .div(10 ** veToken.decimals)
          .toFixed(veToken.decimals);
      });

      const nfts = nftIds.map((id, idx) => {
        return {
          id: id,
          lockEnds: parsedLocked[idx].end,
          lockAmount: parsedLocked[idx].amount,
          lockValue: parsedBalanceOfNFT[idx],
        };
      });

      this.setStore({ vestNFTs: nfts });
      this.emitter.emit(ACTIONS.VEST_NFTS_RETURNED, nfts);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  createVest = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const govToken = this.getStore("govToken");
      const { amount, unlockTime } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let vestTXID = this.getTXUUID();

      const unlockString = moment()
        .add(unlockTime, "seconds")
        .format("YYYY-MM-DD");

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Vest ${govToken.symbol} until ${unlockString}`,
        type: "Vest",
        verb: "Vest Created",
        transactions: [
          {
            uuid: allowanceTXID,
            description: `Checking your ${govToken.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: vestTXID,
            description: `Vesting your tokens`,
            status: "WAITING",
          },
        ],
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getVestAllowance(web3, govToken, account);

      if (BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the vesting contract to use your ${govToken.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${govToken.symbol} sufficient`,
          status: "DONE",
        });
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          govToken.address
        );

        const amount1 = BigNumber(amount)
          .times(10 ** govToken.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          this._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.VE_TOKEN_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT VEST TRANSACTION
      const sendAmount = BigNumber(amount)
        .times(10 ** govToken.decimals)
        .toFixed(0);

      const veTokenContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );
      //console.log("sendAmount", sendAmount, unlockTime);
      this._callContractWait(
        web3,
        veTokenContract,
        "create_lock",
        [sendAmount, unlockTime],
        account,
        gasPrice,
        null,
        null,
        vestTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getGovTokenInfo(web3, account);
          this.getNFTByID("fetchAll");

          this.emitter.emit(ACTIONS.CREATE_VEST_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getVestAllowance = async (web3, token, account) => {
    try {
      const tokenContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI,
        token.address
      );
      const allowance = await tokenContract.methods
        .allowance(account.address, CONTRACTS.VE_TOKEN_ADDRESS)
        .call();
      return BigNumber(allowance)
        .div(10 ** token.decimals)
        .toFixed(token.decimals);
    } catch (ex) {
      ////console.error(ex);
      return null;
    }
  };

  increaseVestAmount = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const govToken = this.getStore("govToken");
      const { amount, tokenID } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let vestTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Increase vest amount on token #${tokenID}`,
        type: "Vest",
        verb: "Vest Increased",
        transactions: [
          {
            uuid: allowanceTXID,
            description: `Checking your ${govToken.symbol} allowance`,
            status: "WAITING",
          },
          {
            uuid: vestTXID,
            description: `Increasing your vest amount`,
            status: "WAITING",
          },
        ],
      });

      // CHECK ALLOWANCES AND SET TX DISPLAY
      const allowance = await this._getVestAllowance(web3, govToken, account);

      if (BigNumber(allowance).lt(amount)) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow vesting contract to use your ${govToken.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${govToken.symbol} sufficient`,
          status: "DONE",
        });
      }

      const gasPrice = await stores.accountStore.getGasPrice();

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          govToken.address
        );

        const amount1 = BigNumber(amount)
          .times(10 ** govToken.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          this._callContractWait(
            web3,
            tokenContract,
            "approve",
            [CONTRACTS.VE_TOKEN_ADDRESS, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT INCREASE TRANSACTION
      const sendAmount = BigNumber(amount)
        .times(10 ** govToken.decimals)
        .toFixed(0);

      const veTokenContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      this._callContractWait(
        web3,
        veTokenContract,
        "increase_amount",
        [tokenID, sendAmount],
        account,
        gasPrice,
        null,
        null,
        vestTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._getGovTokenInfo(web3, account);
          this._updateVestNFTByID(tokenID);

          this.emitter.emit(ACTIONS.INCREASE_VEST_AMOUNT_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  increaseVestDuration = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const govToken = this.getStore("govToken");
      const { tokenID, unlockTime } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let vestTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Increase unlock time on token #${tokenID}`,
        type: "Vest",
        verb: "Vest Increased",
        transactions: [
          {
            uuid: vestTXID,
            description: `Increasing your vest duration`,
            status: "WAITING",
          },
        ],
      });

      const gasPrice = await stores.accountStore.getGasPrice();

      // SUBMIT INCREASE TRANSACTION
      const veTokenContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      this._callContractWait(
        web3,
        veTokenContract,
        "increase_unlock_time",
        [tokenID, unlockTime + ""],
        account,
        gasPrice,
        null,
        null,
        vestTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._updateVestNFTByID(tokenID);

          this.emitter.emit(ACTIONS.INCREASE_VEST_DURATION_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  withdrawVest = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { tokenID } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let resetTXID = this.getTXUUID();
      let vestTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Withdraw vest amount on token #${tokenID}`,
        type: "Vest",
        verb: "Vest Withdrawn",
        transactions: [
          {
            uuid: resetTXID,
            description: `Checking if your nft is attached`,
            status: "WAITING",
          },
          {
            uuid: vestTXID,
            description: `Withdrawing your expired tokens`,
            status: "WAITING",
          },
        ],
      });

      // CHECK if veNFT is attached
      const attached = await this._checkNFTAttached(web3, tokenID);

      if (!!attached) {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: resetTXID,
          description: `NFT is resetting`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: resetTXID,
          description: `Skipping reset`,
          status: "DONE",
        });
      }

      const resetCallsPromise = [];

      if (!!attached) {
        const voterContract = new web3.eth.Contract(
          CONTRACTS.VOTER_ABI as AbiItem[],
          CONTRACTS.VOTER_ADDRESS
        );

        const gasPrice = await stores.accountStore.getGasPrice();

        const resetPromise = new Promise<void>((resolve, reject) => {
          this._callContractWait(
            web3,
            voterContract,
            "reset",
            [tokenID],
            account,
            gasPrice,
            null,
            null,
            resetTXID,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            }
          );
        });
        resetCallsPromise.push(resetPromise);
      }

      const done = await Promise.all(resetCallsPromise);

      const gasPrice = await stores.accountStore.getGasPrice();

      // SUBMIT withdraw TRANSACTION
      const veTokenContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      this._callContractWait(
        web3,
        veTokenContract,
        "withdraw",
        [tokenID],
        account,
        gasPrice,
        null,
        null,
        vestTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this._updateVestNFTByID(tokenID);

          this.emitter.emit(ACTIONS.WITHDRAW_VEST_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _checkNFTAttached = async (web3, tokenID) => {
    if (!web3) return;

    const votingEscrowContract = new web3.eth.Contract(
      CONTRACTS.VE_TOKEN_ABI as AbiItem[],
      CONTRACTS.VE_TOKEN_ADDRESS
    );

    const attached = await votingEscrowContract.methods
      .attachments(tokenID)
      .call();

    return attached !== 0;
  };

  vote = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      // const govToken = this.getStore("govToken");
      const { tokenID, votes } = payload.content;
      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let voteTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Cast vote using token #${tokenID}`,
        verb: "Votes Cast",
        transactions: [
          {
            uuid: voteTXID,
            description: `Cast votes`,
            status: "WAITING",
          },
        ],
      });

      // SUBMIT INCREASE TRANSACTION
      const gaugesContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      );

      let onlyVotes = votes.filter((vote) => {
        return BigNumber(vote.value).gt(0) || BigNumber(vote.value).lt(0);
      });
      let tokens = onlyVotes.map((vote) => {
        return vote.address;
      });
      let voteCounts = onlyVotes.map((vote) => {
        return BigNumber(vote.value).times(100).toFixed(0);
      });
      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        gaugesContract,
        "vote",
        [parseInt(tokenID), tokens, voteCounts],
        account,
        gasPrice,
        null,
        null,
        voteTXID,
        (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this.emitter.emit(ACTIONS.VOTE_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  getVestVotes = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { tokenID } = payload.content;
      const pairs = this.getStore("pairs");
      if (!pairs) {
        return null;
      }

      if (!tokenID) {
        return;
      }

      const filteredPairs = pairs.filter((pair) => {
        return pair && pair.gauge && pair.gauge.address;
      });

      const gaugesContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      );

      const calls = filteredPairs.map((pair) => {
        return gaugesContract.methods.votes(tokenID, pair.address).call();
      });

      const voteCounts = (await Promise.all(calls)) as string[];
      let votes: Vote[] = [];
      const totalVotes = voteCounts.reduce((curr, acc) => {
        let num = BigNumber(acc).gt(0)
          ? BigNumber(acc)
          : BigNumber(acc).times(-1);
        return BigNumber(curr).plus(num);
      }, BigNumber(0));
      for (let i = 0; i < voteCounts.length; i++) {
        // TEST UPDATE
        // ////////console.log("voteCounts[i]", voteCounts[i]);

        votes.push({
          address: filteredPairs[i].address,
          votePercent:
            BigNumber(totalVotes).gt(0) || BigNumber(totalVotes).lt(0)
              ? BigNumber(voteCounts[i]).times(100).div(totalVotes).toFixed(0)
              : "0",
          tokenID: tokenID,
        });
      }
      this.emitter.emit(ACTIONS.VEST_VOTES_RETURNED, votes);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  createBribe = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { asset, amount, gauge } = payload.content;

      // TEST BRIBE
      let wrapTXID = this.getTXUUID();

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let allowanceTXID = this.getTXUUID();
      let bribeTXID = this.getTXUUID();

      if (asset.symbol === NATIVE_TOKEN.symbol) {
        this.emitter.emit(ACTIONS.TX_ADDED, {
          title: `Create bribe on ${gauge.token0.symbol}/${gauge.token1.symbol}`,
          verb: "Bribe Created",
          transactions: [
            {
              uuid: wrapTXID,
              description: `Wrap your ${asset.symbol} to WETH`,
              status: "WAITING",
            },
            {
              uuid: allowanceTXID,
              description: `Checking your WETH allowance`,
              status: "WAITING",
            },
            {
              uuid: bribeTXID,
              description: `Create bribe`,
              status: "WAITING",
            },
          ],
        });
      } else {
        this.emitter.emit(ACTIONS.TX_ADDED, {
          title: `Create bribe on ${gauge.token0.symbol}/${gauge.token1.symbol}`,
          verb: "Bribe Created",
          transactions: [
            {
              uuid: allowanceTXID,
              description: `Checking your ${asset.symbol} allowance`,
              status: "WAITING",
            },
            {
              uuid: bribeTXID,
              description: `Create bribe`,
              status: "WAITING",
            },
          ],
        });
      }

      if (asset.symbol === NATIVE_TOKEN.symbol) {
        // TEST BRIBE
        // WRAP ETH TO WETH
        const wrapCallsPromises = [];

        if (asset.symbol === NATIVE_TOKEN.symbol) {
          const wethContract = new web3.eth.Contract(
            CONTRACTS.WETH_ABI as AbiItem[],
            CONTRACTS.WETH_ADDRESS
          );

          const gasPrice = await stores.accountStore.getGasPrice();
          const sendValue = BigNumber(amount)
            .times(10 ** asset.decimals)
            .toFixed(0);

          const wrapPromise = new Promise<void>((resolve, reject) => {
            this._callContractWait(
              web3,
              wethContract,
              "deposit",
              [],
              account,
              gasPrice,
              null,
              null,
              wrapTXID,
              (err) => {
                if (err) {
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              },
              sendValue
            );
          });
          wrapCallsPromises.push(wrapPromise);
        }

        const doneWrap = await Promise.all(wrapCallsPromises);
      }

      // CHECK ALLOWANCES AND SET TX DISPLAY
      // TEST BRIBE
      let Asset;

      if (asset.symbol === NATIVE_TOKEN.symbol) {
        Asset = {
          address: CONTRACTS.WETH_ADDRESS,
          symbol: "WETH",
          decimals: 18,
        };
      } else {
        Asset = asset;
      }

      const allowance = await this._getBribeAllowance(
        web3,
        Asset,
        gauge,
        account
      );

      if (BigNumber(allowance).lt(amount)) {
        // TEST BRIBE

        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allow the bribe contract to spend your ${Asset.symbol}`,
        });
      } else {
        this.emitter.emit(ACTIONS.TX_STATUS, {
          uuid: allowanceTXID,
          description: `Allowance on ${Asset.symbol} sufficient`,
          status: "DONE",
        });
      }

      const allowanceCallsPromises = [];

      // SUBMIT REQUIRED ALLOWANCE TRANSACTIONS
      if (BigNumber(allowance).lt(amount)) {
        // TEST BRIBE

        const tokenContract = new web3.eth.Contract(
          CONTRACTS.ERC20_ABI as AbiItem[],
          Asset.address
        );
        const gasPrice = await stores.accountStore.getGasPrice();

        const amount1 = BigNumber(amount)
          .times(10 ** Asset.decimals)
          .toFixed(0);
        const tokenPromise = new Promise<void>((resolve, reject) => {
          this._callContractWait(
            web3,
            tokenContract,
            "approve",
            [gauge.gauge.bribe_address, amount1],
            account,
            gasPrice,
            null,
            null,
            allowanceTXID,
            (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            }
          );
        });

        allowanceCallsPromises.push(tokenPromise);
      }

      const done = await Promise.all(allowanceCallsPromises);

      // SUBMIT BRIBE TRANSACTION
      const bribeContract = new web3.eth.Contract(
        CONTRACTS.WE_BRIBE_FACTORY_ABI as AbiItem[],
        gauge.gauge.bribe_address
      );

      const sendAmount = BigNumber(amount)
        .times(10 ** Asset.decimals)
        .toFixed(0);

      const gasPrice = await stores.accountStore.getGasPrice();
      this._callContractWait(
        web3,
        bribeContract,
        "notifyRewardAmount",
        [Asset.address, sendAmount],
        account,
        gasPrice,
        null,
        null,
        bribeTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          await this.updatePairsCall(web3, account);

          this.emitter.emit(ACTIONS.BRIBE_CREATED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _getBribeAllowance = async (web3, token, pair, account) => {
    try {
      const tokenContract = new web3.eth.Contract(
        CONTRACTS.ERC20_ABI,
        token.address
      );
      const allowance = await tokenContract.methods
        .allowance(account.address, pair.gauge.bribe_address)
        .call();
      return BigNumber(allowance)
        .div(10 ** token.decimals)
        .toFixed(token.decimals);
    } catch (ex) {
      ////console.error(ex);
      return null;
    }
  };

  getVestBalances = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { tokenID } = payload.content;
      const pairs = this.getStore("pairs");

      if (!pairs) {
        return null;
      }

      if (!tokenID) {
        return;
      }

      const filteredPairs = pairs.filter((pair) => {
        return pair && pair.gauge;
      });

      const bribesEarned = await Promise.all(
        filteredPairs.map(async (pair) => {
          const bribesEarned = await Promise.all(
            pair.gauge.bribes.map(async (bribe) => {
              // FIXME: this is external bribe in python and internal in express
              const bribeContract = new web3.eth.Contract(
                CONTRACTS.WE_BRIBE_FACTORY_ABI as AbiItem[],
                pair.gauge.bribe_address
              );

              const [earned] = await Promise.all([
                bribeContract.methods
                  .earned(bribe.token.address, tokenID)
                  .call(),
              ]);

              return {
                earned: BigNumber(earned)
                  .div(10 ** bribe.token.decimals)
                  .toFixed(bribe.token.decimals),
              };
            })
          );

          pair.gauge.bribesEarned = bribesEarned;

          return pair;
        })
      );

      // TEST UPDATE
      // ////////console.log("bribesEarned", bribesEarned);

      this.emitter.emit(ACTIONS.VEST_BALANCES_RETURNED, bribesEarned);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  getAllTokenVoteBalance = async () => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      let nftIds = null;
      const nfts = this.getStore("vestNFTs");
      if (nfts.length > 0) {
        nftIds = nfts.map((nft) => nft.id);
      } else {
        const vestingContract = new web3.eth.Contract(
          CONTRACTS.VE_TOKEN_ABI as AbiItem[],
          CONTRACTS.VE_TOKEN_ADDRESS
        );

        const nftsLength = await vestingContract.methods
          .balanceOf(account.address)
          .call();
        const nftCount = parseInt(nftsLength);

        const calls = Array.from({ length: nftCount }, (_, idx) => ({
          target: CONTRACTS.VE_TOKEN_ADDRESS,
          callData: vestingContract.methods
            .tokenOfOwnerByIndex(account.address, idx)
            .encodeABI(),
        }));

        const aggregateRes1 = await multicallContract.methods
          .aggregate(calls)
          .call();

        nftIds = aggregateRes1.returnData.map((data) => parseInt(data, 16));
      }

      const pairs = this.getStore("pairs");

      const filteredPairs = [
        ...pairs.filter((pair) => {
          return pair && pair.gauge;
        }),
      ];

      if (nftIds) {
        const Bribecalls = nftIds.map((nft) => {
          // Create an array to store the results for each nft
          const nftCalls = filteredPairs.map((pair) => {
            return pair.gauge.bribes.map((bribe) => {
              const bribeContract = new web3.eth.Contract(
                CONTRACTS.WE_BRIBE_FACTORY_ABI as AbiItem[],
                pair.gauge.bribe_address
              );
              const callData = bribeContract.methods
                .earned(bribe.token.address, nft)
                .encodeABI();

              return {
                target: pair.gauge.bribe_address,
                callData: callData,
              };
            });
          });
          return [].concat(...nftCalls);
        });

        const Feecalls = nftIds.map((nft) => {
          const nftCalls = filteredPairs.map((pair) => {
            const feeContract = new web3.eth.Contract(
              CONTRACTS.IT_BRIBE_FACTORY_ABI as AbiItem[],
              pair.gauge.fees_address
            );

            const callData = feeContract.methods
              .earned(pair.token0_address, nft)
              .encodeABI();

            const callData2 = feeContract.methods
              .earned(pair.token1_address, nft)
              .encodeABI();

            return [
              {
                target: pair.gauge.fees_address,
                callData: callData,
              },
              {
                target: pair.gauge.fees_address,
                callData: callData2,
              },
            ];
          });
          return [].concat(...nftCalls);
        });

        // Flatten the array of arrays into a single-level array
        const Bribeflattened = [].concat(...Bribecalls);
        const Feeflattened = [].concat(...Feecalls);

        const Bribeaggregate = await multicallContract.methods
          .aggregate(Bribeflattened)
          .call();

        const Feeaggregate = await multicallContract.methods
          .aggregate(Feeflattened)
          .call();

        const BribehexValues = Bribeaggregate.returnData;
        const FeeValues = Feeaggregate.returnData;

        const BribeValues = await BribehexValues.map((hexValue) => {
          return web3.eth.abi.decodeParameter("uint256", hexValue);
        });
        //////console.log("All bribe", decimalValues);
        const FeeValues2 = await FeeValues.map((hexValue) => {
          return web3.eth.abi.decodeParameter("uint256", hexValue);
        });

        //////console.log("BribeValues", BribeValues);

        const result = [];
        let cnt = 0;
        let dataIndex = 0;
        const mappedResult = nftIds.map((id) => {
          const allEarnedData: AllEarned = {
            tokenID: "0",
            Bribe: [],
            Fees: [],
          };

          const pairsForId = filteredPairs.map((pair) => {
            let isBribe = false;

            const updatedGauge = {
              ...pair.gauge,
              bribes: pair.gauge.bribes.map((bribe) => {
                let earned = "0";
                if (BribeValues[cnt] > 0) {
                  isBribe = true;
                  earned = BigNumber(BribeValues[cnt])
                    .div(10 ** bribe.token.decimals)
                    .toFixed(bribe.token.decimals);
                }
                cnt++;
                return {
                  ...bribe,
                  earned,
                };
              }),
            };

            updatedGauge.Isbribe = isBribe;

            return {
              ...pair,
              gauge: updatedGauge,
            };
          });
          const filteredBribes = [];
          const a = pairsForId
            .filter((pair) => pair.gauge.Isbribe)
            .map((pair) => {
              pair.rewardType = "Bribe";
              pair.gauge.tokenID = id;
              filteredBribes.push(pair);
              //result.push(pair);
            });

          const feesEarned = filteredPairs.map((pair, index) => {
            let token0 = "";
            let token1 = "";
            if (FeeValues2[dataIndex] !== undefined) {
              token0 = BigNumber(FeeValues2[dataIndex])
                .div(10 ** pair.token0.decimals)
                .toFixed(pair.token0.decimals);
            }

            if (FeeValues2[dataIndex + 1] !== undefined) {
              token1 = BigNumber(FeeValues2[dataIndex + 1])
                .div(10 ** pair.token1.decimals)
                .toFixed(pair.token1.decimals);
            }

            const updatedGauge = {
              ...pair.gauge,
              token0Earned: token0,
              token1Earned: token1,
            };
            dataIndex += 2;
            return {
              ...pair,
              gauge: updatedGauge,
            };
          });

          ////console.log("feesEarned", feesEarned, id)
          const filteredFees = feesEarned
            .filter(
              (pair) =>
                pair.gauge &&
                (pair.gauge.token0Earned || pair.gauge.token1Earned) &&
                (BigNumber(pair.gauge.token0Earned).gt(0) ||
                  BigNumber(pair.gauge.token1Earned).gt(0))
            )
            .map((pair) => {
              ////console.log("pair in fee", pair, id)
              pair.rewardType = "Fees";
              pair.gauge.tokenID = id;
              //result.push(pair);
              return pair;
            });
          if (filteredBribes.length > 0 || filteredFees.length > 0) {
            allEarnedData.tokenID = id;
            allEarnedData.Bribe = filteredBribes;
            allEarnedData.Fees = filteredFees;
            result.push(allEarnedData);
          }
        });
        await this.getLpBalance();
        let veDist_ = this.getStore("rewards").veDist;
        if (veDist_.length > 0) {
        } else {
          await this.getDistBalances();
        }
        this.emitter.emit(ACTIONS.ALL_TOKEN_BALANCES_RETURNED, result);
      }
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
      this.emitter.emit(ACTIONS.REWARD_BALANCES_RETURNED, []);
    }
  };

  getDistBalances = async () => {
    try {
      const account = stores.accountStore.getStore("account");

      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();

      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const veToken = this.getStore("veToken");
      const govToken = this.getStore("govToken");

      const veDistContract = new web3.eth.Contract(
        CONTRACTS.VE_DIST_ABI as AbiItem[],
        CONTRACTS.VE_DIST_ADDRESS
      );

      const vestingContract = new web3.eth.Contract(
        CONTRACTS.VE_TOKEN_ABI as AbiItem[],
        CONTRACTS.VE_TOKEN_ADDRESS
      );

      const veDistReward = [];

      const nftsLength = await vestingContract.methods
        .balanceOf(account.address)
        .call();
      const nftCount = parseInt(nftsLength);

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const calls = Array.from({ length: nftCount }, (_, idx) => ({
        target: CONTRACTS.VE_TOKEN_ADDRESS,
        callData: vestingContract.methods
          .tokenOfOwnerByIndex(account.address, idx)
          .encodeABI(),
      }));

      const aggregateRes1 = await multicallContract.methods
        .aggregate(calls)
        .call();

      const nftIds = aggregateRes1.returnData.map((data) => parseInt(data, 16));

      const calls2 = nftIds.map((idx) => ({
        target: CONTRACTS.VE_DIST_ADDRESS,
        callData: veDistContract.methods.claimable(idx).encodeABI(),
      }));

      const aggregateRes2 = await multicallContract.methods
        .aggregate(calls2)
        .call();

      const veDistEarned = aggregateRes2.returnData.map(
        (data) => new BigNumber(parseInt(data, 16))
      );

      const nonZeroIndexes = veDistEarned
        .map((value, index) => ({ value, index }))
        .filter((item) => BigNumber(item.value).gt(0))
        .map((item) => item.index);
      ////console.log("nonZeroIndexes", nonZeroIndexes);
      const vestNFTs = this.getStore("vestNFTs");
      const theNFT = nonZeroIndexes.flatMap((idx) => {
        const relevantVestNFTs = vestNFTs.filter(
          (vestNFT) => nftIds[idx] === vestNFT.id
        );
        return relevantVestNFTs.map((vestNFT) => ({
          nftId: vestNFT,
          veDistEarned: veDistEarned[idx],
        }));
      });

      theNFT.forEach((token) => {
        veDistReward.push({
          token: token.nftId,
          lockToken: veToken,
          rewardToken: govToken,
          earned: new BigNumber(token.veDistEarned)
            .div(10 ** govToken.decimals)
            .toFixed(govToken.decimals),
          rewardType: "Distribution",
        });
      });

      this.setStore({
        rewards: {
          ...this.store.rewards,
          veDist: veDistReward,
        },
      });
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  getLpBalance = async () => {
    const web3 = await stores.accountStore.getWeb3Provider();

    if (!web3) {
      //////console.warn("web3 not found");
      return null;
    }
    const account = stores.accountStore.getStore("account");
    const pairs = this.getStore("pairs");

    const filteredPairs = [
      ...pairs.filter((pair) => {
        return pair && pair.gauge;
      }),
    ];

    const rewardsEarned = await Promise.all(
      filteredPairs.map(async (pair) => {
        const gaugeContract = new web3.eth.Contract(
          CONTRACTS.GAUGE_ABI as AbiItem[],
          pair.gauge.address
        );
        let earned = "";
        try {
          earned = await gaugeContract.methods
            .earned(CONTRACTS.GOV_TOKEN_ADDRESS, account.address)
            .call();
          ////////console.log("earned reawards", earned, pair)
          pair.gauge.rewardsEarned = BigNumber(earned)
            .div(10 ** 18)
            .toFixed(18);

          return pair;
        } catch (ex) {
          ////console.error(ex);
        }
      })
    );

    const filteredRewards: Pair[] = []; // Pair with rewardType set to "Reward"
    for (let j = 0; j < rewardsEarned.length; j++) {
      let pair = Object.assign({}, rewardsEarned[j]);
      if (
        pair.gauge &&
        pair.gauge.rewardsEarned &&
        BigNumber(pair.gauge.rewardsEarned).gt(0)
      ) {
        pair.rewardType = "Reward";
        filteredRewards.push(pair);
      }
    }
    this.setStore({
      rewards: {
        ...this.store.rewards,
        rewards: filteredRewards,
      },
    });
  };

  getBribeBalance = async (payload) => {
    const account = stores.accountStore.getStore("account");
    if (!account) {
      //////console.warn("account not found");
      return null;
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      //////console.warn("web3 not found");
      return null;
    }

    const multicallContract = new web3.eth.Contract(
      CONTRACTS.MULTICALL_ABI as AbiItem[],
      CONTRACTS.MULTICALL_ADDRESS
    );

    const { tokenID } = payload.content;

    const pairs = this.getStore("pairs");

    const filteredPairs = [
      ...pairs.filter((pair) => {
        return pair && pair.gauge;
      }),
    ];

    let filteredBribes: Pair[] = [];

    if (tokenID) {
      const calls = filteredPairs.map((pair) => {
        ////////console.log("pairs", pair)
        return pair.gauge.bribes.map((bribe) => {
          ////////console.log("bribes", bribe)
          const bribeContract = new web3.eth.Contract(
            CONTRACTS.WE_BRIBE_FACTORY_ABI as AbiItem[],
            pair.gauge.bribe_address
          );
          const callData = bribeContract.methods
            .earned(bribe.token.address, tokenID)
            .encodeABI();
          //////console.log("symbol",bribe.token.symbol,bribe.token.address,pair.symbol);
          return {
            target: pair.gauge.bribe_address,
            callData: callData,
          };
        });
      });

      // Flatten the array of arrays into a single-level array
      const flattenedCalls = [].concat(...calls);

      const aggregateRes1 = await multicallContract.methods
        .aggregate(flattenedCalls)
        .call();

      const hexValues = aggregateRes1.returnData;
      //////console.log("hexValues", hexValues)
      const decimalValues = hexValues.map((hexValue) => {
        return web3.eth.abi.decodeParameter("uint256", hexValue);
      });
      //////console.log("hexValues bribe", hexValues, tokenID);

      let cnt = 0;
      const bribesEarned2 = filteredPairs.map((pair) => {
        pair.gauge.Isbribe = false;
        pair.gauge.bribes.forEach((bribe) => {
          if (decimalValues[cnt] > 0) {
            pair.gauge.Isbribe = true;
          }
          bribe.earned = BigNumber(decimalValues[cnt])
            .div(10 ** bribe.token.decimals)
            .toFixed(bribe.token.decimals);
          cnt++;
        });
        return pair;
      });
      // q//console.log("bribesEarned2", bribesEarned2);
      filteredBribes = bribesEarned2
        .filter((pair) => pair.gauge.Isbribe)
        .map((pair) => {
          pair.rewardType = "Bribe";
          return pair;
        });
    }

    this.setStore({
      rewards: {
        bribes: filteredBribes,
      },
    });
  };

  getFeeBalance = async (payload) => {
    const account = stores.accountStore.getStore("account");
    if (!account) {
      //////console.warn("account not found");
      return null;
    }

    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) {
      //////console.warn("web3 not found");
      return null;
    }

    const multicallContract = new web3.eth.Contract(
      CONTRACTS.MULTICALL_ABI as AbiItem[],
      CONTRACTS.MULTICALL_ADDRESS
    );

    const { tokenID } = payload.content;

    const pairs = this.getStore("pairs");

    const filteredPairs = [
      ...pairs.filter((pair) => {
        return pair && pair.gauge;
      }),
    ];

    let filteredFees: Pair[] = [];
    if (tokenID) {
      const calls = filteredPairs.map((pair) => {
        const feeContract = new web3.eth.Contract(
          CONTRACTS.IT_BRIBE_FACTORY_ABI as AbiItem[],
          pair.gauge.fees_address
        );
        //console.log("tokenID", tokenID);
        const callData = feeContract.methods
          .earned(pair.token0_address, tokenID)
          .encodeABI();

        const callData2 = feeContract.methods
          .earned(pair.token1_address, tokenID)
          .encodeABI();
        return [
          {
            target: pair.gauge.fees_address,
            callData: callData,
          },
          {
            target: pair.gauge.fees_address,
            callData: callData2,
          },
        ];
      });

      const flattenedCalls = [].concat(...calls);

      const aggregateRes1 = await multicallContract.methods
        .aggregate(flattenedCalls)
        .call();

      const hexValues = aggregateRes1.returnData;
      const decimalValues = hexValues.map((hexValue) => {
        return web3.eth.abi.decodeParameter("uint256", hexValue);
      });
      const feesEarned = filteredPairs.map((pair, index) => {
        const dataIndex = index * 2;

        if (decimalValues[dataIndex] !== undefined) {
          pair.gauge.token0Earned = BigNumber(decimalValues[dataIndex])
            .div(10 ** pair.token0.decimals)
            .toFixed(pair.token0.decimals);
        }

        if (decimalValues[dataIndex + 1] !== undefined) {
          pair.gauge.token1Earned = BigNumber(decimalValues[dataIndex + 1])
            .div(10 ** pair.token1.decimals)
            .toFixed(pair.token0.decimals);
        }
        return pair;
      });
      for (let j = 0; j < feesEarned.length; j++) {
        let pair = Object.assign({}, feesEarned[j]);
        if (
          pair.gauge &&
          (pair.gauge.token0Earned || pair.gauge.token1Earned) &&
          (BigNumber(pair.gauge.token0Earned).gt(0) ||
            BigNumber(pair.gauge.token1Earned).gt(0))
        ) {
          pair.rewardType = "Fees";
          filteredFees.push(pair);
        }
      }
    }

    this.setStore({
      rewards: {
        fees: filteredFees,
      },
    });
  };

  getRewardBalances = async (payload) => {
    try {
      const veDistReward = await this.getStore("rewards").veDist;
      //await this.getAllTokenVoteBalance();
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const multicallContract = new web3.eth.Contract(
        CONTRACTS.MULTICALL_ABI as AbiItem[],
        CONTRACTS.MULTICALL_ADDRESS
      );

      const { tokenID } = payload.content;
      ////////////console.log("tokenID", tokenID)
      const pairs = this.getStore("pairs");

      const filteredPairs = [
        ...pairs.filter((pair) => {
          return pair && pair.gauge;
        }),
      ];

      // Pair with rewardType set to "Bribe"
      let filteredBribes: Pair[] = [];
      if (tokenID) {
        const calls = filteredPairs.map((pair) => {
          ////////console.log("pairs", pair)
          return pair.gauge.bribes.map((bribe) => {
            ////////console.log("bribes", bribe)
            const bribeContract = new web3.eth.Contract(
              CONTRACTS.WE_BRIBE_FACTORY_ABI as AbiItem[],
              pair.gauge.bribe_address
            );
            const callData = bribeContract.methods
              .earned(bribe.token.address, tokenID)
              .encodeABI();
            //////console.log("symbol",bribe.token.symbol,bribe.token.address,pair.symbol);
            return {
              target: pair.gauge.bribe_address,
              callData: callData,
            };
          });
        });

        // Flatten the array of arrays into a single-level array
        const flattenedCalls = [].concat(...calls);

        const aggregateRes1 = await multicallContract.methods
          .aggregate(flattenedCalls)
          .call();

        const hexValues = aggregateRes1.returnData;
        //////console.log("hexValues", hexValues)
        const decimalValues = hexValues.map((hexValue) => {
          return web3.eth.abi.decodeParameter("uint256", hexValue);
        });
        //////console.log("hexValues bribe", hexValues, tokenID);

        let cnt = 0;
        const bribesEarned2 = filteredPairs.map((pair) => {
          pair.gauge.Isbribe = false;
          pair.gauge.bribes.forEach((bribe) => {
            if (decimalValues[cnt] > 0) {
              pair.gauge.Isbribe = true;
            }
            bribe.earned = BigNumber(decimalValues[cnt])
              .div(10 ** bribe.token.decimals)
              .toFixed(bribe.token.decimals);
            cnt++;
          });
          return pair;
        });
        // q//console.log("bribesEarned2", bribesEarned2);
        filteredBribes = bribesEarned2
          .filter((pair) => pair.gauge.Isbribe)
          .map((pair) => {
            pair.rewardType = "Bribe";
            return pair;
          });
      }

      // Pair with rewardType set to "Fees"
      let filteredFees: Pair[] = [];
      if (tokenID) {
        const calls = filteredPairs.map((pair) => {
          const feeContract = new web3.eth.Contract(
            CONTRACTS.IT_BRIBE_FACTORY_ABI as AbiItem[],
            pair.gauge.fees_address
          );

          const callData = feeContract.methods
            .earned(pair.token0_address, tokenID)
            .encodeABI();

          const callData2 = feeContract.methods
            .earned(pair.token1_address, tokenID)
            .encodeABI();
          return [
            {
              target: pair.gauge.fees_address,
              callData: callData,
            },
            {
              target: pair.gauge.fees_address,
              callData: callData2,
            },
          ];
        });

        const flattenedCalls = [].concat(...calls);

        const aggregateRes1 = await multicallContract.methods
          .aggregate(flattenedCalls)
          .call();

        const hexValues = aggregateRes1.returnData;
        const decimalValues = hexValues.map((hexValue) => {
          return web3.eth.abi.decodeParameter("uint256", hexValue);
        });
        const feesEarned = filteredPairs.map((pair, index) => {
          const dataIndex = index * 2;

          if (decimalValues[dataIndex] !== undefined) {
            pair.gauge.token0Earned = BigNumber(decimalValues[dataIndex])
              .div(10 ** pair.token0.decimals)
              .toFixed(pair.token0.decimals);
          }

          if (decimalValues[dataIndex + 1] !== undefined) {
            pair.gauge.token1Earned = BigNumber(decimalValues[dataIndex + 1])
              .div(10 ** pair.token1.decimals)
              .toFixed(pair.token0.decimals);
          }
          return pair;
        });
        for (let j = 0; j < feesEarned.length; j++) {
          let pair = Object.assign({}, feesEarned[j]);
          if (
            pair.gauge &&
            (pair.gauge.token0Earned || pair.gauge.token1Earned) &&
            (BigNumber(pair.gauge.token0Earned).gt(0) ||
              BigNumber(pair.gauge.token1Earned).gt(0))
          ) {
            pair.rewardType = "Fees";
            filteredFees.push(pair);
          }
        }
      }

      // Pair with rewardType set to "Rewards"
      const rewardsEarned = await Promise.all(
        filteredPairs.map(async (pair) => {
          const gaugeContract = new web3.eth.Contract(
            CONTRACTS.GAUGE_ABI as AbiItem[],
            pair.gauge.address
          );
          let earned = "";
          try {
            earned = await gaugeContract.methods
              .earned(CONTRACTS.GOV_TOKEN_ADDRESS, account.address)
              .call();
            // //console.log("earned reawards", earned, pair);
            pair.gauge.rewardsEarned = BigNumber(earned)
              .div(10 ** 18)
              .toFixed(18);

            return pair;
          } catch (ex) {
            ////console.error(ex);
          }
        })
      );

      const filteredRewards: Pair[] = []; // Pair with rewardType set to "Reward"
      for (let j = 0; j < rewardsEarned.length; j++) {
        let pair = Object.assign({}, rewardsEarned[j]);
        if (
          pair.gauge &&
          pair.gauge.rewardsEarned &&
          BigNumber(pair.gauge.rewardsEarned).gt(0)
        ) {
          pair.rewardType = "Reward";
          filteredRewards.push(pair);
        }
      }
      //////console.log("filteredRewards", filteredRewards, tokenID);
      const rewards = {
        bribes: filteredBribes,
        fees: filteredFees,
        rewards: filteredRewards,
        veDist: veDistReward,
      };
      //console.log("stable reward", rewards, tokenID);
      ////////console.log("reward reward", filteredRewards, filteredFees, filteredBribes, veDistReward, tokenID)
      this.setStore({
        rewards,
      });
      this.emitter.emit(ACTIONS.REWARD_BALANCES_RETURNED, rewards);
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
      this.emitter.emit(ACTIONS.REWARD_BALANCES_RETURNED, []);
    }
  };

  claimBribes = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, tokenID } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let claimTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Claim rewards for ${pair.token0.symbol}/${pair.token1.symbol}`,
        verb: "Rewards Claimed",
        transactions: [
          {
            uuid: claimTXID,
            description: `Claiming your bribes`,
            status: "WAITING",
          },
        ],
      });

      // SUBMIT CLAIM TRANSACTION
      const gaugesContract = new web3.eth.Contract(
        CONTRACTS.VOTER_ABI as AbiItem[],
        CONTRACTS.VOTER_ADDRESS
      );

      //const claimableGauge = await gaugesContract.methods.claimable(pair.gauge_address).call();

      const sendGauges = [pair.gauge.bribe_address];
      const sendTokens = [
        pair.gauge.bribes.map((bribe) => {
          return bribe.token.address;
        }),
      ];
      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        gaugesContract,
        "claimBribes",
        [sendGauges, sendTokens, tokenID],
        account,
        gasPrice,
        null,
        null,
        claimTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this.getBribeBalance({ content: { tokenID } });
          this.getLpBalance();
          this.emitter.emit(ACTIONS.CLAIM_BRIBE_RETURNED, pair);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  claimAllRewards = async (payload) => {
    try {
      const context = this;
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { type, pairs, tokenID } = payload.content;
      if (type === "LP") {
        let rewardClaimTXIDs = this.getTXUUID();

        if (pairs.length == 0) {
          this.emitter.emit(ACTIONS.ERROR, "Nothing to claim");
          this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED);
          return;
        }

        let sendOBJ = {
          title: `Claim All rewards`,
          verb: "Rewards Claimed",
          transactions: [],
        };

        if (pairs.length > 0) {
          sendOBJ.transactions.push({
            uuid: rewardClaimTXIDs,
            description: `Claiming your All rewards`,
            status: "WAITING",
          });

          this.emitter.emit(ACTIONS.TX_ADDED, sendOBJ);

          const gauges = pairs.map((pair) => pair.gauge_address);

          const sendTok = Array(gauges.length).fill([
            CONTRACTS.GOV_TOKEN_ADDRESS,
          ]);
          const voterContract = new web3.eth.Contract(
            CONTRACTS.VOTER_ABI as AbiItem[],
            CONTRACTS.VOTER_ADDRESS
          );

          const gasPrice = await stores.accountStore.getGasPrice();

          const rewardPromise = new Promise<void>((resolve, reject) => {
            context._callContractWait(
              web3,
              voterContract,
              "claimRewards",
              [gauges, sendTok],
              account,
              gasPrice,
              null,
              null,
              rewardClaimTXIDs,
              (err) => {
                if (err) {
                  reject(err);
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              }
            );
          });

          await Promise.all([rewardPromise]);
        }
        this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, type);
        this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
      } else if (type === "vote") {
        // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
        let claimTXID = this.getTXUUID();
        let feeClaimTXIDs = this.getTXUUID();

        let bribePairs = pairs.filter((pair) => {
          return pair.rewardType === "Bribe";
        });

        let feePairs = pairs.filter((pair) => {
          return pair.rewardType === "Fees";
        });

        const sendGauges = bribePairs.map((pair) => {
          return pair.gauge.bribe_address;
        });
        const sendFees = feePairs.map((pair) => {
          return pair.gauge.fees_address;
        });
        const sendTokens = bribePairs.map((pair) => {
          return pair.gauge.bribes.map((bribe) => {
            return bribe.token.address;
          });
        });
        const sendTokens2 = feePairs.map((pair) => {
          return [pair.token0_address, pair.token1_address];
        });
        if (bribePairs.length == 0 && feePairs.length == 0) {
          this.emitter.emit(ACTIONS.ERROR, "Nothing to claim");
          this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED);
          return;
        }

        let sendOBJ = {
          title: `Claim All rewards`,
          verb: "Rewards Claimed",
          transactions: [],
        };

        if (bribePairs.length > 0) {
          sendOBJ.transactions.push({
            uuid: claimTXID,
            description: `Claiming all your available bribes`,
            status: "WAITING",
          });
        }

        if (feePairs.length > 0) {
          sendOBJ.transactions.push({
            uuid: feeClaimTXIDs,
            description: `Claiming all your available fees`,
            status: "WAITING",
          });
        }

        this.emitter.emit(ACTIONS.TX_ADDED, sendOBJ);

        if (bribePairs.length > 0) {
          // SUBMIT CLAIM TRANSACTION
          const voterContract = new web3.eth.Contract(
            CONTRACTS.VOTER_ABI as AbiItem[],
            CONTRACTS.VOTER_ADDRESS
          );
          const gasPrice = await stores.accountStore.getGasPrice();

          const claimPromise = new Promise<void>((resolve, reject) => {
            context._callContractWait(
              web3,
              voterContract,
              "claimBribes",
              [sendGauges, sendTokens, tokenID],
              account,
              gasPrice,
              null,
              null,
              claimTXID,
              (err) => {
                if (err) {
                  reject(err);
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              }
            );
          });

          await Promise.all([claimPromise]);
        }

        if (feePairs.length > 0) {
          const FeeTokens = [].concat(...sendTokens2);
          const voterContract = new web3.eth.Contract(
            CONTRACTS.VOTER_ABI as AbiItem[],
            CONTRACTS.VOTER_ADDRESS
          );
          const gasPrice = await stores.accountStore.getGasPrice();

          const claimPromise = new Promise<void>((resolve, reject) => {
            context._callContractWait(
              web3,
              voterContract,
              "claimFees",
              [sendFees, sendTokens2, tokenID],
              account,
              gasPrice,
              null,
              null,
              feeClaimTXIDs,
              (err) => {
                if (err) {
                  reject(err);
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              }
            );
          });

          await Promise.all([claimPromise]);
        }
        this.getRewardBalances({ content: { tokenID } });
        this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, type);
        this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
      } else if (type === "Dist") {
        let distributionClaimTXIDs = this.getTXUUID();

        let distribution = pairs.filter((pair) => {
          return pair.rewardType === "Distribution";
        });

        let sendOBJ = {
          title: `Claim All rewards`,
          verb: "Rewards Claimed",
          transactions: [],
        };

        if (distribution.length > 0) {
          const newClaimTX = this.getTXUUID();
          sendOBJ.transactions.push({
            uuid: newClaimTX,
            description: `Claiming distribution for All nfts`,
            status: "WAITING",
          });

          this.emitter.emit(ACTIONS.TX_ADDED, sendOBJ);

          const gasPrice = await stores.accountStore.getGasPrice();

          const tokens = pairs.map((pair) => {
            return pair.token.id;
          });

          const veDistContract = new web3.eth.Contract(
            CONTRACTS.VE_DIST_ABI as AbiItem[],
            CONTRACTS.VE_DIST_ADDRESS
          );

          const rewardPromise = new Promise<void>((resolve, reject) => {
            //
            context._callContractWait(
              web3,
              veDistContract,
              "claim_many",
              [tokens],
              account,
              gasPrice,
              null,
              null,
              distributionClaimTXIDs,
              (err) => {
                if (err) {
                  reject(err);
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              }
            );
          });

          await Promise.all([rewardPromise]);
        }
        this.getRewardBalances({ content: { tokenID } });
        this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, type);
        this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
      } else {
        let tokenID = [];
        let bribe = [];
        let fee = [];
        const result = pairs[0].map((pair) => {
          tokenID.push(pair.tokenID);
          bribe.push(pair.Bribe);
          fee.push(pair.Fees);
        });

        let claimTXID = this.getTXUUID();
        let feeClaimTXIDs = this.getTXUUID();

        const exAddress = bribe.map((pair) =>
          pair.map((pp) => {
            return pp.gauge.bribe_address;
          })
        );

        const ExternalAddress = [].concat(...exAddress);

        const inAddress = fee.map((pair) =>
          pair.map((pp) => {
            return pp.gauge.fees_address;
          })
        );

        const InternalAddress = [].concat(...inAddress);

        const exTokens = bribe.map((pair) =>
          pair.map((pp) =>
            pp.gauge.bribes.map((bribe) => {
              return bribe.token.address;
            })
          )
        );

        const ExternalTokens = [].concat(...exTokens);

        const inTokens = fee.map((pair) =>
          pair.map((pp) => {
            return [pp.token0_address, pp.token1_address];
          })
        );

        const InternalTokens = [].concat(...inTokens);

        if (bribe.length == 0 && fee.length == 0) {
          this.emitter.emit(ACTIONS.ERROR, "Nothing to claim");
          this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED);
          return;
        }

        let sendOBJ = {
          title: `Claim All rewards`,
          verb: "Rewards Claimed",
          transactions: [],
        };

        if (bribe.length > 0) {
          sendOBJ.transactions.push({
            uuid: claimTXID,
            description: `Claiming all your available bribes`,
            status: "WAITING",
          });
        }

        if (fee.length > 0) {
          sendOBJ.transactions.push({
            uuid: feeClaimTXIDs,
            description: `Claiming all your available fees`,
            status: "WAITING",
          });
        }

        this.emitter.emit(ACTIONS.TX_ADDED, sendOBJ);

        const voterContract = new web3.eth.Contract(
          CONTRACTS.VOTER_ABI as AbiItem[],
          CONTRACTS.VOTER_ADDRESS
        );

        if (bribe.length > 0) {
          // SUBMIT CLAIM TRANSACTION

          const gasPrice = await stores.accountStore.getGasPrice();

          const claimPromise = new Promise<void>((resolve, reject) => {
            context._callContractWait(
              web3,
              voterContract,
              "claimBribesWithtokenIds",
              [ExternalAddress, ExternalTokens, tokenID],
              account,
              gasPrice,
              null,
              null,
              claimTXID,
              (err) => {
                if (err) {
                  reject(err);
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              }
            );
          });

          await Promise.all([claimPromise]);
        }

        if (fee.length > 0) {
          const gasPrice = await stores.accountStore.getGasPrice();

          const claimPromise = new Promise<void>((resolve, reject) => {
            context._callContractWait(
              web3,
              voterContract,
              "claimFeesWithtokenIds",
              [InternalAddress, InternalTokens, tokenID],
              account,
              gasPrice,
              null,
              null,
              feeClaimTXIDs,
              (err) => {
                if (err) {
                  reject(err);
                  return this.emitter.emit(ACTIONS.ERROR, err);
                }

                resolve();
              }
            );
          });

          await Promise.all([claimPromise]);
        }

        this.getRewardBalances({ content: { tokenID } });
        this.emitter.emit(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, type);
        this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
      }
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  claimRewards = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, tokenID } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let claimTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Claim rewards for Staked LPs`,
        verb: "Rewards Claimed",
        transactions: [
          {
            uuid: claimTXID,
            description: `Claiming reward for ${pair.symbol}`,
            status: "WAITING",
          },
        ],
      });

      // SUBMIT CLAIM TRANSACTION
      const gaugeContract = new web3.eth.Contract(
        CONTRACTS.GAUGE_ABI as AbiItem[],
        pair.gauge.address
      );

      const sendTokens = [CONTRACTS.GOV_TOKEN_ADDRESS];

      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        gaugeContract,
        "getReward",
        [account.address, sendTokens],
        account,
        gasPrice,
        null,
        null,
        claimTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this.getLpBalance();
          this.emitter.emit(ACTIONS.CLAIM_REWARD_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  claimVeDist = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { tokenID } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let claimTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Claim distribution for NFT #${tokenID}`,
        verb: "Rewards Claimed",
        transactions: [
          {
            uuid: claimTXID,
            description: `Claiming your distribution`,
            status: "WAITING",
          },
        ],
      });

      const gasPrice = await stores.accountStore.getGasPrice();

      // SUBMIT CLAIM TRANSACTION
      const veDistContract = new web3.eth.Contract(
        CONTRACTS.VE_DIST_ABI as AbiItem[],
        CONTRACTS.VE_DIST_ADDRESS
      );

      this._callContractWait(
        web3,
        veDistContract,
        "claim",
        [tokenID],
        account,
        gasPrice,
        null,
        null,
        claimTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }
          this.getLpBalance();
          this.getDistBalances();
          this.emitter.emit(ACTIONS.CLAIM_VE_DIST_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  claimFees = async (payload) => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      const { pair, tokenID } = payload.content;

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let claimTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `Claim fees for ${pair.token0.symbol}/${pair.token1.symbol}`,
        verb: "Fees Claimed",
        transactions: [
          {
            uuid: claimTXID,
            description: `Claiming your fees`,
            status: "WAITING",
          },
        ],
      });

      // SUBMIT CLAIM TRANSACTION
      const FeesContract = new web3.eth.Contract(
        CONTRACTS.IT_BRIBE_FACTORY_ABI as AbiItem[],
        pair.gauge.fees_address
      );

      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        FeesContract,
        "getReward",
        [tokenID, [pair.token0_address, pair.token1_address]],
        account,
        gasPrice,
        null,
        null,
        claimTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          this.getFeeBalance({ content: { tokenID } });
          this.getLpBalance();
          this.emitter.emit(ACTIONS.CLAIM_PAIR_FEES_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _callContractWait = async (
    web3: Web3,
    contract: Contract,
    method: string,
    params: any[],
    account,
    gasPrice,
    dispatchEvent,
    dispatchContent,
    uuid,
    callback,
    sendValue = null
  ) => {
    const res = await web3.eth.getChainId(); //if there's some error..check async
    const isChainSupported = supportedChainIdList.includes(res);
    if (!isChainSupported) {
      type EthWindow = Window &
        typeof globalThis & {
          ethereum?: any;
        };
      const ethereum = (window as EthWindow).ethereum;
      const hexChain = stores.accountStore.getStore("chainId");
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
    }
    this.emitter.emit(ACTIONS.TX_PENDING, { uuid });
    //console.log("GasFee From _callContract : ", gasPrice);
    //console.log("contract : ", contract);
    //console.log("Web3: ", web3);
    //console.log("method: ", method);
    //console.log("param", params);
    const gasCost = contract.methods[method](...params)
      .estimateGas({ from: account.address, value: sendValue })
      .then(async (estimatedGas) => [
        BigNumber(web3.utils.toWei(String(gasPrice), "gwei")),
        0,
        estimatedGas,
      ])
      .then(([estimatedGas]: [BigNumber]) => {
        const context = this;
        ////////console.log("NOW send");
        ////////console.log(contract.methods[method](...params));
        contract.methods[method](...params)
          .send({
            from: account.address,
            //gas:1000000,
            gasPrice: estimatedGas,
            value: sendValue,
          })
          .on("transactionHash", function (txHash: string) {
            context.emitter.emit(ACTIONS.TX_SUBMITTED, { uuid, txHash });
          })
          .on("receipt", function (receipt: TransactionReceipt) {
            context.emitter.emit(ACTIONS.TX_CONFIRMED, {
              uuid,
              txHash: receipt.transactionHash,
            });
            context.emitter.emit(ACTIONS.TX_CLEAR);
            // if (method !== "approve" && method !== "reset") {
            //   setTimeout(() => {
            //     context.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
            //   }, 1);
            // }

            callback(null, receipt.transactionHash);
            if (dispatchEvent) {
              context.dispatcher.dispatch({
                type: dispatchEvent,
                content: dispatchContent,
              });
            }
          })
          .on("error", function (error) {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                context.emitter.emit(ACTIONS.TX_REJECTED, {
                  uuid,
                  error: error.message,
                });
                context.emitter.emit(ACTIONS.TX_CLEAR);
                return callback(error.message);
              }
              context.emitter.emit(ACTIONS.TX_REJECTED, {
                uuid,
                error: error,
              });
              context.emitter.emit(ACTIONS.TX_CLEAR);
              callback(error);
            }
          })
          .catch((error) => {
            if (!error.toString().includes("-32601")) {
              if (error.message) {
                context.emitter.emit(ACTIONS.TX_REJECTED, {
                  uuid,
                  error: error.message,
                });
                context.emitter.emit(ACTIONS.TX_CLEAR);
                return callback(error.message);
              }
              context.emitter.emit(ACTIONS.TX_REJECTED, {
                uuid,
                error: error,
              });
              context.emitter.emit(ACTIONS.TX_CLEAR);
              callback(error);
            }
          });
      })
      .catch((ex) => {
        ////////console.log(ex);
        if (ex.message) {
          this.emitter.emit(ACTIONS.TX_REJECTED, { uuid, error: ex.message });
          this.emitter.emit(ACTIONS.TX_CLEAR);
          return callback(ex.message);
        }
        this.emitter.emit(ACTIONS.TX_REJECTED, {
          uuid,
          error: "Error estimating gas",
        });
        this.emitter.emit(ACTIONS.TX_CLEAR);
        callback(ex);
      });
  };

  updateEpochPeriod = async () => {
    try {
      const account = stores.accountStore.getStore("account");
      if (!account) {
        //////console.warn("account not found");
        return null;
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      if (!web3) {
        //////console.warn("web3 not found");
        return null;
      }

      // ADD TRNASCTIONS TO TRANSACTION QUEUE DISPLAY
      let updateEpochPeriodTXID = this.getTXUUID();

      this.emitter.emit(ACTIONS.TX_ADDED, {
        title: `UPDATE EPOCH PERIOD`,
        verb: "Epoch Period Updated",
        transactions: [
          {
            uuid: updateEpochPeriodTXID,
            description: `Updating Epoch Period`,
            status: "WAITING",
          },
        ],
      });

      // SUBMIT UPDATE EPOCH PERIOD TRANSACTION
      const minterContract = new web3.eth.Contract(
        CONTRACTS.MINTER_ABI as AbiItem[],
        CONTRACTS.MINTER_ADDRESS
      );
      const gasPrice = await stores.accountStore.getGasPrice();

      this._callContractWait(
        web3,
        minterContract,
        "update_period",
        [],
        account,
        gasPrice,
        null,
        null,
        updateEpochPeriodTXID,
        async (err) => {
          if (err) {
            return this.emitter.emit(ACTIONS.ERROR, err);
          }

          window.setTimeout(() => {
            this.dispatcher.dispatch({
              type: ACTIONS.UPDATE_EPOCH_PERIOD,
            });
          }, 2);

          this.emitter.emit(ACTIONS.UPDATE_EPOCH_PERIOD_RETURNED);
          this.dispatcher.dispatch({ type: ACTIONS.GET_BALANCES });
        }
      );
    } catch (ex) {
      ////console.error(ex);
      this.emitter.emit(ACTIONS.ERROR, ex);
    }
  };

  _makeBatchRequest = (web3, callFrom, calls) => {
    let batch = new web3.BatchRequest();

    let promises = calls.map((call) => {
      return new Promise((res, rej) => {
        let req = call.request({ from: callFrom }, (err, data) => {
          if (err) rej(err);
          else res(data);
        });
        batch.add(req);
      });
    });
    batch.execute();

    return Promise.all(promises);
  };
  //
  // _getMulticallWatcher = (web3, calls) => {
  //
  // }
}

export default Store;
