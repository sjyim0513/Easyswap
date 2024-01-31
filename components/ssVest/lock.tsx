import { useState, useEffect, useRef } from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter } from "next/router";
import BigNumber from "bignumber.js";
import moment from "moment";
import { formatCurrency } from "../../utils/utils";
import classes from "./ssVest.module.css";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

import { ArrowBack } from "@mui/icons-material";
import VestingInfo from "./vestingInfo";

export default function ssLock({ govToken, veToken }) {
  const inputEl = useRef(null);
  const router = useRouter();

  const [lockLoading, setLockLoading] = useState(false);

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | false>(false);
  const [selectedValue, setSelectedValue] = useState("week");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    dayjs().add(7, "days")
  );
  const [selectedDateError, setSelectedDateError] = useState(false);

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false);
      router.push("/vest");
    };
    const errorReturned = () => {
      setLockLoading(false);
    };

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(ACTIONS.CREATE_VEST_RETURNED, lockReturned);
    };
  }, []);

  const setAmountPercent = (percent) => {
    setAmount(
      BigNumber(govToken.balance)
        .times(percent)
        .div(100)
        .toFixed(govToken.decimals)
    );
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (
      date.isBefore(dayjs().add(7, "day")) ||
      date.isAfter(dayjs().add(1460, "day"))
    ) {
      setSelectedDateError(true);
    } else {
      setSelectedDateError(false);
      setSelectedDate(date);
    }

    setSelectedValue(null);
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);

    let days = 0;
    switch (event.target.value) {
      case "week":
        days = 7;
        break;
      case "month":
        days = 30;
        break;
      case "year":
        days = 365;
        break;
      case "years":
        days = 1459;
        break;
      default:
        break;
    }

    if (days > 0) {
      const newDate = dayjs().add(days, "day");
      setSelectedDate(newDate);
      setSelectedDateError(false);
    }
  };

  const onLock = () => {
    setAmountError(null);

    let error = false;

    if (!amount || amount === "" || isNaN(+amount)) {
      setAmountError("Amount is required");
      error = true;
    } else if (
      !govToken.balance ||
      isNaN(govToken.balance) ||
      BigNumber(govToken.balance).lte(0)
    ) {
      setAmountError("Invalid balance");
      error = true;
    } else if (BigNumber(amount).lte(0)) {
      setAmountError("Invalid amount");
      error = true;
    } else if (govToken && BigNumber(amount).gt(govToken.balance)) {
      setAmountError(`Greater than your available balance`);
      error = true;
    } else if (selectedDateError) {
      error = true;
    }

    if (!error) {
      setLockLoading(true);

      const now = dayjs();
      const expiry = dayjs(selectedDate).add(1, "day");
      const secondsToExpire = expiry.diff(now, "seconds");

      stores.dispatcher.dispatch({
        type: ACTIONS.CREATE_VEST,
        content: { amount, unlockTime: secondsToExpire },
      });
    }
  };

  const focus = () => {
    inputEl.current.focus();
  };

  const onAmountChanged = (event) => {
    setAmountError(false);
    setAmount(event.target.value);
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

  const renderMassiveDateInput = (
    type,
    amountValue,
    amountError,
    amountChanged,
    balance,
    logo
  ) => {
    return (
      <div className={classes.textField}>
        <div className={`${classes.massiveInputContainer}`}>
          <div className={classes.massiveInputAmount}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Expiry Date"
                value={amountValue}
                onChange={(newValue) => amountChanged(newValue)}
                minDate={dayjs().add(7, "day")}
                maxDate={dayjs().add(1460, "day")}
                className={`${classes.MuiPickersPopper}`}
                disableHighlightToday={true}
              />
            </LocalizationProvider>
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
    token
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
            >
              EASY Balance:{" "}
              {token && token.balance
                ? " " + formatCurrency(token.balance)
                : ""}
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
                  {token && token.logoURI && (
                    <img
                      className={classes.displayAssetIcon}
                      alt=""
                      src={token.logoURI}
                      height="100px"
                      onError={(e) => {
                        (e.target as HTMLImageElement).onerror = null;
                        (e.target as HTMLImageElement).src =
                          "/tokens/unknown-logo.png";
                      }}
                    />
                  )}
                  {!(token && token.logoURI) && (
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
              onInput={(e: any) => {
                const target = e.target;
                target.value = e.target.value.replace(/[^0-9.]/g, "");
              }}
              placeholder="0.00"
              fullWidth
              onBlur={handleBlur}
              variant="standard"
              autoComplete="off"
              error={typeof amountError === "boolean" ? amountError : false}
              helperText={typeof amountError === "string" ? amountError : ""}
              value={amountValue}
              onChange={amountChanged}
              disabled={lockLoading}
              InputProps={{
                disableUnderline: true,
                className: classes.largeInput,
                style: {
                  border: "none",
                  boxShadow: "none",
                  padding: "0 1rem",
                },
              }}
              sx={{
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                input: {
                  fontSize: "32px",
                  marginTop: "1vw",
                  textAlign: "right",
                },
                background: "rgb(255, 255, 255)",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderVestInformation = () => {
    const now = dayjs(); // 현재 날짜와 시간
    const expiry = dayjs(selectedDate); // 선택한 날짜
    const daysToExpire = expiry.diff(now, "day"); // 현재로부터 만료일까지의 일 수

    const lockAmount = amount;
    const lockValue = BigNumber(lockAmount)
      .times(daysToExpire + 1) // +1은 선택한 날짜를 포함하여 계산하기 위함입니다.
      .div(1460) // 1460은 무언가에 의해 정해진 값으로 수정하세요.
      .toFixed(18);

    const tmpNFT = {
      lockAmount: lockAmount,
      lockValue: lockValue,
      lockEnds: expiry.unix(),
    };

    return (
      <VestingInfo
        futureNFT={tmpNFT}
        govToken={govToken}
        veToken={veToken}
        showVestingStructure={true}
      />
    );
  };

  const onBack = () => {
    router.push("/vest");
  };

  return (
    <>
      <Paper elevation={0} className={classes.container3}>
        <div
          className={classes.titleSection}
          style={{ cursor: "pointer" }}
          onClick={onBack}
        >
          <Tooltip title="Back to Vest" placement="top">
            <IconButton className={classes.backButton} onClick={onBack}>
              <ArrowBack className={classes.backIcon} />
            </IconButton>
          </Tooltip>
          <Typography className={classes.titleText}>Create New Lock</Typography>
        </div>
        {renderMassiveInput(
          "amount",
          amount,
          amountError,
          onAmountChanged,
          govToken
        )}
        <div>
          {renderMassiveDateInput(
            "date",
            selectedDate,
            selectedDateError,
            handleDateChange,
            govToken?.balance,
            govToken?.logoURI
          )}
          <div className={classes.inline}>
            <Typography className={classes.expiresIn}>Expires: </Typography>
            <RadioGroup
              className={classes.vestPeriodToggle}
              row
              onChange={handleChange}
              value={selectedValue}
            >
              <FormControlLabel
                className={classes.vestPeriodLabel}
                value="week"
                control={<Radio color="primary" />}
                label="1 week"
                labelPlacement="start"
              />
              <FormControlLabel
                className={classes.vestPeriodLabel}
                value="month"
                control={<Radio color="primary" />}
                label="1 month"
                labelPlacement="start"
              />
              <FormControlLabel
                className={classes.vestPeriodLabel}
                value="year"
                control={<Radio color="primary" />}
                label="1 year"
                labelPlacement="start"
              />
              <FormControlLabel
                className={classes.vestPeriodLabel}
                value="years"
                control={<Radio color="primary" />}
                label="4 years"
                labelPlacement="start"
              />
            </RadioGroup>
          </div>
        </div>
        {renderVestInformation()}
        <div className={classes.actionsContainer}>
          <Button
            className={classes.buttonOverride}
            fullWidth
            variant="contained"
            size="large"
            color="primary"
            disabled={lockLoading}
            onClick={onLock}
          >
            <Typography className={classes.actionButtonText}>
              {lockLoading ? `Locking` : `Lock`}
            </Typography>
            {lockLoading && (
              <CircularProgress size={10} className={classes.loadingCircle} />
            )}
          </Button>
        </div>
      </Paper>
      <br />
      <br />
    </>
  );
}
