"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { gql, useMutation } from "@apollo/client"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const SIGNIN = gql`
  mutation Signin($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      token
      User {
        id
        firstName
        lastName
        email
      }
    }
  }
`

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const { login } = useAuth()

  const [signin, { loading }] = useMutation(SIGNIN)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data } = await signin({
        variables: {
          email: formData.email,
          password: formData.password,
        },
      })

      if (data?.signin) {
        login(data.signin.token, data.signin.User)
        router.push("/")
      }
    } catch (error) {
      alert("ログインに失敗しました")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ItemShare" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">ログイン</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "ログイン中..." : "ログイン"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                アカウントをお持ちでない方は
                <Link href="/signup" className="text-blue-600 hover:underline ml-1">
                  サインアップ
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
