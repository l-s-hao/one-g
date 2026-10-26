import { BASE_PATH } from "./src/lib/route-paths";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  output: "export",
  trailingSlash: true,
  basePath: BASE_PATH,
  assetPrefix: `${BASE_PATH}/`,
  images: { unoptimized: true },
};

export default nextConfig;
