import { create } from "zustand";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  txHistory: Array<{
    hash: string;
    operation: string;
    message: string;
    status: "pending" | "success" | "error";
    timestamp: number;
  }>;
  addTx: (tx: {
    hash: string;
    operation: string;
    message: string;
    status: "pending" | "success" | "error";
    timestamp: number;
  }) => void;
  updateTxStatus: (hash: string, status: "success" | "error", message?: string) => void;
};

export const useGlobalState = create<GlobalState>(set => ({
  nativeCurrency: {
    price: 0,
    isFetching: true,
  },
  setNativeCurrencyPrice: (newValue: number): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
  setIsNativeCurrencyFetching: (newValue: boolean): void =>
    set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
  targetNetwork: scaffoldConfig.targetNetworks[0],
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),

  txHistory:
    typeof window !== "undefined" ? JSON.parse(window.localStorage.getItem("scaffold-eth-tx-history") || "[]") : [],

  addTx: tx =>
    set(state => {
      const newHistory = [tx, ...state.txHistory];
      if (typeof window !== "undefined") {
        window.localStorage.setItem("scaffold-eth-tx-history", JSON.stringify(newHistory));
      }
      return { txHistory: newHistory };
    }),

  updateTxStatus: (hash, status, message) =>
    set(state => {
      const newHistory = state.txHistory.map(t =>
        t.hash === hash ? { ...t, status, message: message ?? t.message } : t,
      );
      if (typeof window !== "undefined") {
        window.localStorage.setItem("scaffold-eth-tx-history", JSON.stringify(newHistory));
      }
      return { txHistory: newHistory };
    }),
}));
