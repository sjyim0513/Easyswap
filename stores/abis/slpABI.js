export const slpABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_WETHAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_ROLLRouter",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_maxSlpReverseRatio",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountTokens",
        type: "uint256",
      },
    ],
    name: "AdminTokenRecovery",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "maxSlpReverseRatio",
        type: "uint256",
      },
    ],
    name: "NewMaxSlpReverseRatio",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenToSlp",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "lpToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lpTokenAmountReceived",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "SlpIn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0ToSlp",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1ToSlp",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "lpToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token0AmountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token1AmountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lpTokenAmountReceived",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "SlpInRebalancing",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "lpToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenToReceive",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "lpTokenAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenAmountReceived",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "SlpOut",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_INT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINIMUM_AMOUNT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ROLLRouter",
    outputs: [
      {
        internalType: "contract IRouter",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WETH",
    outputs: [
      {
        internalType: "contract IWETH",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_token0AmountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_tokenIn",
        type: "address",
      },
    ],
    name: "calculateAmountToSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "amountToSwap",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenToSlp",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenAmountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
    ],
    name: "estimateSlpInSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "swapAmountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "swapAmountOut",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "swapTokenOut",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_lpTokenAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_tokenToReceive",
        type: "address",
      },
    ],
    name: "estimateSlpOutSwap",
    outputs: [
      {
        internalType: "uint256",
        name: "swapAmountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "swapAmountOut",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "swapTokenOut",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSlpReverseRatio",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenAmount",
        type: "uint256",
      },
    ],
    name: "recoverWrongTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "routes",
    outputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "bool",
        name: "stable",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenAmountOutMin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "slippagetolerance",
        type: "uint256",
      },
    ],
    name: "slpInETH",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_tokenToSlp",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenAmountIn",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_tokenAmountOutMin",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "slippagetolerance",
        type: "uint256",
      },
    ],
    name: "slpInToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_lpTokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_tokenAmountOutMin",
        type: "uint256",
      },
    ],
    name: "slpOutETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_lpToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_tokenToReceive",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_lpTokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_tokenAmountOutMin",
        type: "uint256",
      },
    ],
    name: "slpOutToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_maxSlpInverseRatio",
        type: "uint256",
      },
    ],
    name: "updateMaxSlpInverseRatio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
