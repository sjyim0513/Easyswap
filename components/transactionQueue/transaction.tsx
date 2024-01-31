import { useState, useMemo } from "react";
import { Typography, Button, Tooltip } from "@mui/material";
import classes from "./transactionQueue.module.css";

import {
  HourglassEmpty,
  HourglassFull,
  CheckCircle,
  Error,
  Pause,
} from "@mui/icons-material";

import { SCROLLSCAN_LIST } from "../../stores/constants/constants";
import { formatAddress } from "../../utils/utils";
import stores from "../../stores/";
export default function Transaction({ transaction }) {
  const [expanded, setExpanded] = useState(false);
  const chain = stores.accountStore.getStore("chainId")
  const SCROLLSCAN = SCROLLSCAN_LIST[chain]
  const mapStatusToIcon = (status) => {
    switch (status) {
      case "WAITING":
        return <Pause className={classes.orangeIcon} />;
      case "PENDING":
        return <HourglassEmpty className={classes.greenIcon} />;
      case "SUBMITTED":
        return <HourglassFull className={classes.greenIcon} />;
      case "CONFIRMED":
        return <CheckCircle className={classes.greenIcon} />;
      case "REJECTED":
        return <Error className={classes.redIcon} />;
      case "DONE":
        return <CheckCircle className={classes.greenIcon} />;
      default:
    }
  };

  const mapStatusToTootip = (status) => {
    switch (status) {
      case "WAITING":
        return "Transaction will be submitted once ready";
      case "PENDING":
        return "Transaction is pending your approval in your wallet";
      case "SUBMITTED":
        return "Transaction has been submitted to the blockchain and we are waiting on confirmation.";
      case "CONFIRMED":
        return "Transaction has been confirmed by the blockchain.";
      case "REJECTED":
        return "Transaction has been rejected.";
      default:
        return "";
    }
  };

  const onExpendTransaction = () => {
    setExpanded(!expanded);
  };

  const onViewTX = () => {
    window.open(`${SCROLLSCAN}tx/${transaction.txHash}`, "_blank");
  };

  const messsage = useMemo(() => {
    if (!transaction?.error) return undefined;
    for (const [key, value] of errorMap) {
      if (transaction.error.toLowerCase().includes(key.toLowerCase())) {
        return value;
      } else {
        return transaction.error;
      }
    }
  }, [transaction?.error]);

  return (
    <div className={classes.transaction} key={transaction.uuid}>
      <div className={classes.transactionInfo} onClick={onExpendTransaction}>
        <Typography className={classes.transactionDescription}>
          {transaction.description}
        </Typography>
        <Tooltip title={mapStatusToTootip(transaction.status)}>
          {mapStatusToIcon(transaction.status)}
        </Tooltip>
      </div>
      {expanded && (
        <div className={classes.transactionExpanded}>
          {transaction.txHash && (
            <div className={classes.transaactionHash}>
              <Typography color="textSecondary">
                {formatAddress(transaction.txHash, "long")}
              </Typography>
              <Button
                onClick={onViewTX}
                style={{
                  backgroundColor: "transparent",
                  color: "#7E99B0",
                  fontWeight: "400",
                }}
              >
                View in Explorer
              </Button>
            </div>
          )}
          {messsage && (
            <Typography className={classes.errorText}>{messsage}</Typography>
          )}
        </div>
      )}
    </div>
  );
}

const errorMap = new Map<string, string>([
  // this happens with slingshot and metamask
  [
    "invalid height",
    "Scroll RPC issue. Please try reload page/switch RPC/switch networks back and forth",
  ],
  ["attached", "You need to reset your nft first"],
  ["TOKEN ALREADY VOTED", "You have already voted for this token"],
  ["INSUFFICIENT A BALANCE", "Router doesn't have enough token 0 balance"],
  ["INSUFFICIENT B BALANCE", "Router doesn't have enough token 1 balance"],
  // some wallet some rpc not sure
  [
    "EIP-1559",
    "Scroll RPC issue. Please try reload page/switch RPC/switch networks back and forth",
  ],
  // this happens in rubby
  [
    "request failed with status code 502",
    "Scroll issue. Please try reload page/switch RPC/switch networks back and forth",
  ],
  [
    "Request failed with status code 429",
    "RPC is being rate limited. Please try reload page/switch RPC/switch networks back and forth",
  ],
]);
