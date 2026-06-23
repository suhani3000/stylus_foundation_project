"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useWallet } from "~~/context/WalletContext";

const Home: NextPage = () => {
  const { address, isConnected, isConnecting, connectWallet } = useWallet();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">ERC20 Token Stylus Contract</span>
          </h1>

          {!isConnected ? (
            <div className="flex justify-center mt-8">
              <button
                id="home-connect-wallet-btn"
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn rounded-full bg-teal-500 hover:bg-teal-600 text-white border-0 px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-200"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mt-4">
              <p className="my-2 font-medium">Connected Address:</p>
              <span className="font-mono text-sm bg-base-300 px-3 py-1 rounded-full">{address}</span>
            </div>
          )}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
