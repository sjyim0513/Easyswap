import type { NextApiRequest, NextApiResponse } from "next";
import { Pair, RouteAsset } from "../../stores/types/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const host =
      window.location.hostname === "localhost"
        ? "http://43.200.19.230:8003/api/v1/pairs"
        : "/del/api/v1/pairs";
    const data = await fetch(host);

    const resJson = (await data.json()) as { data: Pair[] };
    const tokenPricesMap = new Map<string, number>();
    let tvl = 0;
    let tbv = 0;

    for (const pair of resJson.data) {
      if (!tokenPricesMap.has(pair.token0.address.toLowerCase())) {
        tokenPricesMap.set(
          pair.token0.address.toLowerCase(),
          (pair.token0 as RouteAsset).price
        );
      }
      if (!tokenPricesMap.has(pair.token1.address.toLowerCase())) {
        tokenPricesMap.set(
          pair.token1.address.toLowerCase(),
          (pair.token1 as RouteAsset).price
        );
      }
      tvl += pair.tvl;
      tbv += pair.gauge?.tbv ?? 0;
    }

    res
      .status(200)
      .json({ ...resJson, prices: [...tokenPricesMap.entries()], tvl, tbv });
  } catch (e) {
    res.status(200).json({ data: [] });
  }
}
