import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import Web3 from "web3";

import { Typography } from "@mui/material";
import { withTheme } from "@mui/styles";
import Launch from "@mui/icons-material/Launch";
import stores from "../../stores";

import classes from "./navigation.module.css";
import { ACTIONS } from "../../stores/constants/constants";

import renderScrollLogo20 from "../../images/scrollLogo20";

function Navigation() {
  const router = useRouter();
  const [active, setActive] = useState("swap");
  const [isTradeDropdownOpen, setIsTradeDropdownOpen] = useState(false);
  const [isRewardsDropdownOpen, setIsRewardsDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [chainId, setChainId] = useState(1);

  const linkBridgeUrl =
    chainId === 169
      ? "https://pacific-bridge.manta.network/"
      : "https://pacific-bridge.testnet.manta.network/";

  useEffect(() => {
    const updateChainId = async () => {
      const web3 = new Web3(window.ethereum);
      //const chainId_ = await web3.eth.getChainId();
      const accountChain = stores.accountStore.getStore("chainId");
      setChainId(accountChain);
    };
    const activePath = router.asPath;
    if (activePath.includes("home")) {
      setActive("home");
    }
    if (activePath.includes("swap")) {
      setActive("swap");
    }
    if (activePath.includes("liquidity")) {
      setActive("liquidity");
    }
    if (activePath.includes("vest")) {
      setActive("vest");
    }
    if (activePath.includes("vote")) {
      setActive("vote");
    }
    if (activePath.includes("bribe")) {
      setActive("bribe");
    }
    if (activePath.includes("rewards")) {
      setActive("rewards");
    }
    if (activePath.includes("launchpad")) {
      setActive("launchpad");
    }
    if (activePath.includes("tool")) {
      setActive("tool");
    }
    if (activePath.includes("faucet")) {
      setActive("faucet");
    }
    if (activePath.includes("leaderboard")) {
      setActive("leaderboard");
    }
    // if (activePath.includes("bot")) {
    //   setActive("bot");
    // }
    updateChainId();
    stores.emitter.on(ACTIONS.ACCOUNT_CHANGED, updateChainId);

    return () => {
      stores.emitter.removeListener(ACTIONS.ACCOUNT_CHANGED, updateChainId);
    };
  }, [router.asPath]);

  const toggleDropdown = (link) => {
    if (link === "trade") {
      setIsTradeDropdownOpen(!isTradeDropdownOpen);
      router.push("/swap");
    } else if (link === "rewards") {
      setIsRewardsDropdownOpen(!isRewardsDropdownOpen);
      router.push("/rewards");
    } else if (link === "tools") {
      setIsToolsDropdownOpen(!isToolsDropdownOpen);
      // router.push("/tool");
    }
  };

  const handleMouseEnter = (link) => {
    if (link === "trade") {
      setIsTradeDropdownOpen(true);
    } else if (link === "rewards") {
      setIsRewardsDropdownOpen(true);
    } else if (link === "tools") {
      setIsToolsDropdownOpen(true);
    }
  };

  const handleMouseLeave = (link) => {
    if (link === "trade") {
      setIsTradeDropdownOpen(false);
    } else if (link === "rewards") {
      setIsRewardsDropdownOpen(false);
    } else if (link === "tools") {
      setIsToolsDropdownOpen(false);
    }
  };

  const renderSubNav = (title, link) => {
    return (
      // <div
      //   className={`${classes.subNavItem} ${classes[link]}`}
      //   onMouseEnter={() => handleMouseEnter(link)}
      //   onMouseLeave={() => handleMouseLeave(link)}
      // >
      //   {link === "vest" ||
      //   link === "launchpad" ||
      //   link === "bribe" ||
      //   link === "bridge" ||
      //   link === "faucet" ||
      //   link === "leaderboard" ? (
      //     <Link href={linkUrl}>
      //       <a
      //         className={
      //           active === link
      //             ? `${classes.navButton} ${classes.testChange}`
      //             : classes.navButton
      //         }
      //         target={link === "bridge" ? "_blank" : "_self"}
      //         rel={link === "bridge" ? "noopener noreferrer" : ""}
      //       >
      //         <Typography variant="h2" className={classes.subtitleText}>
      //           {title}
      //           {link === "bridge" && (
      //             <Launch
      //               style={{
      //                 marginLeft: "14px",
      //                 width: "18px",
      //                 height: "auto",
      //               }}
      //             />
      //           )}
      //         </Typography>
      //       </a>
      //     </Link>
      //   ) : (
      //     <div>
      //       <a
      //         className={
      //           active === link
      //             ? `${classes.navButton} ${classes.testChange}`
      //             : classes.navButton
      //         }
      //         onClick={() => {
      //           setActive(link);
      //           toggleDropdown(link);
      //         }}
      //       >
      //         <Typography variant="h2" className={classes.subtitleText}>
      //           {title}
      //         </Typography>
      //         <div
      //           style={{
      //             display: "flex",
      //             alignItems: "center",
      //             padding: "8px",
      //           }}
      //         >
      //           <svg
      //             width="12"
      //             height="7"
      //             viewBox="0 0 12 7"
      //             fill="black"
      //             xmlns="http://www.w3.org/2000/svg"
      //           >
      //             <path
      //               d="M0.97168 1L6.20532 6L11.439 1"
      //               stroke="#AEAEAE"
      //             ></path>
      //           </svg>
      //         </div>
      //       </a>
      //       {link === "trade" && isTradeDropdownOpen && (
      //         <div className={`${classes.dropdownMenu} ${classes[link]}`}>
      //           <div className={classes.dropdownItem}>
      //             <Link href="/swap">
      //               <a className={classes.dropdownMenuItem}>Swap</a>
      //             </Link>
      //           </div>
      //           <div className={classes.dropdownItem}>
      //             <Link href="/liquidity">
      //               <a className={classes.dropdownMenuItem}>Pools</a>
      //             </Link>
      //           </div>
      //         </div>
      //       )}
      //       {link === "rewards" && isRewardsDropdownOpen && (
      //         <div className={`${classes.dropdownMenu} ${classes[link]}`}>
      //           <div className={classes.dropdownItem}>
      //             <Link href="/vote">
      //               <a className={classes.dropdownMenuItem}>Vote</a>
      //             </Link>
      //           </div>
      //           <div className={classes.dropdownItem}>
      //             <Link href="/rewards">
      //               <a className={classes.dropdownMenuItem}>Claim</a>
      //             </Link>
      //           </div>
      //           <div className={classes.dropdownItem}>
      //             <Link href="/bribe">
      //               <a className={classes.dropdownMenuItem}>Bribe</a>
      //             </Link>
      //           </div>
      //         </div>
      //       )}
      //       {link === "tools" && isToolsDropdownOpen && (
      //         <div className={`${classes.dropdownMenu} ${classes[link]}`}>
      //           <div>
      //             <Link href="/tool">
      //               <a className={classes.dropdownMenuItem}>PnL</a>
      //             </Link>
      //             <div className={classes.comingSoon}>
      //               <Typography className={classes.navSub}>
      //                 Coming soon
      //               </Typography>
      //             </div>
      //           </div>
      //           <div>
      //             <Link href="">
      //               <a
      //                 className={classes.dropdownMenuItem}
      //                 style={{
      //                   color: "gray",
      //                   pointerEvents: "none",
      //                 }}
      //               >
      //                 Bot
      //                 {/* <Launch style={{ marginLeft: "10px", width: "16px", height: "auto" }} /> */}
      //               </a>
      //             </Link>
      //             <div className={classes.comingSoon}>
      //               <Typography className={classes.navSub}>
      //                 Coming soon
      //               </Typography>
      //             </div>
      //           </div>
      //           <div>
      //             <Link href="">
      //               <a
      //                 className={classes.dropdownMenuItem}
      //                 style={{
      //                   color: "gray",
      //                   pointerEvents: "none",
      //                 }}
      //               >
      //                 Farmer
      //               </a>
      //             </Link>
      //             <div className={classes.comingSoon}>
      //               <Typography className={classes.navSub}>
      //                 Coming soon
      //               </Typography>
      //             </div>
      //           </div>
      //           <div>
      //             <Link href="">
      //               <a
      //                 className={classes.dropdownMenuItem}
      //                 style={{
      //                   color: "gray",
      //                   pointerEvents: "none",
      //                 }}
      //               >
      //                 Sniper
      //               </a>
      //             </Link>
      //             <div className={classes.comingSoon}>
      //               <Typography className={classes.navSub}>
      //                 Coming soon
      //               </Typography>
      //             </div>
      //           </div>
      //         </div>
      //       )}
      //     </div>
      //   )}
      // </div>
      <div className={classes.navbar}>
        <a href="/swap">{title}</a>
      </div>
    );
  };

  const renderArrow = () => {
    return (
      <svg
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="black"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: "0 0 0 6px" }}
      >
        <path d="M0.97168 1L6.20532 6L11.439 1" stroke="#AEAEAE"></path>
      </svg>
    );
  };

  const renderComingSoonGreen = () => {
    return (
      <div>
        <span className={classes.circleGreenContainer}>
          <span className={classes.circleGreen}>COMING SOON</span>
        </span>
      </div>
    );
  };

  const renderComingSoonOrange = () => {
    return (
      <div>
        <span className={classes.circleOrangeContainer}>
          <span className={classes.circleOrange}>COMING SOON</span>
        </span>
      </div>
    );
  };

  return (
    <div className={classes.navigationContainer}>
      <div className={classes.navigationContent}>
        <div className={classes.navbar}>
          <div className={classes.dropdown}>
            <button className={classes.dropbtn}>Trade {renderArrow()}</button>
            <div className={classes.dropdownContent}>
              <a onClick={() => router.push("/swap")}>Swap</a>
              <a onClick={() => router.push("/liquidity")}>Pools</a>
            </div>
          </div>
          <a onClick={() => router.push("/vest")}>Lock</a>
          <div className={classes.dropdown}>
            <button className={classes.dropbtn}>
              Rewards{renderArrow()}
              <i className="fa fa-caret-down"></i>
            </button>
            <div className={classes.dropdownContent}>
              <a onClick={() => router.push("/vote")}>Vote</a>
              <a onClick={() => router.push("/rewards")}>Claim</a>
              <a onClick={() => router.push("/bribe")}>Bribe</a>
            </div>
          </div>
          <div className={classes.dropdown}>
            <button className={classes.dropbtn}>
              Tools{renderArrow()}
              <i className="fa fa-caret-down"></i>
            </button>
            <div className={classes.dropdownContent}>
              <a onClick={() => router.push("/tool")}>
                Pnl{renderComingSoonGreen()}
              </a>
              <a href="" style={{ pointerEvents: "none", color: "gray" }}>
                Bot{renderComingSoonOrange()}
              </a>
              <a href="" style={{ pointerEvents: "none", color: "gray" }}>
                Farmer{renderComingSoonOrange()}
              </a>
              <a href="" style={{ pointerEvents: "none", color: "gray" }}>
                Sniper{renderComingSoonOrange()}
              </a>
            </div>
          </div>
          {chainId === 169 && (
            <a onClick={() => router.push("/launchpad")}>Launchpad</a>
          )}
          <div className={classes.dropdown}>
            <button className={classes.dropbtn}>
              Bridge{renderArrow()}
              <i className="fa fa-caret-down"></i>
            </button>
            <div className={classes.dropdownContent}>
              <a
                href={linkBridgeUrl}
                target="_blank"
                style={{
                  paddingLeft: "0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {renderScrollLogo20()}
                <Typography style={{ fontWeight: "bold" }}>
                  Manta Bridge
                </Typography>
              </a>

              {/* {chainId === 169 && (
                <a
                  href="https://cbridge.celer.network/1/169/ETH"
                  target="_blank"
                  style={{
                    paddingLeft: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {<img src="/images/cBridge.svg" width={150}></img>}
                </a>
              )} */}
            </div>
          </div>
          {chainId === 3441005 && (
            <a onClick={() => router.push("/faucet")}>Faucet</a>
          )}
        </div>
      </div>
    </div>
  );
}

export default withTheme(Navigation);
