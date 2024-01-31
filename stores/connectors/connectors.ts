import { InjectedConnector } from "@web3-react/injected-connector";
// import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { NetworkConnector } from "@web3-react/network-connector";
// import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { parse } from "query-string";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  3441005: "https://pacific-rpc.testnet.manta.network/http", // Scroll Testnet
  169: "https://pacific-rpc.manta.network/http", // Manta Pacific Mainnet
};

let obj: {
  [key: number]: string;
} = {
  3441005: RPC_URLS[3441005],
};

if (process.env.NEXT_PUBLIC_CHAINID === "169") {
  obj = { 169: RPC_URLS[169] };
}

export const network = new NetworkConnector({ urls: obj });

const supportedChainIds = [169, 3441005];

export const supportedChainIdList = supportedChainIds;

//add chains
export const metamask = new InjectedConnector({
  supportedChainIds: supportedChainIds,
});

export const okxwallet = new InjectedConnector({
  supportedChainIds: supportedChainIds,
});

// export const walletconnect = new WalletConnectConnector({
//   rpc: obj,
//   chainId: parseInt(process.env.NEXT_PUBLIC_CHAINID),
//   bridge: "https://bridge.walletconnect.org",
//   qrcode: true,
// });

// export const coinbase = new WalletLinkConnector({
//   url: `https://mainnet.infura.io/v3/e9cc4b5bc28a49c08ec3c6cb677de698`,
//   appName: "ScrollSwap",
//   supportedChainIds: supportedChainIds
// });

export const RPC_URLS_LIST = {
  3441005: "https://pacific-rpc.testnet.manta.network/http", // Scroll Testnet
  169: "https://pacific-rpc.manta.network/http", // Manta Pacific Mainnet
};
