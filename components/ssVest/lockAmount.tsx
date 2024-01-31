import { useState, useEffect } from "react";
import { Typography, Button, TextField, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import BigNumber from "bignumber.js";
import { formatCurrency } from "../../utils/utils";
import classes from "./ssVest.module.css";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

export default function ffLockAmount({ nft, govToken, updateLockAmount }) {
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | false>(false);

  const router = useRouter();

  const [amount0, setamount0] = useState(true);

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false);
      router.push("/vest");
    };

    const errorReturned = () => {
      setApprovalLoading(false);
      setLockLoading(false);
    };

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.INCREASE_VEST_AMOUNT_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(
        ACTIONS.INCREASE_VEST_AMOUNT_RETURNED,
        lockReturned
      );
    };
  }, []);

  const setAmountPercent = (percent) => {
    const val = BigNumber(govToken.balance)
      .times(percent)
      .div(100)
      .toFixed(govToken.decimals);
    setAmount(val);
    updateLockAmount(val);
  };

  const onLock = () => {
    setLockLoading(true);
    stores.dispatcher.dispatch({
      type: ACTIONS.INCREASE_VEST_AMOUNT,
      content: { amount, tokenID: nft.id },
    });
  };

  const amountChanged = (event) => {
    if (event.target.value > 0) setamount0(false);
    else setamount0(true);
    setAmount(event.target.value);
    updateLockAmount(event.target.value);
  };

  const isValidAmount = (value) => {
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
    const cleanedValue = amount.trim();
    if (cleanedValue === "") {
      setAmountError("");
    } else {
      const modifiedValue = cleanInputValue(cleanedValue);
      if (!isValidAmount(modifiedValue)) {
        setAmount("");
        setAmountError("Invalid input");
      } else {
        setAmount(modifiedValue);
        setAmountError("");
      }
    }
  };

  const renderMassiveInput = (
    type,
    amountValue,
    amountError,
    amountChanged,
    balance,
    logo
  ) => {
    return (
      <div className={classes.textField}>
        <div className={classes.inputTitleContainer}>
          <div className={classes.inputBalance}>
            <Typography
              className={classes.inputBalanceText}
              noWrap
              onClick={() => {
                setAmountPercent(100);
              }}
              style={{ color: "#000" }}
            >
              Balance: {balance ? " " + formatCurrency(balance) : ""}
            </Typography>
          </div>
        </div>
        <div
          className={`${classes.massiveInputContainer} ${
            amountError && classes.error
          }`}
        >
          <div className={classes.massiveInputAssetSelect}>
            <div className={classes.displaySelectContainer}>
              <div className={classes.assetSelectMenuItem}>
                <div className={classes.displayDualIconContainer}>
                  {logo && (
                    <img
                      className={classes.displayAssetIcon}
                      alt=""
                      src={logo}
                      height="100px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          "/tokens/unknown-logo.png";
                      }}
                    />
                  )}
                  {!logo && (
                    <img
                      className={classes.displayAssetIcon}
                      alt=""
                      src={"/tokens/unknown-logo.png"}
                      height="100px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          "/tokens/unknown-logo.png";
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={classes.massiveInputAmount}>
            <TextField
              placeholder="0.00"
              fullWidth
              variant="standard"
              error={amountError}
              helperText={amountError}
              value={amountValue}
              onChange={amountChanged}
              disabled={lockLoading}
              onBlur={handleBlur}
              autoComplete="off"
              style={{ padding: "0 1rem" }}
              sx={{
                input: {
                  fontSize: "36px",
                  marginTop: "1vw",
                  textAlign: "right",
                },
              }}
              InputProps={{
                disableUnderline: true,
                className: classes.largeInputforAmount,
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={classes.someContainer}>
      <div className={classes.inputsContainer3}>
        {renderMassiveInput(
          "lockAmount",
          amount,
          amountError,
          amountChanged,
          govToken?.balance,
          govToken?.logoURI
        )}
      </div>
      <div className={classes.actionsContainer3}>
        <Button
          className={classes.buttonOverride}
          fullWidth
          variant="contained"
          size="large"
          disabled={lockLoading || amount0}
          onClick={onLock}
          sx={{
            backgroundColor: "rgba(255, 174, 128, 0.5)",
          }}
        >
          <Typography className={classes.actionButtonText}>
            {lockLoading ? `Increasing Lock Amount` : `Increase Lock Amount`}
          </Typography>
          {lockLoading && (
            <CircularProgress size={10} className={classes.loadingCircle} />
          )}
        </Button>
      </div>
    </div>
  );
}
