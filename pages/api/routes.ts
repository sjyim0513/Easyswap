import type { NextApiRequest, NextApiResponse } from "next";
import { Pair, RouteAsset } from "../../stores/types/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const host =
      window.location.hostname === "localhost"
        ? "http://43.200.19.230:8003/api/v1/configuration"
        : "/del/api/v1/configuration";

    const response = await fetch(host);
    const routeAssetsCall = (await response.json()) as { data: RouteAsset[] };

    res.status(200).json(routeAssetsCall);
  } catch (e) {
    res.status(200).json({ data: [] });
  }
}
