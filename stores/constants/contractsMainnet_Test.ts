import abis from "../abis/abis";

export const GOV_TOKEN_ADDRESS = "0x7e5FF0c3F5908d5F79d9849b8d34A022c4E741db";
export const GOV_TOKEN_NAME = "EASY";
export const GOV_TOKEN_SYMBOL = "EASY";
export const GOV_TOKEN_DECIMALS = 18;
export const GOV_TOKEN_LOGO = "/tokens/govToken-logo.png";
export const GOV_TOKEN_ABI = abis.erc20ABI;

export const VE_TOKEN_ADDRESS = "0x204D774f62217e8a909248Ce9eCdb689D24010A6"; // votingescrow.
export const VE_TOKEN_NAME = "veROLL";
export const VE_TOKEN_SYMBOL = "veROLL";
export const VE_TOKEN_DECIMALS = 18;
export const VE_TOKEN_LOGO = "/tokens/govToken-logo.png";
export const VE_TOKEN_ABI = abis.veTokenABI;

export const USDC_ADDRESS = "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4";
export const USDC_NAME = "USDC";
export const USDC_SYMBOL = "USDC";
export const USDC_DECIMALS = 6;
export const USDC_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg";
export const USDC_ABI = abis.erc20ABI;

export const TSV2_ADDRESS = "0xf55bec9cafdbe8730f096aa55dad6d22d44099df";
export const TSV2_NAME = "USDT";
export const TSV2_SYMBOL = "USDT";
export const TSV2_DECIMALS = 6;
export const TSV2_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg";
export const TSV2_ABI = abis.erc20ABI;

export const SCR1_ADDRESS = "0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1";
export const SCR1_NAME = "WBTC";
export const SCR1_SYMBOL = "WBTC";
export const SCR1_DECIMALS = 18;
export const SCR1_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/wbtc.jpg";
export const SCR1_ABI = abis.erc20ABI;

export const SCR2_ADDRESS = "0xca77eb3fefe3725dc33bccb54edefc3d9f764f97";
export const SCR2_NAME = "DAI";
export const SCR2_SYMBOL = "DAI";
export const SCR2_DECIMALS = 18;
export const SCR2_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg";
export const SCR2_ABI = abis.erc20ABI;

export const SCR3_ADDRESS = "0x3585084538430aCD6d7c3964754F42338d5300Ca";
export const SCR3_NAME = "testCAKE";
export const SCR3_SYMBOL = "testCAKE";
export const SCR3_DECIMALS = 18;
export const SCR3_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/cake.jpg";
export const SCR3_ABI = abis.erc20ABI;

export const SCR4_ADDRESS = "0x4A2ACFacC9898b00c8477ECEAf8F474fd6EA3b4e";
export const SCR4_NAME = "testBAL";
export const SCR4_SYMBOL = "testBAL";
export const SCR4_DECIMALS = 18;
export const SCR4_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/bal.jpg";
export const SCR4_ABI = abis.erc20ABI;

export const SCR5_ADDRESS = "0xD230158f3D64A9605F6b037Fc6e6f0684D2F1CE8";
export const SCR5_NAME = "testKNC";
export const SCR5_SYMBOL = "testKNC";
export const SCR5_DECIMALS = 18;
export const SCR5_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/knc.jpg";
export const SCR5_ABI = abis.erc20ABI;

export const WETH_ADDRESS = "0x5300000000000000000000000000000000000004";
export const WETH_NAME = "Wrapped Eth";
export const WETH_SYMBOL = "WETH";
export const WETH_DECIMALS = 18;
export const WETH_LOGO = "tokens/weth.png";
export const WETH_ABI = abis.wethABI;
export const WETH_IMPL_ABI = abis.wethImplABI;

// there is something wrong with this Wrapped ETH its not working idk why

export const ETH_ADDRESS = "0x45A318273749d6eb00f5F6cA3bC7cD3De26D642A";
export const ETH_NAME = "Ethereum";
export const ETH_SYMBOL = "ETH";
export const ETH_DECIMALS = 18;
export const ETH_LOGO = "tokens/eth.png";
// BaseV1Factory checked here: https://ftmscan.com/address/0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28#code
export const FACTORY_ADDRESS = "0x5C2C5b3076FF67128fC3A3f9898e8be3721e9Cfa"; // should be changed
export const FACTORY_ABI = abis.factoryABI;

export const ROUTER_ADDRESS = "0x33740044686399CFf5dCc7D6A101824B6e8e25eA";
export const ROUTER_ABI = abis.routerABI;

export const SLP_ADDRESS = "";
export const SLP_ABI = abis.slpABI;
// using rewards distributer here need to double check if correct
export const VE_DIST_ADDRESS = ""; //ve_DIST = reward distributor contract
export const VE_DIST_ABI = abis.veDistABI;

export const VOTER_ADDRESS = "";
export const VOTER_ABI = abis.voterABI;

export const MINTER_ADDRESS = "";
export const MINTER_ABI = abis.minterABI;

export const IDO_ADDRESS = "0xbe815fE63332811F63C85c2b3598Af161e48E534";
export const IDO_ABI = abis.IDO_ABI;

export const FAUCET_ADDRESS = "0x60D8B7916F812A32a5DE9FB3C27eF78B09477440";
export const FAUCET_ABI = abis.FAUCET_ABI;

export const ERC20_ABI = abis.erc20ABI;
export const PAIR_ABI = abis.pairABI;
export const GAUGE_ABI = abis.gaugeABI;
export const BRIBE_ABI = abis.bribeABI;
export const TOKEN_ABI = abis.tokenABI;
export const PAIRFEE_ABI = abis.pairFeeABI;
export const IT_BRIBE_FACTORY_ABI = abis.internalBribeFactory;
export const WE_BRIBE_FACTORY_ABI = abis.wexternalBribeFactory;

export const MULTICALL_ADDRESS = "0xA10090c7290042b62DEbaE5E10202138c00D346A";
export const MULTICALL_ABI = abis.multicallABI;

export const STABLE_TOKEN_ADDRESS =
  "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4"; // need this USDC

export const MSIG_ADDRESS = "";
