"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
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

const CREATE_ITEM = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      name
      groupID
    }
  }
`

const DELETE_ITEM = gql`
  mutation DeleteItem($id: String!) {
    deleteItem(id: $id)
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

export default function ItemsPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")

  const { data: groupData } = useQuery(GET_GROUP, {
    variables: { id: groupId },
  })

  const { data: itemsData, refetch } = useQuery(GET_ITEMS_BY_GROUP, {
    variables: { groupID: groupId },
  })

  const [createItem, { loading: createLoading }] = useMutation(CREATE_ITEM)
  const [deleteItem] = useMutation(DELETE_ITEM)

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createItem({
        variables: {
          input: {
            name: newItemName,
            groupID: groupId,
          },
        },
      })
      setNewItemName("")
      setIsCreateDialogOpen(false)
      refetch()
    } catch (error) {
      alert("アイテムの作成に失敗しました")
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("このアイテムを削除しますか？")) {
      try {
        await deleteItem({ variables: { id: itemId } })
        refetch()
      } catch (error) {
        alert("アイテムの削除に失敗しました")
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
          <h1 className="text-2xl font-bold">アイテム一覧</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {itemsData?.itemsBygroupID?.map((item: any) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
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
              <DialogTitle>新しいアイテムを追加</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <Label htmlFor="itemName">アイテム名</Label>
                <Input id="itemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={createLoading}>
                {createLoading ? "作成中..." : "アイテムを作成"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
