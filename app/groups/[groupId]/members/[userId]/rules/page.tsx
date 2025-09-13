"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const GET_ITEMS_BY_GROUP = gql`
  query GetItemsByGroup($groupID: String!) {
    itemsBygroupID(groupID: $groupID) {
      id
      name
      groupID
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

const GET_GROUP = gql`
  query GetGroup($id: String!) {
    group(id: $id) {
      id
      name
    }
  }
`

const UPSERT_EVENT_RULE = gql`
  mutation UpsertEventRule($input: UpsertEventRuleInput!) {
    UpsertEventRule(input: $input)
  }
`

export default function EventRulesPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string
  const userId = params.userId as string

  const [ruleForm, setRuleForm] = useState({
    itemID: "",
    NormalLimit: 0,
    ImportantLimit: 0,
  })

  const { data: groupData } = useQuery(GET_GROUP, {
    variables: { id: groupId },
  })

  const { data: userData } = useQuery(GET_USER, {
    variables: { id: userId },
  })

  const { data: itemsData } = useQuery(GET_ITEMS_BY_GROUP, {
    variables: { groupID: groupId },
  })

  const [upsertEventRule, { loading }] = useMutation(UPSERT_EVENT_RULE)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await upsertEventRule({
        variables: {
          input: {
            userID: userId,
            itemID: ruleForm.itemID,
            NormalLimit: ruleForm.NormalLimit,
            ImportantLimit: ruleForm.ImportantLimit,
          },
        },
      })
      router.push(`/groups/${groupId}/members`)
    } catch (error) {
      alert("イベントルールの更新に失敗しました")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={groupData?.group?.name || "グループ"} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/groups/${groupId}/members`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              メンバー一覧に戻る
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {userData?.user ? `${userData.user.lastName} ${userData.user.firstName}` : "ユーザー"}
                のイベントルール変更
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="itemID">アイテム</Label>
                  <select
                    id="itemID"
                    value={ruleForm.itemID}
                    onChange={(e) => setRuleForm({ ...ruleForm, itemID: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">アイテムを選択</option>
                    {itemsData?.itemsBygroupID?.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="normalLimit">普通な用事の週間上限</Label>
                    <Input
                      id="normalLimit"
                      type="number"
                      min="0"
                      value={ruleForm.NormalLimit}
                      onChange={(e) => setRuleForm({ ...ruleForm, NormalLimit: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="importantLimit">重要な用事の週間上限</Label>
                    <Input
                      id="importantLimit"
                      type="number"
                      min="0"
                      value={ruleForm.ImportantLimit}
                      onChange={(e) => setRuleForm({ ...ruleForm, ImportantLimit: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "更新中..." : "イベントルールを更新"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
