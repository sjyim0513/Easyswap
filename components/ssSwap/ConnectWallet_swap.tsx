import stores from "../../stores";
import { useEffect, useState } from "react";
import Unlock from "../unlock/unlockModal";
import { Button, Typography } from "@material-ui/core";
import TransactionQueue from "../transactionQueue/transactionQueue";
import { formatAddress } from "../../utils/utils";
import { Paper } from "@mui/material";
import classes from "./ssSwap.module.css";

function Connect() {
  const accountStore = stores.accountStore.getStore("account");
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [transactionQueueLength, setTransactionQueueLength] = useState(0);

  useEffect(() => {
    const accountStore = stores.accountStore.getStore("account");
    setAccount(accountStore);
  });

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const setQueueLength = (length) => {
    setTransactionQueueLength(length);
  };

  return (
    <>
      <Button variant="contained" onClick={onAddressClicked}>
        <Typography>
          {account && account.address
            ? formatAddress(account.address)
            : "Connect Wallet"}
        </Typography>
      </Button>
      {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
      <TransactionQueue setQueueLength={setQueueLength} />
    </>
  );
}

export default Connect;
