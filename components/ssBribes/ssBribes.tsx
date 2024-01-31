import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Typography } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";

import classes from "./ssBribes.module.css";

import BribeCard from "../ssBribeCard/ssBribeCard";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

export default function ssBribes() {
  const [, updateState] = useState<undefined | {}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [pairs, setPairs] = useState([]);
  const [isMainnet, setIsMainnet] = useState(true);

  useEffect(() => {
    const stableSwapUpdated = () => {
      const pairs = stores.stableSwapStore.getStore("pairs");
      const pairsWithBribes = pairs.filter((pair) => {
        return (
          pair &&
          pair.gauge != null &&
          pair.gauge.address &&
          pair.gauge.bribes &&
          pair.gauge.bribes.length > 0
        );
      });
      setPairs(pairsWithBribes);
      const chainId = stores.accountStore.getStore("chainId");

      if (chainId === 169) {
        setIsMainnet(true);
      } else {
        setIsMainnet(false);
      }
      forceUpdate();
    };

    stableSwapUpdated();

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);

  const router = useRouter();
  const onCreate = () => {
    router.push("/bribe/create");
  };

  return (
    <div className={classes.container}>
      <div className={classes.descriptionBox}>
        <Typography
          style={{
            fontSize: "52px",
            fontWeight: "400",
            color: "#000",
            fontFamily: "Buttershine Serif",
            letterSpacing: "1px",
            margin: "0 1rem",
          }}
        >
          Bribe
        </Typography>
      </div>
      <div className={classes.descriptionText}>
        <div className={classes.titleHR}></div>
        <Typography
          style={{
            fontSize: "18px",
            fontWeight: "400",
            lineHeight: "32px",
            color: "#000000",
          }}
        >
          Create a bribe to encourage others to vote for your selected pool's
          rewards distribution.
        </Typography>
      </div>
      <Button
        variant="contained"
        style={{
          alignSelf: "center",
          color: "#000",
          border: "1px solid #FF9A5F",
        }}
        disabled={isMainnet}
        startIcon={<AddCircleOutline />}
        size="large"
        className={classes.buttonOverride}
        onClick={onCreate}
        sx={{ "&:hover": { backgroundColor: "#FFC5A4 !important" } }}
      >
        <Typography className={classes.actionButtonText}>
          Create bribe
        </Typography>
      </Button>
      {/* <div className={classes.bribesContainer}>
        {pairs &&
          pairs &&
          pairs.length > 0 &&
          pairs.map((pair) => {
            return pair.gauge.bribes.map((bribe) => {
              return (
                <BribeCard
                  key={pair.symbol + bribe.token.symbol}
                  pair={pair}
                  bribe={bribe}
                />
              );
            });
          })}
      </div> */}
    </div>
  );
}
