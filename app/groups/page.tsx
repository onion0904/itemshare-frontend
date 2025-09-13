"use client"

import type React from "react"

import { useState } from "react"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, QrCode, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"


const GET_GROUPS_BY_USER = gql`
  query GetGroupsByUser {
    groupsByUserID {
      id
      name
      createdAt
      updatedAt
      userIDs
      eventIDs
    }
  }
`

const CREATE_GROUP = gql`
  mutation CreateGroup($name: String!) {
    createGroup(name: $name) {
      id
      name
      createdAt
      updatedAt
      userIDs
      eventIDs
    }
  }
`

const GENERATE_QR_CODE = gql`
  mutation GenerateGroupInviteQRCode($groupID: String!) {
    generateGroupInviteQRCode(groupID: $groupID)
  }
`

const GENERATE_INVITE_LINK = gql`
  mutation GenerateGroupInviteLink($groupID: String!) {
    generateGroupInviteLink(groupID: $groupID)
  }
`

export default function GroupsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({})
  const [inviteLinks, setInviteLinks] = useState<{ [key: string]: string }>({})

  const { loading: authLoading } = useAuth() // 1. useAuthから認証ローディング状態を取得
  const { data, loading, refetch } = useQuery(GET_GROUPS_BY_USER, {
    skip: authLoading, // 2. 認証がローディング中はクエリをスキップする
  })
  const [createGroup, { loading: createLoading }] = useMutation(CREATE_GROUP)
  const [generateQRCode] = useMutation(GENERATE_QR_CODE)
  const [generateInviteLink] = useMutation(GENERATE_INVITE_LINK)

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createGroup({ 
        variables: { name: newGroupName },
        refetchQueries: [{ query: GET_GROUPS_BY_USER }]
      })
      setNewGroupName("")
      setIsCreateDialogOpen(false)
    } catch (error) {
      alert("グループの作成に失敗しました")
    }
  }

  const handleGenerateQRCode = async (groupID: string) => {
    try {
      const { data } = await generateQRCode({ variables: { groupID } })
      setQrCodes((prev) => ({ ...prev, [groupID]: data.generateGroupInviteQRCode }))
    } catch (error) {
      alert("QRコードの生成に失敗しました")
    }
  }

  const handleGenerateInviteLink = async (groupID: string) => {
    try {
      const { data } = await generateInviteLink({ variables: { groupID } })
      setInviteLinks((prev) => ({ ...prev, [groupID]: data.generateGroupInviteLink }))
      navigator.clipboard.writeText(data.generateGroupInviteLink)
      alert("招待リンクをクリップボードにコピーしました")
    } catch (error) {
      alert("招待リンクの生成に失敗しました")
    }
  }

  if (loading || authLoading) return <div>読み込み中...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="グループ" />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.groupsByUserID?.map((group: any) => (
            <Card key={group.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <Link href={`/groups/${group.id}/calendar`}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                </CardHeader>
              </Link>
              <CardContent className="space-y-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleGenerateQRCode(group.id)}>
                    <QrCode className="w-4 h-4 mr-1" />
                    QRコード
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleGenerateInviteLink(group.id)}>
                    <LinkIcon className="w-4 h-4 mr-1" />
                    リンク
                  </Button>
                </div>

                {qrCodes[group.id] && (
                  <div className="mt-2">
                    <img src={qrCodes[group.id] || "/placeholder.svg"} alt="QRコード" className="w-32 h-32 mx-auto" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14" size="lg">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいグループを作成</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Label htmlFor="groupName">グループ名</Label>
                <Input id="groupName" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={createLoading}>
                {createLoading ? "作成中..." : "グループを作成"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
