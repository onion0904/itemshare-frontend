"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { gql, useMutation } from "@apollo/client"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const ACCEPT_GROUP_INVITATION = gql`
  mutation AcceptGroupInvitation($token: String!) {
    acceptGroupInvitation(token: $token) {
      id
      name
      createdAt
      updatedAt
      userIDs
      eventIDs
    }
  }
`

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [inviteToken, setInviteToken] = useState<string | null>(null)

  const [acceptInvitation, { loading }] = useMutation(ACCEPT_GROUP_INVITATION)

  useEffect(() => {
    const token = searchParams.get("token")
    setInviteToken(token)
  }, [searchParams])

  const handleAcceptInvitation = async () => {
    if (!isAuthenticated) {
      alert("ログインが必要です")
      return
    }

    if (!inviteToken) {
      alert("無効な招待リンクです")
      return
    }

    try {
      await acceptInvitation({ variables: { token: inviteToken } })
      router.push("/groups")
    } catch (error) {
      alert("招待の承諾に失敗しました")
    }
  }

  const handleDeclineInvitation = () => {
    window.close()
  }

  if (!inviteToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="ItemShare" />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-red-600">無効な招待リンクです</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ItemShare" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">グループ招待</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-gray-700">招待されたグループに参加しますか？</p>

              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">グループに参加するにはログインが必要です。</p>
                  <div className="mt-2 space-x-2">
                    <Link href="/login">
                      <Button size="sm">ログイン</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="outline" size="sm">
                        サインアップ
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button onClick={handleAcceptInvitation} disabled={loading || !isAuthenticated} className="flex-1">
                  {loading ? "参加中..." : "参加する"}
                </Button>
                <Button variant="outline" onClick={handleDeclineInvitation} className="flex-1 bg-transparent">
                  参加しない
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
