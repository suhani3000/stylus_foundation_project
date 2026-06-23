"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IStylusToken } from "./IStylusToken";
import { ethers } from "ethers";
import { useGlobalState } from "~~/services/store/store";

const contractAddress = "0x9039edd5b82599360c64b76fea7bf80b89208d1a"; // Get this from run-dev-node.sh output
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "");
const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY || "";
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, IStylusToken, signer);

export function DebugContracts() {
  const [balance, setBalance] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [decimals, setDecimals] = useState<number>(18);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [mintAmount, setMintAmount] = useState<string>("");
  const [burnAmount, setBurnAmount] = useState<string>("");
  const [spenderAddress, setSpenderAddress] = useState<string>("");
  const [approveAmount, setApproveAmount] = useState<string>("");
  const [allowance, setAllowance] = useState<string>("0");
  const [tokenName, setTokenName] = useState<string>("");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const addTx = useGlobalState(s => s.addTx);
  const updateTxStatus = useGlobalState(s => s.updateTxStatus);
  const [txStatus, setTxStatus] = useState<{
    status: "none" | "pending" | "success" | "error";
    message: string;
    operation?: string;
  }>({ status: "none", message: "" });

  const fetchContractInfo = async () => {
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      const totalSupply = await contract.totalSupply();
      setTokenName(name);
      setTokenSymbol(symbol);
      setDecimals(Number(decimals));
      setTotalSupply(ethers.formatUnits(totalSupply, decimals));
    } catch (error) {
      console.error("Error fetching contract info:", error);
    }
  };

  const fetchBalance = async () => {
    try {
      const balance = await contract.balanceOf(signer.address);
      setBalance(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    fetchContractInfo();
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decimals]);

  const handleTransaction = async (
    operation: () => Promise<any>,
    pendingMessage: string,
    successMessage: string,
    operationType: string,
  ) => {
    // Don't proceed if another operation is pending
    if (txStatus.status === "pending") return;

    try {
      setTxStatus({ status: "pending", message: pendingMessage, operation: operationType });
      const tx = await operation();
      if (tx?.hash) {
        addTx({
          hash: tx.hash,
          operation: operationType,
          message: pendingMessage,
          status: "pending",
          timestamp: Date.now(),
        });
      }
      if (tx) {
        await tx.wait();
      }
      setTxStatus({ status: "success", message: successMessage });
      if (tx?.hash) {
        updateTxStatus(tx.hash, "success", successMessage);
      }
      await fetchBalance();
    } catch (error: any) {
      console.error("Transaction error:", error);
      setTxStatus({
        status: "error",
        message: error.reason || error.message || "Transaction failed",
      });
      // If we threw after obtaining a tx object, try to update its status in history
      // Best-effort: we don't have the hash if the send itself failed
    }
    // Clear status after 5 seconds
    setTimeout(() => {
      setTxStatus({ status: "none", message: "" });
    }, 5000);
  };

  const mintTokens = () => {
    if (!mintAmount || isNaN(Number(mintAmount)) || Number(mintAmount) <= 0) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid mint amount",
      });
      return;
    }
    const amount = ethers.parseUnits(mintAmount, decimals);
    handleTransaction(
      () => contract.mint(amount),
      "Minting tokens...",
      `${mintAmount} tokens minted successfully!`,
      "mint",
    );
  };

  const mintToAddress = () => {
    if (!ethers.isAddress(recipientAddress)) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid Ethereum address",
      });
      return;
    }
    if (!mintAmount || isNaN(Number(mintAmount)) || Number(mintAmount) <= 0) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid mint amount",
      });
      return;
    }
    const amount = ethers.parseUnits(mintAmount, decimals);
    handleTransaction(
      () => contract.mintTo(recipientAddress, amount),
      "Minting tokens to address...",
      `${mintAmount} tokens minted to ${recipientAddress} successfully!`,
      "mintTo",
    );
  };

  const transferTokens = () => {
    if (!ethers.isAddress(recipientAddress)) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid recipient address",
      });
      return;
    }
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid transfer amount",
      });
      return;
    }
    const amount = ethers.parseUnits(transferAmount, decimals);
    handleTransaction(
      () => contract.transfer(recipientAddress, amount),
      "Transferring tokens...",
      `${transferAmount} tokens transferred to ${recipientAddress} successfully!`,
      "transfer",
    );
  };

  const approveTokens = () => {
    if (!ethers.isAddress(spenderAddress)) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid spender address",
      });
      return;
    }
    if (!approveAmount || isNaN(Number(approveAmount)) || Number(approveAmount) < 0) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid approve amount",
      });
      return;
    }
    const amount = ethers.parseUnits(approveAmount, decimals);
    handleTransaction(
      () => contract.approve(spenderAddress, amount),
      "Approving tokens...",
      `${approveAmount} tokens approved for ${spenderAddress} successfully!`,
      "approve",
    );
  };

  const checkAllowance = async () => {
    if (txStatus.status === "pending") return;

    if (!ethers.isAddress(spenderAddress)) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid spender address",
      });
      return;
    }
    try {
      setTxStatus({ status: "pending", message: "Checking allowance...", operation: "checkAllowance" });
      const allowanceAmount = await contract.allowance(signer.address, spenderAddress);
      setAllowance(ethers.formatUnits(allowanceAmount, decimals));
      setTxStatus({
        status: "success",
        message: `Allowance: ${ethers.formatUnits(allowanceAmount, decimals)} tokens`,
      });
    } catch (error: any) {
      console.error("Error checking allowance:", error);
      setAllowance("0");
      setTxStatus({
        status: "error",
        message: "Error checking allowance",
      });
    }
    // Clear status after 5 seconds
    setTimeout(() => {
      setTxStatus({ status: "none", message: "" });
    }, 5000);
  };

  const burnTokens = () => {
    if (!burnAmount || isNaN(Number(burnAmount)) || Number(burnAmount) <= 0) {
      setTxStatus({
        status: "error",
        message: "Please enter a valid burn amount",
      });
      return;
    }
    const amount = ethers.parseUnits(burnAmount, decimals);
    handleTransaction(
      () => contract.burn(amount),
      "Burning tokens...",
      `${burnAmount} tokens burned successfully!`,
      "burn",
    );
  };

  // Helper function to determine if a button should be disabled
  const isOperationDisabled = (operation: string) => {
    return txStatus.status === "pending" && (!txStatus.operation || txStatus.operation === operation);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-900/95 shadow-2xl rounded-3xl w-full max-w-5xl p-8 border border-slate-200 dark:border-blue-500/30">
        <div className="flex items-center justify-center mb-8">
          <div className="px-6 py-3 rounded-full">
            <h1 className="text-4xl font-extrabold tracking-tight text-blue-600 dark:text-cyan-400">
              {tokenName}
              <span className="text-2xl ml-2 font-semibold">({tokenSymbol})</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-8 py-6 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md text-center">
            <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-1">Your Token Balance</div>
            <div className="text-4xl font-bold text-pink-500 dark:text-pink-400">
              {balance !== "0" ? (
                balance
              ) : (
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 border-t-2 border-b-2 border-pink-500 dark:border-pink-400 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-100/80 dark:bg-blue-900/40 rounded-2xl px-8 py-6 shadow-xl border border-slate-200 dark:border-blue-500/20 backdrop-blur-md text-center">
            <div className="text-lg font-medium text-slate-600 dark:text-blue-200 mb-1">Total Supply</div>
            <div className="text-4xl font-bold text-green-500 dark:text-green-400">
              {totalSupply !== "0" ? (
                totalSupply
              ) : (
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 border-t-2 border-b-2 border-green-500 dark:border-green-400 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Status Alert */}
        {txStatus.status !== "none" && (
          <div
            className={`transition-all duration-300 alert ${
              txStatus.status === "pending"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200"
                : txStatus.status === "success"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-200"
                  : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200"
            } mb-8 border ${
              txStatus.status === "pending"
                ? "border-blue-200 dark:border-blue-500/40"
                : txStatus.status === "success"
                  ? "border-green-200 dark:border-green-500/40"
                  : "border-red-200 dark:border-red-500/40"
            } shadow-lg backdrop-blur-md rounded-2xl`}
          >
            <div className="flex items-center">
              {txStatus.status === "pending" && (
                <div className="loading loading-spinner loading-md mr-3 text-blue-500 dark:text-blue-400" />
              )}
              {txStatus.status === "success" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-green-500 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {txStatus.status === "error" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-3 text-red-500 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="font-medium">{txStatus.message}</span>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Mint Tokens Section */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">Mint Tokens</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="number"
                value={mintAmount}
                onChange={e => setMintAmount(e.target.value)}
                className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl"
                placeholder="Amount to mint"
                disabled={txStatus.status === "pending"}
              />
              <button
                className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold 
                  ${
                    isOperationDisabled("mint")
                      ? "bg-slate-200 text-slate-400 dark:bg-cyan-900/50 dark:text-cyan-300/70 cursor-not-allowed"
                      : "bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white transform hover:scale-105 transition-all duration-300"
                  }`}
                onClick={mintTokens}
                disabled={isOperationDisabled("mint")}
              >
                {txStatus.status === "pending" && txStatus.operation === "mint" ? (
                  <div className="flex items-center">
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Minting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Mint Tokens
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">Mint to Specific Address</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={e => setRecipientAddress(e.target.value)}
                  className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-96 rounded-xl"
                  placeholder="Enter recipient address"
                  disabled={txStatus.status === "pending"}
                />
                <input
                  type="number"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                  className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl"
                  placeholder="Amount to mint"
                  disabled={txStatus.status === "pending"}
                />
              </div>
              <button
                className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold 
                  ${
                    isOperationDisabled("mintTo")
                      ? "bg-slate-200 text-slate-400 dark:bg-green-900/50 dark:text-green-300/70 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white transform hover:scale-105 transition-all duration-300"
                  }`}
                onClick={mintToAddress}
                disabled={isOperationDisabled("mintTo")}
              >
                {txStatus.status === "pending" && txStatus.operation === "mintTo" ? (
                  <div className="flex items-center">
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Minting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Mint To Address
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Transfer Tokens Section */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">Transfer Tokens</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={e => setRecipientAddress(e.target.value)}
                  className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-96 rounded-xl"
                  placeholder="Enter recipient address"
                  disabled={txStatus.status === "pending"}
                />
                <input
                  type="number"
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl"
                  placeholder="Amount to transfer"
                  disabled={txStatus.status === "pending"}
                />
              </div>
              <button
                className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold 
                  ${
                    isOperationDisabled("transfer")
                      ? "bg-slate-200 text-slate-400 dark:bg-blue-900/50 dark:text-blue-300/70 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transform hover:scale-105 transition-all duration-300"
                  }`}
                onClick={transferTokens}
                disabled={isOperationDisabled("transfer")}
              >
                {txStatus.status === "pending" && txStatus.operation === "transfer" ? (
                  <div className="flex items-center">
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Transferring...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Transfer Tokens
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Approve Tokens Section */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">Approve Tokens</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={spenderAddress}
                  onChange={e => setSpenderAddress(e.target.value)}
                  className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-96 rounded-xl"
                  placeholder="Enter spender address"
                  disabled={txStatus.status === "pending"}
                />
                <input
                  type="number"
                  value={approveAmount}
                  onChange={e => setApproveAmount(e.target.value)}
                  className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl"
                  placeholder="Amount to approve"
                  disabled={txStatus.status === "pending"}
                />
              </div>
              <div className="flex gap-3">
                <button
                  className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold 
                    ${
                      isOperationDisabled("approve")
                        ? "bg-slate-200 text-slate-400 dark:bg-purple-900/50 dark:text-purple-300/70 cursor-not-allowed"
                        : "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white transform hover:scale-105 transition-all duration-300"
                    }`}
                  onClick={approveTokens}
                  disabled={isOperationDisabled("approve")}
                >
                  {txStatus.status === "pending" && txStatus.operation === "approve" ? (
                    <div className="flex items-center">
                      <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Approving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Approve
                    </div>
                  )}
                </button>
                <button
                  className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold 
                    ${
                      isOperationDisabled("checkAllowance")
                        ? "bg-slate-200 text-slate-400 dark:bg-indigo-900/50 dark:text-indigo-300/70 cursor-not-allowed"
                        : "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white transform hover:scale-105 transition-all duration-300"
                    }`}
                  onClick={checkAllowance}
                  disabled={isOperationDisabled("checkAllowance")}
                >
                  {txStatus.status === "pending" && txStatus.operation === "checkAllowance" ? (
                    <div className="flex items-center">
                      <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Checking...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Check Allowance
                    </div>
                  )}
                </button>
              </div>
              {allowance !== "0" && (
                <div className="mt-4 bg-white/70 dark:bg-blue-900/30 rounded-xl px-6 py-4 border border-slate-200 dark:border-blue-500/20">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-slate-600 dark:text-blue-200 break-all">
                      Allowance for{" "}
                      <span className="font-mono text-indigo-600 dark:text-blue-300">{spenderAddress}</span>:{" "}
                      <span className="font-semibold text-slate-800 dark:text-white">{allowance}</span> tokens
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Burn Tokens Section */}
          <div className="bg-slate-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-slate-200 dark:border-blue-500/20">
            <h2 className="text-xl font-semibold text-slate-700 dark:text-blue-200 mb-4">Burn Tokens</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <input
                type="number"
                value={burnAmount}
                onChange={e => setBurnAmount(e.target.value)}
                className="input bg-white/70 dark:bg-blue-900/30 border border-slate-300 dark:border-blue-500/30 focus:border-blue-400 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-blue-900/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/50 w-full sm:w-48 rounded-xl"
                placeholder="Amount to burn"
                disabled={txStatus.status === "pending"}
              />
              <button
                className={`btn border-0 shadow-lg px-6 rounded-xl font-semibold 
                  ${
                    isOperationDisabled("burn")
                      ? "bg-slate-200 text-slate-400 dark:bg-red-900/50 dark:text-red-300/70 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white transform hover:scale-105 transition-all duration-300"
                  }`}
                onClick={burnTokens}
                disabled={isOperationDisabled("burn")}
              >
                {txStatus.status === "pending" && txStatus.operation === "burn" ? (
                  <div className="flex items-center">
                    <div className="h-5 w-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Burning...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Burn Tokens
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* CTA: View your transactions */}
        <div className="mt-10">
          <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-purple-900/20 border border-slate-200 dark:border-blue-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white">See your transaction history</h3>
              <p className="text-slate-600 dark:text-blue-200/90">
                Open the Block Explorer tab to view all actions you performed here.
              </p>
            </div>
            <Link
              href="/blockexplorer"
              className="btn border-0 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl shadow-lg px-6"
            >
              View on Block Explorer
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h6m0 0v6m0-6L10 16" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
