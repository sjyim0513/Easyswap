import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Button,
  TextField,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter } from "next/router";
import moment from "moment";
import BigNumber from "bignumber.js";
import classes from "./ssVest.module.css";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

export default function ffLockDuration({ nft, updateLockDuration }) {
  const inputEl = useRef(null);
  const [lockLoading, setLockLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedDateError, setSelectedDateError] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const [isinEpoch, setisinEpoch] = useState(true);
  const deadline = stores.stableSwapStore.getStore("updateDate");

  const router = useRouter();

  useEffect(() => {
    const lockReturned = () => {
      setLockLoading(false);
      router.push("/vest");
    };
    const errorReturned = () => {
      setLockLoading(false);
    };

    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    stores.emitter.on(ACTIONS.INCREASE_VEST_DURATION_RETURNED, lockReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
      stores.emitter.removeListener(
        ACTIONS.INCREASE_VEST_DURATION_RETURNED,
        lockReturned
      );
    };
  }, []);

  useEffect(() => {
    if (nft && nft.lockEnds) {
      setSelectedDate(dayjs.unix(nft.lockEnds).add(8, "days"));
      setSelectedValue(null);
    } else {
      setSelectedDate(dayjs().add(8, "days"));
      setSelectedValue(null);
    }
  }, [nft]);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setSelectedValue(null);

    updateLockDuration(date);
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
      const newDate = dayjs.unix(nft.lockEnds).add(days, "day");
      setSelectedDate(newDate);
      updateLockDuration(newDate);
      setSelectedDateError(false);
    }
  };

  useEffect(() => {
    const expiry = dayjs(selectedDate).add(1, "days").unix();
    if (expiry < deadline) {
      setisinEpoch(true);
    } else {
      setisinEpoch(false);
    }
  }, [selectedDate]);

  const onLock = () => {
    setLockLoading(true);

    const now = dayjs();
    const expiry = dayjs(selectedDate).add(1, "days");
    const secondsToExpire = expiry.diff(now, "seconds");

    stores.dispatcher.dispatch({
      type: ACTIONS.INCREASE_VEST_DURATION,
      content: { unlockTime: secondsToExpire, tokenID: nft.id },
    });
  };

  const focus = () => {
    inputEl.current.focus();
  };

  let min = moment().add(7, "days").format("YYYY-MM-DD");
  if (BigNumber(nft?.lockEnds).gt(0)) {
    min = dayjs.unix(nft?.lockEnds).format("YYYY-MM-DD");
  }

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
        <div className={`${classes.massiveInputContainer}`}>
          <div className={classes.massiveInputAmount}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="New Expiry Date"
                value={amountValue}
                onChange={(newValue) => amountChanged(newValue)}
                minDate={dayjs.unix(nft.lockEnds).add(1, "day")}
                maxDate={dayjs.unix(nft.lockEnds).add(1459, "day")}
                className={classes.MuiPickersPopper}
                disableHighlightToday={true}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={classes.someContainer}>
      <div className={classes.inputsContainer3}>
        {renderMassiveInput(
          "lockDuration",
          selectedDate,
          selectedDateError,
          handleDateChange,
          null,
          null
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
              control={<Radio color="secondary" />}
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
      <div className={classes.actionsContainer3}>
        <Button
          className={classes.buttonOverride}
          fullWidth
          variant="contained"
          size="large"
          disabled={lockLoading || isinEpoch}
          onClick={onLock}
        >
          <Typography className={classes.actionButtonText}>
            {lockLoading ? `Increasing Duration` : `Increase Duration`}
          </Typography>
          {lockLoading && (
            <CircularProgress size={10} className={classes.loadingCircle} />
          )}
        </Button>
      </div>
    </div>
  );
}
