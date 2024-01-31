import BigNumber from "bignumber.js";
import * as contractsTestnet from "./contractsTestnet";
import * as contractsMainnet from "./contractsMainnet";
import * as contractsMainnet_Test from "./contractsMainnet_Test";
import tokenlistTest from "../../testnet-token-list.json";
import tokenlistMain from "../../mainnet-token-list.json";
import * as actions from "./actions";
import stores from "..";
import type { Contracts } from "../types/types";

// let isMain = process.env.NEXT_PUBLIC_CHAINID === "3441005";
// let isTest = process.env.NEXT_PUBLIC_CHAINID === "534350";
// ////console.log("process.env.NEXT_PUBLIC_CHAINID", process.env.NEXT_PUBLIC_CHAINID);
// //default setting
// let scan = "https://sepolia.scrollscan.com/";
// let cont: Contracts = contractsMainnet;
// let nativeETH = {
//   address: cont.ETH_ADDRESS,
//   decimals: cont.ETH_DECIMALS,
//   logoURI: cont.ETH_LOGO,
//   name: cont.ETH_NAME,
//   symbol: cont.ETH_SYMBOL,
//   chainId: 3441005,
// };
// let wNativeAddress = cont.WETH_ADDRESS;

// //is Testnet
// if (isTest) {
//   //console.log("test");
//   scan = "https://sepolia.scrollscan.com/";
//   cont = contractsTestnet;
//   nativeETH = {
//     address: cont.ETH_ADDRESS,
//     decimals: cont.ETH_DECIMALS,
//     logoURI: cont.ETH_LOGO,
//     name: cont.ETH_NAME,
//     symbol: cont.ETH_SYMBOL,
//     chainId: 3441005,
//   };
//   wNativeAddress = cont.WETH_ADDRESS;
// }
// //is Mainnet
// else if (isMain) {
//   ////console.log("main");
//   scan = "https://sepolia.scrollscan.com/";
//   cont = contractsMainnet;
//   nativeETH = {
//     address: cont.ETH_ADDRESS,
//     decimals: cont.ETH_DECIMALS,
//     logoURI: cont.ETH_LOGO,
//     name: cont.ETH_NAME,
//     symbol: cont.ETH_SYMBOL,
//     chainId: 3441005,
//   };
//   wNativeAddress = cont.WETH_ADDRESS;
// }

const contractList = {
  169: contractsMainnet,
  3441005: contractsTestnet,
};

const tokenlist = {
  169: tokenlistMain,
  3441005: tokenlistTest,
};

const ScanList = {
  169: "https://pacific-explorer.manta.network/",
  3441005: "https://pacific-explorer.testnet.manta.network/",
};

const w_native_address_list = {
  169: contractsMainnet.WETH_ADDRESS,
  3441005: contractsTestnet.WETH_ADDRESS,
};

const native_address_list = {
  169: {
    address: contractsMainnet.ETH_ADDRESS,
    decimals: contractsMainnet.ETH_DECIMALS,
    logoURI: contractsMainnet.ETH_LOGO,
    name: contractsMainnet.ETH_NAME,
    symbol: contractsMainnet.ETH_SYMBOL,
    chainId: 169,
  },
  3441005: {
    address: contractsTestnet.ETH_ADDRESS,
    decimals: contractsTestnet.ETH_DECIMALS,
    logoURI: contractsTestnet.ETH_LOGO,
    name: contractsTestnet.ETH_NAME,
    symbol: contractsTestnet.ETH_SYMBOL,
    chainId: 3441005,
  },
};

export const SCROLLSCAN_LIST = ScanList;

export const TOKEN_LIST = tokenlist;

export const CONTRACTLIST = contractList;

export const ACTIONS = actions;

export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1).toFixed(0);
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const NATIVE_TOKEN_LIST = native_address_list;
export const W_NATIVE_ADDRESS_LIST = w_native_address_list;
