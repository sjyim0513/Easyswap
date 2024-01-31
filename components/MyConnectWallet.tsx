import React from "react";
import { Button, Typography } from "@mui/material";

export const MyConnectWallet = ({ onClick }) => {
  return (
    <button onClick={onClick}>
      <svg
        width="160"
        height="100"
        viewBox="0 0 200 176"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <title>Layer 1</title>
          <path
            d="m182.16,31.82l-158.4,0c-2.1,0 -4.12,-0.84 -5.6,-2.33c-1.49,-1.49 -2.32,-3.52 -2.32,-5.63c0,-2.11 0.83,-4.14 2.32,-5.63c1.49,-1.49 3.5,-2.33 5.6,-2.33l134.64,0c2.1,0 4.12,-0.84 5.6,-2.33c1.49,-1.49 2.32,-3.52 2.32,-5.63c0,-2.11 -0.83,-4.14 -2.32,-5.63c-1.49,-1.49 -3.5,-2.33 -5.6,-2.33l-134.64,0c-6.31,0 -12.35,2.52 -16.8,6.99c-4.46,4.47 -6.96,10.54 -6.96,16.87l0,127.27c0,6.33 2.5,12.4 6.96,16.87c4.46,4.47 10.49,6.99 16.8,6.99l158.4,0c4.2,0 8.23,-1.68 11.2,-4.66c2.97,-2.98 4.64,-7.03 4.64,-11.25l0,-111.36c0,-4.22 -1.67,-8.26 -4.64,-11.25c-2.97,-2.98 -7,-4.66 -11.2,-4.66z"
            fill="#FF9A5F"
            id="svg_1"
          />
          <text
            fill="#ffffff"
            font-family="Helvetica"
            font-size="24"
            id="svg_2"
            stroke="#000000"
            stroke-width="0"
            text-anchor="middle"
            transform="matrix(1 0 0 0.91557 0 10.8634)"
            x="102"
            y="107.92"
          >
            Connect Wallet
          </text>
        </g>
      </svg>
    </button>
  );
};
