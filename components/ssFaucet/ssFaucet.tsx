import React, { useEffect, useState } from "react";
import { withTheme } from "@mui/styles";
import classes from "./ssFaucet.module.css";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import stores from "../../stores";
import { CONTRACTLIST } from "../../stores/constants/constants";
import type { AbiItem } from "web3-utils";
import Web3 from "web3";
import { ACTIONS } from "../../stores/constants/constants";
import { Typography, TextField, Button, InputAdornment } from "@mui/material";

let CONTRACTS;
const useStyles = makeStyles((theme) => ({
  tableContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    background: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    boxShadow: "0px 0px 11px 0px #ffd6bf",
  },
  tableTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  tableBody: {
    fontSize: "1rem",
    fontWeight: "normal",
    marginBottom: "1rem",
  },
  imgContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "1rem",
    gap: "0.5rem",
  },
  tokenImg: {
    height: "2rem",
    width: "2rem",
    borderRadius: "50%",
  },
}));

function Setup() {
  const classes = useStyles();
  const chain = stores.accountStore.getStore("chainId");
  CONTRACTS = CONTRACTLIST[3441005];
  // const web3 = new Web3(window.ethereum);
  const web3 = new Web3(window.ethereum);
  const fauctContracts = new web3.eth.Contract(
    CONTRACTS.FAUCET_ABI as AbiItem[],
    CONTRACTS.FAUCET_ADDRESS
  );
  const accountStore = stores.accountStore.getStore("account");
  const chainIdStore = stores.accountStore.getStore("chainId");
  const chainInvalid = stores.accountStore.getStore("chainInvalid");
  const [account, setAccount] = useState(accountStore);
  const [warning, setWarning] = useState("");
  const [chainId, setChainId] = useState(chainIdStore);

  const handleClaim = async () => {
    if (chainId !== 3441005) {
      setWarning("Please switch to the Manta Testnet L2 Rollup Testnet.");
      setTimeout(() => {
        setWarning("");
      }, 5000);
      return;
    }
    if (account?.address) {
      const tx = await fauctContracts.methods
        .allowedToWithdraw(account?.address)
        .call();
      if (!tx) {
        setWarning(
          "Please try again after 24 hours from your original request."
        );
        setTimeout(() => {
          setWarning("");
        }, 5000);
        return;
      }
      try {
        const tx = await fauctContracts.methods.requestTokens().send({
          from: account?.address,
        });

        if (tx.status) {
          setWarning("Tokens sent successfully.");
          setTimeout(() => {
            setWarning("");
          }, 5000);
        }
      } catch (error) {
        //
      }
    }
  };

  useEffect(() => {
    const updateAccount = () => {
      const accountStore = stores.accountStore.getStore("account");
      const chainIdStore = stores.accountStore.getStore("chainId");
      setChainId(chainIdStore);
      setAccount(accountStore);
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CHANGED, updateAccount);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, updateAccount);

    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CHANGED, updateAccount);
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CONFIGURED, updateAccount);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 4px",
      }}
    >
      <div>
        <Paper elevation={0} className={classes.tableContainer}>
          <div>
            <Typography className={classes.tableTitle}>Faucet</Typography>
          </div>
          <div>
            <Typography className={classes.tableBody}>
              You can claim test tokens once per day per wallet.
            </Typography>
          </div>
          <div className={classes.imgContainer}>
            <img src="/tokens/govToken-logo.png" className={classes.tokenImg} />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdc.jpg"
              className={classes.tokenImg}
            />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/usdt.jpg"
              className={classes.tokenImg}
            />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/aave.jpg"
              className={classes.tokenImg}
            />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/crv.jpg"
              className={classes.tokenImg}
            />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/cake.jpg"
              className={classes.tokenImg}
            />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/bal.jpg"
              className={classes.tokenImg}
            />
            <img
              src="https://raw.githubusercontent.com/sushiswap/list/master/logos/token-logos/token/knc.jpg"
              className={classes.tokenImg}
            />
          </div>

          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleClaim}
              fullWidth
              sx={{
                color: "#FF9A5F",
                backgroundColor: "white",
                border: "1px solid #FF9A5F",
                "&:hover": {
                  color: "white",
                  backgroundColor: "#FF9A5F",
                },
              }}
            >
              Send Me Testnet Tokens
            </Button>
          </div>
          <div style={{ minHeight: "2rem" }}>
            {warning && (
              <Typography
                variant="body2"
                color="error"
                style={{ marginLeft: "0.5vh" }}
              >
                {warning}
              </Typography>
            )}
          </div>
        </Paper>
      </div>
    </div>
  );
}

export default withTheme(Setup);
