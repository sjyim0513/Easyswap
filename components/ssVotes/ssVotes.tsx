import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  MenuItem,
  Select,
  Grid,
  IconButton,
} from "@mui/material";
import BigNumber from "bignumber.js";
import { Assessment, Search } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";

import classes from "./ssVotes.module.css";
import { formatCurrency } from "../../utils/utils";

import GaugesTable from "./ssVotesTable";
import Timer from "./timer";

import stores from "../../stores";
import { ACTIONS } from "../../stores/constants/constants";
import { Pair, VeToken, Vote } from "../../stores/types/types";

const initialEmptyToken = {
  id: "0",
  lockAmount: "0",
  lockEnds: "0",
  lockValue: "0",
};

export default function ssVotes() {
  const router = useRouter();

  const [gauges, setGauges] = useState<Pair[]>([]);
  const [voteLoading, setVoteLoading] = useState(false);
  const [votes, setVotes] = useState<
    Array<Pick<Vote, "address"> & { value: number }>
  >([]);
  const [veToken, setVeToken] = useState<VeToken>(null);
  const nft = stores.stableSwapStore.getStore("vestNFTs");
  const nfts = nft.filter((nft) => nft.lockValue !== "0.000000000000000000");
  const [vestNFTs, setVestNFTs] = useState(nfts);
  const [token, setToken] = useState(nfts[0]?.id || "0");
  const [search, setSearch] = useState("");
  const [updateDate, setUpdateDate] = useState(0);
  const [isvoteReturned, setIsVoteReturned] = useState(false);
  const [isMainnet, setIsMainnet] = useState(true);

  const ssUpdated = async () => {
    const chainId = stores.accountStore.getStore("chainId");

    if (chainId === 169) {
      setIsMainnet(true);
    } else {
      setIsMainnet(false);
    }

    const _updateDate = stores.stableSwapStore.getStore("updateDate");
    if (_updateDate) {
      setUpdateDate(_updateDate);
    }
    setVeToken(stores.stableSwapStore.getStore("veToken"));
    const as = stores.stableSwapStore.getStore("pairs");
    const filteredAssets = as.filter((asset) => {
      return asset.gauge && asset.gauge.address;
    });
    setGauges(filteredAssets);

    const nft = stores.stableSwapStore.getStore("vestNFTs");
    const nfts = nft.filter((nft) => nft.lockValue !== "0.000000000000000000");
    if (nfts && nfts.length > 0) {
      setVestNFTs(nfts);
    }
  };

  const vestVotesUpdate = async () => {
    //console.log("vestNFTs", vestNFTs);
    if (vestNFTs && vestNFTs.length > 0 && gauges && gauges.length > 0) {
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_VEST_VOTES,

        content: { tokenID: token },
      });
      stores.dispatcher.dispatch({
        type: ACTIONS.GET_VEST_BALANCES,

        content: { tokenID: token },
      });
    }
  };

  useEffect(() => {
    vestVotesUpdate();
  }, [vestNFTs]);

  useEffect(() => {
    const vestVotesReturned = (vals) => {
      // TEST UPDATE
      //console.log("vestVotesReturned_vals called", vals);
      if (vals.length !== 0) {
        setVotes(
          vals.map((asset) => {
            return {
              address: asset?.address,
              value: BigNumber(
                asset && asset.votePercent ? asset.votePercent : 0
              ).toNumber(),
            };
          })
        );
      }
    };

    const vestBalancesReturned = (vals) => {
      // TEST UPDATE
      // //////console.log("vestBalancesReturned_vals called", vals);

      setGauges(vals);
    };

    const stableSwapUpdated = () => {
      // TEST UPDATE
      ssUpdated();
    };

    const voteReturned = () => {
      // TEST UPDATE
      setIsVoteReturned(true);
      setVoteLoading(false);
      vestVotesUpdate();
    };

    ssUpdated();

    // stores.dispatcher.dispatch({ type: ACTIONS.GET_VEST_NFTS, content: {} })
    stores.emitter.on(ACTIONS.UPDATED, stableSwapUpdated);
    stores.emitter.on(ACTIONS.VOTE_RETURNED, voteReturned);
    stores.emitter.on(ACTIONS.ERROR, voteReturned);
    stores.emitter.on(ACTIONS.VEST_VOTES_RETURNED, vestVotesReturned);
    // stores.emitter.on(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
    stores.emitter.on(ACTIONS.VEST_BALANCES_RETURNED, vestBalancesReturned);

    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, stableSwapUpdated);
      stores.emitter.removeListener(ACTIONS.VOTE_RETURNED, voteReturned);
      stores.emitter.removeListener(ACTIONS.ERROR, voteReturned);
      stores.emitter.removeListener(
        ACTIONS.VEST_VOTES_RETURNED,
        vestVotesReturned
      );
      // stores.emitter.removeListener(ACTIONS.VEST_NFTS_RETURNED, vestNFTsReturned)
      stores.emitter.removeListener(
        ACTIONS.VEST_BALANCES_RETURNED,
        vestBalancesReturned
      );
    };
  }, []);

  const onVote = () => {
    setVoteLoading(true);
    // TEST UPDATE
    // //////console.log("onVote_token", token);
    stores.dispatcher.dispatch({
      type: ACTIONS.VOTE,
      content: { votes, tokenID: token },
    });
  };
  let totalVotes = votes.reduce((acc, curr) => {
    return BigNumber(acc)
      .plus(BigNumber(curr.value).lt(0) ? curr.value * -1 : curr.value)
      .toNumber();
  }, 0);

  const handleChange = (event) => {
    // TEST_UPDATE
    // //////console.log("handleChange_token_etv", event.target.value);
    // //////console.log("handleChange_token_state", token);
    stores.dispatcher.dispatch({
      type: ACTIONS.GET_VEST_VOTES,
      content: { tokenID: event.target.value },
    });
    setToken(event.target.value);
  };

  const onSearchChanged = (event) => {
    setSearch(event.target.value);
  };

  const onBribe = () => {
    router.push("/bribe/create");
  };

  const renderMediumInput = (value: string, options: any[]) => {
    if (options.length === 0) {
      return (
        <div className={classes.textField}>
          <div className={classes.mediumInputContainer}>
            <Grid container>
              <Grid item lg="auto" md="auto" sm={12} xs={12}>
                <Typography
                  variant="body2"
                  className={classes.smallText}
                  style={{ color: "darkgray" }}
                >
                  You don't have a token yet
                </Typography>
              </Grid>
              <Grid item lg={1} md={1} sm={1} xs={1}>
                <div className={classes.mediumInputAmount}>
                  <Link href="/vest">
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        height: "99%",
                        width: "99%",
                        color: "white",
                      }}
                      disabled={isMainnet}
                    >
                      Create Vest
                    </Button>
                  </Link>
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      );
    }
    return (
      <div className={classes.textField}>
        <div className={classes.mediumInputContainer}>
          <Grid container>
            <Grid item lg="auto" md="auto" sm={12} xs={12}>
              <Typography variant="body2" className={classes.smallText}>
                Please select your veNFT:
              </Typography>
            </Grid>

            <Grid item lg={6} md={6} sm={12} xs={12}>
              <div className={classes.mediumInputAmount}>
                <Select
                  fullWidth
                  value={value}
                  variant="standard"
                  disableUnderline
                  onChange={handleChange}
                  sx={{
                    "& .MuiSelect-select": { height: "inherit" },
                    border: "1px solid #FF9A5F",
                    borderRadius: "12px",
                    padding: "5px",
                  }}
                >
                  {options &&
                    options.map((option) => {
                      return (
                        <MenuItem key={option.id} value={option.id}>
                          <div className={classes.menuOption}>
                            <Typography>Token #{option.id}</Typography>
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
            </Grid>
          </Grid>
        </div>
      </div>
    );
  };

  const filteredGauges = useMemo(
    () =>
      gauges.filter((pair) => {
        if (!search || search === "") {
          return true;
        }

        const searchLower = search.toLowerCase();

        if (
          pair.symbol.toLowerCase().includes(searchLower) ||
          pair.address.toLowerCase().includes(searchLower) ||
          pair.token0.symbol.toLowerCase().includes(searchLower) ||
          pair.token0.address.toLowerCase().includes(searchLower) ||
          pair.token0.name.toLowerCase().includes(searchLower) ||
          pair.token1.symbol.toLowerCase().includes(searchLower) ||
          pair.token1.address.toLowerCase().includes(searchLower) ||
          pair.token1.name.toLowerCase().includes(searchLower)
        ) {
          return true;
        }

        return false;
      }),
    [gauges, search]
  );
  return (
    <div className={classes.container}>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: "4rem",
        }}
      >
        <Timer deadline={updateDate} />
      </div>
      <div className={classes.descriptionTimerBox}>
        <div className={classes.descriptionBox}>
          <div style={{ display: "flex", alignItems: "end" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="65"
              height="65"
              viewBox="0 0 76 76"
              fill="none"
            >
              <path
                d="M28.5 37.9993L34.8333 44.3327L47.5 31.666"
                stroke="#FF9A5F"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M69.6663 60.1663H6.33301M15.833 22.1663C15.833 18.683 18.683 15.833 22.1663 15.833H53.833C55.5127 15.833 57.1236 16.5003 58.3113 17.688C59.4991 18.8757 60.1663 20.4866 60.1663 22.1663V60.1663H15.833V22.1663Z"
                stroke="#FF9A5F"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
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
              Vote
            </Typography>
          </div>
          <div className={classes.titleHR}></div>
          <Typography
            style={{ fontSize: "18px", fontWeight: "400", marginTop: "10px" }}
          >
            Select your veNFT and use 100% of your votes for one or more pools
            to earn bribes and trading fees.
          </Typography>
        </div>
      </div>
      <div className={classes.topBarContainer}>
        <Grid container spacing={1}>
          {/* <Grid item lg='auto' sm={12} xs={12}>
            
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                startIcon={<AddCircleOutlineIcon />}
                size='large'
                className={ classes.buttonOverride }
                color='primary'
                onClick={ onBribe }
              >
                <Typography className={ classes.actionButtonText }>{ `Create Bribe` }</Typography>
              </Button>
           
          </Grid> */}
          <Grid item lg={true} md={true} sm={12} xs={12}>
            <TextField
              className={classes.searchContainer}
              variant="outlined"
              fullWidth
              placeholder="EASY, USDC, 0x..."
              value={search}
              onChange={onSearchChanged}
              autoComplete="off"
              sx={{ input: { color: "#FFAE80" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fill: "black" }} />
                  </InputAdornment>
                ),
                // endAdornment: (
                //   <InputAdornment position="end">
                //     <IconButton
                //       color="primary"
                //       aria-label="Search"
                //     >
                //       <SearchIcon style={{ color: "black" }} />
                //     </IconButton>
                //   </InputAdornment>
                // ),
              }}
            />
          </Grid>
          <Grid item lg="auto" sm={12} xs={12}>
            <div className={classes.tokenIDContainer}>
              {token && renderMediumInput(token, vestNFTs)}
            </div>
          </Grid>
        </Grid>
      </div>
      <Paper elevation={0} className={classes.tableContainer}>
        <GaugesTable
          gauges={filteredGauges}
          setParentSliderValues={setVotes}
          defaultVotes={votes}
          token={vestNFTs.find((nft) => nft?.id === token) || initialEmptyToken}
        />
      </Paper>
      <Paper
        elevation={10}
        className={classes.actionButtons}
        sx={{ backgroundColor: "transparent", boxShadow: "" }}
      >
        <div className={classes.infoSection}>
          <Typography sx={{ color: "#000" }}>Voting Power Used: </Typography>
          <Typography
            className={`${
              BigNumber(totalVotes).eq(100)
                ? classes.helpText
                : classes.errorText
            }`}
          >
            {totalVotes} %
          </Typography>
        </div>
        <div style={{ padding: "0px 2px" }}>
          <Button
            className={classes.buttonOverride}
            variant="contained"
            size="large"
            disabled={
              voteLoading || !BigNumber(totalVotes).eq(100) || isMainnet
            }
            onClick={onVote}
          >
            <Typography
              className={classes.actionButtonText}
              style={{
                color: BigNumber(totalVotes).eq(100)
                  ? "#fff"
                  : "rgb(255, 174, 128)",
              }}
            >
              {voteLoading ? `Casting Votes` : `Cast Votes`}
            </Typography>
            {voteLoading && (
              <CircularProgress size={10} className={classes.loadingCircle} />
            )}
          </Button>
        </div>
      </Paper>
    </div>
  );
}
