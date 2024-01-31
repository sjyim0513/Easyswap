import { useRouter } from "next/router";
import { Typography, Button, Grid } from "@mui/material";
import { ArrowForward, ArrowUpward } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import classes from "./home.module.css";

const githubLink = "https://github.com/Easyswap-fi/Easyswap";
const twitterLink = "https://twitter.com/easyswapfi";
const telegramLink = "";
const mediumLink = "";
const gitbookLink = "https://easyswapfi.gitbook.io/docs/";

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function isElementInViewport(el) {
  if (!el) {
    return false;
  }

  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function handleScroll() {
  const expContainerTop = document.getElementById("expContainerTop");
  const expContainer1 = document.getElementById("expContainer1");
  const expContainer2 = document.getElementById("expContainer2");
  const expContainer3 = document.getElementById("expContainer3");
  const expContainer4 = document.getElementById("expContainer4");
  const infoImage = document.getElementById("infoImage");
  const scrollToTopButton = document.getElementById("scrollToTopButton");
  const yOffset = window.pageYOffset;

  if (yOffset > 700) {
    scrollToTopButton.style.display = "block";
  } else {
    scrollToTopButton.style.display = "none";
  }

  if (
    isElementInViewport(expContainerTop) &&
    !expContainerTop.classList.contains(classes.animationRight)
  ) {
    expContainerTop.classList.add(classes.animationRight);
  }
  if (
    isElementInViewport(expContainer1) &&
    !expContainer1.classList.contains(classes.animation)
  ) {
    expContainer1.classList.add(classes.animationLeft);
  }

  if (
    isElementInViewport(expContainer2) &&
    !expContainer2.classList.contains(classes.animation)
  ) {
    expContainer2.classList.add(classes.animationRight);
  }

  if (
    isElementInViewport(expContainer3) &&
    !expContainer3.classList.contains(classes.animation)
  ) {
    expContainer3.classList.add(classes.animationLeft);
  }
  if (
    isElementInViewport(expContainer4) &&
    !expContainer4.classList.contains(classes.animation)
  ) {
    expContainer4.classList.add(classes.animationRight);
  }

  if (
    isElementInViewport(infoImage) &&
    !infoImage.classList.contains(classes.animationLeft)
  ) {
    infoImage.classList.add(classes.animationLeft);
  }
}

function Home() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [shouldShowImage, setShouldShowImage] = useState(
    window.innerWidth >= 1000
  );
  const [shouldShowText, setShouldShowText] = useState(
    window.innerWidth >= 1000
  );
  const [shouldShowAuditImage, setShouldShowAuditImage] = useState(
    window.innerWidth >= 1650
  );
  const router = useRouter();

  useEffect(() => {
    // 화면 크기 변경 시에 windowWidth 상태 업데이트
    const handleResize = () => {
      const newWindowWidth = window.innerWidth;
      setWindowWidth(newWindowWidth);
      setShouldShowImage(newWindowWidth >= 1300);
      setShouldShowText(newWindowWidth >= 1024);
      setShouldShowAuditImage(newWindowWidth >= 1500);
    };

    // 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    window.onload = () => {
      handleScroll();
    };

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative mt-0 flex h-full w-full flex-col">
      <div id="info" className="relative w-full">
        <div className={`${classes.infobg}`}>
          <div>
            <div className={`${classes.infoTop}`}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingBottom: "1rem",
                  paddingTop: "2rem",
                }}
              >
                <Typography className={`${classes.infoTitle}`}>
                  DeFi Made Easy
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "auto",
                }}
              >
                <Typography
                  className={`${classes.infoTitle2}`}
                  style={{
                    color: "#FF7759",
                    borderColor: "#FF7759",
                    borderWidth: "2px",
                    borderRadius: "15px",
                    padding: "0.5rem",
                  }}
                >
                  EasySwap
                </Typography>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "auto",
                marginTop: "15rem",
                alignItems: "center",
              }}
              className={`${classes.enterAppMobile}`}
            >
              <div style={{ marginRight: "1.5rem" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="439"
                  height="4"
                  viewBox="0 0 439 4"
                  fill="none"
                  style={{ maxWidth: "100%" }}
                >
                  <path
                    d="M2 2L437 2"
                    stroke="url(#paint0_linear_46_318)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_46_318"
                      x1="437"
                      y1="48.9983"
                      x2="2"
                      y2="48.9983"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#94EBD6" />
                      <stop offset="1" stopColor="#94EBD6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <Button
                className={classes.buttonOverride}
                onClick={() => router.push("/swap")}
                sx={{
                  border: "0px",
                  "&.MuiButtonBase-root:hover": {
                    border: "none",
                  },
                }}
              >
                Enter the App
              </Button>
              <div style={{ marginLeft: "1.5rem" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="439"
                  height="4"
                  viewBox="0 0 439 4"
                  fill="none"
                  style={{ maxWidth: "100%" }}
                >
                  <path
                    d="M2 2L437 2"
                    stroke="url(#paint0_linear_46_319)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_46_319"
                      x1="2.00001"
                      y1="42.998"
                      x2="437"
                      y2="42.998"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#94EBD6" />
                      <stop offset="1" stopColor="#94EBD6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div
            className={`${classes.imgBox}`}
            style={{
              display: "flex",
              justifyContent: "center",
              background: "url('images/easyswap.png') center/cover no-repeat",
              height: "40rem",
              borderRadius: "1rem 1rem 0 0",
              margin: "5% auto",
              position: "relative", // 상대적 위치 설정
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: "blur(1px)", // 블러 효과 적용
                backgroundColor: "rgba(255, 255, 255, 0.1)", // 투명 배경 색상 설정
                borderRadius: "1.5rem 1.5rem 0 0",
                height: "1.5%",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backdropFilter: "blur(1px)", // 블러 효과 적용
                backgroundColor: "rgba(255, 255, 255, 0.1)", // 투명 배경 색상 설정
                borderRadius: "1.5rem 1.5rem 0 0",
                height: "1.5%",
              }}
            ></div>
          </div>

          <div
            style={{ width: "100%", padding: "8rem 20%" }}
            className={`${classes.gridMobilePadding}`}
          >
            <div>
              <Typography
                variant="body1"
                className={`${classes.securityTitle}`}
                style={{ marginBottom: "5rem" }}
              >
                Welcome to EasySwap
              </Typography>
            </div>
            <div className={`${classes.expGrid}`}>
              {shouldShowImage && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src="/images/easyswap_info.png"
                    className={`${classes.infoImage}`}
                    id="infoImage"
                  />
                </div>
              )}
              <div className={`${classes.expContainer}`} id="expContainerTop">
                <div className={`${classes.expTitle}`}>
                  <span className={`${classes.exp1}`}>What is EasySwap ?</span>
                  <div style={{ paddingTop: "1%" }}>
                    <a
                      href="https://easyswapfi.gitbook.io/docs/introduction/welcome"
                      target="_blank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${classes.arrowLink}`}
                        viewBox="0 0 33 31"
                        fill="none"
                      >
                        <path
                          d="M29.7965 25.9586C29.4615 25.9591 29.1297 25.8959 28.8202 25.7723C28.5106 25.6488 28.2293 25.4675 27.9924 25.2388C27.7556 25.0101 27.5678 24.7385 27.4399 24.4396C27.312 24.1407 27.2464 23.8203 27.247 23.4969L27.247 8.58484L5.20152 29.8712C4.72423 30.3321 4.07688 30.591 3.40189 30.591C2.72689 30.591 2.07955 30.3321 1.60225 29.8712C1.12496 29.4104 0.856823 28.7853 0.856823 28.1336C0.856823 27.4818 1.12496 26.8568 1.60225 26.3959L23.6478 5.10951L8.20091 5.10662C7.52474 5.10661 6.87627 4.84726 6.39815 4.3856C5.92003 3.92395 5.65143 3.29781 5.65143 2.64493C5.65143 1.99204 5.92003 1.3659 6.39815 0.904247C6.87627 0.442589 7.52474 0.183233 8.20091 0.183234L29.7965 0.183232C30.1315 0.18267 30.4632 0.245961 30.7728 0.369474C31.0824 0.492986 31.3637 0.674292 31.6005 0.902992C31.8374 1.13169 32.0252 1.40329 32.1531 1.70221C32.281 2.00113 32.3466 2.32149 32.346 2.64492L32.346 23.4969C32.3466 23.8203 32.281 24.1407 32.1531 24.4396C32.0252 24.7385 31.8374 25.0101 31.6005 25.2388C31.3637 25.4675 31.0824 25.6488 30.7728 25.7723C30.4632 25.8959 30.1315 25.9591 29.7965 25.9586Z"
                          fill="black"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <span className={`${classes.expItems}`}>
                    Easyswap is the go-to DEX, featuring a killer combo of
                    Trading Bots and MEV Protection in a ve(3,3) DEX setup. The
                    Trading Bot is set to be built on various social media
                    platforms, kicking off with Telegram. With the Easyswap Bot,
                    users can enjoy Easyswap services conveniently, anytime,
                    anywhere. MEV Protection tackles the MEV issue by encrypting
                    transactions based on zero-knowledge and then decrypting
                    them. Stay tuned, as we'll dive deeper into the ins and outs
                    of Easyswap Bot and MEV Protection in the next section.
                  </span>
                </div>
              </div>
              <div className={`${classes.expContainer}`} id="expContainer1">
                <div className={`${classes.expTitle}`}>
                  <span className={`${classes.exp1}`}>Easyswap Bot</span>
                  <div style={{ paddingTop: "1%" }}>
                    <a
                      href="https://easyswapfi.gitbook.io/docs/tool-features/easyswap-tool"
                      target="_blank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${classes.arrowLink}`}
                        viewBox="0 0 33 31"
                        fill="none"
                      >
                        <path
                          d="M29.7965 25.9586C29.4615 25.9591 29.1297 25.8959 28.8202 25.7723C28.5106 25.6488 28.2293 25.4675 27.9924 25.2388C27.7556 25.0101 27.5678 24.7385 27.4399 24.4396C27.312 24.1407 27.2464 23.8203 27.247 23.4969L27.247 8.58484L5.20152 29.8712C4.72423 30.3321 4.07688 30.591 3.40189 30.591C2.72689 30.591 2.07955 30.3321 1.60225 29.8712C1.12496 29.4104 0.856823 28.7853 0.856823 28.1336C0.856823 27.4818 1.12496 26.8568 1.60225 26.3959L23.6478 5.10951L8.20091 5.10662C7.52474 5.10661 6.87627 4.84726 6.39815 4.3856C5.92003 3.92395 5.65143 3.29781 5.65143 2.64493C5.65143 1.99204 5.92003 1.3659 6.39815 0.904247C6.87627 0.442589 7.52474 0.183233 8.20091 0.183234L29.7965 0.183232C30.1315 0.18267 30.4632 0.245961 30.7728 0.369474C31.0824 0.492986 31.3637 0.674292 31.6005 0.902992C31.8374 1.13169 32.0252 1.40329 32.1531 1.70221C32.281 2.00113 32.3466 2.32149 32.346 2.64492L32.346 23.4969C32.3466 23.8203 32.281 24.1407 32.1531 24.4396C32.0252 24.7385 31.8374 25.0101 31.6005 25.2388C31.3637 25.4675 31.0824 25.6488 30.7728 25.7723C30.4632 25.8959 30.1315 25.9591 29.7965 25.9586Z"
                          fill="black"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <span className={`${classes.expItems}`}>
                    The Easyswap Bot makes it a breeze to access Easyswap
                    services anytime, anywhere, as long as you have a
                    smartphone. Initially built on Telegram, the Easyswap Bot
                    plans to expand its reach to platforms like X and Discord in
                    the future.
                    <br />
                    For more features of the Easyswap Bot, click the link button
                    to check them out in the Docs!
                  </span>
                </div>
              </div>

              <div className={`${classes.expContainer}`} id="expContainer2">
                <div className={`${classes.expTitle}`}>
                  <span className={`${classes.exp1}`}>MEV Protection</span>
                  <div style={{ paddingTop: "1%" }}>
                    <a
                      href="https://easyswapfi.gitbook.io/docs/dex-product/mev-protection"
                      target="_blank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${classes.arrowLink}`}
                        viewBox="0 0 33 31"
                        fill="none"
                      >
                        <path
                          d="M29.7965 25.9586C29.4615 25.9591 29.1297 25.8959 28.8202 25.7723C28.5106 25.6488 28.2293 25.4675 27.9924 25.2388C27.7556 25.0101 27.5678 24.7385 27.4399 24.4396C27.312 24.1407 27.2464 23.8203 27.247 23.4969L27.247 8.58484L5.20152 29.8712C4.72423 30.3321 4.07688 30.591 3.40189 30.591C2.72689 30.591 2.07955 30.3321 1.60225 29.8712C1.12496 29.4104 0.856823 28.7853 0.856823 28.1336C0.856823 27.4818 1.12496 26.8568 1.60225 26.3959L23.6478 5.10951L8.20091 5.10662C7.52474 5.10661 6.87627 4.84726 6.39815 4.3856C5.92003 3.92395 5.65143 3.29781 5.65143 2.64493C5.65143 1.99204 5.92003 1.3659 6.39815 0.904247C6.87627 0.442589 7.52474 0.183233 8.20091 0.183234L29.7965 0.183232C30.1315 0.18267 30.4632 0.245961 30.7728 0.369474C31.0824 0.492986 31.3637 0.674292 31.6005 0.902992C31.8374 1.13169 32.0252 1.40329 32.1531 1.70221C32.281 2.00113 32.3466 2.32149 32.346 2.64492L32.346 23.4969C32.3466 23.8203 32.281 24.1407 32.1531 24.4396C32.0252 24.7385 31.8374 25.0101 31.6005 25.2388C31.3637 25.4675 31.0824 25.6488 30.7728 25.7723C30.4632 25.8959 30.1315 25.9591 29.7965 25.9586Z"
                          fill="black"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <span className={`${classes.expItems}`}>
                    Users trading on the blockchain are exposed to attacks like
                    front-running, sandwich attacks, and back-running. In other
                    words, folks who are vulnerable to MEV extraction can
                    unknowingly take a hit during transactions. To combat this
                    MEV issue, Easyswap employs PVDE technology to protect its
                    users. By using a time-lock puzzle, transaction details are
                    kept under wraps until an operator creates a block. This
                    helps to prevent front-running and sandwich attacks.
                  </span>
                </div>
              </div>
              <div className={`${classes.expContainer}`} id="expContainer3">
                <div className={`${classes.expTitle}`}>
                  <span className={`${classes.exp1}`}>Governance</span>
                  <div style={{ paddingTop: "1%" }}>
                    <a
                      href="https://easyswapfi.gitbook.io/docs/dex-product/governance"
                      target="_blank"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${classes.arrowLink}`}
                        viewBox="0 0 33 31"
                        fill="none"
                      >
                        <path
                          d="M29.7965 25.9586C29.4615 25.9591 29.1297 25.8959 28.8202 25.7723C28.5106 25.6488 28.2293 25.4675 27.9924 25.2388C27.7556 25.0101 27.5678 24.7385 27.4399 24.4396C27.312 24.1407 27.2464 23.8203 27.247 23.4969L27.247 8.58484L5.20152 29.8712C4.72423 30.3321 4.07688 30.591 3.40189 30.591C2.72689 30.591 2.07955 30.3321 1.60225 29.8712C1.12496 29.4104 0.856823 28.7853 0.856823 28.1336C0.856823 27.4818 1.12496 26.8568 1.60225 26.3959L23.6478 5.10951L8.20091 5.10662C7.52474 5.10661 6.87627 4.84726 6.39815 4.3856C5.92003 3.92395 5.65143 3.29781 5.65143 2.64493C5.65143 1.99204 5.92003 1.3659 6.39815 0.904247C6.87627 0.442589 7.52474 0.183233 8.20091 0.183234L29.7965 0.183232C30.1315 0.18267 30.4632 0.245961 30.7728 0.369474C31.0824 0.492986 31.3637 0.674292 31.6005 0.902992C31.8374 1.13169 32.0252 1.40329 32.1531 1.70221C32.281 2.00113 32.3466 2.32149 32.346 2.64492L32.346 23.4969C32.3466 23.8203 32.281 24.1407 32.1531 24.4396C32.0252 24.7385 31.8374 25.0101 31.6005 25.2388C31.3637 25.4675 31.0824 25.6488 30.7728 25.7723C30.4632 25.8959 30.1315 25.9591 29.7965 25.9586Z"
                          fill="black"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <span className={`${classes.expItems}`}>
                    Easyswap plans to create a fully governance-driven protocol,
                    with its Governance page set to launch sometime in 2024.
                    Until the launch of Governance, Easyswap's direction and
                    roadmap will be discussed in collaboration between the
                    Easyswap development team and partner companies.
                  </span>
                </div>
              </div>

              <div className={`${classes.expContainer}`} id="expContainer4">
                <div className={`${classes.expTitle}`}>
                  <span className={`${classes.exp1}`}>Launchpad</span>
                  <div style={{ paddingTop: "1%" }}>
                    <a href="/launchpad">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${classes.arrowLink}`}
                        viewBox="0 0 33 31"
                        fill="none"
                      >
                        <path
                          d="M29.7965 25.9586C29.4615 25.9591 29.1297 25.8959 28.8202 25.7723C28.5106 25.6488 28.2293 25.4675 27.9924 25.2388C27.7556 25.0101 27.5678 24.7385 27.4399 24.4396C27.312 24.1407 27.2464 23.8203 27.247 23.4969L27.247 8.58484L5.20152 29.8712C4.72423 30.3321 4.07688 30.591 3.40189 30.591C2.72689 30.591 2.07955 30.3321 1.60225 29.8712C1.12496 29.4104 0.856823 28.7853 0.856823 28.1336C0.856823 27.4818 1.12496 26.8568 1.60225 26.3959L23.6478 5.10951L8.20091 5.10662C7.52474 5.10661 6.87627 4.84726 6.39815 4.3856C5.92003 3.92395 5.65143 3.29781 5.65143 2.64493C5.65143 1.99204 5.92003 1.3659 6.39815 0.904247C6.87627 0.442589 7.52474 0.183233 8.20091 0.183234L29.7965 0.183232C30.1315 0.18267 30.4632 0.245961 30.7728 0.369474C31.0824 0.492986 31.3637 0.674292 31.6005 0.902992C31.8374 1.13169 32.0252 1.40329 32.1531 1.70221C32.281 2.00113 32.3466 2.32149 32.346 2.64492L32.346 23.4969C32.3466 23.8203 32.281 24.1407 32.1531 24.4396C32.0252 24.7385 31.8374 25.0101 31.6005 25.2388C31.3637 25.4675 31.0824 25.6488 30.7728 25.7723C30.4632 25.8959 30.1315 25.9591 29.7965 25.9586Z"
                          fill="black"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
                <div>
                  <span className={`${classes.expItems}`}>
                    Easyswap operates a Launchpad to support projects looking to
                    onboard. Projects can apply through a separate application
                    process and, upon review, those that meet certain criteria
                    earn the right to conduct an IDO on the Launchpad. Projects
                    participating in the Launchpad will be announced in future
                    updates.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`${classes.securitybox}`}>
            <div style={{ marginBottom: "3vw" }}>
              <Typography
                variant="body1"
                className={`${classes.securityTitle}`}
              >
                Security
              </Typography>
            </div>
            <div style={{ display: "flex" }}>
              <div className={`${classes.securityContainer}`}>
                <div
                  style={{ marginLeft: "100px", marginRight: "100px" }}
                  className={`${classes.auditContainer}`}
                >
                  <img
                    src="/images/auditImage.png"
                    className={`${classes.auditImage}`}
                  ></img>
                </div>
                <div style={{ display: "block" }}>
                  <div>
                    <Typography
                      variant="body1"
                      className={`${classes.auditDetails}`}
                    >
                      2023/09/26
                    </Typography>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body1"
                      className={`${classes.auditDetails}`}
                    >
                      Audit details
                    </Typography>
                    <a
                      href="https://github.com/Easyswap-fi/Easyswap/blob/main/audit/PeckShield-Audit-Report-Easyswap-v1.0.pdf"
                      style={{
                        border: "2px solid rgba(0, 0, 0, 0.5)",
                        borderRadius: "8px",
                        margin: "0px 1rem",
                      }}
                      className={`${classes.button}`}
                      target="_blank"
                    >
                      <ArrowForward />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                right: "6rem",
                paddingTop: "1rem",
              }}
            >
              {shouldShowAuditImage && (
                <svg
                  width="400"
                  height="400"
                  viewBox="0 0 473 462"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7275 230.239C21.7731 273.005 41.3073 322.722 80.3048 345.57C139.232 380.089 134.297 433.18 249.304 456.26C267.237 459.857 284.249 461.376 300.297 461.072C308.92 460.91 317.278 460.221 325.323 459.036C398.414 448.357 447.614 397.546 465.659 336.218C489.408 255.558 441.991 202.751 410.552 170.927C379.123 139.113 356.103 39.9731 243.215 16.3963C226.001 12.8097 208.402 10.9758 190.803 11.4216C150.64 12.4044 106.83 25.596 76.5155 53.1242C74.2358 55.1911 72.0271 57.3391 69.869 59.5478C27.7408 102.79 9.83785 171.94 16.7275 230.239Z"
                    fill="#F7B98B"
                  />
                  <path
                    opacity="0.7"
                    d="M16.7275 230.239C21.7731 273.005 41.3073 322.722 80.3048 345.57C139.232 380.089 134.297 433.18 249.304 456.26C267.237 459.857 284.249 461.376 300.297 461.072C308.92 460.91 317.278 460.221 325.323 459.036C398.414 448.357 447.614 397.546 465.659 336.218C489.408 255.558 441.991 202.751 410.552 170.927C379.123 139.113 356.103 39.9731 243.215 16.3963C226.001 12.8097 208.402 10.9758 190.803 11.4216C150.64 12.4044 106.83 25.596 76.5155 53.1242C74.2358 55.1911 72.0271 57.3391 69.869 59.5478C27.7408 102.79 9.83785 171.94 16.7275 230.239Z"
                    fill="#F7B98B"
                  />
                  <path
                    d="M32.5029 234.16V248.861"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M39.8488 241.505H25.1475"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M366.884 365.408V374.476"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M371.413 369.937H362.345"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M414.777 58.5852V67.6532"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M419.306 63.1243H410.249"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M292.912 428.671V437.739"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M297.441 433.21H288.383"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M409.022 408.468V430.464"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M420.025 419.461H398.019"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M72.7671 91.9189V113.925"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M83.7599 102.922H61.7637"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M37.4473 164.666C37.4473 166.854 35.6742 168.637 33.4756 168.637C31.2871 168.637 29.5039 166.864 29.5039 164.666C29.5039 162.477 31.277 160.694 33.4756 160.694C35.6641 160.694 37.4473 162.477 37.4473 164.666Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M429.438 395.337C429.438 396.857 428.212 398.083 426.693 398.083C425.173 398.083 423.947 396.857 423.947 395.337C423.947 393.817 425.173 392.591 426.693 392.591C428.212 392.591 429.438 393.817 429.438 395.337Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M329.376 414.223C329.376 415.743 328.15 416.968 326.63 416.968C325.111 416.968 323.885 415.743 323.885 414.223C323.885 412.703 325.111 411.477 326.63 411.477C328.15 411.477 329.376 412.703 329.376 414.223Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M48.0757 184.38C50.0515 179.943 48.0564 174.745 43.6195 172.769C39.1826 170.793 33.9841 172.788 32.0082 177.225C30.0324 181.662 32.0275 186.86 36.4644 188.836C40.9013 190.812 46.0998 188.817 48.0757 184.38Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M442.164 258.375C447.021 258.375 450.958 254.438 450.958 249.581C450.958 244.724 447.021 240.786 442.164 240.786C437.307 240.786 433.369 244.724 433.369 249.581C433.369 254.438 437.307 258.375 442.164 258.375Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M169.676 71.9661C170.787 67.2382 167.856 62.5043 163.128 61.3925C158.4 60.2808 153.666 63.2121 152.555 67.94C151.443 72.6678 154.374 77.4018 159.102 78.5135C163.83 79.6253 168.564 76.6939 169.676 71.9661Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M152.099 118.201C97.7012 118.201 53.4453 161.535 53.4453 214.788V268.963H81.5612V214.788C81.5612 176.712 113.203 145.729 152.099 145.729C190.985 145.729 222.627 176.712 222.627 214.788V268.963H250.743V214.788C250.743 161.525 206.487 118.201 152.099 118.201Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M258.392 416.391V268.963H120.589M111.248 268.963H42.9995V447.151H258.402V427.08M160.782 363.158L164.723 403.625H134.571L138.512 363.158C131.177 359.278 126.202 351.679 126.202 342.955C126.202 330.27 136.699 319.997 149.647 319.997C162.606 319.997 173.102 330.27 173.102 342.955C173.092 351.689 168.107 359.288 160.782 363.158Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M160.782 363.158L164.723 403.625H134.571L138.512 363.158C131.177 359.278 126.202 351.679 126.202 342.955C126.202 330.27 136.699 319.997 149.647 319.997C162.606 319.997 173.102 330.27 173.102 342.955C173.092 351.689 168.107 359.288 160.782 363.158Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M160.782 363.158L164.723 403.625H134.571L138.512 363.158C131.177 359.278 126.202 351.679 126.202 342.955C126.202 330.27 136.699 319.997 149.647 319.997C162.606 319.997 173.102 330.27 173.102 342.955C173.092 351.689 168.107 359.288 160.782 363.158Z"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M387.695 23.3162C383.388 22.5057 377.755 28.0478 375.891 31.4825C375.729 31.7763 373.733 36.7105 373.814 36.7207C373.824 36.7207 381.494 37.2982 384.706 36.0925C387.441 35.059 390.643 32.9921 391.514 30.0235C392.365 27.1157 390.795 23.9039 387.695 23.3162Z"
                    fill="#263238"
                  />
                  <path
                    d="M317.724 95.6982C317.998 98.1703 318.332 100.622 318.768 103.023C318.98 104.057 319.132 105.121 319.386 106.093C319.629 107.086 319.862 108.059 320.105 109.032C320.662 111.017 321.179 112.872 321.746 114.716C322.03 115.648 322.314 116.519 322.597 117.421C321.898 115.992 320.753 113.753 320.622 113.561C318.464 110.298 312.385 105.252 308.16 106.428C305.12 107.279 303.823 110.612 304.927 113.429C306.052 116.306 309.416 118.1 312.233 118.89C315.333 119.761 322.141 118.748 322.972 118.616C323.448 120.116 323.935 121.585 324.411 123.003H327.136C326.589 121.534 326.042 120.004 325.495 118.424C326.255 118.1 332.142 115.567 334.512 113.257C337.005 114.827 339.852 116.154 340.348 116.387C339.72 118.616 339.133 120.785 338.616 122.831C338.596 122.892 338.585 122.953 338.575 123.014H341.24C341.635 121.281 342.081 119.478 342.557 117.613C343.398 117.775 350.156 118.981 353.277 118.201C356.114 117.492 359.528 115.8 360.734 112.963C361.919 110.177 360.724 106.803 357.714 105.86C353.53 104.563 347.299 109.417 345.05 112.618C344.908 112.821 343.469 115.435 342.77 116.782C343.084 115.567 343.398 114.361 343.743 113.105C344.229 111.291 344.806 109.386 345.353 107.542C345.668 106.6 345.992 105.637 346.316 104.675C346.62 103.692 347.035 102.801 347.39 101.838C347.947 100.45 348.596 99.0416 349.234 97.6435C351.048 98.2514 356.417 99.9434 359.234 99.68C362.142 99.4064 365.769 98.2615 367.4 95.6272C368.991 93.0537 368.333 89.538 365.496 88.1499C361.554 86.2249 354.665 90.0851 351.949 92.9018C351.858 92.9929 351.352 93.6515 350.754 94.4317C351.422 93.0841 352.081 91.7265 352.8 90.3789C354.847 86.5592 357.046 82.7294 359.244 78.8793C359.7 78.0789 360.146 77.2683 360.602 76.4679C362.132 76.9846 367.927 78.8692 370.876 78.5956C373.783 78.3221 377.421 77.1772 379.042 74.5429C380.633 71.9694 379.974 68.4536 377.137 67.0656C373.196 65.1405 366.306 69.0008 363.591 71.8174C363.489 71.9187 362.882 72.6989 362.213 73.5905C363.378 71.4831 364.503 69.3655 365.556 67.2378C367.41 63.5093 369.032 59.7301 370.318 55.951C370.855 56.1435 377.603 58.4839 380.886 58.18C383.794 57.9064 387.421 56.7615 389.052 54.1272C390.643 51.5537 389.984 48.038 387.147 46.6499C383.206 44.7249 376.316 48.5851 373.601 51.4018C373.409 51.6044 371.23 54.4514 370.48 55.5052C370.491 55.4646 370.521 55.414 370.531 55.3734C371.838 51.3916 372.598 47.4301 373.135 43.6408C373.672 39.8616 373.864 36.2547 373.956 32.9314C374.057 29.6082 373.935 26.5585 373.804 23.8634C373.723 22.4044 373.621 21.067 373.52 19.831C373.53 19.8411 373.591 19.8918 373.591 19.8918C373.652 19.9424 375.394 14.9069 375.465 14.5827C376.306 10.763 375.698 2.89053 371.919 0.671657C369.194 -0.919041 365.901 0.46902 364.645 3.22488C363.358 6.04153 364.411 9.69912 365.8 12.2726C367.218 14.9069 372.091 18.7469 373.317 19.679C373.398 20.9759 373.479 22.3538 373.53 23.8837C373.601 26.5788 373.652 29.6183 373.479 32.9213C373.439 33.8028 373.358 34.745 373.297 35.667C373.084 34.0966 372.75 31.9486 372.699 31.7359C371.686 27.9567 367.512 21.2494 363.135 21.0265C359.984 20.8644 357.694 23.6203 357.856 26.6497C358.008 29.7399 360.632 32.4958 363.054 34.1472C365.577 35.8595 371.818 37.0247 373.186 37.2678C373.013 39.3043 372.801 41.3814 372.436 43.5395C371.828 47.2578 370.987 51.189 369.609 55.0695C369.528 55.2823 369.427 55.495 369.346 55.7179C369.376 54.9276 369.214 50.5507 369.163 50.2467C368.576 46.3764 365.161 39.2537 360.835 38.5546C357.714 38.048 355.141 40.5404 354.969 43.5597C354.786 46.6499 357.086 49.6793 359.305 51.574C361.868 53.7625 369.011 55.7787 369.275 55.8598C367.948 59.4768 366.306 63.0838 364.432 66.6603C363.074 69.2541 361.595 71.8275 360.085 74.3909C360.095 73.3575 359.943 69.2946 359.903 69.0008C359.315 65.1304 355.901 58.0077 351.574 57.3086C348.454 56.802 345.89 59.2945 345.708 62.3137C345.526 65.404 347.826 68.4334 350.055 70.328C352.557 72.4659 359.396 74.4314 359.974 74.5935C359.285 75.7587 358.606 76.9239 357.917 78.089C355.647 81.8783 353.348 85.6778 351.2 89.4873C350.45 90.8045 349.771 92.1419 349.082 93.4691C349.052 91.919 348.94 89.0922 348.9 88.849C348.312 84.9787 344.898 77.856 340.571 77.1569C337.451 76.6503 334.887 79.1427 334.705 82.162C334.523 85.2522 336.823 88.2816 339.052 90.1763C341.281 92.0811 346.995 93.8643 348.616 94.3405C347.481 96.5594 346.407 98.7884 345.445 101.027C345.05 102 344.594 102.973 344.269 103.935C343.925 104.898 343.58 105.84 343.246 106.782C342.618 108.748 342.02 110.582 341.483 112.426C341.199 113.358 340.956 114.239 340.703 115.151C340.906 113.571 341.189 111.068 341.189 110.845C341.189 106.934 338.9 99.376 334.735 98.0285C331.736 97.0558 328.808 99.1328 328.17 102.091C328.089 102.466 328.048 102.851 328.038 103.236C326.052 106.104 324.907 110.278 324.826 112.872C324.816 113.125 325.07 116.094 325.222 117.603C324.816 116.418 324.411 115.242 324.006 113.996C323.408 112.213 322.841 110.308 322.283 108.474C322.03 107.512 321.767 106.529 321.503 105.546C321.219 104.553 321.068 103.581 320.834 102.588C320.531 101.119 320.297 99.5888 320.054 98.069C321.908 97.5725 327.309 96.0224 329.517 94.2493C331.797 92.4154 334.188 89.4569 334.097 86.3667C334.006 83.3373 331.513 80.774 328.383 81.1894C324.036 81.7567 320.419 88.7781 319.71 92.6282C319.69 92.7498 319.619 93.5806 319.558 94.5634C319.365 93.074 319.173 91.5745 319.031 90.0547C318.626 85.7386 318.352 81.3312 318.058 76.9137C317.998 75.9917 317.927 75.0697 317.856 74.1579C319.416 73.7526 325.282 72.1214 327.603 70.2672C329.882 68.4334 332.273 65.4749 332.182 62.3847C332.091 59.3553 329.599 56.7919 326.468 57.2073C322.121 57.7747 318.504 64.7961 317.795 68.6461C317.765 68.788 317.694 69.7708 317.623 70.8853C317.43 68.484 317.207 66.1031 316.913 63.7322C316.397 59.5984 315.677 55.5558 314.654 51.6956C315.201 51.5537 322.131 49.7908 324.695 47.7239C326.974 45.89 329.365 42.9315 329.274 39.8413C329.183 36.8119 326.691 34.2486 323.56 34.664C319.213 35.2313 315.596 42.2527 314.887 46.1028C314.836 46.3764 314.593 49.9529 314.553 51.2397C314.543 51.189 314.532 51.1485 314.522 51.0978C313.418 47.0552 311.868 43.3368 310.226 39.8717C308.595 36.4168 306.761 33.3063 304.998 30.4897C303.246 27.6629 301.462 25.1907 299.872 23.0124C299 21.8371 298.18 20.7834 297.41 19.8006C297.43 19.8006 297.501 19.8107 297.501 19.8107C297.582 19.8107 296.255 14.6637 296.133 14.3496C294.735 10.7022 289.872 4.4711 285.495 4.70413C282.344 4.87637 280.358 7.85513 280.834 10.8542C281.31 13.914 284.218 16.376 286.791 17.7641C289.436 19.1724 295.616 19.6891 297.146 19.7904C297.926 20.8239 298.757 21.9384 299.639 23.1846C301.179 25.3933 302.901 27.8959 304.583 30.7531C305.039 31.513 305.485 32.3438 305.941 33.1442C304.897 31.9588 303.438 30.3377 303.276 30.1958C300.348 27.6021 293.164 24.3092 289.395 26.5382C286.68 28.1492 286.295 31.7055 288.088 34.1371C289.922 36.6295 293.63 37.4806 296.559 37.5211C299.608 37.5617 305.464 35.0895 306.731 34.5323C307.714 36.3256 308.676 38.1797 309.568 40.1858C311.108 43.6205 312.577 47.3693 313.57 51.3612C313.621 51.5841 313.651 51.8172 313.712 52.0401C313.296 51.3612 310.753 47.805 310.541 47.5821C307.916 44.6844 301.138 40.6215 297.146 42.425C294.269 43.7218 293.499 47.2173 295.019 49.8415C296.569 52.5163 300.166 53.7827 303.063 54.1374C306.407 54.5528 313.479 52.2934 313.742 52.2123C314.624 55.9611 315.252 59.8821 315.657 63.8943C315.961 66.8021 316.143 69.7607 316.295 72.7394C315.738 71.8681 313.367 68.5651 313.165 68.3523C310.541 65.4546 303.762 61.3918 299.77 63.1952C296.893 64.4921 296.123 67.9876 297.643 70.6117C299.193 73.2865 302.79 74.553 305.687 74.9076C308.95 75.3129 315.738 73.1751 316.306 72.9927C316.376 74.3402 316.458 75.6878 316.508 77.0454C316.711 81.4629 316.883 85.8905 317.197 90.2573C317.309 91.767 317.471 93.2564 317.623 94.7458C316.741 93.4691 315.09 91.1794 314.928 90.997C312.303 88.0993 305.525 84.0364 301.533 85.8399C298.656 87.1367 297.886 90.6322 299.406 93.2564C300.956 95.9312 304.553 97.1977 307.45 97.5523C310.368 97.8562 316.113 96.1845 317.724 95.6982Z"
                    fill="#263238"
                  />
                  <path
                    d="M306.944 33.7116C306.944 33.7116 313.661 29.9527 315.677 27.1765C317.39 24.8057 318.92 21.3203 318.008 18.3618C317.126 15.4641 314.036 13.6505 311.128 14.8765C307.086 16.5786 305.444 24.2991 305.789 28.1998C305.809 28.5342 306.873 33.7521 306.944 33.7116Z"
                    fill="#263238"
                  />
                  <path
                    d="M120.832 343.259C116.344 342.408 110.477 348.183 108.532 351.77C108.36 352.084 106.283 357.221 106.374 357.231C106.384 357.231 114.368 357.829 117.722 356.573C120.569 355.499 123.902 353.34 124.814 350.25C125.706 347.221 124.064 343.867 120.832 343.259Z"
                    fill="#263238"
                  />
                  <path
                    d="M47.9136 418.691C48.1973 421.275 48.5417 423.828 49.0078 426.32C49.2307 427.394 49.3827 428.499 49.6562 429.522C49.9095 430.555 50.1527 431.579 50.406 432.582C50.9835 434.659 51.5205 436.584 52.1082 438.499C52.402 439.471 52.6958 440.383 52.9896 441.315C52.2601 439.826 51.0646 437.485 50.9329 437.293C48.6836 433.889 42.3512 428.64 37.954 429.866C34.7827 430.748 33.4352 434.233 34.5902 437.171C35.7655 440.17 39.2711 442.035 42.1992 442.865C45.4313 443.777 52.5236 442.713 53.3848 442.582C53.8812 444.142 54.3878 445.672 54.8843 447.151H57.7212C57.1538 445.611 56.5864 444.031 56.0089 442.379C56.7992 442.045 62.9391 439.4 65.4011 436.999C68.005 438.64 70.9635 440.018 71.4802 440.262C70.8318 442.582 70.2137 444.851 69.6768 446.979C69.6565 447.04 69.6464 447.101 69.6261 447.161H72.4124C72.8278 445.358 73.2938 443.473 73.7802 441.538C74.6616 441.7 81.7032 442.967 84.9556 442.156C87.9141 441.417 91.4703 439.664 92.7267 436.695C93.9628 433.787 92.7166 430.272 89.5757 429.299C85.219 427.941 78.7245 433.007 76.3739 436.341C76.2219 436.553 74.7325 439.279 74.0031 440.687C74.3273 439.421 74.6515 438.164 75.0162 436.857C75.5228 434.963 76.1206 432.987 76.688 431.062C77.0223 430.079 77.3567 429.076 77.691 428.073C78.0051 427.05 78.4408 426.118 78.8157 425.114C79.3932 423.666 80.072 422.207 80.7407 420.738C82.6354 421.376 88.2281 423.139 91.1562 422.865C94.1857 422.582 97.975 421.386 99.667 418.64C101.329 415.955 100.63 412.298 97.6812 410.849C93.5778 408.843 86.3943 412.865 83.5675 415.803C83.4763 415.905 82.9393 416.583 82.3213 417.394C83.0204 415.986 83.7094 414.577 84.4591 413.169C86.5868 409.187 88.8867 405.195 91.1664 401.183C91.6426 400.352 92.1087 399.511 92.5747 398.67C94.1654 399.207 100.204 401.173 103.284 400.889C106.313 400.606 110.103 399.41 111.795 396.664C113.456 393.979 112.757 390.312 109.809 388.873C105.706 386.867 98.5221 390.889 95.6953 393.827C95.594 393.929 94.9557 394.749 94.2566 395.671C95.4623 393.473 96.6477 391.274 97.7419 389.045C99.6771 385.155 101.359 381.223 102.696 377.282C103.254 377.475 110.285 379.926 113.71 379.602C116.739 379.319 120.528 378.123 122.22 375.377C123.882 372.692 123.183 369.025 120.235 367.586C116.131 365.59 108.948 369.602 106.121 372.54C105.918 372.753 103.649 375.722 102.869 376.816C102.889 376.765 102.909 376.725 102.919 376.674C104.287 372.53 105.077 368.396 105.635 364.445C106.202 360.504 106.395 356.745 106.486 353.28C106.587 349.815 106.465 346.643 106.334 343.827C106.253 342.307 106.151 340.919 106.04 339.622C106.05 339.632 106.121 339.683 106.121 339.683C106.192 339.733 107.995 334.485 108.076 334.151C108.958 330.169 108.32 321.962 104.378 319.652C101.541 317.991 98.1067 319.45 96.7896 322.317C95.4521 325.245 96.5464 329.065 97.9952 331.739C99.4745 334.485 104.561 338.477 105.827 339.46C105.918 340.807 105.999 342.246 106.05 343.847C106.121 346.654 106.172 349.825 105.999 353.27C105.959 354.192 105.868 355.174 105.807 356.137C105.584 354.506 105.24 352.256 105.179 352.044C104.125 348.102 99.7785 341.111 95.2191 340.889C91.9364 340.726 89.5554 343.594 89.7175 346.745C89.8796 349.967 92.6152 352.844 95.1279 354.556C97.7521 356.34 104.267 357.555 105.695 357.809C105.523 359.926 105.29 362.094 104.915 364.354C104.277 368.224 103.406 372.328 101.977 376.37C101.896 376.593 101.785 376.816 101.703 377.039C101.734 376.208 101.562 371.659 101.511 371.345C100.893 367.312 97.3367 359.886 92.8381 359.156C89.5858 358.629 86.911 361.223 86.7185 364.374C86.526 367.596 88.9272 370.757 91.2474 372.733C93.9121 375.013 101.359 377.12 101.643 377.201C100.255 380.97 98.5424 384.729 96.5869 388.457C95.1786 391.163 93.6284 393.837 92.058 396.512C92.0681 395.438 91.906 391.203 91.8655 390.899C91.2474 386.867 87.6912 379.44 83.1926 378.711C79.9504 378.184 77.2655 380.778 77.073 383.929C76.8805 387.15 79.2817 390.312 81.6019 392.287C84.2058 394.516 91.3285 396.563 91.9364 396.735C91.2272 397.951 90.518 399.167 89.7885 400.373C87.4176 404.324 85.0265 408.275 82.7874 412.257C82.0072 413.635 81.298 415.023 80.5786 416.401C80.5482 414.78 80.4266 411.842 80.3962 411.588C79.7782 407.556 76.2219 400.129 71.7234 399.4C68.4812 398.873 65.7963 401.467 65.6038 404.618C65.4113 407.83 67.8125 411.001 70.1327 412.977C72.463 414.962 78.4104 416.817 80.0923 417.313C78.9069 419.623 77.7822 421.943 76.7893 424.284C76.384 425.297 75.8977 426.31 75.5634 427.313C75.1986 428.316 74.844 429.299 74.4894 430.282C73.8308 432.328 73.2128 434.233 72.6454 436.158C72.3516 437.131 72.0983 438.053 71.8247 438.995C72.0375 437.354 72.3313 434.74 72.3313 434.507C72.3313 430.434 69.9503 422.551 65.6038 421.153C62.473 420.14 59.4335 422.298 58.7648 425.388C58.6837 425.783 58.6331 426.178 58.6229 426.573C56.5459 429.562 55.3605 433.909 55.2794 436.614C55.2693 436.878 55.5327 439.968 55.6948 441.548C55.2693 440.312 54.8438 439.086 54.4283 437.789C53.8103 435.935 53.2125 433.949 52.635 432.035C52.3716 431.031 52.098 430.008 51.8245 428.985C51.5306 427.951 51.3685 426.938 51.1355 425.895C50.8214 424.365 50.5681 422.774 50.3249 421.183C52.25 420.667 57.8934 419.056 60.1832 417.212C62.5541 415.307 65.0566 412.217 64.9553 408.995C64.8641 405.844 62.2603 403.169 58.9978 403.594C54.4689 404.192 50.6998 411.507 49.9602 415.52C49.9399 415.651 49.869 416.513 49.7981 417.536C49.5955 415.976 49.3928 414.425 49.251 412.835C48.8356 408.336 48.5417 403.736 48.2378 399.136C48.177 398.174 48.0959 397.222 48.025 396.259C49.6461 395.833 55.7657 394.141 58.1771 392.206C60.548 390.301 63.0404 387.211 62.9492 383.989C62.858 380.838 60.2541 378.164 56.9917 378.589C52.4628 379.187 48.6937 386.502 47.9541 390.504C47.9237 390.646 47.8528 391.679 47.7717 392.834C47.5691 390.332 47.3361 387.85 47.0321 385.388C46.4951 381.082 45.7352 376.867 44.6815 372.844C45.259 372.702 52.4729 370.859 55.1477 368.711C57.5186 366.806 60.011 363.716 59.9198 360.494C59.8286 357.343 57.2247 354.668 53.9623 355.093C49.4333 355.691 45.6643 363.006 44.9247 367.019C44.874 367.302 44.6207 371.031 44.5701 372.368C44.5599 372.317 44.5498 372.267 44.5397 372.226C43.3846 368.011 41.7737 364.131 40.0614 360.524C38.3593 356.927 36.4443 353.685 34.6105 350.747C32.7867 347.798 30.9326 345.225 29.271 342.945C28.3591 341.719 27.5081 340.625 26.6975 339.602C26.7178 339.602 26.7988 339.612 26.7988 339.612C26.8799 339.622 25.502 334.242 25.3702 333.918C23.9113 330.108 18.8453 323.614 14.286 323.867C11.0033 324.049 8.9364 327.16 9.42273 330.27C9.91919 333.452 12.9486 336.025 15.6335 337.464C18.3894 338.933 24.8231 339.47 26.4239 339.582C27.2446 340.656 28.1058 341.821 29.0278 343.118C30.6287 345.417 32.422 348.031 34.1849 351C34.651 351.79 35.1272 352.662 35.6034 353.493C34.5092 352.256 32.9894 350.575 32.8273 350.423C29.7776 347.717 22.2902 344.283 18.359 346.613C15.5322 348.285 15.127 351.993 17.0013 354.536C18.9163 357.13 22.7765 358.021 25.8262 358.062C29.0076 358.103 35.1069 355.529 36.4342 354.941C37.4575 356.806 38.4606 358.741 39.3927 360.828C41.0037 364.405 42.5336 368.305 43.567 372.469C43.6278 372.702 43.6582 372.946 43.7089 373.179C43.2732 372.469 40.6187 368.771 40.4059 368.528C37.6703 365.509 30.6084 361.274 26.4442 363.148C23.4452 364.506 22.6448 368.143 24.2253 370.879C25.8363 373.665 29.5851 374.982 32.6044 375.357C36.0897 375.783 43.4556 373.432 43.7393 373.351C44.6613 377.262 45.3097 381.345 45.7352 385.529C46.0493 388.559 46.2418 391.649 46.4039 394.739C45.8163 393.837 43.3542 390.393 43.1415 390.16C40.4059 387.14 33.344 382.905 29.1798 384.78C26.1808 386.127 25.3804 389.775 26.9609 392.51C28.5719 395.296 32.3207 396.614 35.34 396.988C38.7443 397.404 45.8163 395.185 46.4141 394.993C46.485 396.401 46.566 397.799 46.6268 399.218C46.8295 403.817 47.022 408.437 47.3462 412.987C47.4576 414.567 47.6299 416.107 47.792 417.668C46.87 416.34 45.1577 413.949 44.9855 413.757C42.2499 410.737 35.188 406.502 31.0238 408.377C28.0248 409.734 27.2244 413.372 28.8049 416.107C30.4159 418.894 34.1647 420.211 37.184 420.586C40.2438 420.94 46.2418 419.197 47.9136 418.691Z"
                    fill="#263238"
                  />
                  <path
                    d="M36.6773 354.09C36.6874 354.09 43.6784 350.179 45.7757 347.282C47.5589 344.82 49.1496 341.182 48.2073 338.092C47.2853 335.073 44.0735 333.178 41.034 334.455C36.8293 336.228 35.117 344.273 35.4615 348.335C35.502 348.7 36.6064 354.131 36.6773 354.09Z"
                    fill="#263238"
                  />
                  <path
                    d="M432.204 377.748H211.471C206.223 377.748 201.968 373.493 201.968 368.245V84.3303H441.717V368.245C441.707 373.493 437.452 377.748 432.204 377.748Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M427.178 373.361H206.446C201.198 373.361 196.942 369.106 196.942 363.857V79.9431H436.692V363.857C436.692 369.106 432.437 373.361 427.178 373.361Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M427.36 79.9431V373.371H427.867C432.74 373.371 436.692 369.42 436.692 364.546V79.9431H427.36Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M436.692 158.06H427.36V218.658H436.692V158.06Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M436.692 79.9431H196.942V100.693H436.692V79.9431Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M410.42 90.5209C410.42 88.8795 409.093 87.5522 407.452 87.5522C405.81 87.5522 404.483 88.8795 404.483 90.5209C404.483 92.1622 405.81 93.4895 407.452 93.4895C409.093 93.4895 410.42 92.1622 410.42 90.5209Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M416.793 93.4895C418.433 93.4895 419.762 92.1604 419.762 90.5209C419.762 88.8813 418.433 87.5522 416.793 87.5522C415.154 87.5522 413.825 88.8813 413.825 90.5209C413.825 92.1604 415.154 93.4895 416.793 93.4895Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M426.124 93.4895C427.764 93.4895 429.093 92.1604 429.093 90.5209C429.093 88.8813 427.764 87.5522 426.124 87.5522C424.485 87.5522 423.156 88.8813 423.156 90.5209C423.156 92.1604 424.485 93.4895 426.124 93.4895Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M305.242 311.841C283.306 298.669 266.031 282.732 253.893 264.474C244.592 250.482 241.715 240.097 241.239 238.162L240.631 235.71V142.416L315.89 110.227L391.149 142.416V235.71L390.541 238.162C390.065 240.097 387.188 250.472 377.887 264.474C365.749 282.732 348.474 298.669 326.529 311.841L315.89 318.234L305.242 311.841Z"
                    fill="#CFCFCF"
                    stroke="white"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M310.561 302.975C261.067 273.249 251.634 237.179 251.259 235.659L250.955 234.433V149.225L315.88 121.453L380.805 149.225V234.433L380.501 235.659C380.126 237.179 370.693 273.259 321.199 302.975L315.88 306.167L310.561 302.975Z"
                    fill="white"
                  />
                  <path
                    d="M315.88 133.044L261.29 155.577V233.177C261.29 233.177 269.497 266.268 315.88 294.12C362.264 266.268 370.471 233.177 370.471 233.177V155.577L315.88 133.044Z"
                    fill="#92E3A9"
                  />
                  <path
                    d="M342.653 226.538C357.747 211.444 357.747 186.97 342.653 171.875C327.558 156.781 303.084 156.781 287.99 171.875C272.895 186.97 272.895 211.444 287.99 226.538C303.084 241.633 327.558 241.633 342.653 226.538Z"
                    fill="white"
                  />
                  <path
                    d="M329.757 189.076C331.747 181.112 326.903 173.042 318.939 171.052C310.975 169.063 302.906 173.906 300.916 181.87C298.926 189.834 303.769 197.904 311.733 199.893C319.698 201.883 327.767 197.04 329.757 189.076Z"
                    fill="#263238"
                  />
                  <path
                    d="M315.323 237.858C325.647 237.858 335.019 233.805 341.949 227.21C340.379 213.886 329.062 203.552 315.323 203.552C301.584 203.552 290.267 213.886 288.696 227.21C295.626 233.805 304.998 237.858 315.323 237.858Z"
                    fill="#263238"
                  />
                  <path
                    opacity="0.19"
                    d="M326.509 311.841C348.444 298.669 365.719 282.732 377.867 264.474C387.178 250.472 390.045 240.097 390.521 238.162L391.129 235.71V142.416L315.87 110.227V318.234L326.509 311.841Z"
                    fill="black"
                  />
                  <path
                    d="M224.501 355.691V330.544H230.743C232.252 330.544 233.458 330.818 234.36 331.365C235.261 331.912 235.92 332.702 236.335 333.735C236.751 334.769 236.953 336.025 236.953 337.494C236.953 338.822 236.72 339.967 236.254 340.939C235.788 341.912 235.099 342.662 234.187 343.188C233.276 343.715 232.141 343.979 230.773 343.979H228.007V355.681H224.501V355.691ZM228.007 341.476H229.618C230.631 341.476 231.432 341.365 232.009 341.132C232.587 340.909 233.002 340.504 233.255 339.936C233.509 339.369 233.63 338.568 233.63 337.535C233.63 336.339 233.539 335.417 233.367 334.769C233.195 334.131 232.82 333.685 232.262 333.432C231.705 333.178 230.834 333.057 229.659 333.057H228.017V341.476H228.007Z"
                    fill="#263238"
                  />
                  <path
                    d="M239.395 355.691V330.544H244.451C246.123 330.544 247.511 330.767 248.615 331.213C249.709 331.658 250.52 332.368 251.047 333.35C251.573 334.333 251.837 335.62 251.837 337.211C251.837 338.183 251.736 339.065 251.523 339.865C251.32 340.666 250.986 341.334 250.53 341.881C250.074 342.429 249.476 342.824 248.726 343.077L252.293 355.681H248.909L245.616 343.888H242.88V355.681H239.395V355.691ZM242.901 341.375H244.238C245.231 341.375 246.042 341.253 246.66 341C247.278 340.757 247.734 340.331 248.027 339.723C248.321 339.126 248.463 338.285 248.463 337.211C248.463 335.742 248.189 334.678 247.652 334.029C247.115 333.381 246.052 333.047 244.451 333.047H242.901V341.375Z"
                    fill="#263238"
                  />
                  <path
                    d="M255.697 355.691V330.544H259.142V355.691H255.697Z"
                    fill="#263238"
                  />
                  <path
                    d="M267.582 355.691L261.959 330.544H265.252L269.224 349.075L273.013 330.544H276.214L270.662 355.691H267.582Z"
                    fill="#263238"
                  />
                  <path
                    d="M276.65 355.691L281.989 330.544H285.373L290.743 355.691H287.42L286.275 349.359H281.148L279.943 355.691H276.65ZM281.615 346.846H285.809L283.692 335.509L281.615 346.846Z"
                    fill="#263238"
                  />
                  <path
                    d="M299.457 355.965C297.674 355.965 296.296 355.59 295.313 354.85C294.33 354.1 293.651 353.097 293.266 351.841C292.881 350.575 292.689 349.176 292.689 347.616V338.741C292.689 337.049 292.881 335.559 293.266 334.303C293.651 333.036 294.33 332.064 295.313 331.365C296.296 330.676 297.674 330.321 299.457 330.321C301.027 330.321 302.274 330.615 303.196 331.192C304.118 331.77 304.776 332.601 305.182 333.675C305.587 334.749 305.789 336.046 305.789 337.555V339.541H302.466V337.768C302.466 336.836 302.416 336.015 302.324 335.296C302.233 334.587 301.98 334.029 301.564 333.634C301.149 333.239 300.46 333.047 299.487 333.047C298.494 333.047 297.765 333.259 297.319 333.685C296.863 334.11 296.569 334.708 296.438 335.488C296.306 336.268 296.235 337.17 296.235 338.204V348.163C296.235 349.43 296.336 350.423 296.549 351.162C296.752 351.902 297.096 352.419 297.573 352.733C298.049 353.047 298.687 353.199 299.498 353.199C300.45 353.199 301.129 352.986 301.544 352.56C301.96 352.135 302.213 351.547 302.324 350.808C302.426 350.058 302.476 349.197 302.476 348.204V346.339H305.8V348.204C305.8 349.734 305.617 351.081 305.242 352.256C304.867 353.422 304.229 354.334 303.317 354.992C302.395 355.641 301.119 355.965 299.457 355.965Z"
                    fill="#263238"
                  />
                  <path
                    d="M312.993 355.691V346.816L307.562 330.554H310.824L314.675 342.692L318.464 330.554H321.757L316.356 346.816V355.691H312.993Z"
                    fill="#263238"
                  />
                  <path
                    d="M331.18 355.691V330.544H337.421C338.931 330.544 340.136 330.818 341.038 331.365C341.94 331.912 342.598 332.702 343.014 333.735C343.429 334.769 343.632 336.025 343.632 337.494C343.632 338.822 343.399 339.967 342.933 340.939C342.467 341.912 341.778 342.662 340.866 343.188C339.954 343.715 338.819 343.979 337.451 343.979H334.685V355.681H331.18V355.691ZM334.695 341.476H336.306C337.32 341.476 338.12 341.365 338.698 341.132C339.275 340.909 339.69 340.504 339.944 339.936C340.187 339.369 340.319 338.568 340.319 337.535C340.319 336.339 340.227 335.417 340.055 334.769C339.883 334.131 339.508 333.685 338.951 333.432C338.394 333.178 337.522 333.057 336.347 333.057H334.706V341.476H334.695Z"
                    fill="#263238"
                  />
                  <path
                    d="M352.507 355.965C350.805 355.965 349.457 355.63 348.444 354.972C347.431 354.313 346.701 353.361 346.276 352.135C345.84 350.909 345.627 349.46 345.627 347.809V338.275C345.627 336.623 345.85 335.195 346.296 334.009C346.742 332.824 347.461 331.912 348.464 331.274C349.467 330.645 350.815 330.331 352.517 330.331C354.209 330.331 355.557 330.655 356.55 331.294C357.542 331.932 358.262 332.844 358.708 334.029C359.153 335.205 359.376 336.623 359.376 338.285V347.849C359.376 349.48 359.153 350.909 358.708 352.135C358.262 353.361 357.542 354.303 356.55 354.972C355.547 355.63 354.209 355.965 352.507 355.965ZM352.507 353.209C353.439 353.209 354.138 353.016 354.614 352.631C355.091 352.246 355.415 351.709 355.577 351.02C355.739 350.332 355.82 349.511 355.82 348.579V337.555C355.82 336.623 355.739 335.823 355.577 335.144C355.415 334.475 355.091 333.958 354.614 333.594C354.138 333.229 353.439 333.047 352.507 333.047C351.575 333.047 350.866 333.229 350.379 333.594C349.893 333.958 349.569 334.475 349.396 335.144C349.234 335.813 349.153 336.623 349.153 337.555V348.579C349.153 349.511 349.234 350.321 349.396 351.02C349.559 351.709 349.883 352.246 350.379 352.631C350.866 353.016 351.575 353.209 352.507 353.209Z"
                    fill="#263238"
                  />
                  <path
                    d="M362.811 355.691V330.544H366.317V353.168H372.74V355.681H362.811V355.691Z"
                    fill="#263238"
                  />
                  <path
                    d="M375.324 355.691V330.544H378.769V355.691H375.324Z"
                    fill="#263238"
                  />
                  <path
                    d="M389.134 355.965C387.351 355.965 385.973 355.59 384.99 354.85C384.007 354.1 383.328 353.097 382.943 351.841C382.558 350.575 382.366 349.176 382.366 347.616V338.741C382.366 337.049 382.558 335.559 382.943 334.303C383.328 333.036 384.007 332.064 384.99 331.365C385.973 330.676 387.351 330.321 389.134 330.321C390.704 330.321 391.95 330.615 392.872 331.192C393.794 331.77 394.453 332.601 394.858 333.675C395.264 334.749 395.466 336.046 395.466 337.555V339.541H392.143V337.768C392.143 336.836 392.092 336.015 392.001 335.296C391.91 334.587 391.657 334.029 391.241 333.634C390.826 333.239 390.137 333.047 389.164 333.047C388.171 333.047 387.442 333.259 386.996 333.685C386.54 334.11 386.246 334.708 386.114 335.488C385.983 336.268 385.912 337.17 385.912 338.204V348.163C385.912 349.43 386.013 350.423 386.226 351.162C386.429 351.902 386.773 352.419 387.249 352.733C387.725 353.047 388.364 353.199 389.174 353.199C390.127 353.199 390.806 352.986 391.221 352.56C391.636 352.135 391.89 351.547 392.001 350.808C392.102 350.058 392.153 349.197 392.153 348.204V346.339H395.476V348.204C395.476 349.734 395.294 351.081 394.919 352.256C394.544 353.422 393.906 354.334 392.994 354.992C392.072 355.641 390.795 355.965 389.134 355.965Z"
                    fill="#263238"
                  />
                  <path
                    d="M402.67 355.691V346.816L397.239 330.554H400.502L404.352 342.692L408.141 330.554H411.434L406.034 346.816V355.691H402.67Z"
                    fill="#263238"
                  />
                  <path
                    d="M172.048 340.706C172.048 340.706 170.792 359.561 173.517 368.984C176.243 378.407 193.416 423.24 193.416 423.24C193.416 423.24 193.832 431.204 193.204 432.034C192.575 432.865 189.647 437.485 185.666 439.37C181.684 441.254 173.305 446.077 175.189 446.705C177.074 447.333 193.832 445.449 195.716 446.29C197.601 447.131 205.98 443.777 208.077 442.936C210.174 442.095 208.077 436.857 208.077 436.857C208.077 436.857 203.68 421.984 201.795 410.464C199.911 398.944 196.973 383.017 195.301 375.063C193.629 367.099 190.478 360.818 190.478 360.818L192.575 341.121L172.048 340.706Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M188.391 442.095L186.233 439.076C186.05 439.177 185.858 439.279 185.665 439.37C181.684 441.254 173.305 446.077 175.189 446.705C177.074 447.333 193.832 445.449 195.716 446.29C197.601 447.131 205.98 443.777 208.077 442.936C210.174 442.095 208.077 436.857 208.077 436.857C208.077 436.857 207.864 436.148 207.52 434.932C204.946 436.148 201.745 437.86 199.485 439.795C195.098 443.564 188.391 442.095 188.391 442.095Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M185.362 342.175C185.362 342.175 187.034 361.446 189.557 368.153C192.069 374.861 192.069 420.525 192.069 424.294C192.069 428.063 185.99 434.142 185.99 434.142C185.99 434.142 175.514 441.893 172.586 442.734C169.658 443.575 167.348 444.618 168.817 445.875C170.286 447.131 184.734 447.131 189.769 447.131C194.795 447.131 201.289 447.344 201.917 446.29C202.546 445.246 202.961 442.095 202.961 442.095C202.961 442.095 201.705 430.363 202.12 425.125C202.536 419.886 210.084 388.042 209.456 377.363C208.827 366.684 205.899 357.251 205.687 356.411C205.474 355.57 207.156 341.122 207.156 341.122L185.362 342.175Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M202.951 442.095C202.951 442.095 202.9 441.589 202.819 440.748C193.407 441.477 181.167 442.095 181.167 442.095L179.749 438.549C176.932 440.454 173.943 442.339 172.576 442.724C169.647 443.565 167.337 444.608 168.807 445.865C170.276 447.121 184.724 447.121 189.759 447.121C194.785 447.121 201.279 447.334 201.907 446.28C202.535 445.246 202.951 442.095 202.951 442.095Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M164.652 290.503C164.652 290.503 163.183 305.61 163.811 312.327C164.439 319.044 166.192 352.327 166.192 352.327C166.192 352.327 178.077 359.643 188.776 360.271C199.475 360.899 215.635 355.235 215.635 355.235C215.635 355.235 219.202 315.691 217.104 305.204C215.007 294.718 213.953 289.682 213.953 289.682C213.953 289.682 185.625 288.213 178.289 286.329C170.944 284.444 169.211 283.37 169.211 283.37L166.79 283.097L164.652 290.503Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M169.049 286.582C169.049 286.582 179.961 291.83 196.111 289.733L195.058 259.104L202.191 212.741L190.65 212.326L177.641 216.946L169.88 275.69L169.049 286.582Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M179.445 207.766C179.445 207.766 176.638 220.462 177.135 222.113C177.631 223.765 182.737 232.498 186.203 231.84C189.668 231.181 197.084 219.144 198.077 216.834C199.07 214.524 197.084 210.573 196.922 209.742C196.76 208.921 194.774 200.35 194.774 200.35C194.774 200.35 186.861 207.108 179.445 207.766Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M180.417 215.446C180.417 215.446 177.388 240.219 177.206 249.854C177.013 259.5 171.532 303.745 171.532 303.745C171.532 303.745 170.772 305.073 165.858 303.553C160.944 302.043 158.482 298.639 158.482 298.639C158.482 298.639 166.993 266.876 167.175 265.366C167.368 263.856 165.666 249.104 165.666 249.104L148.644 263.856C148.644 263.856 149.019 255.913 150.539 254.211C152.048 252.509 163.396 231.333 164.338 229.256C165.281 227.179 164.146 220.938 167.55 219.043C170.964 217.148 180.417 215.446 180.417 215.446Z"
                    fill="#92E3A9"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M163.913 283.917L171.106 286.318L170.843 288.183L164.439 286.582"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M176.264 260.634C176.264 260.634 173.234 231.323 173.619 224.707L176.264 260.634Z"
                    fill="white"
                  />
                  <path
                    d="M176.264 260.634C176.264 260.634 173.234 231.323 173.619 224.707"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M197.814 213.937C197.814 213.937 187.418 249.479 187.418 257.615C187.418 265.741 189.495 305.518 189.495 305.518C189.495 305.518 198.908 308.325 206.284 307.383C213.66 306.44 223.528 302.236 223.528 302.236L213.508 272.357C213.508 272.357 229.395 234.16 229.395 231.516C229.395 228.871 231.472 223.957 229.395 222.63C227.318 221.303 209.354 215.254 206.892 214.119C204.43 212.984 200.843 211.282 197.814 213.937Z"
                    fill="#92E3A9"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M213.478 287.382L196.122 289.733L197.226 292.185L207.085 291.121"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M207.713 214.464C207.358 214.322 207.074 214.21 206.892 214.119C204.43 212.984 200.843 211.282 197.814 213.927C197.814 213.927 187.418 249.469 187.418 257.605C187.418 258.963 187.53 261.192 187.722 263.947C188.573 261.11 190.499 256.663 194.035 247.584C198.624 235.791 205.332 220.016 207.713 214.464Z"
                    fill="#92E3A9"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M171.157 165.962C171.157 165.962 160.813 172.862 160.184 177.877C159.556 182.893 160.032 185.871 160.032 190.735C160.032 195.598 157.368 210.796 159.88 216.439C162.393 222.083 165.99 227.098 171.005 228.506C176.02 229.915 179.151 228.658 180.408 227.412C181.664 226.156 182.606 223.805 182.606 223.805C182.606 223.805 179.941 224.119 179.941 220.988C179.941 217.858 182.92 208.293 182.92 208.293C182.92 208.293 176.183 204.848 174.926 201.556C173.67 198.263 169.911 180.866 170.225 179.458C170.539 178.05 176.183 174.909 176.335 170.998C176.486 167.067 173.984 164.716 171.157 165.962Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M170.225 172.862C170.225 172.862 167.56 178.658 168.34 183.369C169.12 188.07 170.691 196.226 171.471 199.509C172.251 202.802 176.334 206.409 178.371 208.283C180.407 210.168 184.014 212.832 186.679 212.204C189.344 211.576 193.265 205.152 193.265 205.152C193.265 205.152 196.395 201.545 197.186 198.415C197.966 195.284 195.301 189.792 193.579 183.997C191.856 178.202 187.621 173.024 180.569 171.302C173.508 169.569 171.319 171.768 170.225 172.862Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M176.172 189.478C176.172 189.478 178.371 193.085 178.209 194.179C178.057 195.274 176.953 199.975 177.581 200.289C178.209 200.603 180.397 200.137 180.397 200.137"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M180.407 203.43C180.407 203.43 183.7 203.744 186.517 200.137"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M175.078 189.326C175.078 189.326 172.413 188.232 171.157 190.421"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M179.465 188.698C179.465 188.698 179.931 186.5 183.852 187.604"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M183.802 191.677C184.085 192.498 183.913 193.298 183.427 193.47C182.94 193.642 182.312 193.116 182.029 192.295C181.745 191.474 181.917 190.674 182.403 190.512C182.9 190.339 183.528 190.866 183.802 191.677Z"
                    fill="#263238"
                  />
                  <path
                    d="M175.392 193.237C175.676 194.058 175.503 194.858 175.017 195.021C174.531 195.193 173.903 194.666 173.619 193.845C173.335 193.025 173.507 192.224 173.994 192.062C174.48 191.9 175.108 192.427 175.392 193.237Z"
                    fill="#263238"
                  />
                  <path
                    d="M168.492 171.92C168.492 171.92 174.764 181.008 181.035 185.091C187.307 189.164 193.417 190.107 193.579 193.866C193.731 197.624 190.762 206.095 193.113 212.204C195.463 218.314 199.85 220.512 205.97 219.256C212.079 218 214.906 212.356 214.906 212.356C214.906 212.356 211.461 214.707 210.357 212.042C209.263 209.377 206.75 205.456 209.891 199.033C213.022 192.609 214.906 189.63 209.111 178.972C203.315 168.313 196.416 162.204 190.924 159.853C185.423 157.502 168.34 161.261 168.492 171.92Z"
                    fill="#263238"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M166.202 259.489L165.473 252.164L162.687 254.95L166.202 259.489Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M158.249 241.394L161.248 245.467L158.887 249.114C158.887 249.114 158.563 249.54 160.174 252.113C161.785 254.687 164.034 256.936 164.034 256.936C164.034 256.936 169.161 246.146 169.546 244.2C169.931 242.255 160.974 230.847 160.974 230.847C160.974 230.847 157.935 236.784 158.249 241.394Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M149.657 220.776L164.814 238.78L174.865 239.428L160.488 220.38L149.657 220.776Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M157.428 231.009C157.428 231.009 155.534 232.174 155.969 233.197C156.405 234.221 159.617 236.551 161.947 236.845C164.277 237.139 163.133 235.72 163.122 234.97C163.112 234.21 157.428 231.009 157.428 231.009Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M156.699 234.362C156.699 234.362 155.24 235.963 155.675 237.128C156.111 238.293 161.653 239.894 162.666 240.046C163.69 240.188 164.855 238.881 163.396 237.858C161.947 236.834 156.699 234.362 156.699 234.362Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M156.851 238.587C156.851 238.587 156.415 240.624 157.439 241.353C158.462 242.083 163.183 241.536 163.953 241.232C164.723 240.918 162.687 240.046 162.687 240.046L156.851 238.587Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M187.682 247.99L182.079 242.711C182.079 242.711 180.265 236.612 179.445 234.798C178.624 232.984 177.965 232.488 175.98 230.674C174.004 228.861 172.687 229.681 172.352 230.836C172.018 231.991 172.018 231.991 172.018 231.991C172.018 231.991 162.454 231.495 160.974 230.836C159.495 230.178 157.844 228.688 157.023 229.681C156.202 230.674 157.357 231.991 158.674 232.812C159.991 233.633 161.805 234.626 163.122 234.96C164.439 235.294 166.091 235.619 166.091 235.619L159.171 234.626C159.171 234.626 158.836 235.446 159.667 236.277C160.488 237.098 161.815 238.425 161.815 238.425C161.815 238.425 162.474 239.742 163.963 241.232C164.622 241.89 165.797 242.549 166.901 243.076C168.289 243.744 169.566 244.2 169.566 244.2C169.566 244.2 167.418 244.2 165.777 243.866C164.135 243.532 162.646 242.711 162.808 243.866C162.97 245.021 164.125 245.517 165.939 245.842C167.752 246.176 175.503 247.159 176.162 247.321C176.82 247.483 185.392 255.396 185.392 255.396L187.682 247.99Z"
                    fill="white"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M172.028 231.991C172.028 231.991 175.321 232.984 176.476 233.967L172.028 231.991Z"
                    fill="white"
                  />
                  <path
                    d="M172.028 231.991C172.028 231.991 175.321 232.984 176.476 233.967"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M166.091 235.619L170.377 236.612"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M161.805 238.425C161.805 238.425 167.246 240.239 170.052 240.897"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M230.296 224.859C230.165 225.771 228.736 238.648 224.957 251.667C221.188 264.677 219.232 276.389 218.452 277.301C217.672 278.213 209.212 274.961 202.312 270.796C195.412 266.632 181.491 256.612 181.491 256.612L187.347 245.416L208.037 257.777C208.037 257.777 208.685 256.348 209.597 256.085C210.509 255.822 211.157 255.437 211.157 255.437L213.113 230.451"
                    fill="#92E3A9"
                  />
                  <path
                    d="M230.296 224.859C230.165 225.771 228.736 238.648 224.957 251.667C221.188 264.677 219.232 276.389 218.452 277.301C217.672 278.213 209.212 274.961 202.312 270.796C195.412 266.632 181.491 256.612 181.491 256.612L187.347 245.416L208.037 257.777C208.037 257.777 208.685 256.348 209.597 256.085C210.509 255.822 211.157 255.437 211.157 255.437L213.113 230.451"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M158.897 249.104L166.202 259.479C166.202 259.479 164.004 266.217 161.805 268.851C159.607 271.485 152.433 272.661 150.083 269.875C147.742 267.088 148.33 262.843 149.647 260.503C150.964 258.172 158.897 249.104 158.897 249.104Z"
                    fill="#92E3A9"
                    stroke="#263238"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0 447.141H452.822"
                    stroke="#263238"
                    strokeMiterlimit="10"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className={`${classes.partnershipContainer}`}>
            <div className={`${classes.partnershipTitle}`}>
              <div style={{ display: "flex", height: "100%" }}>
                <Typography className={`${classes.securityTitle}`}>
                  Build with the best in web3
                </Typography>
              </div>
            </div>
            <div className={`${classes.partnershipImageContainer}`}>
              <div className={`${classes.partnershipItems}`}>
                <img src="https://global.discourse-cdn.com/standard11/uploads/scroll2/original/2X/8/85e5aaf4d7a9a16934b81eb52434d505c8a53aec.png" />
              </div>
              <div className={`${classes.partnershipItems}`}>
                <img src="/images/EthSign.png" />
              </div>
              <div className={`${classes.partnershipItems}`}>
                <img src="/images/izumi-logo.svg" />
              </div>
              <div className={`${classes.partnershipItems}`}>
                <img src="/images/celer-logo.svg" />
              </div>
              {/* <div className={`${classes.partnershipItems}`}>
                <img src="/images/okx-logo.svg" />
              </div>
              <div className={`${classes.partnershipItems}`}>
                <img src="/images/dodo-logo.svg" />
              </div>
              <div className={`${classes.partnershipItems}`}>
                <img src="/images/full-mask-network-logo.svg" />
              </div> */}
            </div>
          </div>
          <div className={`${classes.communityContainer}`}>
            <div className={`${classes.communityTitle}`}>
              <div>
                <Typography className={`${classes.cTitle1}`}>
                  EasySwap Community
                </Typography>
              </div>
              <div style={{ paddingTop: "2rem" }}>
                <Typography
                  className={`${classes.cTitle2}`}
                  style={{
                    fontSize: "18px",
                    fontWeight: "400",
                    color: "white",
                    lineHeight: "20px",
                  }}
                >
                  The Easyswap Community is a vibrant space to share views on
                  the platform's present and future.
                  <br /> Join the Easyswap Community and become a member today!
                </Typography>
              </div>
            </div>
            <div className={`${classes.communityLinkContainer}`}>
              <div className={`${classes.communityLinkItem}`}>
                <a href={twitterLink} target="_blank">
                  <div className={`${classes.LinkBorder}`}>
                    {/* <svg
                      className={`${classes.LinkImage}`}
                      xmlns="http://www.w3.org/2000/svg"
                      width="45"
                      height="45"
                      viewBox="0 0 45 45"
                      fill="none"
                    >
                      <path
                        d="M42.1127 11.25C40.6689 11.9062 39.1127 12.3375 37.5002 12.5437C39.1502 11.55 40.4252 9.975 41.0252 8.08125C39.4689 9.01875 37.7439 9.675 35.9252 10.05C34.4439 8.4375 32.3627 7.5 30.0002 7.5C25.5939 7.5 21.9939 11.1 21.9939 15.5437C21.9939 16.1812 22.0689 16.8 22.2002 17.3813C15.5252 17.0437 9.58145 13.8375 5.6252 8.98125C4.93145 10.1625 4.5377 11.55 4.5377 13.0125C4.5377 15.8062 5.94395 18.2812 8.11895 19.6875C6.7877 19.6875 5.5502 19.3125 4.4627 18.75C4.4627 18.75 4.4627 18.75 4.4627 18.8062C4.4627 22.7062 7.2377 25.9687 10.9127 26.7C10.2377 26.8875 9.5252 26.9812 8.79395 26.9812C8.2877 26.9812 7.78145 26.925 7.29395 26.8312C8.30645 30 11.2502 32.3625 14.7939 32.4188C12.0564 34.5938 8.5877 35.8687 4.8002 35.8687C4.1627 35.8687 3.5252 35.8312 2.8877 35.7562C6.4502 38.0437 10.6877 39.375 15.2252 39.375C30.0002 39.375 38.1189 27.1125 38.1189 16.4812C38.1189 16.125 38.1189 15.7875 38.1002 15.4312C39.6752 14.3062 41.0252 12.8812 42.1127 11.25Z"
                        fill="white"
                      />
                    </svg> */}
                    <img
                      src="/images/XIcon.png"
                      width={45}
                      className={classes.LinkImage}
                    />
                    <div className={`${classes.LinkTitle}`}>
                      {shouldShowText && (
                        <Typography style={{ color: "white" }}>X</Typography>
                      )}
                    </div>
                  </div>
                </a>
              </div>
              <div className={`${classes.communityLinkItem}`}>
                <a
                  href={telegramLink}
                  target="_blank"
                  style={{ pointerEvents: "none" }}
                >
                  <div className={`${classes.LinkBorder}`}>
                    <img
                      className={`${classes.LinkImage}`}
                      src="/images/telegram-logo-1.png"
                      style={{ height: "45px", width: "45px" }}
                    />
                    <div className={`${classes.LinkTitle}`}>
                      {shouldShowText && (
                        <Typography style={{ color: "white" }}>
                          Telegram
                        </Typography>
                      )}
                    </div>
                  </div>
                </a>
              </div>
              <div className={`${classes.communityLinkItem}`}>
                <a
                  href={mediumLink}
                  target="_blank"
                  style={{ pointerEvents: "none" }}
                >
                  <div className={`${classes.LinkBorder}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 45 43"
                      fill="none"
                      className={`${classes.LinkImage}`}
                    >
                      <g clipPath="url(#clip0_111_222)">
                        <path
                          d="M25.3823 21.5C25.3823 33.3742 19.7001 43 12.6911 43C5.68219 43 0 33.3742 0 21.5C0 9.62585 5.68219 0 12.6911 0C19.7001 0 25.3823 9.62585 25.3823 21.5Z"
                          fill="white"
                        />
                        <path
                          d="M39.3048 21.5C39.3048 32.6776 36.4638 41.7383 32.9591 41.7383C29.4544 41.7383 26.6133 32.6769 26.6133 21.5C26.6133 10.323 29.4548 1.2616 32.9595 1.2616C36.4638 1.2616 39.3048 10.3223 39.3048 21.5Z"
                          fill="white"
                        />
                        <path
                          d="M44.9998 21.5C44.9998 31.5148 44.0007 39.633 42.768 39.633C41.5352 39.633 40.5361 31.5148 40.5361 21.5C40.5361 11.4853 41.5352 3.36707 42.768 3.36707C44.0007 3.36707 44.9998 11.4853 44.9998 21.5Z"
                          fill="white"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_111_222">
                          <rect width="45" height="43" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <div className={`${classes.LinkTitle}`}>
                      {shouldShowText && (
                        <Typography style={{ color: "white" }}>
                          Medium
                        </Typography>
                      )}
                    </div>
                  </div>
                </a>
              </div>
              <div className={`${classes.communityLinkItem}`}>
                <a href={githubLink} target="_blank">
                  <div className={`${classes.LinkBorder}`}>
                    <img
                      src="/images/github-logo-1.png"
                      className={`${classes.LinkImage}`}
                      style={{ height: "45px", width: "45px" }}
                    />
                    <div className={`${classes.LinkTitle}`}>
                      {shouldShowText && (
                        <Typography style={{ color: "white" }}>
                          Github
                        </Typography>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className={`${classes.footer}`}>
            <div className={`${classes.footerLeft}`}>
              <div className={`${classes.footerLogoContainer}`}>
                <img src="/images/logo-fixed.png"></img>
              </div>
              <div className={`${classes.footerImageLinkContainer}`}>
                <div className={`${classes.footerImageLinkItems}`}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <a href={twitterLink} target="_blank">
                      <img
                        src="/images/XIcon.png"
                        width={36}
                        className={classes.LinkImage}
                      ></img>
                    </a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <a
                      href={telegramLink}
                      target="_blank"
                      style={{ pointerEvents: "none" }}
                    >
                      <img
                        className={`${classes.LinkImage}`}
                        src="/images/telegram-logo-2.png"
                        width={36}
                        height={36}
                      />
                    </a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <a
                      href={mediumLink}
                      target="_blank"
                      style={{ pointerEvents: "none" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="34"
                        height="34"
                        viewBox="0 0 41 39"
                        fill="#2B2B2B"
                        className={`${classes.LinkImage}`}
                      >
                        <g clipPath="url(#clip0_111_230)">
                          <path
                            d="M23.1261 19.5C23.1261 30.2696 17.949 39 11.563 39C5.1771 39 0 30.2696 0 19.5C0 8.73042 5.1771 0 11.563 0C17.949 0 23.1261 8.73042 23.1261 19.5Z"
                            fill="#2B2B2B"
                          />
                          <path
                            d="M35.8115 19.5C35.8115 29.6379 33.2229 37.8557 30.0298 37.8557C26.8366 37.8557 24.248 29.6373 24.248 19.5C24.248 9.36278 26.837 1.14429 30.0302 1.14429C33.2229 1.14429 35.8115 9.36212 35.8115 19.5Z"
                            fill="#2B2B2B"
                          />
                          <path
                            d="M41.0005 19.5C41.0005 28.5831 40.0902 35.9462 38.967 35.9462C37.8438 35.9462 36.9336 28.5831 36.9336 19.5C36.9336 10.4169 37.8438 3.05383 38.967 3.05383C40.0902 3.05383 41.0005 10.4169 41.0005 19.5Z"
                            fill="#2B2B2B"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_111_230">
                            <rect width="41" height="39" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <a href={githubLink} target="_blank">
                      <img
                        src="/images/github-logo-2.png"
                        className={`${classes.LinkImage}`}
                        width={36}
                        height={36}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${classes.footerRight}`}>
              <div className={`${classes.footerLinkContainer}`}>
                <div className={`${classes.footerLinkCommunity}`}>
                  <div className={`${classes.footerLinkTitle}`}>
                    <span>Community</span>
                  </div>
                  <div className={`${classes.footerLinkItems}`}>
                    <a
                      href={twitterLink}
                      className={`${classes.footerLinkItem}`}
                      target="_blank"
                    >
                      X
                    </a>
                    <a
                      href={telegramLink}
                      className={`${classes.footerLinkItem}`}
                      target="_blank"
                      style={{ pointerEvents: "none" }}
                    >
                      Telegram
                    </a>
                  </div>
                </div>
                <div className={`${classes.footerLinkLinks}`}>
                  <div className={`${classes.footerLinkTitle}`}>
                    <span>Links</span>
                  </div>
                  <div className={`${classes.footerLinkItems}`}>
                    <a
                      href={mediumLink}
                      className={`${classes.footerLinkItem}`}
                      target="_blank"
                      style={{ pointerEvents: "none" }}
                    >
                      Medium
                    </a>
                    <a
                      href="https://easyswapfi.gitbook.io/"
                      className={`${classes.footerLinkItem}`}
                      target="_blank"
                    >
                      Documentation
                    </a>
                  </div>
                </div>
                <div className={`${classes.footerLinkDevelopers}`}>
                  <div className={`${classes.footerLinkTitle}`}>
                    <span>Developers</span>
                  </div>
                  <div className={`${classes.footerLinkItems}`}>
                    <a
                      href={githubLink}
                      className={`${classes.footerLinkItem}`}
                      target="_blank"
                    >
                      Github
                    </a>
                    <a
                      href=""
                      className={`${classes.footerLinkItem}`}
                      target="_blank"
                      style={{ pointerEvents: "none" }}
                    >
                      Developers
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        id="scrollToTopButton"
        onClick={scrollToTop}
        className={`${classes.scrollToTopButton}`}
      >
        <ArrowUpward />
      </Button>
    </div>
  );
}

export default Home;
