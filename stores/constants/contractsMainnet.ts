import abis from "../abis/abis";

export const GOV_TOKEN_ADDRESS = "0x1394D762d78b5E2B410089A9Fc5FaABeaD6686A1";
export const GOV_TOKEN_NAME = "Easyswap";
export const GOV_TOKEN_SYMBOL = "EASY";
export const GOV_TOKEN_DECIMALS = 18;
export const GOV_TOKEN_LOGO = "/tokens/govToken-logo.png";
export const GOV_TOKEN_ABI = abis.erc20ABI;

export const VE_TOKEN_ADDRESS = ""; // votingescrow.
export const VE_TOKEN_NAME = "veEASY";
export const VE_TOKEN_SYMBOL = "veEASY";
export const VE_TOKEN_DECIMALS = 18;
export const VE_TOKEN_LOGO = "/tokens/govToken-logo.png";
export const VE_TOKEN_ABI = abis.veTokenABI;

export const USDC_ADDRESS = "0xb73603C5d87fA094B7314C74ACE2e64D165016fb";
export const USDC_NAME = "USDC";
export const USDC_SYMBOL = "USDC";
export const USDC_DECIMALS = 6;
export const USDC_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg";
export const USDC_ABI = abis.erc20ABI;

export const USDT_ADDRESS = "0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f";
export const USDT_NAME = "USDT";
export const USDT_SYMBOL = "USDT";
export const USDT_DECIMALS = 6;
export const USDT_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg";
export const TSV2_ABI = abis.erc20ABI;

export const DAI_ADDRESS = "0x1c466b9371f8aBA0D7c458bE10a62192Fcb8Aa71";
export const DAI_NAME = "DAI";
export const DAI_SYMBOL = "DAI";
export const DAI_DECIMALS = 18;
export const DAI_LOGO =
  "https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/dai.jpg";
export const DAI_ABI = abis.erc20ABI;

export const WETH_ADDRESS = "0x0Dc808adcE2099A9F62AA87D9670745AbA741746";
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
export const FACTORY_ADDRESS = "0x7eE4aE540B102F954B5E479577b329f2006dc74B"; // should be changed
export const FACTORY_ABI = abis.factoryABI;

export const ROUTER_ADDRESS = "0x1e6380b38Ffe54D96e4935433F56299fC09065eC";
export const ROUTER_ABI = abis.routerABI;

export const SLP_ADDRESS = "0xA5c43846E73FDC02D28485D9ba620ff5d8e40039";
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

export const FAUCET_ADDRESS = "";
export const FAUCET_ABI = abis.FAUCET_ABI;

export const ERC20_ABI = abis.erc20ABI;
export const PAIR_ABI = abis.pairABI;
export const GAUGE_ABI = abis.gaugeABI;
export const BRIBE_ABI = abis.bribeABI;
export const TOKEN_ABI = abis.tokenABI;
export const PAIRFEE_ABI = abis.pairFeeABI;
export const IT_BRIBE_FACTORY_ABI = abis.internalBribeFactory;
export const WE_BRIBE_FACTORY_ABI = abis.wexternalBribeFactory;

export const MULTICALL_ADDRESS = "0x031402A0203C0eEb01bc004aB9B7A8eD69B2444a";
export const MULTICALL_ABI = abis.multicallABI;

export const STABLE_TOKEN_ADDRESS =
  "0xb73603C5d87fA094B7314C74ACE2e64D165016fb"; // need this USDC

export const USDT_TOKEN_ADDRESS = "0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f"; // need this USDT

export const DAI_TOKEN_ADDRESS = "0x1c466b9371f8aBA0D7c458bE10a62192Fcb8Aa71"; // need this USDT

export const MSIG_ADDRESS = "";
