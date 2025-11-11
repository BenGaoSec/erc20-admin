import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const { RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
  },
  etherscan: { apiKey: ETHERSCAN_API_KEY || "" },
};

export default config;
