import { Dispatcher } from "flux";
import EventEmitter from "events";

import { ACTIONS } from "./constants/constants";

import {
  metamask,
  // walletconnect,
  network,
  // coinbase,
  okxwallet,
} from "./connectors/connectors";

import { ITransaction } from "./types/types";

import Web3 from "web3";

type EthWindow = Window &
  typeof globalThis & {
    ethereum?: any;
  } & {
    okxwallet?: any;
  };

class Store {
  dispatcher: Dispatcher<any>;
  emitter: EventEmitter;
  store: {
    account: null | { address: string };
    chainInvalid: boolean;
    chainId: number;
    web3context: null | { library: { provider: any } };
    tokens: any[];
    connectorsByName: {
      MetaMask: typeof metamask;
      // WalletConnect: typeof walletconnect;
      // WalletLink: typeof coinbase;
      OKXWallet: typeof okxwallet;
    };
    currentBlock: number;
    gasPrices: number;
    // gasPrices: {
    //   standard: number;
    //   fast: number;
    //   instant: number;
    // };
    gasSpeed: string;

    // TEST UPDATE
    queueOpen: boolean;
    transactions: ITransaction["transactions"];
    purpose: null | string;
    type: null | string;
    action: null | string;
    swap_slippage: string;
    liquidity_slippage: string;
  };

  constructor(dispatcher: Dispatcher<any>, emitter: EventEmitter) {
    this.dispatcher = dispatcher;
    this.emitter = emitter;
    this.store = {
      account: null,
      chainId: 169,
      chainInvalid: false,
      web3context: null,
      tokens: [],
      connectorsByName: {
        MetaMask: metamask,
        // WalletConnect: walletconnect,
        // WalletLink: coinbase,
        OKXWallet: okxwallet,
      } as const,
      currentBlock: 1320792,
      gasPrices: null,
      gasSpeed: "fast",

      // TEST UPDATE
      queueOpen: false,
      transactions: [
        {
          uuid: null,
          description: null,
          status: null,
          txHash: null,
          error: null,
        },
      ],
      purpose: null,
      type: null,
      action: null,
      swap_slippage: "2",
      liquidity_slippage: "2",
    };
    dispatcher.register(
      function (this: Store, payload: { type: string }) {
        switch (payload.type) {
          case ACTIONS.CONFIGURE:
            this.configure();
            break;
          case ACTIONS.TX_UPDATED:
            this.addTransaction(payload);
            break;
          case ACTIONS.TX_CLEAR:
            this.clearTransaction(payload);
            break;

          default: {
          }
        }
      }.bind(this)
    );
  }

  getStore = <K extends keyof Store["store"]>(index: K) => {
    return this.store[index];
  };

  setStore(obj: { [key: string]: any }) {
    this.store = { ...this.store, ...obj };
    return this.emitter.emit(ACTIONS.STORE_UPDATED);
  }

  configure = async () => {
    const web3 = await this.getWeb3Provider();

    metamask.isAuthorized().then(async (isAuthorized) => {
      const { supportedChainIds } = metamask;
      const chainId = web3.givenProvider?.isMetaMask
        ? web3.givenProvider.chainId
        : "3441005";
      let parsedChainId = 3441005;
      if (chainId) {
        parsedChainId = parseInt(chainId, 16);
      }
      const isChainSupported = supportedChainIds.includes(parsedChainId);
      if (!isChainSupported) {
        this.setStore({ chainInvalid: true, chainId: parsedChainId });
        this.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
      } else {
        this.setStore({ chainInvalid: false, chainId: parsedChainId });
        //this.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
      }
      if (!isAuthorized) {
        this.setStore({
          account: { address: await network.getAccount() },
          web3context: { library: { provider: await network.getProvider() } },
        });
        this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
        //   })
        //   .then(() => { //start render from here
        this.dispatcher.dispatch({
          type: ACTIONS.CONFIGURE_SS,
          content: { connected: false },
        });
      } else {
        ////console.log("configure");
        this.setStore({
          account: { address: await metamask.getAccount() },
          web3context: { library: { provider: await metamask.getProvider() } },
        });
        this.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
        this.dispatcher.dispatch({
          type: ACTIONS.CONFIGURE_SS,
          content: { connected: true },
        });
      }
    });

    if ((window as EthWindow).ethereum) {
      this.updateAccount();
    } else {
      window.removeEventListener("ethereum#initialized", this.updateAccount);
      window.addEventListener("ethereum#initialized", this.updateAccount, {
        once: true,
      });
    }
  };

  //accountChanged event Called
  updateAccount = () => {
    ////console.log("updateAccount");
    const that = this;
    const res = (window as EthWindow).ethereum.on(
      "accountsChanged",
      function (accounts: string[]) {
        that.setStore({
          account: { address: accounts[0] },
          web3context: {
            library: { provider: (window as EthWindow).ethereum },
          },
        });

        that.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
        that.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
        that.dispatcher.dispatch({
          type: ACTIONS.CONFIGURE_SS,
          content: { connected: false },
        });
      }
    );
    //chainChanged event Called
    (window as EthWindow).ethereum.on(
      "chainChanged",
      function (chainId: string) {
        const { supportedChainIds } = metamask;
        const parsedChainId = parseInt(chainId + "", 16);
        ////console.log("chainChanged", parsedChainId);
        const isChainSupported = supportedChainIds.includes(parsedChainId);
        if (!isChainSupported) {
          that.setStore({ chainInvalid: true, chainId: parsedChainId });
        } else {
          that.setStore({ chainInvalid: false, chainId: parsedChainId });
        }
        that.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
        that.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
      }
    );
  };

  // getGasPrices = async (payload) => {
  //   const gasPrices = await this._getGasPrices();
  //   let gasSpeed = localStorage.getItem("yearn.finance-gas-speed");

  //   if (!gasSpeed) {
  //     gasSpeed = "fast";
  //     localStorage.setItem("yearn.finance-gas-speed", "fast");
  //   }

  //   this.setStore({ gasPrices: gasPrices, gasSpeed: gasSpeed });
  //   this.emitter.emit(ACTIONS.GAS_PRICES_RETURNED);
  // };

  // _getGasPrices = async () => {
  //   try {
  //     const web3 = await this.getWeb3Provider();
  //     const gasPrice = await web3.eth.getGasPrice();
  //     const gasPriceInGwei = web3.utils.fromWei(gasPrice, "gwei");
  //     return {
  //       standard: gasPriceInGwei,
  //       fast: gasPriceInGwei,
  //       instant: gasPriceInGwei,
  //     };
  //   } catch (e) {
  //     ////console.log(e);
  //     return {};
  //   }
  // };

  /**
   * @returns gas price in gwei
   */
  getGasPrice = async () => {
    try {
      const web3 = await this.getWeb3Provider();
      const gasPrice = await web3.eth.getGasPrice(); //'28431819022'
      const gasPriceInGwei = web3.utils.fromWei(gasPrice, "gwei");
      return gasPriceInGwei;
    } catch (e) {
      return null;
    }
  };

  getWeb3Provider = async () => {
    let web3context = this.getStore("web3context");
    let provider = null;
    if (!web3context) {
      provider = await network.getProvider();
    } else {
      provider = web3context.library.provider;
    }
    if (!provider) {
      return null;
    }
    return new Web3(provider);
  };

  _formatFeeHistory(
    result: Awaited<ReturnType<Web3["eth"]["getFeeHistory"]>>,
    includePending: boolean,
    historicalBlocks: number
  ) {
    let blockNum = result.oldestBlock;
    let index = 0;
    const blocks: {
      number: number | "pending";
      baseFeePerGas: number;
      gasUsedRatio: number;
      priorityFeePerGas: number[];
    }[] = [];
    while (blockNum < result.oldestBlock + historicalBlocks) {
      blocks.push({
        number: blockNum,
        baseFeePerGas: Number(result.baseFeePerGas[index]),
        gasUsedRatio: Number(result.gasUsedRatio[index]),
        priorityFeePerGas: result.reward[index].map((x) => Number(x)),
      });
      blockNum += 1;
      index += 1;
    }
    if (includePending) {
      blocks.push({
        number: "pending",
        baseFeePerGas: Number(result.baseFeePerGas[historicalBlocks]),
        gasUsedRatio: NaN,
        priorityFeePerGas: [],
      });
    }
    return blocks;
  }

  addTransaction = (payload) => {
    const { params } = payload.content;

    // TEST TXQ

    this.setStore({
      purpose: params.purpose,
      type: params.type,
      action: params.action,
      queueOpen: params.queueOpen,
      transactions: [...params.transactions],
    });
  };

  clearTransaction = (payload) => {
    this.setStore({
      purpose: null,
      type: null,
      action: null,
      queueOpen: false,
      transactions: [
        {
          uuid: null,
          description: null,
          status: null,
          txHash: null,
          error: null,
        },
      ],
    });
  };
}

export default Store;
