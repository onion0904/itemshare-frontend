"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { gql, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const SEND_VERIFICATION_CODE = gql`
  mutation SendVerificationCode($email: String!) {
    sendVerificationCode(email: $email)
  }
`

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(1)
  const router = useRouter()

  const [sendVerificationCode, { loading }] = useMutation(SEND_VERIFICATION_CODE)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await sendVerificationCode({ variables: { email } })
      setStep(2)
    } catch (error) {
      alert("認証コードの送信に失敗しました")
    }
  }

  if (step === 2) {
    return <SignupFormPage email={email} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ItemShare" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">サインアップ</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "送信中..." : "認証コードを送信"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                すでにアカウントをお持ちの方は
                <Link href="/login" className="text-blue-600 hover:underline ml-1">
                  ログイン
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

const SIGNUP = gql`
  mutation Signup($input: CreateUserInput!, $vcode: String!) {
    signup(input: $input, vcode: $vcode) {
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

function SignupFormPage({ email }: { email: string }) {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    password: "",
    vcode: "",
  })
  const router = useRouter()

  const [signup, { loading }] = useMutation(SIGNUP)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data } = await signup({
        variables: {
          input: {
            lastName: formData.lastName,
            firstName: formData.firstName,
            email,
            password: formData.password,
          },
          vcode: formData.vcode,
        },
      })

      if (data?.signup) {
        localStorage.setItem("token", data.signup.token)
        router.push("/")
      }
    } catch (error) {
      alert("サインアップに失敗しました")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ItemShare" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">ユーザー情報入力</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastName">姓</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstName">名</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" type="email" value={email} disabled />
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

                <div>
                  <Label htmlFor="vcode">認証コード</Label>
                  <Input
                    id="vcode"
                    value={formData.vcode}
                    onChange={(e) => setFormData({ ...formData, vcode: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "登録中..." : "サインアップ"}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                すでにアカウントをお持ちの方は
                <Link href="/login" className="text-blue-600 hover:underline ml-1">
                  ログイン
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
