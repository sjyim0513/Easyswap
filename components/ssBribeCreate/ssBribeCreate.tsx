import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Dialog,
  MenuItem,
  IconButton,
  Select,
} from "@mui/material";
import { Search, ArrowBack, DeleteOutline } from "@mui/icons-material";
import BigNumber from "bignumber.js";
import { formatCurrency } from "../../utils/utils";
import classes from "./ssBribeCreate.module.css";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";
import { BaseAsset, Pair } from "../../stores/types/types";
import { switchChain } from "../header/header";

export default function ssBribeCreate() {
  const router = useRouter();
  const [createLoading, setCreateLoading] = useState(false);
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [isChainInvaild, setIsChainInvaild] = useState(chainInvalid);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | false>(false);
  const [asset, setAsset] = useState<BaseAsset>(null);
  const [assetOptions, setAssetOptions] = useState<BaseAsset[]>([]);
  const [gauge, setGauge] = useState<Pair>(null);
  const [gaugeOptions, setGaugeOptions] = useState([]);

  const ssUpdated = async () => {
    const storePairs = stores.stableSwapStore.getStore("pairs");
    let filteredStoreGaugeOptions = storePairs.filter((option) => {
      return option.pair_iswhitelisted;
    });

    if (router.query.address && router.query.address !== "create") {
      let foundPair = null;
      filteredStoreGaugeOptions.forEach((pair) => {
        if (pair.address === router.query.address) {
          foundPair = pair;
        }
      });
      if (foundPair) {
        setGauge(foundPair);
      }
    } else {
      setGauge(filteredStoreGaugeOptions[0]);
    }
    setGaugeOptions(filteredStoreGaugeOptions);

    const storeAssetOptions = stores.stableSwapStore.getStore("baseAssets");
    let filteredStoreAssetOptions = storeAssetOptions.filter((option) => {
      return option.address !== "ETH" && option.isWhitelisted;
    });
    setAssetOptions(filteredStoreAssetOptions);

    if (filteredStoreAssetOptions.length > 0 && asset == null) {
      setAsset(filteredStoreAssetOptions[0]);
    }
  };

  useEffect(() => {
    const createReturned = (res) => {
      setCreateLoading(false);
      setAmount("");

      onBack();
    };

    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      const chainInvalid = stores.accountStore.getStore("chainInvalid");
      setIsChainInvaild(chainInvalid);
    };

    const errorReturned = () => {
      setCreateLoading(false);
    };

    const assetsUpdated = () => {
      const baseAsset = stores.stableSwapStore.getStore("baseAssets");
      let filteredStoreAssetOptions = baseAsset.filter((option) => {
        return option.address !== "ETH";
      });
      setAssetOptions(filteredStoreAssetOptions);
    };
    stores.emitter.on(ACTIONS.ACCOUNT_CHANGED, accountConfigure);
    stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
    stores.emitter.on(ACTIONS.BRIBE_CREATED, createReturned);
    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);

    ssUpdated();

    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CHANGED, accountConfigure);
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
      stores.emitter.removeListener(ACTIONS.BRIBE_CREATED, createReturned);
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.BASE_ASSETS_UPDATED, assetsUpdated);
    };
  }, []);

  const setAmountPercent = (input, percent) => {
    setAmountError(false);
    if (input === "amount") {
      let am = BigNumber(asset.balance)
        .times(percent)
        .div(100)
        .toFixed(asset.decimals);
      setAmount(am);
    }
  };

  const onCreate = () => {
    setAmountError(false);

    let error = false;

    if (!amount || amount === "" || isNaN(+amount)) {
      setAmountError("From amount is required");
      error = true;
    } else {
      if (
        !asset.balance ||
        isNaN(+asset.balance) ||
        BigNumber(asset.balance).lte(0)
      ) {
        setAmountError("Invalid balance");
        error = true;
      } else if (BigNumber(amount).lt(0)) {
        setAmountError("Invalid amount");
        error = true;
      } else if (asset && BigNumber(amount).gt(asset.balance)) {
        setAmountError(`Greater than your available balance`);
        error = true;
      }
    }

    if (!asset || asset === null) {
      setAmountError("From asset is required");
      error = true;
    }

    if (!error) {
      setCreateLoading(true);
      // TEST BRIBE

      stores.dispatcher.dispatch({
        type: ACTIONS.CREATE_BRIBE,
        content: {
          asset: asset,
          amount: amount,
          gauge: gauge,
        },
      });
    }
  };

  const amountChanged = (event) => {
    setAmountError(false);
    setAmount(event.target.value);
  };

  const onAssetSelect = (type, value) => {
    setAmountError(false);
    setAsset(value);
  };

  const onGagugeSelect = (event) => {
    setGauge(event.target.value);
  };

  const renderMassiveGaugeInput = (type, value, error, options, onChange) => {
    return (
      <div className={classes.textField}>
        <div
          className={`${classes.massiveInputContainer} ${
            error && classes.error
          }`}
        >
          <div className={classes.massiveInputAmount}>
            <Select
              fullWidth
              value={value || ""}
              variant="standard"
              onChange={onChange}
              disableUnderline
              inputProps={{
                className: classes.largeInput,
              }}
            >
              {options &&
                options.map((option) => {
                  return (
                    <MenuItem
                      key={option.address}
                      value={option}
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      <div className={classes.menuOption}>
                        <div className={classes.doubleImages}>
                          <img
                            className={`${classes.someIcon} ${classes.img1Logo}`}
                            alt=""
                            src={
                              option && option.token0
                                ? `${option.token0.logoURI}`
                                : ""
                            }
                            height="70px"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src =
                                "/tokens/unknown-logo.png";
                            }}
                          />
                          <img
                            className={`${classes.someIcon} ${classes.img2Logo}`}
                            alt=""
                            src={
                              option && option.token1
                                ? `${option.token1.logoURI}`
                                : ""
                            }
                            height="70px"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src =
                                "/tokens/unknown-logo.png";
                            }}
                          />
                        </div>
                        <div>
                          <Typography className={classes.fillerText}>
                            {option.token0.symbol}/{option.token1.symbol}
                          </Typography>
                          <Typography className={classes.smallerText}>
                            {option?.isStable ? "Stable" : "Volatile"}
                          </Typography>
                        </div>
                      </div>
                    </MenuItem>
                  );
                })}
            </Select>
          </div>
        </div>
      </div>
    );
  };

  const renderMassiveInput = (
    type,
    amountValue,
    amountError,
    amountChanged,
    assetValue,
    assetError,
    assetOptions,
    onAssetSelect
  ) => {
    return (
      <div className={classes.textField}>
        <div
          className={`${classes.massiveInputContainer} ${
            (amountError || assetError) && classes.error
          }`}
        >
          <div className={classes.massiveInputAssetSelect}>
            <AssetSelect
              type={type}
              value={assetValue}
              assetOptions={assetOptions}
              onSelect={onAssetSelect}
            />
          </div>
          <div className={`${classes.massiveInputAmount}`}>
            <TextField
              placeholder="0.00"
              fullWidth
              variant="standard"
              error={amountError}
              helperText={amountError}
              value={amount || ""}
              onChange={amountChanged}
              disabled={createLoading}
              autoComplete="off"
              InputProps={{
                className: classes.largeInput,
                disableUnderline: true,
              }}
              inputProps={{
                style: {
                  textAlign: "right",
                  color: "black",
                },
              }}
            />
            <Typography
              style={{
                color: "#0000000",
                display: "flex",
                alignItems: "center",
                margin: "0 0.5rem",
              }}
              className={classes.smallerText}
            >
              {asset?.symbol}
            </Typography>
          </div>
          <div className={classes.inputTitleContainer}>
            <div className={classes.inputBalance}>
              <Typography
                className={classes.inputBalanceText}
                noWrap
                onClick={() => {
                  setAmountPercent(type, 100);
                }}
              >
                Balance:
                {assetValue && assetValue.balance
                  ? " " + formatCurrency(assetValue.balance)
                  : ""}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const onBack = () => {
    if (router.query.address) {
      router.push("/vote");
    } else {
      router.push("/bribe");
    }
  };

  const renderCreateInfo = () => {
    return (
      <div className={classes.depositInfoContainer}>
        <Typography className={classes.depositInfoHeading}>
          You are creating a bribe of{" "}
          <span className={classes.highlight}>
            {formatCurrency(amount)} {asset?.symbol}
          </span>{" "}
          to incentivize Vesters to vote for the{" "}
          <span className={classes.highlight}>
            {gauge?.token0?.symbol}/{gauge?.token1?.symbol} Pool
          </span>
        </Typography>
      </div>
    );
  };

  return (
    <div className={classes.retain}>
      <Paper elevation={0} className={classes.container}>
        <div
          className={classes.titleSection}
          style={{ border: "1px solid #FF9A5F" }}
          onClick={onBack}
        >
          <Tooltip placement="top" title="Back to Voting">
            <IconButton className={classes.backButton} onClick={onBack}>
              <ArrowBack className={classes.backIcon} />
            </IconButton>
          </Tooltip>
          <Typography className={classes.titleText}>Create Bribe</Typography>
        </div>
        <div className={classes.reAddPadding}>
          <div className={classes.inputsContainer}>
            {renderMassiveGaugeInput(
              "gauge",
              gauge,
              null,
              gaugeOptions,
              onGagugeSelect
            )}
            {renderMassiveInput(
              "amount",
              amount,
              amountError,
              amountChanged,
              asset,
              null,
              assetOptions,
              onAssetSelect
            )}
            {renderCreateInfo()}
          </div>
          <div className={classes.actionsContainer}>
            {isChainInvaild ? (
              <Button
                disableElevation
                size="large"
                className={classes.buttonOverride}
                variant="contained"
                onClick={switchChain}
                style={{ color: "black", boxSizing: "content-box" }}
              >
                <Typography>Switch Network</Typography>
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                className={
                  createLoading
                    ? classes.multiApprovalButton
                    : classes.buttonOverride
                }
                color="primary"
                disabled={createLoading}
                onClick={onCreate}
                sx={{ border: "none" }}
              >
                <Typography className={classes.actionButtonText}>
                  {createLoading ? `Creating` : `Create Bribe`}
                </Typography>
                {createLoading && (
                  <CircularProgress
                    size={10}
                    className={classes.loadingCircle}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      </Paper>
    </div>
  );
}

function AssetSelect({ type, value, assetOptions, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredAssetOptions, setFilteredAssetOptions] = useState([]);

  const [manageLocal, setManageLocal] = useState(false);

  const openSearch = () => {
    setOpen(true);
    setSearch("");
  };

  useEffect(
    function () {
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

      return () => {};
    },
    [assetOptions, search]
  );

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

  const toggleLocal = () => {
    setManageLocal(!manageLocal);
  };

  const renderAssetOption = (type, asset, idx) => {
    return (
      <MenuItem
        key={asset.address + "_" + idx}
        className={classes.assetSelectMenu}
        onClick={() => {
          onLocalSelect(type, asset);
        }}
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
          <Typography variant="h5">{asset ? asset.symbol : ""}</Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {asset ? asset.name : ""}
          </Typography>
        </div>
        <div className={classes.assetSelectBalance}>
          <Typography variant="h5">
            {asset && asset.balance ? formatCurrency(asset.balance) : "0.00"}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {"Balance"}
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
              value={search || ""}
              onChange={onSearchChanged}
              autoComplete="off"
              sx={{ input: { color: "#000000" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className={classes.searchIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className={classes.assetSearchResults}>
            {filteredAssetOptions
              ? filteredAssetOptions
                  .sort((a, b) => {
                    if (BigNumber(a.balance).lt(b.balance)) return 1;
                    if (BigNumber(a.balance).gt(b.balance)) return -1;
                    if (a.symbol.toLowerCase() < b.symbol.toLowerCase())
                      return -1;
                    if (a.symbol.toLowerCase() > b.symbol.toLowerCase())
                      return 1;
                    return 0;
                  })
                  .map((asset, idx) => {
                    return renderAssetOption(type, asset, idx);
                  })
              : []}
          </div>
        </div>
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
              height="100px"
              onError={(e) => {
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).src = "/tokens/unknown-logo.png";
              }}
            />
          </div>
          <div
            className={classes.assetTypo}
            style={{
              margin: "4px",
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
                <path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path>
              </svg>
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
