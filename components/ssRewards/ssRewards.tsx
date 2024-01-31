import { useState, useEffect, useCallback } from "react";
import { Button, Typography, Grid, Select, MenuItem } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import RewardsTable from "./ssRewardsTable";
import { formatCurrency } from "../../utils/utils";
import Link from "next/link";
import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";

import classes from "./ssRewards.module.css";

const initialEmptyToken = {
  id: "0",
  lockAmount: "0",
  lockEnds: "0",
  lockValue: "0",
};

const initialAllToken = {
  id: "ALL",
  lockAmount: "0",
  lockEnds: "0",
  lockValue: "0",
};

export default function ssRewards() {
  // const [, updateState] = useState<{}>();
  // const forceUpdate = useCallback(() => updateState({}), []);
  const [rewards, setRewards] = useState([]);
  const [rebases, setRebases] = useState([]);
  const [votes, setVotes] = useState([]);
  const [vestNFTs, setVestNFTs] = useState([{}]);
  const [token, setToken] = useState<string>("ALL");
  const [veToken, setVeToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allToken, setAllToken] = useState(initialAllToken);
  const [isMainnet, setIsMainnet] = useState(true);

  const stableSwapUpdated = () => {
    //console.log("stableSwapUpdated");

    const nfts = stores.stableSwapStore.getStore("vestNFTs");
    const updatedNfts = [allToken, ...nfts];
    setVestNFTs(updatedNfts);
    //setVestNFTs(nfts);
    setVeToken(stores.stableSwapStore.getStore("veToken"));
    const accountStore = stores.accountStore.getStore("account");

    const chainId = stores.accountStore.getStore("chainId");

    if (chainId === 169) {
      setIsMainnet(true);
    } else {
      setIsMainnet(false);
    }

    if (accountStore?.address) {
      // if (nfts && nfts.length > 0) {
      if (updatedNfts && updatedNfts.length > 1) {
        if (token === "ALL") {
          window.setTimeout(() => {
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_ALL_TOKEN_VOTE_BALANCES,
            });
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_DIST_BALANCES,
            });
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_LP_BALANCES,
            });
          });
        } else {
          window.setTimeout(() => {
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_REWARD_BALANCES,
              content: { tokenID: token },
            });
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_DIST_BALANCES,
            });
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_LP_BALANCES,
            });
          });
        }
      }
    }

    // forceUpdate();
  };

  const rewardBalancesReturned = (
    rew?: (typeof stores.stableSwapStore)["store"]["rewards"]
  ) => {
    if (rew) {
      if (
        rew &&
        rew.bribes &&
        rew.fees &&
        rew.bribes.length >= 0 &&
        rew.fees.length >= 0 &&
        rew.rewards.length >= 0 &&
        rew.veDist.length >= 0
      ) {
        setVotes([...rew.bribes, ...rew.fees]);
      }
    } else {
      let re = stores.stableSwapStore.getStore("rewards");
      if (
        re &&
        re.bribes &&
        re.fees &&
        re.rewards &&
        re.bribes.length >= 0 &&
        re.fees.length >= 0
      ) {
        setVotes([...re.bribes, ...re.fees]);
      }
    }
  };

  const AllTokenBalancesReturned = (result) => {
    let re = stores.stableSwapStore.getStore("rewards");
    if (
      (re && re.rewards && re.veDist && re.rewards.length >= 0) ||
      re.veDist.length >= 0
    ) {
      setVotes([result]);
      setRewards([...re.rewards]);
      setRebases([...re.veDist]);
    }
  };

  useEffect(() => {
    stableSwapUpdated();

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(
      ACTIONS.ALL_TOKEN_BALANCES_RETURNED,
      AllTokenBalancesReturned
    );
    stores.emitter.on(ACTIONS.REWARD_BALANCES_RETURNED, rewardBalancesReturned);
    return () => {
      stores.emitter.removeListener(
        ACTIONS.ALL_TOKEN_BALANCES_RETURNED,
        AllTokenBalancesReturned
      );
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(
        ACTIONS.REWARD_BALANCES_RETURNED,
        rewardBalancesReturned
      );
    };
  }, [token]);

  useEffect(() => {
    const claimReturnedBribes = () => {
      let re = stores.stableSwapStore.getStore("rewards");
      if (re || re.bribes || re.rewards) {
        setVotes([...re.bribes, ...re.fees]);
        setRewards([...re.rewards]);
      } else {
        return;
      }
    };

    const claimReturnedFees = () => {
      let re = stores.stableSwapStore.getStore("rewards");
      if (re || re.fees || re.rewards) {
        setVotes([...re.bribes, ...re.fees]);
        setRewards([...re.rewards]);
      } else {
        return;
      }
    };

    const claimReturnedLPs = () => {
      let re = stores.stableSwapStore.getStore("rewards");
      if (re || re.fees || re.rewards) {
        setRewards([...re.rewards]);
      } else {
        return;
      }
    };

    const claimReturnedRebases = () => {
      let re = stores.stableSwapStore.getStore("rewards");
      if (re || re.rewards || re.veDist) {
        setRewards([...re.rewards]);
        setRebases([...re.veDist]);
      } else {
        return;
      }
    };

    const claimAllReturned = (type) => {
      let re = stores.stableSwapStore.getStore("rewards");
      if (type === "ALL") {
        //console.log("claimAllReturnedALL", type);
        setVotes([...re.bribes, ...re.fees]);
        setRewards([...re.rewards]);
      } else if (type === "LP") {
        //console.log("claimAllReturnedLP", type);
        setRewards([...re.rewards]);
      } else if (type === "Dist") {
        //console.log("claimAllReturnedDist", type);
        setRewards([...re.rewards]);
        setRebases([...re.veDist]);
      } else if (type === "vote") {
        //console.log("claimAllReturnedVote", type);
        setVotes([...re.bribes, ...re.fees]);
        setRewards([...re.rewards]);
      }
    };

    const errorReturned = () => {
      setLoading(false);
    };

    stores.emitter.on(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturnedBribes);
    stores.emitter.on(ACTIONS.CLAIM_REWARD_RETURNED, claimReturnedLPs);
    stores.emitter.on(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturnedFees);
    stores.emitter.on(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturnedRebases);
    stores.emitter.on(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    return () => {
      stores.emitter.removeListener(
        ACTIONS.CLAIM_BRIBE_RETURNED,
        claimReturnedBribes
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_REWARD_RETURNED,
        claimReturnedLPs
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_PAIR_FEES_RETURNED,
        claimReturnedFees
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_VE_DIST_RETURNED,
        claimReturnedRebases
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_ALL_REWARDS_RETURNED,
        claimAllReturned
      );
      stores.emitter.removeListener(ACTIONS.ERROR, errorReturned);
    };
  }, []);

  const onClaimAll = (type) => {
    setLoading(true);
    let sendTokenID = 0;
    if (type === "vote") {
      if (token && token === "ALL") {
        stores.dispatcher.dispatch({
          type: ACTIONS.CLAIM_ALL_REWARDS,
          content: { type: "ALL", pairs: votes, tokenID: sendTokenID },
        });
      } else {
        if (token) {
          sendTokenID = parseInt(token);
        }
        stores.dispatcher.dispatch({
          type: ACTIONS.CLAIM_ALL_REWARDS,
          content: { type: type, pairs: votes, tokenID: sendTokenID },
        });
      }
    } else if (type === "LP") {
      if (token) {
        sendTokenID = parseInt(token);
      }
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_ALL_REWARDS,
        content: { type: type, pairs: rewards, tokenID: sendTokenID },
      });
    } else if (type === "Dist") {
      if (token) {
        sendTokenID = parseInt(token);
      }
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_ALL_REWARDS,
        content: { type: type, pairs: rebases, tokenID: sendTokenID },
      });
    }
  };

  const handleChange = (event) => {
    if (event.target.value.id === "ALL") {
      setVotes([[]]);
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_ALL_TOKEN_VOTE_BALANCES,
        content: { tokenID: event.target.value.id },
      });
    } else {
      setVotes([]);
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_REWARD_BALANCES,
        content: { tokenID: event.target.value.id },
      });
    }
    setToken(event.target.value);
  };
  // ////console.log("votes", votes)
  // ////console.log("rebases", rebases)
  // ////console.log("reward", rewards)
  const renderMediumInput = (value: string, options: any[]) => {
    let jsxBlock;
    jsxBlock = (
      <div className={classes.textField}>
        <div className={classes.mediumInputContainer}>
          <Typography variant="body2" className={classes.helpText}>
            Please select your vested token:
          </Typography>
          <div className={classes.mediumInputAmount}>
            <Select
              fullWidth
              value={value}
              onChange={handleChange}
              inputProps={{
                className: classes.mediumInput,
              }}
              sx={{
                height: "100%",
                width: "fit-content",
                borderRadius: "30px",
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <div className={classes.menuOption}>
                    <Typography>
                      {option.id === "ALL"
                        ? "All Tokens"
                        : "Token #" + option.id}
                    </Typography>
                    {option.id !== "ALL" && (
                      <div>
                        <Typography
                          align="right"
                          className={classes.smallerText}
                        >
                          {formatCurrency(option.lockValue)}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          className={classes.smallerText}
                        >
                          {veToken?.symbol}
                        </Typography>
                      </div>
                    )}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    );

    return jsxBlock;
  };

  return (
    <div className={classes.container}>
      <div className={classes.descriptionBox}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 45 48"
            fill="none"
          >
            <path
              d="M44.216 36.9248C44.216 38.7548 43.051 40.2358 41.608 40.2358H2.62C1.174 40.2358 0.00400066 38.7558 0.00400066 36.9248V9.60978C0.00400066 7.78278 1.174 6.30078 2.62 6.30078H41.608C43.051 6.30078 44.216 7.78178 44.216 9.60978V36.9248ZM38.974 43.4438C41.87 43.4438 44.214 43.7678 44.214 44.1678V46.9178C44.214 47.3148 41.869 47.6418 38.974 47.6418H5.239C2.349 47.6418 0 47.3158 0 46.9178V44.1678C0 43.7688 2.349 43.4438 5.239 43.4438H38.974Z"
              fill="#FF9A5F"
            />
            <path
              d="M22.1061 0C16.6941 0 12.3101 5.51 12.3101 12.3C12.3101 19.089 16.6951 24.594 22.1061 24.594C27.5141 24.594 31.9011 19.088 31.9011 12.3C31.9011 5.51 27.5151 0 22.1061 0ZM22.1061 22.482C17.6251 22.482 13.9941 17.924 13.9941 12.3C13.9941 6.676 17.6251 2.116 22.1061 2.116C26.5841 2.116 30.2171 6.676 30.2171 12.3C30.2171 17.924 26.5841 22.482 22.1061 22.482Z"
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
              margin: "0 1rem",
            }}
          >
            Claim
          </Typography>
        </div>
      </div>
      <div className={classes.titleHR}></div>
      <div className={classes.descriptionText}>
        <Typography
          style={{
            fontSize: "18px",
            lineHeight: "32px",
          }}
        >
          Choose your veNFT and claim your rewards. <br />
          Rewards are an estimation that aren't exact.
        </Typography>
      </div>

      <div className={classes.toolbarContainer} style={{ marginTop: "20px" }}>
        <Grid container spacing={1}>
          <Grid item lg={true} md={true} sm={false} xs={false}>
            <div className={classes.disclaimerContainer}></div>
          </Grid>
          <Grid item lg="auto" md="auto" sm={12} xs={12}></Grid>
          <Grid item lg="auto" md="auto" sm={12} xs={12}></Grid>
        </Grid>
      </div>

      <div className={classes.typomargin}>
        <Typography
          style={{ fontSize: "23px", fontWeight: "700", whiteSpace: "pre" }}
        >
          Voting Rewards
        </Typography>
        <div
          style={{ display: "flex", alignItems: "center" }}
          className={classes.claimButtonOnVotingRewards}
        >
          <div className={classes.tokenIDContainer}>
            {token && renderMediumInput(token, vestNFTs)}
          </div>
          <Button
            variant="contained"
            style={{
              background: "transparent",
              borderRadius: "30px",
              border: "1px solid #FF9A5F",
            }}
            startIcon={<AddCircleOutline />}
            size="large"
            className={classes.buttonOverride}
            onClick={() => onClaimAll("vote")}
            //disabled={loading}
            disabled={isMainnet}
          >
            <Typography className={classes.actionButtonText}>
              Claim All
            </Typography>
          </Button>
        </div>
      </div>
      <RewardsTable type="vote" rewards={votes} tokenID={token} />

      <div className={classes.toolbarContainer} style={{ marginTop: "50px" }}>
        <Grid container spacing={1}>
          <Grid item lg={true} md={true} sm={false} xs={false}></Grid>
          <Grid item lg="auto" md="auto" sm={12} xs={12}></Grid>
        </Grid>
      </div>

      <div className={classes.typomargin}>
        <Typography
          style={{ fontSize: "23px", fontWeight: "700", whiteSpace: "pre" }}
        >
          Rebase Rewards
        </Typography>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            style={{
              background: "transparent",
              borderRadius: "30px",
              border: "1px solid #FF9A5F",
            }}
            startIcon={<AddCircleOutline />}
            size="large"
            className={classes.buttonOverride}
            onClick={() => onClaimAll("Dist")}
            //disabled={loading}
            disabled={isMainnet}
          >
            <Typography className={classes.actionButtonText}>
              Claim All
            </Typography>
          </Button>
        </div>
      </div>
      <RewardsTable type="Dist" rewards={rebases} tokenID={token} />

      <div className={classes.toolbarContainer} style={{ marginTop: "50px" }}>
        <Grid container spacing={1}>
          <Grid item lg={true} md={true} sm={false} xs={false}></Grid>
          <Grid item lg="auto" md="auto" sm={12} xs={12}></Grid>
        </Grid>
      </div>

      <div className={classes.typomargin}>
        <Typography
          style={{ fontSize: "23px", fontWeight: "700", whiteSpace: "pre" }}
        >
          Liquidity Rewards
        </Typography>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            style={{
              background: "transparent",
              borderRadius: "30px",
              border: "1px solid #FF9A5F",
            }}
            startIcon={<AddCircleOutline />}
            size="large"
            className={classes.buttonOverride}
            onClick={() => onClaimAll("LP")}
            //disabled={loading}
            disabled={isMainnet}
          >
            <Typography className={classes.actionButtonText}>
              Claim All
            </Typography>
          </Button>
        </div>
      </div>
      <RewardsTable type="LP" rewards={rewards} tokenID={token} />
    </div>
  );
}
