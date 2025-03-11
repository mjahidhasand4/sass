"use client";
import { FC } from "react";
import { IChildren } from "@/types";
import { SessionProvider } from "next-auth/react";

export const Providers: FC<IChildren> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
