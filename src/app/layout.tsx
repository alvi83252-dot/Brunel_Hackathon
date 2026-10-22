import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-source" });

export const metadata: Metadata = {
  title: "Brunel University Hackathon Management Portal",
  description: "Register a team, submit a project, and run judging for the Brunel University hackathon.",
  icons: {
    icon: [
      { url: "/brunel-crest.jpg", type: "image/jpeg" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("btm-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${sans.className} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
