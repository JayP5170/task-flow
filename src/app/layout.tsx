import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
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
  title: {
    default: "TaskFlow | Premium Project Management SaaS",
    template: "%s | TaskFlow",
  },
  description:
    "A state-of-the-art SaaS platform for managing projects and team tasks with elegance and efficiency. Experience productivity at its peak with our premium design and seamless collaboration tools.",
  keywords: [
    "project management",
    "task management",
    "saas",
    "team collaboration",
    "productivity",
    "workflow management",
    "team tasks",
    "project tracking",
  ],
  authors: [{ name: "TaskFlow Team" }],
  creator: "TaskFlow",
  publisher: "TaskFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  metadataBase: new URL("https://task-flow-delta-inky.vercel.app"),
  alternates: {
    canonical: "https://task-flow-delta-inky.vercel.app",
  },
  openGraph: {
    title: "TaskFlow | Premium Project Management SaaS",
    description:
      "Manage your projects with elegance and efficiency. Experience productivity at its peak.",
    type: "website",
    siteName: "TaskFlow",
    locale: "en_US",
    url: "https://task-flow-delta-inky.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow | Premium Project Management SaaS",
    description: "Manage your projects with elegance and efficiency.",
    creator: "@taskflow",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "ioTmbHPTcdsVMEzpVTy4coBC5xm4IYlx_sPGQWd3TkI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-center"
          expand={false}
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "24px",
              padding: "16px",
              border: "1px solid rgba(20, 184, 166, 0.1)",
            },
            className: "font-sans font-medium",
          }}
        />
      </body>
    </html>
  );
}
