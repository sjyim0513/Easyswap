import React from "react";
import { Typography, Button, CircularProgress } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ACTIONS, SCROLLSCAN_LIST } from "../../stores/constants/constants";

const { ERROR, CONNECTION_DISCONNECTED, CONNECTION_CONNECTED, CONFIGURE_SS } =
  ACTIONS;

import stores from "../../stores";
import {
  supportedChainIdList,
  RPC_URLS_LIST,
} from "../../stores/connectors/connectors";

type EthWindow = Window &
  typeof globalThis & {
    ethereum?: any;
  };

type OkxWindow = Window &
  typeof globalThis & {
    okxwallet?: any;
  };

const Unlock = ({ closeModal }: { closeModal: () => void }) => {
  const [, setState] = React.useState<{
    loading: boolean;
    error: Error | null;
  }>({
    loading: false,
    error: null,
  });

  React.useEffect(() => {
    const error = (err: Error) => {
      setState({ loading: false, error: err });
    };

    const connectionConnected = () => {
      // stores.dispatcher.dispatch({
      //   type: CONFIGURE_SS,
      //   content: { connected: true },
      // });

      if (closeModal != null) {
        closeModal();
      }
    };

    const connectionDisconnected = () => {
      // stores.dispatcher.dispatch({
      //   type: CONFIGURE_SS,
      //   content: { connected: false },
      // });
      if (closeModal != null) {
        closeModal();
      }
    };

    stores.emitter.on(CONNECTION_CONNECTED, connectionConnected);
    stores.emitter.on(CONNECTION_DISCONNECTED, connectionDisconnected);
    stores.emitter.on(ERROR, error);
    return () => {
      stores.emitter.removeListener(CONNECTION_CONNECTED, connectionConnected);
      stores.emitter.removeListener(
        CONNECTION_DISCONNECTED,
        connectionDisconnected
      );
      stores.emitter.removeListener(ERROR, error);
    };
  }, []);

  return (
    <div className="relative flex h-auto flex-[1]">
      <div
        className="absolute -right-2 -top-2 cursor-pointer"
        onClick={closeModal}
      >
        <Close />
      </div>
      <div className="m-auto flex flex-wrap p-3 pt-40 text-center lg:pt-3">
        <Web3ReactProvider getLibrary={getLibrary}>
          <MyComponent closeModal={closeModal} />
        </Web3ReactProvider>
      </div>
    </div>
  );
};

function getLibrary(provider: ExternalProvider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;
  return library;
}

const switchChain = async (chainId: number, library: any) => {
  let hexChain = "0xA9";
  let rpcUrl = RPC_URLS_LIST[169]; //Manta Testnet L2 Rollup
  let Scan = SCROLLSCAN_LIST[169]; //Manta Testnet L2 Rollup
  try {
    const isChainSupported = supportedChainIdList.includes(chainId);

    if (isChainSupported) {
      const hexChain = "0x" + Number(chainId).toString(16);
      rpcUrl = RPC_URLS_LIST[chainId];
      Scan = SCROLLSCAN_LIST[chainId];

      await library.provider
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "Manta Pacific Mainnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [Scan],
            },
          ],
        })
        .then(stores.accountStore.setStore({ chainInvalid: false }));
    } else {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });

      await library.provider
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "Manta Pacific Mainnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [Scan],
            },
          ],
        })
        .then(stores.accountStore.setStore({ chainInvalid: false }));
    }
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await library.provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "Manta Pacific Mainnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [Scan],
            },
          ],
        });
      } catch (addError) {}
    }
  }
};

const switchChainDesktop = async () => {
  let hexChain = "0xA9"; //Manta Testnet L2 Rollup
  let rpcUrl = RPC_URLS_LIST[169]; //Manta Testnet L2 Rollup
  let Scan = SCROLLSCAN_LIST[169]; //Manta Testnet L2 Rollup
  try {
    const ethereum = (window as EthWindow).ethereum;

    if (!ethereum) {
      return;
    }
    const chain = parseInt(ethereum.chainId);
    const isChainSupported = supportedChainIdList.includes(chain);

    if (isChainSupported) {
      hexChain = "0x" + Number(ethereum.chainId).toString(16);
      rpcUrl = RPC_URLS_LIST[chain];
      Scan = SCROLLSCAN_LIST[chain];

      await ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "Manta Pacific Mainnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [Scan],
            },
          ],
        })
        .then(stores.accountStore.setStore({ chainInvalid: false }));
      // if (currentChainId !== hexChain) {
      //   await ethereum.request({
      //     method: "wallet_switchEthereumChain",
      //     params: [{ chainId: hexChain }],
      //   });
      // }
      // if (currentChainId !== hexChain) {
      //   stores.accountStore.setStore({ chainInvalid: false });
      // }
    } else {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });

      await ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "Manta Pacific Mainnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [Scan],
            },
          ],
        })
        .then(stores.accountStore.setStore({ chainInvalid: false }));
      // if (currentChainId !== hexChain) {
      //   await ethereum.request({
      //     method: "wallet_switchEthereumChain",
      //     params: [{ chainId: hexChain }],
      //   });
      // }
      //stores.accountStore.setStore({ chainInvalid: false });
    }
    //stores.accountStore.setStore({ chainInvalid: false });
    // }
    // else if (process.env.NEXT_PUBLIC_CHAINID === "3441005") {
    //   const hexChain =
    //     "0x" + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);

    //   if (currentChainId !== hexChain) {
    //     await ethereum.request({
    //       method: "wallet_switchEthereumChain",
    //       params: [{ chainId: hexChain }],
    //     });
    //   }

    //   await ethereum.request({
    //     method: "wallet_addEthereumChain",
    //     params: [
    //       {
    //         chainId: hexChain,
    //         chainName: "Manta Testnet L2 Rollup",
    //         nativeCurrency: {
    //           name: "ETH",
    //           symbol: "ETH",
    //           decimals: 18,
    //         },
    //         rpcUrls: ["https://pacific-rpc.testnet.manta.network/http"],
    //         blockExplorerUrls: ["https://pacific-explorer.manta.network"],
    //       },
    //     ],
    //   });
    // }
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await (window as EthWindow).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChain,
              chainName: "Manta Pacific Mainnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: [rpcUrl],
              blockExplorerUrls: [Scan],
            },
          ],
        });
        //  else {
        //   await (window as EthWindow).ethereum.request({
        //     method: "wallet_addEthereumChain",
        //     params: [
        //       {
        //         chainId: hexChain,
        //         chainName: "Manta Testnet L2 Rollup",
        //         nativeCurrency: {
        //           name: "ETH",
        //           symbol: "ETH",
        //           decimals: 18,
        //         },
        //         rpcUrls: ["https://pacific-rpc.testnet.manta.network/http"],
        //         blockExplorerUrls: ["https://pacific-explorer.manta.network"],
        //       },
        //     ],
        //   });
        // }
      } catch (addError) {}
    }
  }
};

function onConnectionClicked(
  currentConnector: (typeof stores.accountStore.store)["connectorsByName"][keyof (typeof stores.accountStore.store)["connectorsByName"]],
  name: keyof (typeof stores.accountStore.store)["connectorsByName"],
  setActivatingConnector: (_connect: AbstractConnector) => void,
  activate: (
    _connector: AbstractConnector,
    _onError?: ((_error: Error) => void) | undefined,
    _throwErrors?: boolean | undefined
  ) => Promise<void>,
  chainId: number,
  library: any
) {
  const connectorsByName = stores.accountStore.getStore("connectorsByName");
  setActivatingConnector(currentConnector);
  if (name === "MetaMask") {
    if ((window as EthWindow).ethereum) {
      activate(connectorsByName[name], (error) => {
        if (
          error.name == "UnsupportedChainIdError" ||
          error.message.includes("chain")
        ) {
          switchChainDesktop();
        }
        if (error.name == "NoEthereumProviderError" && name == "MetaMask") {
          window.open("https://metamask.io/download.html", "_blank");
          return false;
        }
        if (error.name == "UserRejectedRequestError") {
          return false;
        }
      });
    } else {
      activate(connectorsByName[name], (error) => {
        ////console.log("name", name);
        if (error.message.includes("window.ethereum")) {
          window.location.href = "https://metamask.app.link/dapp/easyswap.fi/";
          return false;
        }
        if (error.name === "NoEthereumProviderError" && name === "MetaMask") {
          window.location.href = "https://metamask.app.link/dapp/easyswap.fi/";
          return false;
        }
        if (
          error.name === "UnsupportedChainIdError" ||
          error.message.includes("chain")
        ) {
          switchChain(chainId, library);
        }
        if (error.name == "UserRejectedRequestError") {
          return false;
        }
      });
    }
  } else if (name === "OKXWallet") {
    if ((window as OkxWindow).okxwallet) {
      // if okxWallet is installed
      activate(connectorsByName[name], (error) => {
        if (
          error.name == "UnsupportedChainIdError" ||
          error.message.includes("chain")
        ) {
          switchChainDesktop();
        }
        if (error.name == "UserRejectedRequestError") {
          return false;
        }
      });
    } else {
      if ((window as EthWindow).ethereum) {
        //if desktop
        window.open("https://www.okx.com/web3", "_blank");
      } else {
        window.open(
          "okx://wallet/dapp/details?dappUrl=https://easyswap.fi",
          "_blank"
        );
      }
    }
  }
}

function MyComponent({ closeModal }: { closeModal: () => void }) {
  const context = useWeb3React();
  ////console.log("context", context);
  const { connector, library, account, activate, active, error, chainId } =
    context;
  const connectorsByName = stores.accountStore.getStore("connectorsByName");
  const [activatingConnector, setActivatingConnector] =
    React.useState<AbstractConnector>();
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  React.useEffect(() => {
    if (account && active && library) {
      stores.accountStore.setStore({
        account: { address: account },
        web3context: context,
      });
      let parsedChainId = 3441005;
      if (chainId) {
        parsedChainId = chainId;
      }
      const isChainSupported = supportedChainIdList.includes(parsedChainId);
      if (!isChainSupported) {
        stores.accountStore.setStore({
          chainInvalid: true,
          chainId: parsedChainId,
        });
        stores.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
      } else {
        stores.accountStore.setStore({
          chainInvalid: false,
          chainId: parsedChainId,
        });
        //this.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
      }
      stores.emitter.emit(CONNECTION_CONNECTED);
      stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
    }
  }, [account, active, closeModal, context, library, chainId]);

  const width = window.innerWidth;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: width > 576 ? "space-between" : "center",
        alignItems: "center",
        color: "#000000",
      }}
    >
      {Object.keys(connectorsByName).map((name) => {
        const currentConnector =
          connectorsByName[
            name as keyof (typeof stores.accountStore.store)["connectorsByName"]
          ];
        const activating = currentConnector === activatingConnector;
        const connected = currentConnector === connector;
        const disabled = !!activatingConnector || !!error;

        let url;
        let display = name;
        let descriptor = "";
        if (name === "MetaMask") {
          url = "/connectors/icn-metamask.svg";
          descriptor = "Connect to your MetaMask wallet";
        } else if (name === "WalletConnect") {
          url = "/connectors/walletConnectIcon.svg";
          descriptor = "Scan with WalletConnect to connect";
        } else if (name === "TrustWallet") {
          url = "/connectors/trustWallet.png";
          descriptor = "Connect to your TrustWallet";
        } else if (name === "Portis") {
          url = "/connectors/portisIcon.png";
          descriptor = "Connect with your Portis account";
        } else if (name === "Fortmatic") {
          url = "/connectors/fortmaticIcon.png";
          descriptor = "Connect with your Fortmatic account";
        } else if (name === "Ledger") {
          url = "/connectors/icn-ledger.svg";
          descriptor = "Connect with your Ledger Device";
        } else if (name === "Squarelink") {
          url = "/connectors/squarelink.png";
          descriptor = "Connect with your Squarelink account";
        } else if (name === "Trezor") {
          url = "/connectors/trezor.png";
          descriptor = "Connect with your Trezor Device";
        } else if (name === "Torus") {
          url = "/connectors/torus.jpg";
          descriptor = "Connect with your Torus account";
        } else if (name === "Authereum") {
          url = "/connectors/icn-aethereum.svg";
          descriptor = "Connect with your Authereum account";
        } else if (name === "WalletLink") {
          display = "Coinbase Wallet";
          url = "/connectors/coinbaseWalletIcon.svg";
          descriptor = "Connect to your Coinbase wallet";
        } else if (name === "Frame") {
          return "";
        } else if (name === "OKXWallet") {
          display = "OKX Wallet";
          url = "/connectors/okx-logo.svg";
          descriptor = "Connect to your OKX wallet";
        }

        return (
          <div
            key={name}
            style={{
              padding: "0px",
              display: "flex",
              margin: width > 576 ? "12px 0px" : "0px",
            }}
          >
            <Button
              style={{
                width: width > 576 ? "350px" : "calc(100vw - 100px)",
                height: "200px",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(108,108,123,0.2)",
                color: "rgba(108,108,123,1)",
              }}
              variant="contained"
              onClick={() => {
                onConnectionClicked(
                  currentConnector,
                  name as keyof (typeof stores.accountStore.store)["connectorsByName"],
                  setActivatingConnector,
                  activate,
                  chainId,
                  library
                );
              }}
              disableElevation
              color="secondary"
              disabled={disabled}
            >
              <div
                style={{
                  height: "160px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <img
                  style={{
                    width: "60px",
                    height: "60px",
                  }}
                  src={url}
                  alt=""
                />
                <Typography
                  style={{ color: "#000000", marginBottom: "-15px" }}
                  variant={"h2"}
                >
                  {display}
                </Typography>
                <Typography style={{ color: "#000000" }} variant={"body2"}>
                  {descriptor}
                </Typography>
                {activating && (
                  <CircularProgress size={15} style={{ marginRight: "10px" }} />
                )}
                {!activating && connected && (
                  <div
                    style={{
                      background: "#4caf50",
                      borderRadius: "10px",
                      width: "10px",
                      height: "10px",
                      marginRight: "0px",
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                    }}
                  ></div>
                )}
              </div>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default Unlock;
