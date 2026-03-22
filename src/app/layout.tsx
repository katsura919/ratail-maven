import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Retail Coaching & Consulting for Independent Retailers | RETAILMavens",
  description:
    "Retail coaching & consulting that empowers independent retailers to have more freedom, increased profits and better sleep.",
  openGraph: {
    title: "Retail Coaching & Consulting for Independent Retailers | RETAILMavens",
    description:
      "Retail coaching & consulting that empowers independent retailers to have more freedom, increased profits and better sleep.",
    url: "https://retailmavens.com/",
    siteName: "RETAILMavens",
    images: [
      {
        url: "https://retailmavens.com/wp-content/uploads/2025/09/RETAILSMavens-Coaching.webp",
        width: 479,
        height: 447,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retail Coaching & Consulting for Independent Retailers | RETAILMavens",
    description:
      "Retail coaching & consulting that empowers independent retailers to have more freedom, increased profits and better sleep.",
    images: ["https://retailmavens.com/wp-content/uploads/2025/09/RETAILSMavens-Coaching.webp"],
  },
  icons: {
    icon: "https://retailmavens.com/wp-content/uploads/2018/09/cropped-favicon-32x32.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
