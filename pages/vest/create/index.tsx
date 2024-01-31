import { useState, useEffect, useCallback } from "react";
import { Typography, Button, Paper, SvgIcon, Grid } from "@mui/material";
import Vesting from "../../../components/ssVest/ssVest";

import stores from "../../../stores";
import { ACTIONS } from "../../../stores/constants/constants";
import Unlock from "../../../components/unlock/unlockModal";

// function BalanceIcon({ className }: { className: string }) {
//   return (
//     <SvgIcon viewBox="0 0 64 64" strokeWidth="1" className={className}>
//       <g strokeWidth="1" transform="translate(0, 0)">
//         <rect
//           data-color="color-2"
//           x="9"
//           y="10"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeLinecap="square"
//           strokeMiterlimit="10"
//           width="46"
//           height="40"
//           strokeLinejoin="miter"
//         ></rect>{" "}
//         <line
//           data-color="color-2"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeLinecap="square"
//           strokeMiterlimit="10"
//           x1="14"
//           y1="57"
//           x2="14"
//           y2="61"
//           strokeLinejoin="miter"
//         ></line>{" "}
//         <line
//           data-color="color-2"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeLinecap="square"
//           strokeMiterlimit="10"
//           x1="50"
//           y1="57"
//           x2="50"
//           y2="61"
//           strokeLinejoin="miter"
//         ></line>{" "}
//         <rect
//           x="2"
//           y="3"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeLinecap="square"
//           strokeMiterlimit="10"
//           width="60"
//           height="54"
//           strokeLinejoin="miter"
//         ></rect>{" "}
//         <line
//           data-cap="butt"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeMiterlimit="10"
//           x1="27.757"
//           y1="25.757"
//           x2="22.103"
//           y2="20.103"
//           strokeLinejoin="miter"
//           strokeLinecap="butt"
//         ></line>{" "}
//         <line
//           data-cap="butt"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeMiterlimit="10"
//           x1="36.243"
//           y1="25.757"
//           x2="41.897"
//           y2="20.103"
//           strokeLinejoin="miter"
//           strokeLinecap="butt"
//         ></line>{" "}
//         <line
//           data-cap="butt"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeMiterlimit="10"
//           x1="36.243"
//           y1="34.243"
//           x2="41.897"
//           y2="39.897"
//           strokeLinejoin="miter"
//           strokeLinecap="butt"
//         ></line>{" "}
//         <line
//           data-cap="butt"
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeMiterlimit="10"
//           x1="27.757"
//           y1="34.243"
//           x2="22.103"
//           y2="39.897"
//           strokeLinejoin="miter"
//           strokeLinecap="butt"
//         ></line>{" "}
//         <circle
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeLinecap="square"
//           strokeMiterlimit="10"
//           cx="32"
//           cy="30"
//           r="14"
//           strokeLinejoin="miter"
//         ></circle>{" "}
//         <circle
//           fill="none"
//           stroke="#4585d6"
//           strokeWidth="1"
//           strokeLinecap="square"
//           strokeMiterlimit="10"
//           cx="32"
//           cy="30"
//           r="6"
//           strokeLinejoin="miter"
//         ></circle>
//       </g>
//     </SvgIcon>
//   );
// }

function Vest() {
  const accountStore = stores.accountStore.getStore("account");
  const [account, setAccount] = useState(accountStore);
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    const accountConfigure = () => {
      const accountStore = stores.accountStore.getStore("account");
      setAccount(accountStore);
      closeUnlock();
    };
    const connectWallet = () => {
      onAddressClicked();
    };

    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigure);
    stores.emitter.on(ACTIONS.CONNECT_WALLET, connectWallet);
    return () => {
      stores.emitter.removeListener(
        ACTIONS.ACCOUNT_CONFIGURED,
        accountConfigure
      );
      stores.emitter.removeListener(ACTIONS.CONNECT_WALLET, connectWallet);
    };
  }, []);

  const onAddressClicked = () => {
    setUnlockOpen(true);
  };

  const closeUnlock = () => {
    setUnlockOpen(false);
  };

  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [govToken, setGovToken] = useState(null);
  const [veToken, setVeToken] = useState(null);

  useEffect(() => {
    const forexUpdated = () => {
      setGovToken(stores.stableSwapStore.getStore("govToken"));
      setVeToken(stores.stableSwapStore.getStore("veToken"));
      forceUpdate();
    };

    setGovToken(stores.stableSwapStore.getStore("govToken"));
    setVeToken(stores.stableSwapStore.getStore("veToken"));

    stores.emitter.on(ACTIONS.UPDATED, forexUpdated);
    return () => {
      stores.emitter.removeListener(ACTIONS.UPDATED, forexUpdated);
    };
  }, []);

  return (
    <div>
      {account && account.address ? (
        <div>
          <Vesting />
        </div>
      ) : (
        <Paper className="fixed flex h-[calc(100%-150px)] w-[calc(100%-80px)] flex-col flex-wrap items-center justify-center p-12 text-center shadow-none max-lg:my-auto max-lg:mb-0 max-lg:mt-24 lg:h-[100vh] lg:w-full">
          <Typography
            className="text-center font-['Inter'] text-2xl font-black sm:text-5xl"
            variant="h1"
          >
            Vest
          </Typography>
          <Typography
            className="color-[#7e99b0] mx-auto my-7 max-w-3xl text-center text-base sm:text-lg"
            variant="body2"
          >
            Lock your token to earn rewards and governance rights.
          </Typography>
          <Button
            disableElevation
            style={{
              backgroundColor: "rgb(255, 174, 128)",
              color: "black",
              height: "60px",
              paddingLeft: "26px",
              paddingRight: "26px",
              borderRadius: "90px",
              fontWeight: "500",
              fontSize: "1.3vw",
              lineHeight: "20px",
            }}
            variant="contained"
            onClick={onAddressClicked}
          >
            <Typography>Connect Wallet</Typography>
          </Button>
        </Paper>
      )}
      {unlockOpen && <Unlock modalOpen={unlockOpen} closeModal={closeUnlock} />}
    </div>
  );
}

export default Vest;
