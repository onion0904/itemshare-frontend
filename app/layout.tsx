import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ApolloProviderWrapper } from "@/components/apollo-provider"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ItemShare",
  description: "アイテム共有アプリケーション",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ApolloProviderWrapper>
          <AuthProvider>{children}</AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  )
}
