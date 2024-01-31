import type { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";

import stores from ".";
import { CONTRACTLIST } from "./constants/constants";
import { supportedChainIdList } from "./connectors/connectors";
import {
  DefiLlamaTokenPrice,
  DexScreenerPair,
  TokenForPrice,
} from "./types/types";
import { weekdays } from "moment";

let CONTRACTS;

let WEEK = 604800;
let chainString = "";

// # See: https://docs.1inch.io/docs/aggregation-protocol/api/swagger
// # See: https://docs.dexscreener.com/#tokens
// # See: https://defillama.com/docs/api#operations-tag-coins
// # See: https://api.dev.dex.guru/docs#tag/Token-Finance
// # See: https://docs.open.debank.com/en/reference/api-pro-reference/token

class Helper {
  private aggregatorEndpoint = "https://api.1inch.io/v4.0/169/quote";
  private defiLlamaBaseUrl = "https://api.llama.fi";
  private defiLlamaTokenUrl = "https://coins.llama.fi/prices/current";
  private debankEndpoint =
    "https://pro-openapi.debank.com/v1/token?chain=scroll";
  private dexScreenerEndpoint = "https://api.dexscreener.com/latest/dex/tokens";
  private dexGuruEndpoint =
    "https://api.dev.dex.guru/v1/chain/169/tokens/%/market";
  private tokenPricesMap = new Map<string, number>();

  get getTokenPricesMap() {
    return this.tokenPricesMap;
  }

  // TODO: understand token prices in python
  // setTokenPricesMap = async (tokenPrices: Map<string, number>) => {
  //   this.tokenPricesMap = tokenPrices;
  // };

  getProtocolDefiLlama = async () => {
    const data = await fetch(
      `${this.defiLlamaBaseUrl}/protocol/${chainString}}`
    );
    const json = await data.json();
    return json as unknown;
  };

  getCurrentTvl = async () => {
    const response = await fetch(
      `${this.defiLlamaBaseUrl}/tvl/${chainString}}`
    );
    const json = await response.json();
    return json as number;
  };

  getActivePeriod = async () => {
    try {
      const chain = stores.accountStore.getStore("chainId");
      chainString = chain === 169 ? "Manta" : "";
      const isChainSupported = supportedChainIdList.includes(chain);
      if (isChainSupported) {
        CONTRACTS = CONTRACTLIST[chain];
      } else {
        CONTRACTS = CONTRACTLIST[3441005];
      }

      const web3 = await stores.accountStore.getWeb3Provider();
      const minterContract = new web3.eth.Contract(
        CONTRACTS.MINTER_ABI as AbiItem[],
        CONTRACTS.MINTER_ADDRESS
      );
      const activePeriod = await minterContract.methods.active_period().call();
      const activePeriodEnd = parseInt(activePeriod) + WEEK;
      // TIMER
      //////console.log("ACTIVE PERIOD END: ", activePeriodEnd);
      return activePeriodEnd;
    } catch (ex) {
      //////console.log("EXCEPTION. ACTIVE PERIOD ERROR");
      //////console.log(ex);
      return 0;
    }
  };

  updateTokenPrice = async (token: TokenForPrice) => {
    if (this.tokenPricesMap.has(token.address.toLowerCase())) {
      return this.tokenPricesMap.get(token.address.toLowerCase());
    }

    const price = await this._getTokenPrice(token);
    this.tokenPricesMap.set(token.address.toLowerCase(), price);
    return price;
  };

  getTokenPrice = async (token: TokenForPrice) => {
    const price = await this._getTokenPrice(token);
    return price;
  };

  getCirculatingSupply = async () => {
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) return;

    const govTokenContract = new web3.eth.Contract(
      CONTRACTS.GOV_TOKEN_ABI as AbiItem[],
      CONTRACTS.GOV_TOKEN_ADDRESS
    );

    const multicallContract = new web3.eth.Contract(
      CONTRACTS.MULTICALL_ABI as AbiItem[],
      CONTRACTS.MULTICALL_ADDRESS
    );

    const calls = [
      {
        target: CONTRACTS.GOV_TOKEN_ADDRESS,
        callData: govTokenContract.methods.totalSupply().encodeABI(),
      },
      {
        target: CONTRACTS.GOV_TOKEN_ADDRESS,
        callData: govTokenContract.methods
          .balanceOf(CONTRACTS.VE_TOKEN_ADDRESS)
          .encodeABI(),
      },
      {
        target: CONTRACTS.GOV_TOKEN_ADDRESS,
        callData: govTokenContract.methods
          .balanceOf(CONTRACTS.MINTER_ADDRESS)
          .encodeABI(),
      },
      {
        target: CONTRACTS.GOV_TOKEN_ADDRESS,
        callData: govTokenContract.methods
          .balanceOf(CONTRACTS.MSIG_ADDRESS)
          .encodeABI(),
      },
      {
        target: CONTRACTS.GOV_TOKEN_ADDRESS,
        callData: govTokenContract.methods
          .balanceOf("0xd0cC9738866cd82B237A14c92ac60577602d6c18")
          .encodeABI(),
      },
    ];

    const aggregateRes1 = await multicallContract.methods
      .aggregate(calls)
      .call();
    const hexValues = aggregateRes1.returnData;

    const totalSupply = await govTokenContract.methods.totalSupply().call();

    const lockedSupply = await govTokenContract.methods
      .balanceOf(CONTRACTS.VE_TOKEN_ADDRESS)
      .call();

    const ScrollInMinter = await govTokenContract.methods
      .balanceOf(CONTRACTS.MINTER_ADDRESS)
      .call();

    const ScrollInMsig = await govTokenContract.methods
      .balanceOf(CONTRACTS.MSIG_ADDRESS)
      .call();

    const ScrollInTimelockerController = await govTokenContract.methods
      .balanceOf("0xd0cC9738866cd82B237A14c92ac60577602d6c18")
      .call();

    const circulatingSupply = BigNumber(totalSupply)
      .minus(BigNumber(lockedSupply))
      .minus(BigNumber(ScrollInMinter))
      .minus(BigNumber(ScrollInMsig))
      .minus(BigNumber(ScrollInTimelockerController))
      .div(10 ** 18)
      .toNumber();

    return circulatingSupply;
  };

  getMarketCap = async () => {
    const circulatingSupply = await this.getCirculatingSupply();
    const price = await this.updateTokenPrice({
      address: CONTRACTS.GOV_TOKEN_ADDRESS,
      decimals: CONTRACTS.GOV_TOKEN_DECIMALS,
      symbol: CONTRACTS.GOV_TOKEN_SYMBOL,
    });
    return circulatingSupply * price;
  };

  protected _getTokenPrice = async (token: TokenForPrice) => {
    let price = 0;

    price = await this._getAggregatedPriceInStables(token);

    if (price === 0) {
      price = await this._getChainPriceInStables(token);
    }
    // TODO this one needs api keys and is not free
    // if (price === 0) {
    //   price = await this._getDebankPriceInStables(token);
    // }
    return price;
  };

  protected _getAggregatedPriceInStables = async (token: TokenForPrice) => {
    const price = await this._getDefillamaPriceInStables(token);

    if (price !== 0) {
      return price;
    }

    try {
      return await this._getDexscreenerPriceInStables(token);
    } catch (ex) {
      ////console.warn(ex);
      return 0;
    }
  };

  protected _getDefillamaPriceInStables = async (token: TokenForPrice) => {
    if (token.address === CONTRACTS.STABLE_TOKEN_ADDRESS) {
      return 1.0;
    }
    const chainName = chainString;
    const chainToken = `${chainName}:${token.address.toLowerCase()}`;

    const res = await fetch(`${this.defiLlamaTokenUrl}/${chainToken}`);
    const json = (await res.json()) as DefiLlamaTokenPrice;
    const price = json.coins[chainToken]?.price;

    if (price > 0) {
      ////console.log("Defillama", price);
      return price;
    }

    return 0;
  };

  protected _getChainPriceInStables = async (token: TokenForPrice) => {
    const web3 = await stores.accountStore.getWeb3Provider();
    if (!web3) return 0;

    if (
      token.address.toLowerCase() ===
        CONTRACTS.STABLE_TOKEN_ADDRESS.toLowerCase() ||
      token.address.toLowerCase() ===
        CONTRACTS.USDT_TOKEN_ADDRESS.toLowerCase() ||
      token.address.toLowerCase() === CONTRACTS.DAI_TOKEN_ADDRESS.toLowerCase()
    ) {
      return 1.0;
    }

    const routerContract = new web3.eth.Contract(
      CONTRACTS.ROUTER_ABI as AbiItem[],
      CONTRACTS.ROUTER_ADDRESS
    );

    try {
      let price = await routerContract.methods
        .getAmountOut(
          BigNumber(1 * 10 ** token.decimals).toFixed(),
          token.address,
          CONTRACTS.STABLE_TOKEN_ADDRESS
        )
        .call();

      if (price.amount === "0") {
        price = await routerContract.methods
          .getAmountOut(
            BigNumber(1 * 10 ** token.decimals).toFixed(),
            token.address,
            CONTRACTS.USDT_TOKEN_ADDRESS
          )
          .call();
      }

      if (price.amount === "0") {
        price = await routerContract.methods
          .getAmountOut(
            BigNumber(1 * 10 ** token.decimals).toFixed(),
            token.address,
            CONTRACTS.DAI_TOKEN_ADDRESS
          )
          .call();
      }

      return price.amount / 10 ** 6;
    } catch (ex) {
      return 0;
    }
  };

  protected _getDebankPriceInStables = async (token: TokenForPrice) => {
    if (token.address === CONTRACTS.STABLE_TOKEN_ADDRESS) {
      return 1.0;
    }

    const res = await fetch(
      `${this.debankEndpoint}&id=${token.address.toLowerCase()}`
    );
    const json = await res.json();
    const price = json.price;

    return 0;
  };

  protected _getDexscreenerPriceInStables = async (token: TokenForPrice) => {
    if (token.address === CONTRACTS.STABLE_TOKEN_ADDRESS) {
      return 1.0;
    }

    const res = await fetch(`
      ${this.dexScreenerEndpoint}/${token.address.toLowerCase()}
    `);
    const json = await res.json();
    const pairs = json.pairs as DexScreenerPair[];

    if (pairs?.length === 0) {
      return 0;
    }

    let price = "";
    try {
      const sortedPairs = pairs.sort(
        (a, b) =>
          b.txns.h24.buys +
          b.txns.h24.sells -
          (a.txns.h24.buys + a.txns.h24.sells)
      );

      price = sortedPairs.filter(
        (pair) => pair.baseToken.symbol === token.symbol
      )[0]?.priceUsd;
    } catch (ex) {
      return 0;
    }
    ////console.log("DexScreener", price);
    return parseFloat(price);
  };
}

export default Helper;
