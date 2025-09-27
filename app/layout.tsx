import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import "./globals.css"

import {
  Roboto_Slab as V0_Font_Roboto_Slab,
  Roboto_Mono as V0_Font_Roboto_Mono,
  Roboto as V0_Font_Roboto,
} from "next/font/google"

const robotoSlab = V0_Font_Roboto_Slab({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-roboto-slab",
})

const robotoMono = V0_Font_Roboto_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
})

const roboto = V0_Font_Roboto({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "TaskFlow - Linear-style Task Management",
  description: "A complete task management app with sprints, kanban boards, and issue tracking",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${roboto.variable} ${robotoMono.variable} ${robotoSlab.variable}`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
