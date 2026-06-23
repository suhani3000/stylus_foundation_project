import { ethers } from "ethers";

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(uint256 value)",
  "function mint_to(address to, uint256 value)",
  "function burn(uint256 value)",
];

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";

/** Read-only contract — uses a static public RPC, no wallet needed */
export function readContract(address: string) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(address, ERC20_ABI, provider);
}

/** Write contract — requires a signer from the connected wallet */
export function getContract(address: string, signer: ethers.Signer) {
  return new ethers.Contract(address, ERC20_ABI, signer);
}

export type TxRecord = {
  operation: string;
  hash: string;
  status: "success" | "failed";
  timestamp: string;
};

export function saveTx(record: TxRecord) {
  if (typeof window === "undefined") return;
  const existing = getTxs();
  const updated = [record, ...existing].slice(0, 50);
  localStorage.setItem("erc20_txs", JSON.stringify(updated));
}

export function getTxs(): TxRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("erc20_txs") || "[]");
  } catch {
    return [];
  }
}
