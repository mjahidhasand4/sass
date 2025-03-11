import "@/styles/globals.css";
import { FC } from "react";
import type { Metadata } from "next";
import { IChildren } from "@/types";
import { Providers } from "@/context";

export const metadata: Metadata = {
  title: "SaaS",
};

const RootLayout: FC<IChildren> = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
