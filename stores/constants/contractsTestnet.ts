import abis from "../abis/abis";

export const GOV_TOKEN_ADDRESS = "0x7c6d0A486220c0Dbc7243c4560ceA71AF1B1a209";
export const GOV_TOKEN_NAME = "EASY";
export const GOV_TOKEN_SYMBOL = "EASY";
export const GOV_TOKEN_DECIMALS = 18;
export const GOV_TOKEN_LOGO = "/tokens/govToken-logo.png";
export const GOV_TOKEN_ABI = abis.erc20ABI;

export const VE_TOKEN_ADDRESS = "0xbC340A296b8126d540a6e7Bc79E4d1E747FebA73"; // votingescrow.
export const VE_TOKEN_NAME = "veEASY";
export const VE_TOKEN_SYMBOL = "veEASY";
export const VE_TOKEN_DECIMALS = 18;
export const VE_TOKEN_LOGO = "/tokens/govToken-logo.png";
export const VE_TOKEN_ABI = abis.veTokenABI;

export const USDC_ADDRESS = "0x64B655696B90FcdEa8901484601d59b0570F519d";
export const USDC_NAME = "testUSDC";
export const USDC_SYMBOL = "testUSDC";
export const USDC_DECIMALS = 6;
export const USDC_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg";
export const USDC_ABI = abis.erc20ABI;

export const TSV2_ADDRESS = "0xeD69060f8718db16d6F255Cf2a0909f70715d54b";
export const TSV2_NAME = "testUSDT";
export const TSV2_SYMBOL = "testUSDT";
export const TSV2_DECIMALS = 6;
export const TSV2_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg";
export const TSV2_ABI = abis.erc20ABI;

export const SCR1_ADDRESS = "0xe434612F3372E0c77cD33196d61Cc82d74B06527";
export const SCR1_NAME = "testAAVE";
export const SCR1_SYMBOL = "testAAVE";
export const SCR1_DECIMALS = 18;
export const SCR1_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/aave.jpg";
export const SCR1_ABI = abis.erc20ABI;

export const SCR2_ADDRESS = "0xe569aBc166aD195F8BA18319ca6e72093a776c3B";
export const SCR2_NAME = "testCRV";
export const SCR2_SYMBOL = "testCRV";
export const SCR2_DECIMALS = 18;
export const SCR2_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/crv.jpg";
export const SCR2_ABI = abis.erc20ABI;

export const SCR3_ADDRESS = "0x6967AF49Db5a34F4228A3607C04B2F4aB0bA97b9";
export const SCR3_NAME = "testCAKE";
export const SCR3_SYMBOL = "testCAKE";
export const SCR3_DECIMALS = 18;
export const SCR3_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/cake.jpg";
export const SCR3_ABI = abis.erc20ABI;

export const SCR4_ADDRESS = "0x73B7847Ec53Aa510686b1e2Cd91e6505dBb65A4d";
export const SCR4_NAME = "testBAL";
export const SCR4_SYMBOL = "testBAL";
export const SCR4_DECIMALS = 18;
export const SCR4_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/bal.jpg";
export const SCR4_ABI = abis.erc20ABI;

export const SCR5_ADDRESS = "0x4EFEfa698702890073bF34522b914B1bAd340090";
export const SCR5_NAME = "testKNC";
export const SCR5_SYMBOL = "testKNC";
export const SCR5_DECIMALS = 18;
export const SCR5_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/knc.jpg";
export const SCR5_ABI = abis.erc20ABI;

export const WETH_ADDRESS = "0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF";
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

export const FACTORY_ADDRESS = "0x6Ce12a4a83816aF4bBcD4ea9c667a10e810d5628"; // should be changed
export const FACTORY_ABI = abis.factoryABI;

export const ROUTER_ADDRESS = "0x86A200FF7f0AA77b4c11be496D50A94878beFe15";
export const ROUTER_ABI = abis.routerABI;

export const SLP_ADDRESS = "0xc5D8cc14C04931726565887812207C9705bee594";
export const SLP_ABI = abis.slpABI;
// using rewards distributer here need to double check if correct
export const VE_DIST_ADDRESS = "0xEC6573718b62cDE64cb8B9Fc801d7C403Fd4EF07"; //ve_DIST = reward distributor contract
export const VE_DIST_ABI = abis.veDistABI;

export const VOTER_ADDRESS = "0x3Cd6421e77D2352E546e7880ba40c504eD20Bf9B";
export const VOTER_ABI = abis.voterABI;

export const MINTER_ADDRESS = "0x64da0BAa116813FB9784c93ec65F10bD6D98a520";
export const MINTER_ABI = abis.minterABI;

export const IDO_ADDRESS = "0x24ceE94899771704CA9CfC52006194C3d00390e6";
export const IDO_ABI = abis.IDO_ABI;

export const FAUCET_ADDRESS = "0xcdE6dFd9293b9f8BdBBA942feE394211B40b36aa";
export const FAUCET_ABI = abis.FAUCET_ABI;

export const ERC20_ABI = abis.erc20ABI;
export const PAIR_ABI = abis.pairABI;
export const GAUGE_ABI = abis.gaugeABI;
export const BRIBE_ABI = abis.bribeABI;
export const TOKEN_ABI = abis.tokenABI;
export const PAIRFEE_ABI = abis.pairFeeABI;
export const IT_BRIBE_FACTORY_ABI = abis.internalBribeFactory;
export const WE_BRIBE_FACTORY_ABI = abis.wexternalBribeFactory;

export const MULTICALL_ADDRESS = "0xe931351eac5981b9331B552577Cd5A2C45210911";
export const MULTICALL_ABI = abis.multicallABI;

export const STABLE_TOKEN_ADDRESS =
  "0x64B655696B90FcdEa8901484601d59b0570F519d"; // need this USDC

export const USDT_TOKEN_ADDRESS = "0xeD69060f8718db16d6F255Cf2a0909f70715d54b"; // need this USDT

export const DAI_TOKEN_ADDRESS = "0xeD69060f8718db16d6F255Cf2a0909f70715d54b"; // need this USDT

export const MSIG_ADDRESS = "";