import { useState } from "react";
import { useRouter } from "next/router";
import { Paper, Typography, IconButton } from "@mui/material";
import classes from "./ssVest.module.css";
import moment from "moment";
import BigNumber from "bignumber.js";

import { ArrowBack } from "@mui/icons-material";
import dayjs from "dayjs";
import LockAmount from "./lockAmount";
import LockDuration from "./lockDuration";
import VestingInfo from "./vestingInfo";

export default function existingLock({ nft, govToken, veToken }) {
  const [futureNFT, setFutureNFT] = useState(null);

  const router = useRouter();

  const onBack = () => {
    router.push("/vest");
  };

  const updateLockAmount = (amount) => {
    if (amount === "") {
      let tmpNFT = {
        lockAmount: nft.lockAmount,
        lockValue: nft.lockValue,
        lockEnds: nft.lockEnds,
      };

      setFutureNFT(tmpNFT);
      return;
    }

    let tmpNFT = {
      lockAmount: nft.lockAmount,
      lockValue: nft.lockValue,
      lockEnds: nft.lockEnds,
    };

    const now = moment();
    const expiry = moment.unix(tmpNFT.lockEnds);
    const dayToExpire = expiry.diff(now, "days");

    tmpNFT.lockAmount = BigNumber(nft.lockAmount).plus(amount).toFixed(18);
    tmpNFT.lockValue = BigNumber(tmpNFT.lockAmount)
      .times(parseInt(dayToExpire.toString()) + 1)
      .div(1460)
      .toFixed(18);

    setFutureNFT(tmpNFT);
  };

  const updateLockDuration = (val) => {
    let tmpNFT = {
      lockAmount: nft.lockAmount,
      lockValue: nft.lockValue,
      lockEnds: nft.lockEnds,
    };

    const now = dayjs();
    const expiry = dayjs(val);
    const dayToExpire = expiry.diff(now, "days");

    tmpNFT.lockEnds = expiry.unix();
    tmpNFT.lockValue = BigNumber(tmpNFT.lockAmount)
      .times(parseInt(dayToExpire.toString()))
      .div(1460)
      .toFixed(18);

    setFutureNFT(tmpNFT);
  };

  return (
    <Paper elevation={0} className={classes.container2}>
      <div
        className={classes.titleSection}
        onClick={onBack}
        style={{ cursor: "pointer" }}
      >
        <IconButton className={classes.backButton} onClick={onBack}>
          <ArrowBack className={classes.backIcon} />
        </IconButton>
        <Typography className={classes.titleText}>
          Manage Existing Lock
        </Typography>
      </div>
      <LockAmount
        nft={nft}
        govToken={govToken}
        updateLockAmount={updateLockAmount}
      />
      <LockDuration nft={nft} updateLockDuration={updateLockDuration} />
      <VestingInfo
        currentNFT={nft}
        futureNFT={futureNFT}
        veToken={veToken}
        showVestingStructure={false}
        govToken={govToken}
      />
    </Paper>
  );
}
