import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Provider } from "@/shared/ui/provider";
import { ThemeProvider } from "@/app/themes";
import { Header } from "@/widgets/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tinkersaur.us",
  description: "Context Studio - Visual context modeling tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          <ThemeProvider>
            <Header />
            {children}
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
