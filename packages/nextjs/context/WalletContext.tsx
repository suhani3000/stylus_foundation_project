"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
const ARBITRUM_SEPOLIA_HEX = "0x" + ARBITRUM_SEPOLIA_CHAIN_ID.toString(16);

const ARBITRUM_SEPOLIA_PARAMS = {
  chainId: ARBITRUM_SEPOLIA_HEX,
  chainName: "Arbitrum Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"],
};

type WalletContextType = {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  signer: ethers.JsonRpcSigner | null;
  provider: ethers.BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
};

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  isConnected: false,
  isConnecting: false,
  signer: null,
  provider: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  error: null,
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!address;

  const ensureArbitrumSepolia = async (ethProvider: ethers.BrowserProvider) => {
    const network = await ethProvider.getNetwork();
    if (Number(network.chainId) !== ARBITRUM_SEPOLIA_CHAIN_ID) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ARBITRUM_SEPOLIA_HEX }],
        });
      } catch (switchError: any) {
        // Chain not added yet — add it
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [ARBITRUM_SEPOLIA_PARAMS],
          });
        } else {
          throw switchError;
        }
      }
    }
  };

  const setupWallet = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
      await ensureArbitrumSepolia(ethProvider);
      const ethSigner = await ethProvider.getSigner();
      const addr = await ethSigner.getAddress();
      const rawBalance = await ethProvider.getBalance(addr);
      const formattedBalance = parseFloat(ethers.formatEther(rawBalance)).toFixed(4);
      setProvider(ethProvider);
      setSigner(ethSigner);
      setAddress(addr);
      setBalance(formattedBalance);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to connect");
      localStorage.removeItem("wallet_connected");
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("MetaMask not found. Please install it.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      await setupWallet();
      localStorage.setItem("wallet_connected", "true");
    } catch (e: any) {
      setError(e.message || "Connection rejected");
    } finally {
      setIsConnecting(false);
    }
  }, [setupWallet]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setBalance(null);
    setSigner(null);
    setProvider(null);
    setError(null);
    localStorage.removeItem("wallet_connected");
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    if (localStorage.getItem("wallet_connected") === "true") {
      setupWallet();
    }
  }, [setupWallet]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setupWallet();
      }
    };

    const handleChainChanged = () => {
      setupWallet();
    };

    (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
    (window as any).ethereum.on("chainChanged", handleChainChanged);

    return () => {
      (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [setupWallet, disconnectWallet]);

  return (
    <WalletContext.Provider
      value={{ address, balance, isConnected, isConnecting, signer, provider, connectWallet, disconnectWallet, error }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
