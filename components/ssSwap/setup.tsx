import React, { useState, useEffect, useMemo } from "react";
import {
  TextField,
  Typography,
  InputAdornment,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  CircularProgress,
  Modal,
  Tooltip,
} from "@mui/material";
import {
  Search,
  ImportExport,
  ArrowForwardIos,
  CloseSharp,
  EditOutlined,
  SyncAltSharp,
  ContentCopy,
} from "@mui/icons-material";

import { styled, withTheme } from "@mui/styles";

import { formatCurrency } from "../../utils/utils";

import classes from "./ssSwap.module.css";

import stores from "../../stores";
import {
  ACTIONS,
  W_NATIVE_ADDRESS_LIST,
} from "../../stores/constants/constants";
import BigNumber from "bignumber.js";
import type { BaseAsset } from "../../stores/types/types";

import TransactionQueue from "../transactionQueue/transactionQueue";
import Unlock from "../unlock/unlockModal";
import { ACCOUNT_CHANGED } from "../../stores/constants/actions";

type EthWindow = Window &
  typeof globalThis & {
    ethereum?: any;
  };

function Setup() {
  const accountStore = stores.accountStore.getStore("account");
  const invalid = stores.accountStore.getStore("chainInvalid");
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);
  const [isconnected, setIsconnected] = useState(true);
  const [isAccount, setIsAccount] = useState(accountStore);
  const [chainInvalid, setChainInvalid] = useState(invalid);
  const { CONNECT_WALLET, ACCOUNT_CONFIGURED } = ACTIONS;

  let W_NATIVE_ADDRESS = "";
  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  const switchChain = async () => {
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

    stores.emitter.emit(ACTIONS.ACCOUNT_CHANGED);
  };

  const SettingModal = ({ onClose }) => {
    const [slippage_, setSlippage_] = useState(slippage);
    const handleSlippageChanged = (newSlippage) => {
      if (newSlippage || Object.keys(newSlippage).length > 0) {
        setSlippage_(newSlippage);
      } else {
        setSlippage_(slippage_);
      }
    };

    const handleClose = () => {
      onClose(slippage_);
    };

    return (
      <Dialog
        open={isModalOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { overflowY: "hidden" } }}
      >
        <div className={`${classes.settingModal}`}>
          <div className={`${classes.modalContent}`}>
            <div className={`${classes.modalHeader}`}>
              <Typography style={{ fontSize: "14px", fontWeight: "bold" }}>
                Slippage
              </Typography>
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  height: "fit-content",
                }}
              >
                <button className="close-button" onClick={handleClose}>
                  <CloseSharp />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div
                style={{
                  display: "flex",
                  padding: "0 2rem",
                  marginBottom: "2rem",
                }}
              >
                {renderSmallInput(
                  "slippage",
                  slippage,
                  slippageError,
                  onSlippageChanged,
                  handleSlippageChanged
                )}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    );
  };

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  useEffect(() => {
    const accountConfigure = () => {
      ////console.log("2")
      const accountStore = stores.accountStore.getStore("account");
      const chain = stores.accountStore.getStore("chainId");
      W_NATIVE_ADDRESS = W_NATIVE_ADDRESS_LIST[chain];
      setIsAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    const accountChanged = () => {
      ////console.log("1")
      const invalid = stores.accountStore.getStore("chainInvalid");
      const accountStore = stores.accountStore.getStore("account");
      setIsAccount(accountStore);
      setChainInvalid(invalid);
    };

    const invalid = stores.accountStore.getStore("chainInvalid");
    accountConfigure();
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

  const [, updateState] = React.useState<{}>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const [fromAmountValue, setFromAmountValue] = useState("");
  const [fromAmountValueUsd, setFromAmountValueUsd] = useState("");
  const [fromAmountError, setFromAmountError] = useState<false | string>(false);
  const [fromAssetValue, setFromAssetValue] = useState<BaseAsset | null>(null);
  const [fromAssetError, setFromAssetError] = useState<false | string>(false);
  const [fromAssetOptions, setFromAssetOptions] = useState<BaseAsset[]>([]);

  const [toAmountValue, setToAmountValue] = useState("");
  const [toAmountValueUsd, setToAmountValueUsd] = useState("");
  const [toAmountError, setToAmountError] = useState(false);
  const [toAssetValue, setToAssetValue] = useState<BaseAsset>(null);
  const [toAssetError, setToAssetError] = useState<false | string>(false);
  const [toAssetOptions, setToAssetOptions] = useState<BaseAsset[]>([]);

  const [slippage, setSlippage] = useState("2");
  const [slippageError, setSlippageError] = useState(false);

  const [quoteError, setQuoteError] = useState(null);
  const [quote, setQuote] = useState(null);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Map<string, number>>();

  const [baseAsset, setbaseAsset] = useState<BaseAsset[]>([]);
  const [isWrapUnwrap, setIsWrapUnwrap] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openSettingModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fromAmountChanged(fromAmountValue);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [fromAmountValue]);

  const closeSettingModal = (props) => {
    setIsModalOpen(false);
    if (typeof props === "number") {
      setSlippage(props.toString());
    } else {
      setSlippage(props);
    }
  };

  const usdDiff = useMemo(() => {
    if (
      fromAmountValueUsd &&
      fromAmountValueUsd === "" &&
      toAmountValueUsd &&
      toAmountValueUsd === ""
    )
      return "";
    if (
      parseFloat(fromAmountValueUsd) === 0 ||
      parseFloat(toAmountValueUsd) === 0
    )
      return "";
    if (parseFloat(fromAmountValueUsd) === parseFloat(toAmountValueUsd)) return;
    if (parseFloat(fromAmountValueUsd) === parseFloat(toAmountValueUsd)) return;
    fromAmountValueUsd &&
      fromAmountValueUsd !== "" &&
      toAmountValueUsd &&
      toAmountValueUsd !== "";

    const increase =
      ((parseFloat(toAmountValueUsd) - parseFloat(fromAmountValueUsd)) /
        parseFloat(fromAmountValueUsd)) *
      100;
    const decrease =
      ((parseFloat(fromAmountValueUsd) - parseFloat(toAmountValueUsd)) /
        parseFloat(fromAmountValueUsd)) *
      100;
    const diff =
      parseFloat(fromAmountValueUsd) > parseFloat(toAmountValueUsd)
        ? -1 * decrease
        : increase;
    return diff.toFixed(2);
  }, [fromAmountValueUsd, toAmountValueUsd]);

  useEffect(
    function () {
      const sisWrapUnwrap =
        (fromAssetValue?.symbol === "WETH" && toAssetValue?.symbol === "ETH") ||
        (fromAssetValue?.symbol === "ETH" && toAssetValue?.symbol === "WETH")
          ? true
          : false;
      setIsWrapUnwrap(sisWrapUnwrap);

      const errorReturned = () => {
        setLoading(false);
        setApprovalLoading(false);
        setQuoteLoading(false);
      };

      const quoteReturned = (val) => {
        if (!val) {
          setQuoteLoading(false);
          setQuote(null);
          setToAmountValue("");
          setToAmountValueUsd("");
          setQuoteError(
            "Insufficient liquidity or no route available to complete swap"
          );
        }
        if (
          val &&
          val.inputs &&
          val.output &&
          val.inputs.fromAmount &&
          val.inputs.fromAsset.address &&
          val.inputs.toAsset.address
          // val.inputs.fromAmount === fromAmountValue &&
          // val.inputs.fromAsset.address === fromAssetValue.address &&
          // val.inputs.toAsset.address === toAssetValue.address
        ) {
          setQuoteLoading(false);
          //////console.log("val", val)
          if (BigNumber(val.output.finalValue).eq(0)) {
            setQuote(null);
            setToAmountValue("");
            setToAmountValueUsd("");
            setQuoteError(
              "Insufficient liquidity or no route available to complete swap"
            );
            return;
          }
          setFromAmountValue(String(val.inputs.fromAmount));
          setToAmountValue(BigNumber(val.output.finalValue).toFixed(6));
          const toAddressLookUp =
            val.inputs.toAsset.symbol === "ETH"
              ? W_NATIVE_ADDRESS.toLowerCase()
              : val.inputs.toAsset.address.toLowerCase();
          const toUsdValue = BigNumber(val.output.finalValue)
            .multipliedBy(tokenPrices?.get(toAddressLookUp) ?? 0)
            .toFixed(2);
          setToAmountValueUsd(toUsdValue);
          setQuote(val);
        }
      };

      const ssUpdated = () => {
        const swapAssets = stores.stableSwapStore.getStore("pairtokenAssets");
        const tokenPrices = stores.stableSwapStore.getStore("tokenPrices");
        const slippage = stores.accountStore.getStore("swap_slippage");
        const tvl = stores.stableSwapStore.getStore("tvl");
        setToAssetOptions(swapAssets);
        setFromAssetOptions(swapAssets);
        setSlippage(slippage);

        if (swapAssets.length > 0 && toAssetValue == null) {
          setToAssetValue(swapAssets[0]);
        }

        if (swapAssets.length > 0 && fromAssetValue == null) {
          setFromAssetValue(swapAssets[1]);
        }

        if (tokenPrices.size > 0) {
          setTokenPrices(tokenPrices);
        }

        forceUpdate();
      };

      const assetsUpdated = (payload: BaseAsset[]) => {
        if (payload && payload.length > 0) {
          setToAssetOptions(payload);
          setFromAssetOptions(payload);
        } else {
          const swapAssets = stores.stableSwapStore.getStore("pairtokenAssets");
          setToAssetOptions(swapAssets);
          setFromAssetOptions(swapAssets);
        }
      };

      const swapReturned = (event) => {
        setLoading(false);
        setFromAmountValue("");
        setToAmountValue("");
        setFromAmountValueUsd("");
        setToAmountValueUsd("");
        calculateReceiveAmount("", fromAssetValue, toAssetValue);
        setQuote(null);
        setQuoteLoading(false);
      };

      stores.emitter.on(ACTIONS.ERROR, errorReturned);
      stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
      stores.emitter.on(ACTIONS.SWAP_RETURNED, swapReturned);
      stores.emitter.on(ACTIONS.QUOTE_SWAP_RETURNED, quoteReturned);
      stores.emitter.on(ACTIONS.SWAP_ASSETS_UPDATED, assetsUpdated);
      // stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);
      stores.emitter.on(ACTIONS.WRAP_UNWRAP_RETURNED, swapReturned);
      // stores.emitter.on(ACTIONS.SET_SWAP_SLIPPAGE, setSwapSlippage);

      ssUpdated();

      return () => {
        stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
        stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
        stores.emitter.removeListener(ACTIONS.SWAP_RETURNED, swapReturned);
        stores.emitter.removeListener(
          ACTIONS.WRAP_UNWRAP_RETURNED,
          swapReturned
        );
        stores.emitter.removeListener(
          ACTIONS.QUOTE_SWAP_RETURNED,
          quoteReturned
        );
        stores.emitter.removeListener(
          ACTIONS.SWAP_ASSETS_UPDATED,
          assetsUpdated
        );
        // stores.emitter.removeListener(
        //   ACTIONS.SET_SWAP_SLIPPAGE,
        //   setSwapSlippage
        // );
      };
    },
    [fromAmountValue, fromAssetValue, toAssetValue]
  );

  const onAssetSelect = (type: string, value: BaseAsset) => {
    if (type === "From") {
      if (value.address === toAssetValue.address) {
        setToAssetValue(fromAssetValue);
        setFromAssetValue(toAssetValue);
        calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue);
      } else if (
        (value.symbol === "ETH" && toAssetValue.symbol === "WETH") ||
        (value.symbol === "WETH" && toAssetValue.symbol === "ETH")
      ) {
        setFromAssetValue(value);
        // setToAssetValue(
        //   toAssetOptions.find((asset) => asset.symbol === fromAssetValue.symbol)
        // );
        // setFromAssetValue(
        //   fromAssetOptions.find((asset) => asset.symbol === value.symbol)
        // );
        calculateReceiveAmount(
          fromAmountValue,
          fromAssetOptions.find((asset) => asset.symbol === value.symbol),
          toAssetOptions.find((asset) => asset.symbol === fromAssetValue.symbol)
        );
      } else {
        setFromAssetValue(value);
        calculateReceiveAmount(fromAmountValue, value, toAssetValue);
      }
      setFromAmountValueUsd(
        (
          parseFloat(fromAmountValue) *
          (tokenPrices?.get(
            value.symbol === "ETH"
              ? W_NATIVE_ADDRESS.toLowerCase()
              : value.address.toLowerCase()
          ) ?? 0)
        ).toFixed(2)
      );
    } else {
      if (value.address === fromAssetValue.address) {
        setFromAssetError(false);
        setToAssetValue(fromAssetValue);
        setFromAssetValue(toAssetValue);
        calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue);
      } else if (
        (value.symbol === "ETH" && fromAssetValue.symbol === "WETH") ||
        (value.symbol === "WETH" && fromAssetValue.symbol === "ETH")
      ) {
        setToAssetValue(value);
        // setFromAssetValue(
        //   fromAssetOptions.find((asset) => asset.symbol === toAssetValue.symbol)
        // );
        // setToAssetValue(
        //   toAssetOptions.find((asset) => asset.symbol === value.symbol)
        // );
        calculateReceiveAmount(
          fromAmountValue,
          fromAssetOptions.find(
            (asset) => asset.symbol === toAssetValue.symbol
          ),
          toAssetOptions.find((asset) => asset.symbol === value.symbol)
        );
      } else {
        setToAssetValue(value);

        calculateReceiveAmount(fromAmountValue, fromAssetValue, value);
      }
      // setToAmountValueUsd(
      //   (
      //     parseFloat(fromAmountValue) *
      //     (tokenPrices?.get(
      //       value.symbol === "ETH"
      //         ? W_NATIVE_ADDRESS.toLowerCase()
      //         : value.address.toLowerCase()
      //     ) ?? 0)
      //   ).toFixed(2)
      // );
    }

    forceUpdate();
  };

  const fromAmountChanged = (newValue) => {
    setFromAmountError(false);
    setFromAmountValue(newValue);
    if (newValue === "") {
      setToAmountValue("");
      setQuote(null);
      setFromAmountValueUsd("");
      setToAmountValueUsd("");
    } else {
      setFromAmountValueUsd(
        (
          parseFloat(newValue) *
          (tokenPrices?.get(
            fromAssetValue?.symbol === "ETH"
              ? W_NATIVE_ADDRESS.toLowerCase()
              : fromAssetValue
              ? fromAssetValue?.address.toLowerCase()
              : ""
          ) ?? 0)
        ).toFixed(4)
      );
      calculateReceiveAmount(newValue, fromAssetValue, toAssetValue);
    }
  };

  const toAmountChanged = (event) => {};

  const onSlippageChanged = (event) => {
    if (event.target.value == "" || !isNaN(event.target.value)) {
      setSlippage(event.target.value);
    }
  };

  const handleTextFieldClick = (e) => {
    e.stopPropagation();

    e.target.value = "";
  };

  const calculateReceiveAmount = (
    amount: string,
    from: BaseAsset,
    to: BaseAsset
  ) => {
    if (
      amount !== "" &&
      !isNaN(+amount) &&
      to != null &&
      parseFloat(amount) !== 0
    ) {
      //setQuoteLoading(true);
      setQuoteError(false);
      if (
        (from?.symbol === "WETH" && to?.symbol === "ETH") ||
        (from?.symbol === "ETH" && to?.symbol === "WETH")
      ) {
        setQuoteLoading(false);
        setToAmountValue(amount);
        return;
      }
      stores.dispatcher.dispatch({
        type: ACTIONS.QUOTE_SWAP,
        content: {
          fromAsset: from,
          toAsset: to,
          fromAmount: amount,
        },
      });
    }
  };

  const onSwap = () => {
    setFromAmountError(false);
    setFromAssetError(false);
    setToAssetError(false);

    let error = false;

    if (!fromAmountValue || fromAmountValue === "" || isNaN(+fromAmountValue)) {
      setFromAmountError("From amount is required");
      error = true;
    } else {
      if (
        !fromAssetValue.balance ||
        isNaN(+fromAssetValue.balance) || // TODO probably dont neet it
        BigNumber(fromAssetValue.balance).lte(0)
      ) {
        setFromAmountError("Invalid balance");
        error = true;
      } else if (BigNumber(fromAmountValue).lte(0)) {
        setFromAmountError("Invalid amount");
        error = true;
      } else if (BigNumber(toAmountValue).lte(0)) {
        setToAmountError(true);
        error = true;
      } else if (
        fromAssetValue &&
        BigNumber(fromAmountValue).gt(fromAssetValue.balance)
      ) {
        setFromAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!fromAssetValue || fromAssetValue === null) {
      setFromAssetError("From asset is required");
      error = true;
    }

    if (!toAssetValue || toAssetValue === null) {
      setFromAssetError("To asset is required");
      error = true;
    }

    if (!error) {
      setLoading(true);

      stores.dispatcher.dispatch({
        type: ACTIONS.SWAP,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
          toAmount: toAmountValue,
          quote: quote,
          slippage: slippage,
        },
      });
    }
  };

  const onWrapUnwrap = () => {
    setFromAmountError(false);
    setFromAssetError(false);
    setToAssetError(false);

    let error = false;

    if (!fromAmountValue || fromAmountValue === "" || isNaN(+fromAmountValue)) {
      setFromAmountError("From amount is required");
      error = true;
    } else {
      if (
        !fromAssetValue.balance ||
        isNaN(+fromAssetValue.balance) || // TODO probably dont neet it
        BigNumber(fromAssetValue.balance).lte(0)
      ) {
        setFromAmountError("Invalid balance");
        error = true;
      } else if (BigNumber(fromAmountValue).lt(0)) {
        setFromAmountError("Invalid amount");
        error = true;
      } else if (
        fromAssetValue &&
        BigNumber(fromAmountValue).gt(fromAssetValue.balance)
      ) {
        setFromAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!fromAssetValue || fromAssetValue === null) {
      setFromAssetError("From asset is required");
      error = true;
    }

    if (!toAssetValue || toAssetValue === null) {
      setFromAssetError("To asset is required");
      error = true;
    }

    if (!error) {
      setLoading(true);

      stores.dispatcher.dispatch({
        type: ACTIONS.WRAP_UNWRAP,
        content: {
          fromAsset: fromAssetValue,
          toAsset: toAssetValue,
          fromAmount: fromAmountValue,
        },
      });
    }
  };

  const setBalance100 = () => {
    if (fromAssetValue) {
      const am = BigNumber(fromAssetValue.balance).toString();
      setFromAmountValue(am);
      setFromAmountValueUsd(
        (
          parseFloat(am) *
          tokenPrices?.get(
            fromAssetValue.symbol === "ETH"
              ? W_NATIVE_ADDRESS.toLowerCase()
              : fromAssetValue
              ? fromAssetValue.address.toLowerCase()
              : ""
          )
        ).toFixed(2)
      );

      calculateReceiveAmount(am, fromAssetValue, toAssetValue);
    }
  };

  const swapAssets = () => {
    const fa = fromAssetValue;
    const ta = toAssetValue;
    setFromAssetValue(ta);
    setToAssetValue(fa);
    setFromAmountValueUsd(
      (
        parseFloat(toAmountValue) *
        (tokenPrices?.get(
          ta.symbol === "ETH"
            ? W_NATIVE_ADDRESS.toLowerCase()
            : ta.address.toLowerCase()
        ) ?? 0)
      ).toFixed(2)
    );

    calculateReceiveAmount(toAmountValue, ta, fa);
  };

  const isValidAmount = (value) => {
    if (value.endsWith(".")) {
      return true;
    }
    return /^\d+(\.\d+)?$/.test(value);
  };

  const cleanInputValue = (value) => {
    const cleanedValue = value.replace(/^0+/, "");
    if (cleanedValue.startsWith(".")) {
      return `0${cleanedValue}`;
    }
    return cleanedValue;
  };

  const handleBlur = () => {
    const cleanedValue = fromAmountValue.trim();
    if (cleanedValue === "") {
      setFromAssetError("");
    } else {
      const modifiedValue = cleanInputValue(cleanedValue);

      if (!isValidAmount(modifiedValue)) {
        setFromAmountValue("");
        setFromAssetError("Invalid input");
      } else {
        const modifiedValue = cleanedValue.endsWith(".")
          ? cleanedValue.slice(0, -1)
          : cleanedValue;
        setFromAmountValue(modifiedValue);
        if (isWrapUnwrap) {
          setToAmountValue(modifiedValue);
        }
        setFromAssetError("");
      }
    }
  };

  const renderSwapInformation = () => {
    if (quoteError) {
      return (
        <div className={classes.quoteLoader}>
          <Typography className={classes.quoteError}>{quoteError}</Typography>
        </div>
      );
    }

    if (quoteLoading) {
      return (
        <div className={classes.quoteLoader}>
          <CircularProgress size={20} className={classes.loadingCircle} />
        </div>
      );
    }

    if (!quote) {
      return null;
    }
    return (
      <div className={classes.depositInfoContainer}>
        {/* <Typography className={classes.depositInfoHeading}>
          Price Info
        </Typography>
        <div className={classes.priceInfos}>
          <div className={classes.priceInfo}>
            <Typography className={classes.title}>
              {formatCurrency(
                BigNumber(quote.inputs.fromAmount)
                  .div(quote.output.finalValue)
                  .toFixed(18)
              )}
            </Typography>
            <Typography
              className={classes.text}
            >{`${fromAssetValue?.symbol} per ${toAssetValue?.symbol}`}</Typography>
          </div>
          <div className={classes.priceInfo}>
            <Typography className={classes.title}>
              {formatCurrency(
                BigNumber(quote.output.finalValue)
                  .div(quote.inputs.fromAmount)
                  .toFixed(18)
              )}
            </Typography>
            <Typography
              className={classes.text}
            >{`${toAssetValue?.symbol} per ${fromAssetValue?.symbol}`}</Typography>
          </div>
        </div> */}
        <Typography className={classes.depositInfoHeading}>Route</Typography>
        <div className={classes.route}>
          <img
            className={classes.displayAssetIconSmall}
            alt=""
            src={fromAssetValue ? `${fromAssetValue.logoURI}` : ""}
            height="40px"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "/tokens/unknown-logo.png";
            }}
          />
          <div className={classes.line}>
            <div className={classes.routeArrow}>
              <ArrowForwardIos className={classes.routeArrowIcon} />
            </div>
            <div className={classes.stabIndicatorContainer}>
              <Typography className={classes.stabIndicator}>
                {quote.output.routes[0].stable ? "Stable" : "Volatile"}
              </Typography>
            </div>
          </div>
          {quote && quote.output && quote.output.routeAsset && (
            <>
              <img
                className={classes.displayAssetIconSmall}
                alt=""
                src={
                  quote.output.routeAsset
                    ? `${quote.output.routeAsset.logoURI}`
                    : ""
                }
                height="40px"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    "/tokens/unknown-logo.png";
                }}
              />
              <div className={classes.line}>
                <div className={classes.routeArrow}>
                  <ArrowForwardIos className={classes.routeArrowIcon} />
                </div>
                <div className={classes.stabIndicatorContainer}>
                  <Typography className={classes.stabIndicator}>
                    {quote.output.routes[1].stable ? "Stable" : "Volatile"}
                  </Typography>
                </div>
              </div>
            </>
          )}
          <img
            className={classes.displayAssetIconSmall}
            alt=""
            src={toAssetValue ? `${toAssetValue.logoURI}` : ""}
            height="40px"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "/tokens/unknown-logo.png";
            }}
          />
        </div>
        {BigNumber(quote.priceImpact).gt(parseFloat(slippage)) && (
          <div className={classes.warningContainer}>
            <Typography
              className={
                BigNumber(quote.priceImpact).gt(5)
                  ? classes.warningError
                  : classes.warningWarning
              }
              align="center"
              color="#ffffff"
            >
              Price impact {formatCurrency(quote.priceImpact)}%
            </Typography>
          </div>
        )}
      </div>
    );
  };

  const renderSmallInput = (
    type,
    amountValue,
    amountError,
    amountChanged,
    handleSlippageChanged
  ) => {
    const [localSettings, setLocalSettings] = useState(amountValue);
    const [selectedSlippage, setSelectedSlippage] = useState(null);
    const handleSlippageButtonClick = (slippageValue) => {
      setLocalSettings(slippageValue);
      handleSlippageChanged(slippageValue);
      stores.accountStore.setStore({ swap_slippage: slippageValue });
    };

    const handleChanged = (event) => {
      setLocalSettings(event.target.value);
    };

    const handleBlur = () => {
      let newSlippage = parseFloat(localSettings); // 문자열을 숫자로 변환

      if (newSlippage < 0.1) {
        newSlippage = 0.1;
      } else if (newSlippage > 100) {
        newSlippage = 100;
      }
      newSlippage = parseFloat(newSlippage.toFixed(2));
      handleSlippageChanged(newSlippage); // 숫자 값을 전달
      setLocalSettings(newSlippage);
      stores.accountStore.setStore({ swap_slippage: newSlippage });
    };

    // useEffect(() => {
    //   stores.emitter.emit(ACTIONS.)
    // }, [localSettings]);

    return (
      <div className={classes.textField} style={{ width: "100%" }}>
        <div className={classes.inputTitleContainerSlippage}>
          <div className={classes.inputBalanceSlippage}>
            <Typography className={classes.inputBalanceTextSlippage} noWrap>
              Slippage tolerance: {localSettings}%
            </Typography>
          </div>
        </div>
        <div
          className={classes.smallInputContainer}
          style={{ padding: "1rem" }}
        >
          <div style={{ display: "flex" }}>
            <Button
              onClick={() => handleSlippageButtonClick(0.1)}
              style={{
                backgroundColor:
                  localSettings === 0.1 || localSettings === "0.1"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "8px 0 0 8px",
                border: "1px solid",
              }}
            >
              0.1%
            </Button>
            <Button
              onClick={() => handleSlippageButtonClick(0.3)}
              style={{
                backgroundColor:
                  localSettings === 0.3 || localSettings === "0.3"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0px",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              0.3%
            </Button>
            <Button
              onClick={() => handleSlippageButtonClick(1)}
              style={{
                backgroundColor:
                  localSettings === 1 || localSettings === "1"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0px",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              1%
            </Button>
            <Button
              onClick={() => handleSlippageButtonClick(3)}
              style={{
                backgroundColor:
                  localSettings === 3 || localSettings === "3"
                    ? "rgba(255, 174, 128, 0.3)"
                    : "white",
                borderRadius: "0 8px 8px 0",
                border: "1px solid",
                borderLeft: "none",
              }}
            >
              3%
            </Button>
          </div>
          <Typography style={{ padding: "1rem" }}>or</Typography>
          <TextField
            onClick={handleTextFieldClick}
            placeholder="0.00"
            fullWidth
            size="small"
            style={{ width: "70px" }}
            error={!!amountError}
            helperText={amountError}
            value={localSettings}
            onChange={handleChanged}
            onBlur={handleBlur}
            disabled={loading}
            autoComplete="off"
            inputProps={{
              style: {
                textAlign: "center",
                color: "black",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <span style={{ color: "black", fontSize: "15px" }}>%</span>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    );
  };

  function PriceInfoSwitcher({ fromAssetValue, toAssetValue, quote }) {
    const [showFirstPriceInfo, setShowFirstPriceInfo] = useState(true);

    const togglePriceInfo = () => {
      setShowFirstPriceInfo(!showFirstPriceInfo);
    };

    const renderPriceInfo = () => {
      if (showFirstPriceInfo) {
        return (
          <div className={classes.priceInfo}>
            <Typography className={classes.text}>
              1 {`${fromAssetValue?.symbol}`}
              <button onClick={togglePriceInfo}>
                <SyncAltSharp style={{ width: "18px", margin: "0 0.25rem" }} />
              </button>
              {formatCurrency(
                BigNumber(quote?.output.finalValue)
                  .div(quote?.inputs.fromAmount)
                  .toFixed(18)
              )}{" "}
              {`${toAssetValue?.symbol}`}
            </Typography>
          </div>
        );
      } else {
        return (
          <div className={classes.priceInfo}>
            <Typography className={classes.text}>
              1 {`${toAssetValue?.symbol}`}
              <button onClick={togglePriceInfo}>
                <SyncAltSharp style={{ width: "18px", margin: "0 0.25rem" }} />
              </button>
              {formatCurrency(
                BigNumber(quote?.inputs.fromAmount)
                  .div(quote?.output.finalValue)
                  .toFixed(18)
              )}{" "}
              {`${fromAssetValue?.symbol}`}
            </Typography>
          </div>
        );
      }
    };

    return <div className={classes.priceInfos}>{renderPriceInfo()}</div>;
  }

  const renderMassiveInput = (
    type,
    amountValue,
    amountValueUsd,
    diffUsd,
    amountError,
    amountChanged,
    assetValue,
    assetError,
    assetOptions,
    onAssetSelect
  ) => {
    const disabled = loading || type === "To";
    return (
      <div className={classes.textField}>
        {type === "From" && (
          <div>
            <div
              style={{ marginTop: "15px" }}
              className={`${classes.massiveInputContainer} ${
                (amountError || assetError) && classes.error
              }`}
            >
              <div style={{ display: "flex" }}>
                <div className={classes.massiveInputAssetSelect}>
                  <AssetSelect
                    type={type}
                    value={assetValue}
                    assetOptions={assetOptions}
                    onSelect={onAssetSelect}
                  />
                </div>
                <div
                  style={{ display: "flex", marginTop: "15px", padding: "5px" }}
                >
                  <CopyAddress asset={assetValue} />
                </div>
              </div>

              <div className={classes.massiveInputAmount}>
                <TextField
                  onInput={(e: any) => {
                    const target = e.target;
                    target.value = e.target.value.replace(/[^0-9.]/g, "");
                  }}
                  placeholder="0.00"
                  variant="standard"
                  error={!!amountError}
                  value={amountValue}
                  onBlur={handleBlur}
                  onChange={(e) => setFromAmountValue(e.target.value)}
                  autoComplete="off"
                  style={{ width: "-webkit-fill-available" }}
                  // disabled={loading || type === "To"}
                  sx={{
                    input: {
                      color: "rgb(0,0,0)",
                      fontSize: "30px",
                      fontWeight: "bold",
                      backgroundColor: "#FFEFE7",
                      borderRadius: "50px",
                      width: "100%",
                      textAlign: "right",
                      marginTop: "2vw",
                      padding: "0vh 1.5vh",
                      boxShadow: "none",
                    },
                  }}
                  InputProps={{
                    disableUnderline: true,
                    className: `${classes.largeInput} ${
                      disabled ? classes.largeInputDisabled : ""
                    }`,
                    readOnly: type === "To" ? true : false,
                    style: {
                      borderBottom: "none !important",
                    },
                  }}
                />
              </div>
              <div className={classes.inputTitleContainer}>
                {assetValue &&
                assetValue.balance &&
                amountValueUsd &&
                amountValueUsd !== "" ? (
                  <div
                    className={`${classes.inputTitleContainer} ${classes.usdContainer}`}
                  >
                    <Typography className={classes.inputBalanceText} noWrap>
                      {"~$" +
                        formatCurrency(amountValueUsd) +
                        (type === "To" && diffUsd && diffUsd !== ""
                          ? ` (${diffUsd}%)`
                          : "")}
                    </Typography>
                  </div>
                ) : (
                  <span style={{ color: "black", paddingLeft: "1rem" }}>-</span>
                )}
                <Typography
                  className={classes.inputBalanceText}
                  noWrap
                  onClick={() => {
                    if (type === "From") {
                      setBalance100();
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  Balance:
                  {assetValue && assetValue.balance
                    ? " " + formatCurrency(assetValue.balance)
                    : ""}
                </Typography>
              </div>
            </div>
          </div>
        )}

        {type === "To" && (
          <div>
            <div
              className={`${classes.massiveInputContainer} ${
                (amountError || assetError) && classes.error
              }`}
            >
              <div style={{ display: "flex" }}>
                <div className={classes.massiveInputAssetSelect}>
                  <AssetSelect
                    type={type}
                    value={assetValue}
                    assetOptions={assetOptions}
                    onSelect={onAssetSelect}
                  />
                </div>
                <div
                  style={{ display: "flex", marginTop: "15px", padding: "5px" }}
                >
                  <CopyAddress asset={assetValue} />
                </div>
              </div>

              <div className={classes.massiveInputAmount}>
                <TextField
                  // onInput={(e: any) => {
                  //   const target = e.target;
                  //   target.value = e.target.value.replace(/[^0-9.]/g, "");
                  // }}
                  placeholder="0.00"
                  variant="standard"
                  error={!!amountError}
                  value={amountValue}
                  onChange={amountChanged}
                  autoComplete="off"
                  style={{ width: "-webkit-fill-available" }}
                  // disabled={loading || type === "To"}
                  sx={{
                    input: {
                      color: "rgb(0,0,0)",
                      fontSize: "30px",
                      fontWeight: "bold",
                      backgroundColor: "#FFEFE7",
                      borderRadius: "50px",
                      width: "100%",
                      textAlign: "right",
                      marginTop: "2vw",
                      padding: "0vh 1.5vh",
                      boxShadow: "none",
                      cursor: type === "To" ? "not-allowed" : "text",
                    },
                  }}
                  InputProps={{
                    disableUnderline: true,
                    className: `${classes.largeInput} ${
                      disabled ? classes.largeInputDisabled : ""
                    }`,
                    readOnly: type === "To" ? true : false,
                    style: {
                      borderBottom: "none !important",
                    },
                  }}
                />
              </div>
              <div className={classes.inputTitleContainer}>
                {assetValue &&
                assetValue.balance &&
                amountValueUsd &&
                amountValueUsd !== "" ? (
                  <div
                    className={`${classes.inputTitleContainerTo} ${classes.usdContainer}`}
                  >
                    <Typography className={classes.inputBalanceText} noWrap>
                      {"~$" +
                        formatCurrency(amountValueUsd) +
                        (type === "To" && diffUsd && diffUsd !== ""
                          ? ` (${diffUsd}%)`
                          : "")}
                    </Typography>
                  </div>
                ) : (
                  <span style={{ color: "black", paddingLeft: "1rem" }}>-</span>
                )}
                {/* <Typography className={classes.inputBalanceText} noWrap>
                  Balance:
                  {assetValue && assetValue.balance
                    ? " " + formatCurrency(assetValue.balance)
                    : ""}
                </Typography> */}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const shouldDisableButton =
    (quote === null ? 0 : quote.priceImpact) > parseFloat(slippage);

  return (
    <div className={classes.swapInputs}>
      {isModalOpen && <SettingModal onClose={closeSettingModal} />}
      {renderMassiveInput(
        "From",
        fromAmountValue,
        fromAmountValueUsd,
        usdDiff,
        fromAmountError,
        fromAmountChanged,
        fromAssetValue,
        fromAssetError,
        fromAssetOptions,
        onAssetSelect
      )}
      <div className={classes.swapIconContainer}>
        <div className={classes.swapIconSubContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 41 41"
            fill="none"
            className={classes.swapIcon}
            onClick={swapAssets}
          >
            <path
              d="M23.9167 30.7502C24.3698 30.7502 24.8043 30.5702 25.1246 30.2498C25.445 29.9294 25.625 29.4949 25.625 29.0418L25.625 9.24224L29.5371 13.1714C29.8588 13.4931 30.2951 13.6738 30.75 13.6738C31.2049 13.6738 31.6412 13.4931 31.9629 13.1714C32.2846 12.8497 32.4653 12.4134 32.4653 11.9585C32.4653 11.5036 32.2846 11.0673 31.9629 10.7456L25.1296 3.91224C24.8894 3.6752 24.5843 3.51462 24.2529 3.45077C23.9215 3.38692 23.5786 3.42267 23.2675 3.55349C22.9555 3.68165 22.6885 3.89929 22.5 4.17898C22.3115 4.45866 22.21 4.78789 22.2083 5.12516L22.2083 29.0418C22.2083 29.4949 22.3883 29.9294 22.7087 30.2498C23.0291 30.5702 23.4636 30.7502 23.9167 30.7502ZM17.7325 37.4468C18.0445 37.3187 18.3115 37.101 18.5 36.8213C18.6885 36.5416 18.79 36.2124 18.7917 35.8752L18.7917 11.9585C18.7917 11.5054 18.6117 11.0709 18.2913 10.7505C17.9709 10.4301 17.5364 10.2502 17.0833 10.2502C16.6303 10.2502 16.1957 10.4301 15.8754 10.7505C15.555 11.0709 15.375 11.5054 15.375 11.9585L15.375 31.7581L11.4629 27.8289C11.3041 27.6688 11.1152 27.5417 10.907 27.455C10.6988 27.3682 10.4755 27.3236 10.25 27.3236C10.0245 27.3236 9.8012 27.3682 9.59302 27.455C9.38485 27.5417 9.1959 27.6688 9.03709 27.8289C8.87697 27.9877 8.74988 28.1767 8.66315 28.3848C8.57642 28.593 8.53177 28.8163 8.53177 29.0418C8.53177 29.2673 8.57642 29.4906 8.66315 29.6988C8.74988 29.907 8.87697 30.0959 9.03709 30.2547L15.8704 37.0881C16.1107 37.3251 16.4157 37.4857 16.7471 37.5495C17.0785 37.6134 17.4214 37.5776 17.7325 37.4468Z"
              fill="black"
            />
          </svg>
        </div>
      </div>
      {renderMassiveInput(
        "To",
        toAmountValue,
        toAmountValueUsd,
        usdDiff,
        toAmountError,
        toAmountChanged,
        toAssetValue,
        toAssetError,
        toAssetOptions,
        onAssetSelect
      )}
      {renderSwapInformation()}
      {!isAccount?.address && (
        <div className={classes.actionsContainer}>
          <Button
            disableElevation
            className={classes.buttonOverride}
            variant="contained"
            size="large"
            onClick={onAddressClicked}
            sx={{
              border: "1px solid rgba(255, 174, 128, 0.3)",
            }}
          >
            <Typography className={classes.actionButtonText}>
              {"Connect Wallet"}
            </Typography>
          </Button>
          {unlockOpen && (
            <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />
          )}
          <TransactionQueue setQueueLength={setQueueLength} />
        </div>
      )}
      {isAccount.address && (
        <div className={classes.actionsContainer}>
          <div className={`${classes.settingBar}`}>
            <div>
              <div className={classes.priceInfos}>
                <PriceInfoSwitcher
                  fromAssetValue={fromAssetValue}
                  toAssetValue={toAssetValue}
                  quote={quote}
                />
              </div>
            </div>
            <div style={{ display: "flex" }}>
              <Button
                onClick={openSettingModal}
                style={{
                  width: "fit-content",
                  border: "none",
                  color: "gray",
                  backgroundColor: "transparent",
                }}
              >
                <Typography
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "gray",
                  }}
                >
                  Slippage
                </Typography>
                <EditOutlined style={{ width: "18px" }} />
              </Button>
              <Typography
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "14px",
                  color: "gray",
                  margin: "0 1.5rem",
                }}
              >
                {slippage}%
              </Typography>
            </div>
          </div>
          <Button
            variant="contained"
            size="large"
            className={classes.buttonOverride}
            disabled={
              loading ||
              quoteLoading ||
              (!quote && !isWrapUnwrap) ||
              shouldDisableButton
            }
            onClick={
              !isAccount.address
                ? onAddressClicked
                : chainInvalid
                ? switchChain
                : !isWrapUnwrap
                ? onSwap
                : onWrapUnwrap
            }
          >
            {chainInvalid ? (
              <Typography className={classes.actionButtonText}>
                Please change network
              </Typography>
            ) : shouldDisableButton ? (
              "Price Impact over Slippage"
            ) : (
              <Typography className={classes.actionButtonText}>
                {loading ? "Loading" : isWrapUnwrap ? "Wrap/Unwrap" : "Swap"}
              </Typography>
            )}
            {loading && (
              <CircularProgress size={20} className={classes.loadingCircle} />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

const CopyAddress = (props) => {
  if (!props.asset || !props.asset.address) {
    return null;
  }

  if (props.asset.symbol === "ETH" || props.asset.symbol === "WETH") {
    return null;
  }

  const [copied, setCopied] = useState(false);

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
    <div style={{ display: "flex", alignItems: "center" }}>
      <Tooltip
        title={copied ? "Copied" : ""}
        placement="right"
        arrow={false}
        open={copied}
      >
        <Button
          variant="outlined"
          onClick={() => handleCopyToClipboard(props.asset?.address)}
          style={{
            border: "0px",
            color: "gray",
            padding: "0px",
            display: "flex",
            width: "fit-content",
            minWidth: "15px",
            backgroundColor: "transparent",
          }}
        >
          <ContentCopy style={{ width: "16px", height: "auto" }} />
        </Button>
      </Tooltip>
    </div>
  );
};

function AssetSelect({ type, value, assetOptions, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredAssetOptions, setFilteredAssetOptions] = useState([]);

  const [manageLocal, setManageLocal] = useState(false);
  const openSearch = () => {
    setSearch("");
    setOpen(true);
  };

  useEffect(() => {
    async function sync() {
      let ao = assetOptions.filter((asset) => {
        if (search && search !== "") {
          return (
            asset.address.toLowerCase().includes(search.toLowerCase()) ||
            asset.symbol.toLowerCase().includes(search.toLowerCase()) ||
            asset.name.toLowerCase().includes(search.toLowerCase())
          );
        } else {
          return true;
        }
      });
      setFilteredAssetOptions(ao);
      //no options in our default list and its an address we search for the address
      if (ao.length === 0 && search && search.length === 42) {
        const baseAsset = await stores.stableSwapStore.getBaseAsset(
          search,
          true,
          true
        );
        if (baseAsset) {
          stores.emitter.emit(ACTIONS.ERROR, {
            warning: "Token is not whitelisted",
          });
        }
      }
    }
    sync();
    return () => {};
  }, [assetOptions, search]);

  const onSearchChanged = async (event) => {
    setSearch(event.target.value);
  };

  const onLocalSelect = (type, asset) => {
    setSearch("");
    setManageLocal(false);
    setOpen(false);
    onSelect(type, asset);
  };

  const onClose = () => {
    setManageLocal(false);
    setSearch("");
    setOpen(false);
  };

  const renderAssetOption = (type, asset, idx) => {
    return (
      <MenuItem
        defaultValue={asset?.address}
        key={asset?.address + "_" + idx}
        className={classes.assetSelectMenu}
        onClick={() => {
          onLocalSelect(type, asset);
        }}
        style={{ margin: "12px 0" }}
      >
        <div className={classes.assetSelectMenuItem}>
          <div className={classes.displayDualIconContainerSmall}>
            <img
              className={classes.displayAssetIconSmall}
              alt=""
              src={asset ? `${asset.logoURI}` : ""}
              height="60px"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = "/tokens/unknown-logo.png";
              }}
            />
          </div>
        </div>
        <div className={classes.assetSelectIconName}>
          <Typography
            variant="h5"
            style={{ color: "#000000", fontWeight: "500" }}
          >
            {asset ? asset.symbol : ""}
          </Typography>
          <Typography
            variant="subtitle1"
            style={{ fontSize: "12px", padding: "1px" }}
            color="textSecondary"
          >
            {asset ? asset.name : ""}
          </Typography>
        </div>
        <div className={classes.assetSelectBalance}>
          <Typography variant="h5" style={{ fontWeight: "500" }}>
            {asset && asset.balance ? formatCurrency(asset.balance) : "0.00"}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Balance
          </Typography>
        </div>
      </MenuItem>
    );
  };

  const renderOptions = () => {
    return (
      <>
        <div className={classes.searchContainer}>
          <div className={classes.searchInline}>
            <TextField
              autoFocus
              variant="outlined"
              fullWidth
              placeholder="EASY, USDC, 0x..."
              value={search}
              style={{ boxShadow: "0 6px 18px rgb(0 0 0/8%)" }}
              onChange={onSearchChanged}
              autoComplete="off"
              sx={{ input: { color: "#000000" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className={classes.assetSearchResults}>
            {filteredAssetOptions && filteredAssetOptions.length > 0 ? (
              filteredAssetOptions
                .sort((a, b) => {
                  if (BigNumber(a.balance).lt(b.balance)) return 1;
                  if (BigNumber(a.balance).gt(b.balance)) return -1;
                  if (a.symbol.toLowerCase() < b.symbol.toLowerCase())
                    return -1;
                  if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) return 1;
                  return 0;
                })
                .map((asset, idx) => {
                  return renderAssetOption(type, asset, idx);
                })
            ) : (
              <div>
                <Typography>No results</Typography>
              </div>
            )}
          </div>
        </div>
        <div className={classes.manageLocalContainer}></div>
      </>
    );
  };
  return (
    <React.Fragment>
      <div
        className={classes.displaySelectContainer}
        onClick={() => {
          openSearch();
        }}
      >
        <div className={classes.assetSelectMenuItem}>
          <div className={classes.displayDualIconContainer}>
            <img
              className={classes.displayAssetIcon}
              alt=""
              src={value ? `${value.logoURI}` : ""}
              height="70px"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = "/tokens/unknown-logo.png";
              }}
            />
            <div
              className={classes.assetTypo}
              style={{
                color: "black",
                boxShadow: "rgba 34, 34, 34, 0.02 0px 0px 1px 0px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
              }}
            >
              {value?.symbol}
              <div style={{ padding: "7px" }}>
                <svg
                  width="12"
                  height="7"
                  viewBox="0 0 12 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.97168 1L6.20532 6L11.439 1"
                    stroke="#AEAEAE"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        onClose={onClose}
        aria-labelledby="simple-dialog-title"
        open={open}
      >
        {!manageLocal && renderOptions()}
      </Dialog>
    </React.Fragment>
  );
}

export default withTheme(Setup);
