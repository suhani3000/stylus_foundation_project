"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import {
  ArrowTopRightOnSquareIcon,
  BugAntIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";

const BlockExplorer: NextPage = () => {
  const txHistory = useGlobalState(s => s.txHistory);
  const items = useMemo(() => txHistory, [txHistory]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
          <BugAntIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Block Explorer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Track and explore all your Stylus ERC20 token transactions on Arbitrum Sepolia
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4 mx-auto">
            <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time Tracking</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Monitor your transactions as they happen on the blockchain
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4 mx-auto">
            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Secure & Verified</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            All transactions are verified and secured on Arbitrum Sepolia
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4 mx-auto">
            <ArrowTopRightOnSquareIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Block Explorer Links</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Direct links to view transactions on Arbiscan</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-600 max-w-2xl w-full">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 mx-auto">
          <ExclamationTriangleIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Interacting with Contracts!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          No transactions found yet. Begin your journey by minting, transferring, approving, or burning tokens using our
          debug interface.
        </p>
        <Link
          href="/debug"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <BugAntIcon className="w-5 h-5 mr-2" />
          Go to Debug Contracts
        </Link>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Operations</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Mint new tokens
            </li>
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Transfer tokens between addresses
            </li>
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              Approve token spending
            </li>
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              Burn tokens
            </li>
          </ul>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What You&apos;ll See</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              Real-time transaction status
            </li>
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
              Transaction hashes and details
            </li>
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
              Direct links to Arbiscan
            </li>
            <li className="flex items-center text-gray-600 dark:text-gray-300">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
              Timestamps and operation types
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const TransactionTable = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Transaction History
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {items.length} transaction{items.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Operation</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Transaction Hash</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Explorer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((tx, index) => (
                <tr
                  key={tx.hash}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}`}
                >
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                      {tx.operation}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tx.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : tx.status === "success"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <code
                      className="text-sm bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded font-mono break-all"
                      title={tx.message}
                    >
                      {tx.hash}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                      View on Arbiscan
                    </a>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">{items.length === 0 ? <EmptyState /> : <TransactionTable />}</div>
  );
};

export default BlockExplorer;
