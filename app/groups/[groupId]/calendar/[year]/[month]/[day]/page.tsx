"use client"

import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const GET_EVENTS_BY_DAY = gql`
  query GetEventsByDay($input: DailyEventInput!, $groupID: String!) {
    eventsByDay(input: $input, groupID: $groupID) {
      id
      userID
      itemID
      together
      description
      year
      month
      day
      date
      important
      createdAt
      updatedAt
      startDate
      endDate
    }
  }
`

const GET_ITEM = gql`
  query GetItem($id: String!) {
    item(id: $id) {
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

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
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

export default function DailyEventsPage() {
  const params = useParams()
  const groupId = params.groupId as string
  const year = Number(params.year)
  const month = Number(params.month)
  const day = Number(params.day)

  const { data: groupData } = useQuery(GET_GROUP, {
    variables: { id: groupId },
  })

  const { data: eventsData, refetch } = useQuery(GET_EVENTS_BY_DAY, {
    variables: {
      input: { year, month, day },
      groupID: groupId,
    },
  })

  const [deleteEvent] = useMutation(DELETE_EVENT)

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("この予約を削除しますか？")) {
      try {
        await deleteEvent({ variables: { id: eventId } })
        refetch()
      } catch (error) {
        alert("予約の削除に失敗しました")
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
          <h1 className="text-2xl font-bold">
            {year}年{month}月{day}日の予約一覧
          </h1>
        </div>

        <div className="space-y-4">
          {eventsData?.eventsByDay?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">この日の予約はありません</CardContent>
            </Card>
          ) : (
            eventsData?.eventsByDay?.map((event: any) => (
              <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
            ))
          )}
        </div>
      </main>
    </div>
  )
}

function EventCard({ event, onDelete }: { event: any; onDelete: (id: string) => void }) {
  const { data: itemData } = useQuery(GET_ITEM, {
    variables: { id: event.itemID },
  })

  const { data: userData } = useQuery(GET_USER, {
    variables: { id: event.userID },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {event.description}
            {event.important && <Badge variant="destructive" className="bg-red-600 text-white border-red-700">重要</Badge>}
            {event.together && <Badge variant="secondary">共有可能</Badge>}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => onDelete(event.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">アイテム: </span>
            {itemData?.item?.name || "読み込み中..."}
          </div>
          <div>
            <span className="font-semibold">予約者: </span>
            {userData?.user ? `${userData.user.lastName} ${userData.user.firstName}` : "読み込み中..."}
          </div>
          <div>
            <span className="font-semibold">作成日時: </span>
            {new Date(event.createdAt).toLocaleString("ja-JP")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
