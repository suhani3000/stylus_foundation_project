import { useState } from "react";

export const useDevAccount = () => {
  const [balance] = useState<string>("0");
  const [address] = useState<string>("");

  return { balance, address };
};
