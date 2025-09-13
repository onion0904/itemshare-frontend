"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, EyeOff } from "lucide-react"

const GET_USER = gql`
  query GetUser($id: String) {
    user(id: $id) {
      id
      firstName
      lastName
      email
      password
      createdAt
      updatedAt
      groupIDs
      eventIDs
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
      email
    }
  }
`

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const userId = params.userId?.[0]
  const isOwnProfile = !userId || userId === currentUser?.id

  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
  })

  const { data: userData, refetch } = useQuery(GET_USER, {
    variables: userId ? { id: userId } : {},
    onCompleted: (data) => {
      if (data?.user) {
        setEditForm({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
        })
      }
    },
  })

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER)

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateUser({
        variables: {
          input: editForm,
        },
      })
      setIsEditing(false)
      refetch()
    } catch (error) {
      alert("ユーザー情報の更新に失敗しました")
    }
  }

  const user = userData?.user

  if (!user) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ItemShare" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-2xl">{user.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">
                    {user.lastName} {user.firstName}
                  </CardTitle>
                  {isOwnProfile && <p className="text-gray-600">あなたのプロフィール</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-500">メールアドレス</Label>
                <p>{user.email}</p>
              </div>

              {isOwnProfile && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">プロフィール編集</h3>

                    {isEditing ? (
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="lastName">姓</Label>
                            <Input
                              id="lastName"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="firstName">名</Label>
                            <Input
                              id="firstName"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button type="submit" disabled={updateLoading}>
                            {updateLoading ? "更新中..." : "更新"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            キャンセル
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>名前を変更</Button>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-500">登録日</Label>
                <p>{new Date(user.createdAt).toLocaleDateString("ja-JP")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
