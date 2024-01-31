import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "@mui/material";

import classes from "./ssVests.module.css";

import VestsTable from "./ssVestsTable";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

export default function ssVests() {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [vestNFTs, setVestNFTs] = useState([]);
  const [govToken, setGovToken] = useState(null);
  const [veToken, setVeToken] = useState(null);
  const accountStore = stores.accountStore.getStore("account");
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [account, setAccount] = useState(accountStore);
  const [isChainInvaild, setIsChainInvaild] = useState(chainInvalid);

  useEffect(() => {
    const ssUpdated = async () => {
      if (account.address && !isChainInvaild) {
        setGovToken(stores.stableSwapStore.getStore("govToken"));
        setVeToken(stores.stableSwapStore.getStore("veToken"));
      }
    };

    ssUpdated();

    stores.emitter.on(ACTIONS.UPDATED, ssUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, ssUpdated);
    };
  }, []);

  useEffect(() => {
    const vestNFTsReturned = (nfts) => {
      setVestNFTs(nfts);
      forceUpdate();
    };

    if (account.address && !isChainInvaild) {
      stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} });
    }

    // window.setTimeout(() => {
    //   stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} });
    // }, 1);

    stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned);
    return () => {
      stores.emitter.removeListener(
        ACTIONS.VEST_NFTS_RETURNED,
        vestNFTsReturned
      );
    };
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.descriptionBox}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="38"
            viewBox="0 0 36 44"
            fill="none"
          >
            <path
              d="M18.0003 33.4163C19.1496 33.4163 20.2518 32.9774 21.0645 32.1959C21.8771 31.4145 22.3337 30.3547 22.3337 29.2497C22.3337 28.1446 21.8771 27.0848 21.0645 26.3034C20.2518 25.522 19.1496 25.083 18.0003 25.083C16.8511 25.083 15.7489 25.522 14.9362 26.3034C14.1235 27.0848 13.667 28.1446 13.667 29.2497C13.667 30.3547 14.1235 31.4145 14.9362 32.1959C15.7489 32.9774 16.8511 33.4163 18.0003 33.4163ZM31.0003 14.6663C32.1496 14.6663 33.2518 15.1053 34.0645 15.8867C34.8771 16.6681 35.3337 17.7279 35.3337 18.833V39.6663C35.3337 40.7714 34.8771 41.8312 34.0645 42.6126C33.2518 43.394 32.1496 43.833 31.0003 43.833H5.00033C3.85105 43.833 2.74885 43.394 1.9362 42.6126C1.12354 41.8312 0.666992 40.7714 0.666992 39.6663V18.833C0.666992 17.7279 1.12354 16.6681 1.9362 15.8867C2.74885 15.1053 3.85105 14.6663 5.00033 14.6663H7.16699V10.4997C7.16699 7.737 8.30836 5.08748 10.34 3.13398C12.3716 1.18047 15.1271 0.0830078 18.0003 0.0830078C19.423 0.0830078 20.8317 0.352443 22.1461 0.875929C23.4604 1.39942 24.6547 2.1667 25.6607 3.13398C26.6666 4.10126 27.4646 5.24958 28.009 6.51339C28.5534 7.7772 28.8337 9.13174 28.8337 10.4997V14.6663H31.0003ZM18.0003 4.24967C16.2764 4.24967 14.6231 4.90815 13.4041 6.08026C12.1851 7.25236 11.5003 8.84207 11.5003 10.4997V14.6663H24.5003V10.4997C24.5003 8.84207 23.8155 7.25236 22.5965 6.08026C21.3775 4.90815 19.7242 4.24967 18.0003 4.24967Z"
              fill="#FF9A5F"
            />
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
            Lock
          </Typography>
        </div>
      </div>
      <div className={classes.titleHR}></div>
      <div className={classes.descriptionText}>
        <Typography
          style={{
            fontSize: "18px",
            fontWeight: "400",
            lineHeight: "32px",
            color: "#000",
          }}
        >
          Lock your tokens into veNFT to earn and govern. Vote with it to earn
          bribes and trading fees. veNFT can be transferred, merged and split.
          You can hold multiple positions.
        </Typography>
      </div>
      <VestsTable vestNFTs={vestNFTs} govToken={govToken} veToken={veToken} />
    </div>
  );
}