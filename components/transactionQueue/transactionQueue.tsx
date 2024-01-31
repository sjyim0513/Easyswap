import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  DialogContent,
  Dialog,
  Slide,
  IconButton,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { OpenInNew, Close } from "@mui/icons-material";

import Lottie from "lottie-react";
import successAnim from "../../public/lottiefiles/successAnim.json";
import swapSuccessAnim from "../../public/lottiefiles/swapSuccess.json";
import lockSuccessAnim from "../../public/lottiefiles/lockSuccess.json";
import pairSuccessAnim from "../../public/lottiefiles/pairSuccess.json";

import Transaction from "./transaction";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

import classes from "./transactionQueue.module.css";
import stores from "../../stores";
import { ACTIONS, SCROLLSCAN_LIST } from "../../stores/constants/constants";
import { ITransaction } from "../../stores/types/types";

const initialTransaction: ITransaction["transactions"] = [
  {
    uuid: null,
    description: null,
    status: null,
    txHash: null,
    error: null,
  },
];

export default function TransactionQueue({ setQueueLength }) {
  const [queueOpen, setQueueOpen] = useState(false);
  const [transactions, setTransactions] =
    useState<ITransaction["transactions"]>(initialTransaction);
  const [purpose, setPurpose] = useState(null);
  const [type, setType] = useState(null);
  const [action, setAction] = useState(null);
  const chain = stores.accountStore.getStore("chainId");
  const SCROLLSCAN = SCROLLSCAN_LIST[chain];

  const handleClose = () => {
    setQueueOpen(false);

    stores.dispatcher.dispatch({
      type: ACTIONS.TX_UPDATED,
      content: {
        params: {
          purpose: purpose,
          type: null,
          action: action,
          transactions: [...transactions],
          queueOpen: false,
        },
      },
    });

    const transactions1 = stores.accountStore.getStore("transactions");
    setTransactions(transactions1);

    // TEST TXQ
    // ////////console.log("state txs", transactions);
    // ////////console.log("store txs", stores.accountStore.getStore("transactions"));
  };

  const fullScreen = window.innerWidth < 576;
  const firstUpdate = useRef(true);

  // const clearTransactions = () => {
  //   setTransactions([]);
  //   setQueueLength(0);
  // };

  const openQueue = () => {
    setQueueOpen(true);
  };

  // useEffect(() => {
  //   // TEST TXQ
  //   //////console.log("pupose", purpose);
  //   if (purpose === null) {
  //     setTransactions(initialTransaction);
  //   }
  // }, []);

  const transactionAdded = (params: ITransaction) => {
    stores.dispatcher.dispatch({
      type: ACTIONS.TX_UPDATED,
      content: {
        params: {
          purpose: params.title,
          type: params.type,
          action: params.verb,
          transactions: [...params.transactions],
          queueOpen: true,
        },
      },
    });

    // TEST TXQ
    // //////console.log(
    //   "transactionAdded",
    //   stores.accountStore.getStore("transactions")
    // );

    const transactions1 = stores.accountStore.getStore("transactions");
    setTransactions(transactions1);
    setQueueLength(params.transactions.length);
  };

  const transactionPending = (
    params: Pick<ITransaction["transactions"][number], "uuid">
  ) => {
    let txs = transactions.map((tx) => {
      if (tx.uuid === params.uuid) {
        tx.status = "PENDING";
      }
      return tx;
    });

    setTransactions(txs);
  };

  const transactionSubmitted = (
    params: Pick<ITransaction["transactions"][number], "uuid" | "txHash">
  ) => {
    let txs = transactions.map((tx) => {
      if (tx.uuid === params.uuid) {
        tx.status = "SUBMITTED";
        tx.txHash = params.txHash;
      }
      return tx;
    });
    setTransactions(txs);
  };

  const transactionConfirmed = (
    params: Pick<ITransaction["transactions"][number], "uuid" | "txHash">
  ) => {
    let txs = transactions.map((tx) => {
      if (tx.uuid === params.uuid) {
        tx.status = "CONFIRMED";
        tx.txHash = params.txHash;
        tx.description = tx.description;
      }
      return tx;
    });
    setTransactions(txs);
  };

  const transactionRejected = (
    params: Pick<ITransaction["transactions"][number], "uuid" | "error">
  ) => {
    let txs = transactions.map((tx) => {
      if (tx.uuid === params.uuid) {
        tx.status = "REJECTED";
        tx.error = params.error;
      }
      return tx;
    });
    setTransactions(txs);
  };

  const transactionStatus = (
    params: Omit<ITransaction["transactions"][number], "error" | "txHash"> & {
      status?: string;
    }
  ) => {
    setQueueOpen(true);

    let txs = transactions.map((tx) => {
      if (tx.uuid === params.uuid) {
        tx.status = params.status ? params.status : tx.status;
        tx.description = params.description
          ? params.description
          : tx.description;
      }
      return tx;
    });

    setTransactions(txs);
  };

  // const clearTransactions = () => {
  //   setTransactions(initialTransaction);
  //   setQueueLength(0);
  // };

  useEffect(() => {
    const purpose1 = stores.accountStore.getStore("purpose");
    const type1 = stores.accountStore.getStore("type");
    const action1 = stores.accountStore.getStore("action");
    const transactions1 = stores.accountStore.getStore("transactions");

    if (type1 !== null) {
      const queueOpen1 = stores.accountStore.getStore("queueOpen");
      setQueueOpen(queueOpen1);
    }

    // TEST TXQ
    // //////console.log("purpose", purpose);
    // //////console.log("purpose1", purpose1);
    // //////console.log("state transactions", transactions);
    // //////console.log("queueOpne1", queueOpen1);

    setPurpose(purpose1);
    setType(type1);
    setAction(action1);

    setTransactions(transactions1);

    // stores.emitter.on(ACTIONS.CLEAR_TRANSACTION_QUEUE, clearTransactions); TODO: we don't have impl for this one
    stores.emitter.on(ACTIONS.TX_ADDED, transactionAdded);
    stores.emitter.on(ACTIONS.TX_PENDING, transactionPending);
    stores.emitter.on(ACTIONS.TX_SUBMITTED, transactionSubmitted);
    stores.emitter.on(ACTIONS.TX_CONFIRMED, transactionConfirmed);
    stores.emitter.on(ACTIONS.TX_REJECTED, transactionRejected);
    stores.emitter.on(ACTIONS.TX_STATUS, transactionStatus);
    stores.emitter.on(ACTIONS.TX_OPEN, openQueue);
    // stores.emitter.on(ACTIONS.TX_CLEAR, clearTransactions);
    return () => {
      // stores.emitter.removeListener(
      //   ACTIONS.CLEAR_TRANSACTION_QUEUE,
      //   clearTransactions
      // );
      stores.emitter.removeListener(ACTIONS.TX_ADDED, transactionAdded);
      stores.emitter.removeListener(ACTIONS.TX_PENDING, transactionPending);
      stores.emitter.removeListener(ACTIONS.TX_SUBMITTED, transactionSubmitted);
      stores.emitter.removeListener(ACTIONS.TX_CONFIRMED, transactionConfirmed);
      stores.emitter.removeListener(ACTIONS.TX_REJECTED, transactionRejected);
      stores.emitter.removeListener(ACTIONS.TX_STATUS, transactionStatus);
      stores.emitter.removeListener(ACTIONS.TX_OPEN, openQueue);
      // stores.emitter.removeListener(ACTIONS.TX_CLEAR, clearTransactions);
      stores.emitter.off(ACTIONS.TX_ADDED, transactionAdded);
      stores.emitter.off(ACTIONS.TX_PENDING, transactionPending);
      stores.emitter.off(ACTIONS.TX_SUBMITTED, transactionSubmitted);
      stores.emitter.off(ACTIONS.TX_CONFIRMED, transactionConfirmed);
      stores.emitter.off(ACTIONS.TX_REJECTED, transactionRejected);
      stores.emitter.off(ACTIONS.TX_STATUS, transactionStatus);
      stores.emitter.off(ACTIONS.TX_OPEN, openQueue);
      // stores.emitter.off(ACTIONS.TX_CLEAR, clearTransactions);
    };
  }, [transactions]);

  const renderDone = (txs) => {
    if (
      !(
        transactions &&
        transactions.filter((tx) => {
          return ["DONE", "CONFIRMED"].includes(tx.status);
        }).length === transactions.length
      )
    ) {
      return null;
    }

    let lottie = (
      <Lottie
        loop={false}
        className={classes.animClass}
        animationData={successAnim}
      />
    );
    if (type === "Liquidity") {
      lottie = (
        <Lottie
          loop={false}
          className={classes.animClass}
          animationData={pairSuccessAnim}
        />
      );
    } else if (type === "Swap") {
      lottie = (
        <Lottie
          loop={false}
          className={classes.animClass}
          animationData={swapSuccessAnim}
        />
      );
    } else if (type === "Vest") {
      lottie = (
        <Lottie
          loop={false}
          className={classes.animClass}
          animationData={lockSuccessAnim}
        />
      );
    }

    return (
      <div className={classes.successDialog}>
        {lottie}
        <Typography className={classes.successTitle}>
          {action ? action : "Transaction Successful!"}
        </Typography>
        <Typography className={classes.successText}>
          Transaction has been confirmed by the blockchain.
        </Typography>
        {txs &&
          txs.length > 0 &&
          txs
            .filter((tx) => {
              return tx.txHash != null;
            })
            .map((tx, idx) => {
              return (
                <Typography
                  className={classes.viewDetailsText}
                  key={`tx_key_${idx}`}
                >
                  <a href={`${SCROLLSCAN}tx/${tx?.txHash}`} target="_blank">
                    {tx && tx.description ? tx.description : "View in Explorer"}{" "}
                    <OpenInNew className={classes.newWindowIcon} />
                  </a>
                </Typography>
              );
            })}
      </div>
    );
  };

  const renderTransactions = (transactions) => {
    if (
      transactions &&
      transactions.filter((tx) => {
        return ["DONE", "CONFIRMED"].includes(tx.status);
      }).length === transactions.length
    ) {
      return null;
    }

    return (
      <>
        <div className={classes.headingContainer}>
          <Typography className={classes.heading}>
            {purpose ? purpose : "Pending Transactions"}
          </Typography>
        </div>
        <div className={classes.transactionsContainer}>
          {transactions &&
            transactions.map((tx, idx) => {
              return <Transaction transaction={tx} key={`${tx}${idx}`} />;
            })}
        </div>
      </>
    );
  };

  return (
    <Dialog
      className={classes.dialogScale}
      open={queueOpen}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={"sm"}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
    >
      <DialogContent>
        <IconButton className={classes.closeIconbutton} onClick={handleClose}>
          <Close />
        </IconButton>
        {renderTransactions(transactions)}
        {renderDone(transactions)}
      </DialogContent>
    </Dialog>
  );
}
