import { ethers } from "ethers";

const ERC20_ABI = [
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

export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
}

export function getWallet() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY!, provider);
}

export function getContract(address: string, signerOrProvider?: any) {
  return new ethers.Contract(address, ERC20_ABI, signerOrProvider || getProvider());
}

export async function readBalance(contractAddress: string, walletAddress: string) {
  const contract = getContract(contractAddress);
  const raw = await contract.balanceOf(walletAddress);
  return parseFloat(ethers.formatUnits(raw, 18));
}

export async function readTotalSupply(contractAddress: string) {
  const contract = getContract(contractAddress);
  const raw = await contract.totalSupply();
  return parseFloat(ethers.formatUnits(raw, 18));
}

export async function sendTx(
  contractAddress: string,
  fnName: string,
  args: any[],
): Promise<{ hash: string; success: boolean; error?: string }> {
  try {
    const wallet = getWallet();
    const contract = getContract(contractAddress, wallet);
    const tx = await contract[fnName](...args);
    await tx.wait();
    return { hash: tx.hash, success: true };
  } catch (e: any) {
    return { hash: "", success: false, error: e.message };
  }
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
