"use client"

import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Settings, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const GET_GROUP = gql`
  query GetGroup($id: String!) {
    group(id: $id) {
      id
      name
      createdAt
      updatedAt
      userIDs
      eventIDs
    }
  }
`

const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      firstName
      lastName
      email
    }
  }
`

const REMOVE_USER_FROM_GROUP = gql`
  mutation RemoveUserFromGroup($groupID: String!, $userID: String!) {
    removeUserFromGroup(groupID: $groupID, userID: $userID) {
      id
      name
      userIDs
    }
  }
`

export default function GroupMembersPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const { data: groupData, refetch } = useQuery(GET_GROUP, {
    variables: { id: groupId },
  })

  const [removeUserFromGroup] = useMutation(REMOVE_USER_FROM_GROUP)

  const handleRemoveUser = async (userId: string) => {
    if (confirm("このユーザーをグループから削除しますか？")) {
      try {
        await removeUserFromGroup({
          variables: {
            groupID: groupId,
            userID: userId,
          },
        })
        refetch()
      } catch (error) {
        alert("ユーザーの削除に失敗しました")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={groupData?.group?.name || "グループ"} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/groups/${groupId}/calendar`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              カレンダーに戻る
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">グループメンバー</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupData?.group?.userIDs?.map((userId: string) => (
            <MemberCard key={userId} userId={userId} groupId={groupId} onRemove={handleRemoveUser} />
          ))}
        </div>
      </main>
    </div>
  )
}

function MemberCard({
  userId,
  groupId,
  onRemove,
}: { userId: string; groupId: string; onRemove: (userId: string) => void }) {
  const { data: userData } = useQuery(GET_USER, {
    variables: { id: userId },
  })

  const user = userData?.user

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <div>読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Link href={`/profile/${userId}`}>
            <Avatar className="cursor-pointer">
              <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <Link href={`/profile/${userId}`}>
              <CardTitle className="text-lg hover:text-blue-600">
                {user.lastName} {user.firstName}
              </CardTitle>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Link href={`/groups/${groupId}/members/${userId}/rules`}>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              ルール変更
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => onRemove(userId)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
