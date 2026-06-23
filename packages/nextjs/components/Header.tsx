"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useWallet } from "~~/context/WalletContext";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  { label: "Home", href: "/" },
  { label: "Debug Contracts", href: "/debug", icon: <BugAntIcon className="h-4 w-4" /> },
  { label: "Block Explorer", href: "/blockexplorer", icon: <MagnifyingGlassIcon className="h-4 w-4" /> },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

const WalletButton = () => {
  const { address, balance, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet();

  if (!isConnected) {
    return (
      <button
        id="connect-wallet-btn"
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn btn-sm rounded-full bg-teal-500 hover:bg-teal-600 text-white border-0 px-5 font-semibold shadow transition-all duration-200"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end text-xs">
        <span className="font-mono font-semibold">{short}</span>
        <span className="text-slate-400">{balance} ETH</span>
      </div>
      <button
        id="disconnect-wallet-btn"
        onClick={disconnectWallet}
        className="btn btn-sm rounded-full bg-red-500 hover:bg-red-600 text-white border-0 px-4 font-semibold shadow transition-all duration-200"
      >
        Disconnect
      </button>
    </div>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="SE2 logo" className="cursor-pointer" fill src="/logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">ERC20 Interactor</span>
            <span className="text-xs">Arbitrum Stylus dev stack</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <WalletButton />
      </div>
    </div>
  );
};
