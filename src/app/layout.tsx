import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { Provider } from "@/shared/ui/provider";
import { ThemeProvider } from "@/app/themes";
import { Header } from "@/widgets/header";
import "./globals.css";

const nunitoSans = localFont({
  src: [
    {
      path: "../fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-nunito-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
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
        className={`${nunitoSans.variable} ${geistMono.variable} antialiased`}
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
