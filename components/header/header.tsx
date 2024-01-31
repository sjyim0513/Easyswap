import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

import {
  Typography,
  Button,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from "@mui/material";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import { withStyles, withTheme } from "@mui/styles";
import {
  List,
  ArrowDropDown,
  AccountBalanceWalletOutlined,
  Close,
  Launch,
} from "@mui/icons-material";

import { ContentCopy } from "@mui/icons-material";

import Navigation from "../navigation/navigation";
import Unlock from "../unlock/unlockModal";
import TransactionQueue from "../transactionQueue/transactionQueue";

import { ACTIONS } from "../../stores/constants/constants";

import stores from "../../stores";
import { formatAddress } from "../../utils/utils";

import classes from "./header.module.css";
import { useWeb3React } from "@web3-react/core";
import {
  supportedChainIdList,
  RPC_URLS_LIST,
} from "../../stores/connectors/connectors";

import { SCROLLSCAN_LIST } from "../../stores/constants/constants";

import renderScrollLogo18 from "../../images/scrollLogo18";
import renderScrollLogo19 from "../../images/scrollLogo19";
import renderScrollLogo20 from "../../images/scrollLogo20";
import xrp_logo from "../../images/xrp_logo";

type EthWindow = Window &
  typeof globalThis & {
    ethereum?: any;
  };

function SiteLogo(props) {
  const { color, className } = props;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // 브라우저 창 크기가 변경될 때 업데이트
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 화면 크기에 따라 이미지와 너비 선택
  const logoSrc =
    windowWidth <= 768 ? "/images/mobile-logo.svg" : "/images/logo-fixed.svg";
  const logoWidth = windowWidth <= 768 ? 70 : 250;

  return (
    <img
      className={className}
      src={logoSrc}
      alt="Easyswap logo"
      height={47}
      width={logoWidth}
    />
  );
}

const { CONNECT_WALLET, ACCOUNT_CONFIGURED, ACCOUNT_CHANGED, ERROR } = ACTIONS;

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: "none",
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: "#FFF",
      },
    },
  },
}))(MenuItem);

const StyledBadge = withStyles((theme) => ({
  badge: {
    background: "#FFCC33",
    color: "#000",
  },
}))(Badge);

export const switchChain = async (selectedChain) => {
  let hexChain = "0xA9"; // + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);

  try {
    const ethereum = (window as EthWindow).ethereum;
    if (!ethereum) {
      // if there's isn't any wallet
      return;
    }

    // Current chain ID
    const currentChainId = stores.accountStore.getStore("chainId");
    if (selectedChain === "Manta Pacific Mainnet") {
      const hexChain = "0xA9"; // + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);
      if (currentChainId !== parseInt(hexChain, 16)) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChain }],
        });
      }

      await ethereum.request({
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
            rpcUrls: ["https://pacific-rpc.manta.network/http"],
            blockExplorerUrls: ["https://pacific-explorer.manta.network"],
          },
        ],
      });
    } else if (selectedChain === "Manta Testnet") {
      const hexChain = "0x34816D"; // + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);
      if (currentChainId !== parseInt(hexChain, 16)) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChain }],
        });
      }

      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChain,
            chainName: "Manta Testnet",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://pacific-rpc.testnet.manta.network/http"],
            blockExplorerUrls: ["https://pacific-explorer.manta.network"],
          },
        ],
      });
    }
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        if (selectedChain === "Manta Pacific Mainnet") {
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
                rpcUrls: ["https://pacific-rpc.manta.network/http"],
                blockExplorerUrls: ["https://pacific-explorer.manta.network"],
              },
            ],
          });
        } else if (selectedChain === "Manta Testnet") {
          const hexChain = "0x34816D"; // + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);
          await (window as EthWindow).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChain,
                chainName: "Manta Testnet",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://pacific-rpc.testnet.manta.network/http"],
                blockExplorerUrls: ["https://pacific-explorer.manta.network"],
              },
            ],
          });
        }
      } catch (addError) {}
    }
  }
};

function Header() {
  const accountStore = stores.accountStore.getStore("account");
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const invalidd = stores.accountStore.getStore("chainInvalid");
  const [chainInvalid, setChainInvalid] = useState(invalidd);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deactivate } = useWeb3React();
  const [copied, setCopied] = useState(false);
  const desktop = useMediaQuery({ query: "(min-width: 1200px)" });
  const [chainId, setChainId] = useState(1);
  const initialSize =
    chainId === 3441005 ? window.innerWidth > 1350 : window.innerWidth > 1380;
  const [shouldShow, setShouldShow] = useState(initialSize);
  const [selectedChain, setSelectedChain] = useState("");

  const updateChainId = () => {
    const chainId_ = stores.accountStore.getStore("chainId");
    setChainId(chainId_);
  };

  useEffect(() => {
    const handleResize = () => {
      if (chainId === 3441005) {
        setShouldShow(window.innerWidth > 1350);
      } else if (chainId === 169) {
        setShouldShow(window.innerWidth > 1380);
      } else setShouldShow(window.innerWidth > 1350);
    };

    window.addEventListener("resize", handleResize);

    if (desktop) {
      setIsDesktop(true);
    } else {
      setIsDesktop(false);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chainId, desktop]);

  useEffect(() => {
    // The debounce function receives our function as a parameter
    const debounce = (fn) => {
      // This holds the requestAnimationFrame reference, so we can cancel it if we wish
      let frame;
      // The debounce function returns a new function that can receive a variable number of arguments
      return (...params) => {
        // If the frame variable has been defined, clear it now, and queue for next frame
        if (frame) {
          cancelAnimationFrame(frame);
        }
        // Queue our function call for the next frame
        frame = requestAnimationFrame(() => {
          // Call our function and pass any params we received
          fn(...params);
        });
      };
    };

    // Reads out the scroll position and stores it in the data attribute
    // so we can use it in our stylesheets
    const storeScroll = () => {
      document.documentElement.dataset.scroll = window.scrollY.toString();
    };

    // Listen for new scroll events, here we debounce our `storeScroll` function
    document.addEventListener("scroll", debounce(storeScroll), {
      passive: true,
    });

    // Update scroll position for first time
    storeScroll();
  });

  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      const invalid = stores.accountStore.getStore("chainInvalid");

      setChainInvalid(invalid);
      setAccount(accountStore);
      if (!invalid) {
        stores.dispatcher.dispatch({
          type: ACTIONS.CONFIGURE_SS,
          content: { connected: true },
        });
      }
      closeUnlock();
    };
    updateChainId();
    fetchChainData();

    const connectWallet = () => {
      onAddressClicked();
    };
    const accountChanged = () => {
      const invalid = stores.accountStore.getStore("chainInvalid");
      const chainId_ = stores.accountStore.getStore("chainId");
      // fetchChainData();
      setChainInvalid(invalid);
      updateChainId();
      if (chainId_ === 3441005) {
        setSelectedChain("Manta Testnet");
      } else if (chainId_ === 169) {
        setSelectedChain("Manta Pacific Mainnet");
      } else setSelectedChain("Manta Pacific Mainnet");
    };
    const invalid = stores.accountStore.getStore("chainInvalid");
    setChainInvalid(invalid);
    stores.emitter.on(ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(CONNECT_WALLET, connectWallet);
    stores.emitter.on(ACCOUNT_CHANGED, accountChanged);
    return () => {
      stores.emitter.removeListener(ACCOUNT_CONFIGURED, accountConfigure);
      stores.emitter.removeListener(CONNECT_WALLET, connectWallet);
      stores.emitter.removeListener(ACCOUNT_CHANGED, accountChanged);
    };
  }, []);

  const fetchChainData = async () => {
    const ethereum = (window as EthWindow).ethereum;
    if (!ethereum) {
      // if there's isn't any wallet
      return;
    }
    const chainId_ = stores.accountStore.getStore("chainId");
    const isChainSupported = supportedChainIdList.includes(chainId_);
    if (isChainSupported && chainId_ === 3441005) {
      setSelectedChain("Manta Testnet");
    } else if (isChainSupported && chainId_ === 169) {
      setSelectedChain("Manta Pacific Mainnet");
    } else {
      setSelectedChain("Manta Pacific Mainnet");
    }
  };

  const switchToMainnet = async () => {
    let hexChain = "0xA9"; // + Number(process.env.NEXT_PUBLIC_CHAINID).toString(16);
    try {
      const ethereum = (window as EthWindow).ethereum;
      if (!ethereum) {
        // if there's isn't any wallet
        return;
      }

      const currentChainId = stores.accountStore.getStore("chainId");

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
            rpcUrls: ["https://pacific-rpc.manta.network/http"],
            blockExplorerUrls: ["https://pacific-explorer.manta.network"],
          },
        ],
      });
      if (currentChainId !== parseInt(hexChain, 16)) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChain }],
        });
      }
    } catch (error) {
      //
    }
  };

  const switchToTestnet = async () => {
    let hexChain = "0x34816D"; // + Number(process.env.NEXT_PUBLIC_CHAINID_TESTNET).toString(16);
    try {
      const ethereum = (window as EthWindow).ethereum;
      if (!ethereum) {
        // if there's isn't any wallet
        return;
      }

      const currentChainId = stores.accountStore.getStore("chainId");
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChain,
            chainName: "Manta Testnet",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["https://pacific-rpc.testnet.manta.network/http"],
            blockExplorerUrls: ["https://pacific-explorer.manta.network"],
          },
        ],
      });

      if (currentChainId !== parseInt(hexChain, 16)) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChain }],
        });
      }
    } catch (error) {
      //
    }
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const handleWalletMenuItemClick = () => {
    if (!chainInvalid && !isModalOpen) {
      setIsModalOpen(true);
      setAnchorEl(null);
    }
  };

  const handleNetworkItemClickMainnet = () => {
    switchToMainnet();
    setAnchorEl_Network(null);
  };

  const handleNetworkItemClickTestnet = () => {
    switchToTestnet();
    setAnchorEl_Network(null);
  };

  const handelToScroll = () => {
    window.open("https://scroll.easyswap.fi");
  };

  const handelToRipple = () => {
    window.open("https://ripple.easyswap.fi");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  async function disconnectWallet() {
    try {
      deactivate();
      setAccount(null);
      setUnlockOpen(false);
      setAnchorEl(null);
      stores.accountStore.setStore({
        account: { address: null },
      });
      stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
      //stores.dispatcher.dispatch({ type: ACTIONS.ACCOUNT_CONFIGURED });
    } catch (error) {}
    return true;
  }

  function ConnectAccount() {
    return (
      <div className={classes.connectWallet}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {transactionQueueLength > 0 && (
            <IconButton
              className={classes.accountButton}
              style={{
                color: "#000000",
                backgroundColor: "none",
                marginRight: "0.5rem",
              }}
              onClick={() => {
                stores.emitter.emit(ACTIONS.TX_OPEN);
              }}
            >
              <StyledBadge
                badgeContent={transactionQueueLength}
                style={{ color: "#5F27FF" }}
                overlap="circular"
              >
                <List
                  className={classes.iconColor}
                  style={{ fill: "#34A797" }}
                />
              </StyledBadge>
            </IconButton>
          )}

          {!chainInvalid && shouldShow && (
            <div>
              <Button
                disableElevation
                className={classes.accountButton}
                variant="contained"
                onClick={handleClick_Network}
                ref={buttonRef_Network}
              >
                {renderScrollLogo20()}
                <Typography
                  className={classes.headBtnTxt}
                  style={{ margin: "0 0.5rem" }}
                >
                  {selectedChain}
                </Typography>
                <ArrowDropDown className={classes.ddIcon} />
              </Button>
              <Menu
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition_Network}
                keepMounted
                open={Boolean(anchorEl_Network)}
                onClose={handleClose_Network}
                className={classes.userMenu}
                style={{
                  zIndex: 10030,
                  marginTop: 8,
                  width: "fit-content",
                }}
              >
                <StyledMenuItem
                  onClick={handleNetworkItemClickMainnet}
                  style={{ padding: "0.5rem 3px" }}
                >
                  {renderScrollLogo18()}
                  <Typography
                    style={{
                      color: "#34a797",
                      fontSize: "15px",
                    }}
                  >
                    Manta Pacific Mainnet
                  </Typography>
                </StyledMenuItem>
                <hr style={{ margin: "0.25rem 0", width: "100%" }} />
                <StyledMenuItem
                  onClick={handleNetworkItemClickTestnet}
                  style={{ padding: "0.5rem 3px" }}
                >
                  {renderScrollLogo18()}
                  <Typography
                    style={{
                      color: "#34a797",
                      fontSize: "15px",
                    }}
                  >
                    Manta Testnet
                  </Typography>
                </StyledMenuItem>
                <hr style={{ margin: "0.25rem 0", width: "100%" }} />
                <StyledMenuItem
                  onClick={handelToScroll}
                  style={{ padding: "0.5rem 3px" }}
                >
                  {renderScrollLogo19()}
                  <Typography
                    style={{
                      color: "#34a797",
                      fontSize: "15px",
                    }}
                  >
                    Scroll Sepolia
                  </Typography>
                </StyledMenuItem>
                <hr style={{ margin: "0.25rem 0", width: "100%" }} />
                <StyledMenuItem
                  onClick={handelToRipple}
                  style={{ padding: "0.5rem 3px" }}
                >
                  {xrp_logo()}
                  <Typography
                    style={{
                      color: "#34a797",
                      fontSize: "15px",
                    }}
                  >
                    Ripple Testnet
                  </Typography>
                </StyledMenuItem>
              </Menu>
            </div>
          )}
          {account && account.address ? (
            chainInvalid ? (
              <Button
                disableElevation
                className={classes.accountButton}
                variant="contained"
                onClick={() => switchChain(selectedChain)}
              >
                {/* {account && account.address && (
                  <div
                    className={`${classes.accountIcon} ${classes.metamask}`}
                  ></div>
                )} */}
                <Typography className={classes.headBtnTxt}>
                  Switch Network
                </Typography>
              </Button>
            ) : (
              <div>
                <Button
                  disableElevation
                  className={classes.accountButton}
                  variant="contained"
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                  ref={buttonRef}
                >
                  {/* {account && account.address && (
                    <div
                      className={`${classes.accountIcon} ${classes.metamask}`}
                    ></div>
                  )} */}
                  <Typography className={classes.headBtnTxt}>
                    {account && account.address
                      ? formatAddress(account.address)
                      : "Connect Wallet"}
                  </Typography>
                  <ArrowDropDown className={classes.ddIcon} />
                </Button>
                <Menu
                  anchorReference="anchorPosition"
                  anchorPosition={anchorPosition}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  className={classes.userMenu}
                  style={{
                    zIndex: 10030,
                    marginTop: 8,
                  }}
                >
                  <StyledMenuItem onClick={handleWalletMenuItemClick}>
                    <ListItemIcon className={classes.userMenuIcon}>
                      <AccountBalanceWalletOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      className={classes.userMenuText}
                      style={{ color: "#000000" }}
                      secondary=": Wallet"
                    />
                  </StyledMenuItem>

                  <StyledMenuItem
                    onClick={() => {
                      disconnectWallet();
                    }}
                  >
                    <ListItemIcon className={classes.userMenuIcon}>
                      <AccountBalanceWalletOutlined fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      className={classes.userMenuText}
                      style={{ color: "#000000" }}
                      secondary=": Disconnect Wallet"
                    />
                  </StyledMenuItem>
                </Menu>
              </div>
            )
          ) : (
            <Button
              disableElevation
              className={classes.accountButton}
              variant="contained"
              onClick={onAddressClicked}
            >
              {/* {account && account.address && (
                <div
                  className={`${classes.accountIcon} ${classes.metamask}`}
                ></div>
              )} */}
              <Typography className={classes.headBtnTxt}>
                {account && account.address
                  ? formatAddress(account.address)
                  : "Connect Wallet"}
              </Typography>
            </Button>
          )}
        </div>
        {unlockOpen && (
          <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
        )}
        <TransactionQueue setQueueLength={setQueueLength} />
      </div>
    );
  }

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };
  const [anchorPosition, setAnchorPosition] = React.useState({
    top: 0,
    left: 0,
  });

  const [anchorEl, setAnchorEl] = React.useState(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const handleClick = (event) => {
    if (buttonRef.current) {
      const { top, left } = buttonRef.current.getBoundingClientRect();
      setAnchorPosition({
        top: top + window.pageYOffset + 30,
        left: left + window.pageXOffset,
      });
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);
  const listIconButtonRef = useRef();

  const handleMenuClick = () => {
    setMenuAnchorEl(listIconButtonRef.current);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const [anchorPosition_Network, setAnchorPositionNetwork] = React.useState({
    top: 0,
    left: 0,
  });

  const [anchorEl_Network, setAnchorEl_Network] =
    React.useState<HTMLButtonElement | null>(null);
  const buttonRef_Network = useRef<HTMLButtonElement | null>(null);

  const handleClick_Network = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef_Network.current) {
      const { top, left } = buttonRef_Network.current.getBoundingClientRect();
      setAnchorPositionNetwork({
        top: top + window.pageYOffset + 30,
        left: left + window.pageXOffset,
      });
    }
    setAnchorEl_Network(event.currentTarget);
  };

  const handleClose_Network = () => {
    setAnchorEl_Network(null);
  };

  function WalletInfo(props) {
    const govToken = stores.stableSwapStore.getStore("govToken");
    const handleCopyToClipboard = (text) => {
      if (navigator.clipboard && navigator.permissions) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        });
      } else if (document.queryCommandSupported("copy")) {
        const ele = document.createElement("textarea");
        ele.value = text;
        document.body.appendChild(ele);
        ele.select();
        document.execCommand("copy");
        document.body.removeChild(ele);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      }
    };

    return (
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            padding: "3rem",
            paddingTop: "0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img src="/tokens/govToken-logo.png" width={120} />
        </div>
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            style={{ margin: 0, lineHeight: "20px", fontSize: "22px" }}
          >
            {formatAddress(props.account.address, "long")}
          </Typography>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className={classes.link}>
              <Tooltip
                title={copied ? "Copied" : ""}
                placement="bottom"
                arrow={false}
                open={copied}
              >
                <Button
                  variant="outlined"
                  onClick={() => handleCopyToClipboard(props.account.address)}
                  style={{
                    border: "0px",
                    color: "black",
                    backgroundColor: "transparent",
                  }}
                >
                  <ContentCopy style={{ width: "16px", height: "auto" }} />
                  <Typography style={{ fontSize: "13px" }}>
                    Copy Address
                  </Typography>
                </Button>
              </Tooltip>
            </div>
            <div className={classes.link}>
              <Launch style={{ width: "16px", margin: "0 5px" }} />
              <a
                href={`${SCROLLSCAN_LIST[chainId]}address/${props.account.address}`}
                target="_blank"
              >
                <Typography style={{ fontSize: "13px" }}>
                  View on Blockscout
                </Typography>
              </a>
            </div>
          </div>
        </div>
        <div style={{ margin: "1rem 0" }}>
          {/* <Typography style={{ margin: 0, lineHeight: "20px" }}>
            {parseFloat(govToken.balance).toFixed(4).replace(/\.?0+$/, "")}
          </Typography> */}
        </div>
      </div>
    );
  }

  const open = Boolean(menuAnchorEl);

  return (
    <div>
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ backgroundColor: "white" }}
      >
        <div style={{ display: "flex", justifyContent: "end" }}>
          <DialogActions style={{ padding: "0.5rem 0" }}>
            <Button
              onClick={handleCloseModal}
              style={{
                color: "#000",
                border: "0px",
                padding: "0px",
                backgroundColor: "transparent",
              }}
            >
              <Close style={{ width: "24px" }} />
            </Button>
          </DialogActions>
        </div>
        <DialogContent>
          <WalletInfo
            account={account}
            chainInvalid={chainInvalid}
            isModalOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </DialogContent>
      </Dialog>

      <div className={classes.headerContainer}>
        <a
          onClick={() => {
            router.push("/home");
          }}
          className={classes.logoContainer}
        >
          <SiteLogo className={classes.appLogo} />
        </a>
        {isDesktop ? (
          <div className={classes.headerRight}>
            <Navigation />
            <ConnectAccount />
          </div>
        ) : (
          <div className={classes.headerDesktop}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
              ref={listIconButtonRef}
            >
              <List
                className={classes.iconColor1}
                style={{ fontSize: "2.5rem" }}
              />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={open}
              onClose={handleMenuClose}
              // onClick={handleMenuClick}
              PaperProps={{
                elevation: 0,
                sx: {
                  maxWidth: "calc(100% - 16px)", // To ensure the menu doesn't exceed the viewport width
                  height: "auto",
                  overflow: "visible",
                  color: "black",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: "calc(100% - 20px)",
                    height: "calc(100%)",
                    ml: 0,
                    mr: 0,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",

                    zIndex: 10030,
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  router.push("/swap");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Swap
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/liquidity");
                  handleMenuClose();
                }}
                sx={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                Pools
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/vest");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Lock
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/vote");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Vote
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/rewards");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Claim
              </MenuItem>
              <MenuItem
                onClick={() => {
                  router.push("/bribe");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Bribe
              </MenuItem>
              {chainId === 3441005 && (
                <MenuItem
                  onClick={() => {
                    router.push("/faucet");
                    handleMenuClose();
                  }}
                  sx={{ fontWeight: "bold" }}
                >
                  Faucet
                </MenuItem>
              )}
              {/* {chainId === 169 && (
                <MenuItem
                  onClick={() => {
                    router.push("/leaderboard");
                    handleMenuClose();
                  }}
                  sx={{ fontWeight: "bold" }}
                >
                  Leaderboard
                </MenuItem>
              )} */}
              <MenuItem
                onClick={() => {
                  if (chainId === 3441005)
                    window.open(
                      "https://pacific-bridge.testnet.manta.network/",
                      "_blank"
                    );
                  else
                    window.open(
                      "https://pacific-bridge.manta.network/",
                      "_blank"
                    );
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Bridge
              </MenuItem>
              {chainId === 169 && (
                <MenuItem
                  onClick={() => {
                    router.push("/launchpad");
                    handleMenuClose();
                  }}
                  sx={{ fontWeight: "bold" }}
                >
                  Launchpad
                </MenuItem>
              )}
              {/* <MenuItem
                onClick={() => {
                  router.push("/tool");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                PnL
              </MenuItem> */}
              {/* <MenuItem
                onClick={() => {
                  // router.push("/bot");
                  handleMenuClose();
                }}
                sx={{ fontWeight: "bold" }}
              >
                Bot
              </MenuItem> */}
              <div>
                <ConnectAccount />
              </div>
            </Menu>
          </div>
        )}
      </div>
    </div>
  );
}

export default withTheme(Header);
