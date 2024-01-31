import Head from "next/head";
import classes from "./layout.module.css";
import Header from "../header/header";
import SnackbarController from "../snackbar/snackbarController";
import { useRouter } from "next/router";
import SocialIcons from "./social";

import { ExternalProvider, Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import { useMediaQuery } from "react-responsive";

export default function Layout({
  children,
  configure,
}: {
  children: React.ReactNode;
  configure?: boolean;
}) {
  const router = useRouter();
  const backgroundStyle =
    router.pathname === "/home" ? classes.homeBackground : classes.background;

  function getLibrary(provider: ExternalProvider) {
    const library = new Web3Provider(provider);
    library.pollingInterval = 8000;
    return library;
  }
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  return (
    <div className={classes.container}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="shortcut icon" href="/apple-touch-icon.png" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <meta
            name="description"
            content="EasySwap allows low cost, near 0 slippage trades on uncorrelated or tightly correlated assets built on Scroll."
          />
          <meta name="og:title" content="EasySwap" />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        {/* <div className={backgroundStyle} /> */}
        {/* <div className={classes.greyGlow} />
        <div className={classes.greenGlow} /> */}
        <div className={classes.content}>
          {!configure && <Header />}
          <SnackbarController />
          <main>{children}</main>
        </div>
        {/* {isMobile ? null : <SocialIcons />} */}
      </Web3ReactProvider>
    </div>
  );
}
