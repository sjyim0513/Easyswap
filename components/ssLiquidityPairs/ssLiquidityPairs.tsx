import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "@mui/material";
import type { Pair } from "../../stores/types/types";

import classes from "./ssLiquidityPairs.module.css";

import PairsTable from "./ssLiquidityPairsTable";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

export default function ssLiquidityPairs() {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [pairs, setPairs] = useState<Pair[]>([]);

  useEffect(() => {
    const stableSwapUpdated = () => {
      setPairs(stores.stableSwapStore.getStore("pairs"));
      forceUpdate();
    };

    setPairs(stores.stableSwapStore.getStore("pairs"));

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
    };
  }, []);
  return (
    <div className={classes.container}>
      <div className={classes.descriptionTvlBox}>
        <div className={classes.descriptionBox}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="54"
              height="37"
              viewBox="0 0 54 37"
              fill="none"
            >
              <circle cx="16.0851" cy="18.383" r="16.0851" fill="#FF9A5F" />
              <circle cx="35.6171" cy="18.383" r="18.383" fill="#FFF9F3" />
              <circle cx="35.617" cy="18.383" r="16.0851" fill="#A86C4A" />
            </svg>
            <Typography
              style={{
                fontSize: "52px",
                fontWeight: "400",
                color: "#000",
                fontFamily: "Buttershine Serif",
                letterSpacing: "1px",
                margin: "0 0.5rem",
              }}
            >
              Pools
            </Typography>
          </div>
        </div>
        <div className={classes.titleHR}></div>
        <div className={classes.descriptionText}>
          <Typography
            style={{
              fontSize: "20px",
              fontWeight: "400",
              lineHeight: "32px",
              color: "#000",
            }}
          >
            Pair your tokens to provide liquidity.
            <br /> Stake the LP tokens to earn governance tokens.
          </Typography>
        </div>
      </div>
      <PairsTable pairs={pairs} />
    </div>
  );
}
