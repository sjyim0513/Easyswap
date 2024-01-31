interface BaseAsset {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string | null;
  local: boolean;
  balance: string | null;
  isWhitelisted?: boolean;
}

interface RouteAsset {
  price: number;
  address: string;
  name?: string;
  symbol: string;
  decimals: number;
  logoURI?: null | string;
}

type TokenForPrice = Omit<
  RouteAsset,
  "price" | "nativeChainAddress" | "nativeChainId" | "name" | "logoURI"
> &
  Partial<RouteAsset>;

type VeToken = Omit<BaseAsset, "balance" | "local">;

interface VestNFT {
  id: string;
  lockAmount: string;
  lockEnds: string;
  lockValue: string;
}

interface Bribe {
  token: RouteAsset;
  rewardAmount: number; // gets assigned in frontend store and eq rewardAmmount
  earned?: string;
  tokenPrice?: number;
}

interface AllEarned {
  tokenID: string;
  Bribe: any[];
  Fees: any[];
}

type BribeEarned = { earned: string };

interface Pair {
  tvl?: number;
  apr?: number;
  address?: string;
  symbol?: string;
  decimals?: number;
  stable?: boolean;
  reserve0?: number | string; // gets reassigned to string in frontend store
  reserve1?: number | string; // gets reassigned to string in frontend store
  token0_address?: string;
  token1_address?: string;
  gauge_address?: string; // if no,  set to :""
  isStable?: boolean;
  totalSupply?: number | string; // gets reassigned to string in frontend store
  token0?: RouteAsset | BaseAsset; //TODO check if this is correct
  token1?: RouteAsset | BaseAsset;
  pair_iswhitelisted?: boolean;
  rewardType?: string;
  claimable0?: string;
  claimable1?: string;
  earned0?: string;
  earned1?: string;
  balance?: string;
  gauge?: {
    // exists only if gauge_address is not empty
    tokenID?: number;
    decimals: number;
    tbv: number;
    votes: number;
    address: string;
    total_supply: number;
    bribe_address: string;
    fees_address: string;
    fees: number;
    reward: number;
    bribes: Bribe[];
    // following gets assigned in frontend store
    balance?: string;
    reserve0?: string;
    reserve1?: string;
    weight?: string;
    weightPercent?: string;
    rewardsEarned?: string;
    bribesEarned?: Bribe[] | BribeEarned[];
    AllEarned?: AllEarned[];
    token0Earned?: string;
    token1Earned?: string;
    Isbribe?: boolean;
    votingApr?: number;
    totalSupply: string;
  };
}

interface GeneralContracts {
  GOV_TOKEN_ADDRESS: string;
  GOV_TOKEN_NAME: string;
  GOV_TOKEN_SYMBOL: string;
  GOV_TOKEN_DECIMALS: number;
  GOV_TOKEN_LOGO: string;
  GOV_TOKEN_ABI: any[];
  VE_TOKEN_ADDRESS: string;
  VE_TOKEN_NAME: string;
  VE_TOKEN_SYMBOL: string;
  VE_TOKEN_DECIMALS: number;
  VE_TOKEN_LOGO: string;
  VE_TOKEN_ABI: any[];
  FACTORY_ADDRESS: string;
  FACTORY_ABI: any[];
  ROUTER_ADDRESS: string;
  ROUTER_ABI: any[];
  VE_DIST_ADDRESS: string;
  VE_DIST_ABI: any[];
  VOTER_ADDRESS: string;
  VOTER_ABI: any[];
  MINTER_ADDRESS: string;
  MINTER_ABI: any[];
  IDO_ADDRESS: string;
  IDO_ABI: any[];
  ERC20_ABI: any[];
  PAIR_ABI: any[];
  GAUGE_ABI: any[];
  BRIBE_ABI: any[];
  TOKEN_ABI: any[];
  SLP_ABI: any[];
  SLP_ADDRESS: string;
  WE_BRIBE_FACTORY_ABI: any[];
  IT_BRIBE_FACTORY_ABI: any[];
  MULTICALL_ADDRESS: string;
  MULTICALL_ABI: any[];
  STABLE_TOKEN_ADDRESS: string;
  MSIG_ADDRESS: string;
  FAUCET_ADDRESS: string;
  FAUCET_ABI: any[];
}

interface TestnetContracts extends GeneralContracts {
  WETH_ADDRESS: string;
  WETH_NAME: string;
  WETH_SYMBOL: string;
  WETH_DECIMALS: number;
  WETH_ABI: any[];
  WETH_LOGO: string;
  WETH_IMPL_ABI: any[];
  ETH_ADDRESS: string;
  ETH_NAME: string;
  ETH_SYMBOL: string;
  ETH_DECIMALS: number;
  ETH_LOGO: string;
  USDC_ADDRESS: string;
  USDC_NAME: string;
  USDC_SYMBOL: string;
  USDC_DECIMALS: number;
  USDC_LOGO: string;
  USDC_ABI: any[];
  TSV2_ADDRESS: string;
  TSV2_NAME: string;
  TSV2_SYMBOL: string;
  TSV2_DECIMALS: number;
  TSV2_LOGO: string;
  TSV2_ABI: any[];
  SCR1_ADDRESS: string;
  SCR1_NAME: string;
  SCR1_SYMBOL: string;
  SCR1_DECIMALS: number;
  SCR1_LOGO: string;
  SCR1_ABI: any[];
  SCR2_ADDRESS: string;
  SCR2_NAME: string;
  SCR2_SYMBOL: string;
  SCR2_DECIMALS: number;
  SCR2_LOGO: string;
  SCR2_ABI: any[];
  SCR3_ADDRESS: string;
  SCR3_NAME: string;
  SCR3_SYMBOL: string;
  SCR3_DECIMALS: number;
  SCR3_LOGO: string;
  SCR3_ABI: any[];
  SCR4_ADDRESS: string;
  SCR4_NAME: string;
  SCR4_SYMBOL: string;
  SCR4_DECIMALS: number;
  SCR4_LOGO: string;
  SCR4_ABI: any[];
  SCR5_ADDRESS: string;
  SCR5_NAME: string;
  SCR5_SYMBOL: string;
  SCR5_DECIMALS: number;
  SCR5_LOGO: string;
  SCR5_ABI: any[];
}
interface MainnetContracts extends GeneralContracts {
  WETH_ADDRESS: string;
  WETH_NAME: string;
  WETH_SYMBOL: string;
  WETH_DECIMALS: number;
  WETH_ABI: any[];
  WETH_IMPL_ABI: any[];
  ETH_ADDRESS: string;
  ETH_NAME: string;
  ETH_SYMBOL: string;
  ETH_DECIMALS: number;
  ETH_LOGO: string;
  USDC_ADDRESS: string;
  USDC_NAME: string;
  USDC_SYMBOL: string;
  USDC_DECIMALS: number;
  USDC_LOGO: string;
  USDC_ABI: any[];
  USDT_ADDRESS: string;
  USDT_NAME: string;
  USDT_SYMBOL: string;
  USDT_DECIMALS: number;
  USDT_LOGO: string;
  USDT_ABI: any[];
  DAI_ADDRESS: string;
  DAI_NAME: string;
  DAI_SYMBOL: string;
  DAI_DECIMALS: number;
  DAI_LOGO: string;
  DAI_ABI: any[];
}

type Contracts = TestnetContracts | MainnetContracts;

type Vote = {
  address: string;
  votePercent: string;
  tokenID: string;
};

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceNative: string;
  priceUsd?: string;
  txns: {
    m5: {
      buys: number;
      sells: number;
    };
    h1: {
      buys: number;
      sells: number;
    };
    h6: {
      buys: number;
      sells: number;
    };
    h24: {
      buys: number;
      sells: number;
    };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  pairCreatedAt?: number;
}

interface DefiLlamaTokenPrice {
  coins: {
    [key: string]: {
      decimals: number;
      price: number;
      symbol: string;
      timestamp: number;
      confidence: number;
    };
  };
}

interface ITransaction {
  title: string;
  type: string;
  verb: string;
  transactions: {
    uuid: string;
    description: string;
    status: string;
    txHash?: string;
    error?: string;
  }[];
}

export type {
  BaseAsset,
  Pair,
  RouteAsset,
  TokenForPrice,
  Contracts,
  TestnetContracts,
  MainnetContracts,
  VeToken,
  Vote,
  VestNFT,
  DexScreenerPair,
  DefiLlamaTokenPrice,
  ITransaction,
  AllEarned,
  Bribe,
};
