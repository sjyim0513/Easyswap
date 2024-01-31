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
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [rewards, setRewards] = useState([]);
  const [rebases, setRebases] = useState([]);
  const [votes, setVotes] = useState([]);
  const [vestNFTs, setVestNFTs] = useState([]);
  const [token, setToken] = useState(initialEmptyToken);
  const [veToken, setVeToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allToken, setAllToken] = useState(initialAllToken);
  const [isMainnet, setIsMainnet] = useState(true);

  const stableSwapUpdated = () => {
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
      //   if (nfts && nfts.length > 0) {
      if (updatedNfts && updatedNfts.length > 0) {
        if (!token || token.lockEnds === "0") {
          setToken(updatedNfts[0]);
          // if (token.id === "ALL") {
          //   window.setTimeout(() => {

          //     stores.dispatcher.dispatch({
          //       type: ACTIONS.GET_ALL_TOKEN_VOTE_BALANCES,
          //     });
          //   });
          // }
          // else {
          //   window.setTimeout(() => {
          //     stores.dispatcher.dispatch({
          //       type: ACTIONS.GET_REWARD_BALANCES,
          //     });
          //   });
          // }
          window.setTimeout(() => {
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_REWARD_BALANCES,
              content: { tokenID: nfts[0].id },
            });
          });
        } else {
          window.setTimeout(() => {
            stores.dispatcher.dispatch({
              type: ACTIONS.GET_REWARD_BALANCES,
              content: { tokenID: token.id },
            });
          });
        }
      } else {
        window.setTimeout(() => {
          stores.dispatcher.dispatch({
            type: ACTIONS.GET_REWARD_BALANCES,
            content: { tokenID: 0 },
          });
        });
      }
    }

    forceUpdate();
  };

  const rewardBalancesReturned = (
    rew?: (typeof stores.stableSwapStore)["store"]["rewards"]
  ) => {
    if (rew) {
      if (
        rew &&
        rew.bribes &&
        rew.fees &&
        rew.rewards &&
        rew.veDist &&
        rew.bribes.length >= 0 &&
        rew.fees.length >= 0 &&
        rew.rewards.length >= 0
      ) {
        setVotes([...rew.bribes, ...rew.fees]);
        setRewards([...rew.rewards]);
        setRebases([...rew.veDist]);
      }
    } else {
      let re = stores.stableSwapStore.getStore("rewards");
      if (
        re &&
        re.bribes &&
        re.fees &&
        re.rewards &&
        re.veDist &&
        re.bribes.length >= 0 &&
        re.fees.length >= 0 &&
        re.rewards.length >= 0
      ) {
        setVotes([...re.bribes, ...re.fees]);
        setRewards([...re.rewards]);
        setRebases([...re.veDist]);
      }
    }
  };

  useEffect(() => {
    rewardBalancesReturned();
    stableSwapUpdated();

    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(ACTIONS.REWARD_BALANCES_RETURNED, rewardBalancesReturned);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(
        ACTIONS.REWARD_BALANCES_RETURNED,
        rewardBalancesReturned
      );
    };
  }, [token]);

  useEffect(() => {
    const claimReturned = () => {
      setLoading(false);
    };

    const claimAllReturned = () => {
      setLoading(false);
    };

    const errorReturned = () => {
      setLoading(false);
    };

    stableSwapUpdated();

    stores.emitter.on(ACTIONS.CLAIM_BRIBE_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_REWARD_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_PAIR_FEES_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_VE_DIST_RETURNED, claimReturned);
    stores.emitter.on(ACTIONS.CLAIM_ALL_REWARDS_RETURNED, claimAllReturned);
    stores.emitter.on(ACTIONS.ERROR, errorReturned);
    return () => {
      stores.emitter.removeListener(
        ACTIONS.CLAIM_BRIBE_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_REWARD_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_PAIR_FEES_RETURNED,
        claimReturned
      );
      stores.emitter.removeListener(
        ACTIONS.CLAIM_VE_DIST_RETURNED,
        claimReturned
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
      if (token && token.id) {
        sendTokenID = +token.id;
      }
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_ALL_REWARDS,
        content: { type: type, pairs: votes, tokenID: sendTokenID },
      });
    } else if (type === "LP") {
      if (token && token.id) {
        sendTokenID = +token.id;
      }
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_ALL_REWARDS,
        content: { type: type, pairs: rewards, tokenID: sendTokenID },
      });
    } else if (type === "Dist") {
      if (token && token.id) {
        sendTokenID = +token.id;
      }
      stores.dispatcher.dispatch({
        type: ACTIONS.CLAIM_ALL_REWARDS,
        content: { type: type, pairs: rebases, tokenID: sendTokenID },
      });
    }
  };

  const handleChange = (event) => {
    setToken(event.target.value);
    if (event.target.value.id === "ALL") {
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_ALL_TOKEN_VOTE_BALANCES,
        content: { tokenID: event.target.value.id },
      });
    } else {
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_REWARD_BALANCES,
        content: { tokenID: event.target.value.id },
      });
    }
  };
  // ////console.log("votes", votes)
  // ////console.log("rebases", rebases)
  // ////console.log("reward", rewards)
  const renderMediumInput = (value, options) => {
    let jsxBlock;
    if (options.length === 0) {
      jsxBlock = (
        <div className={classes.textField}>
          <div className={classes.mediumInputContainer}>
            <Typography variant="body2" className={classes.helpText}>
              You don't have a token yet
            </Typography>
            <div className={classes.mediumInputAmount}>
              <Link href="/vest">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    height: "99%",
                    width: "99%",
                    borderRadius: "30px",
                  }}
                  disabled={isMainnet}
                >
                  <Typography style={{ color: "white", whiteSpace: "pre" }}>
                    Create Vest
                  </Typography>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    } else {
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
                {options &&
                  options.map((option) => {
                    return (
                      <MenuItem key={option.id} value={option}>
                        <div className={classes.menuOption}>
                          <Typography>
                            {option.id === "ALL"
                              ? "All Tokens"
                              : "Token #" + option.id}
                          </Typography>
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
                        </div>
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>
          </div>
        </div>
      );
    }
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
            {renderMediumInput(token, vestNFTs)}
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
            disabled={isMainnet}
            //disabled={loading}
          >
            <Typography className={classes.actionButtonText}>
              Claim All
            </Typography>
          </Button>
        </div>
      </div>
      <RewardsTable type="vote" rewards={votes} tokenID={token?.id} />

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
      <RewardsTable type="Dist" rewards={rebases} tokenID={token?.id} />

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
      <RewardsTable type="LP" rewards={rewards} tokenID={token?.id} />
    </div>
  );
}
