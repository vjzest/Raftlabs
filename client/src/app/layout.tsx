import type { Metadata } from "next";
import StoreProvider from "../store/StoreProvider";
import { ToastProvider } from "../components/Toast";
import Header from "../components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "CraveBites — Order Food Online",
  description: "Order your favorite food with real-time delivery tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <StoreProvider>
          <ToastProvider>
            <Header />
            <main>{children}</main>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
