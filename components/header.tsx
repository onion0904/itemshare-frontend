"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-primary">
              ホーム
            </Link>
            <Link href="/groups" className="hover:text-primary">
              グループ
            </Link>
            <Link href="/terms" className="hover:text-primary">
              利用規約
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Avatar className="cursor-pointer">
                    <AvatarFallback>{user?.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">ログイン</Button>
                </Link>
                <Link href="/signup">
                  <Button>サインアップ</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
