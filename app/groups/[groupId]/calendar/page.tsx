"use client"

import type React from "react"

import { useState } from "react"
import { useParams } from "next/navigation"
import { gql, useQuery, useMutation } from "@apollo/client"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Plus, Package, Users } from "lucide-react"
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

const GET_EVENTS_BY_MONTH = gql`
  query GetEventsByMonth($input: MonthlyEventInput!, $groupID: String!) {
    eventsByMonth(input: $input, groupID: $groupID) {
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
    }
  }
`

const GET_ITEMS_BY_GROUP = gql`
  query GetItemsByGroup($groupID: String!) {
    itemsBygroupID(groupID: $groupID) {
      id
      name
      groupID
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

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!, $groupID: String!) {
    createEvent(input: $input, groupID: $groupID) {
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
    }
  }
`

export default function GroupCalendarPage() {
  const params = useParams()
  const groupId = params.groupId as string

  const [currentDate, setCurrentDate] = useState(new Date())
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    itemID: "",
    together: false,
    description: "",
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    day: 1,
    important: false,
  })

  const { data: groupData } = useQuery(GET_GROUP, {
    variables: { id: groupId },
  })

  const { data: eventsData, refetch: refetchEvents } = useQuery(GET_EVENTS_BY_MONTH, {
    variables: {
      input: {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
      },
      groupID: groupId,
    },
  })

  const { data: itemsData } = useQuery(GET_ITEMS_BY_GROUP, {
    variables: { groupID: groupId },
  })

  const [createEvent, { loading: createEventLoading }] = useMutation(CREATE_EVENT)

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createEvent({
        variables: {
          input: eventForm,
          groupID: groupId,
        },
      })
      setIsCreateEventOpen(false)
      setEventForm({
        itemID: "",
        together: false,
        description: "",
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        day: 1,
        important: false,
      })
      refetchEvents()
    } catch (error: any) {
      console.error("GraphQL mutation error:", error)
      
      if (error?.graphQLErrors?.length > 0) {
        alert(error.graphQLErrors.map((e: any) => e.message).join("\n"))
      } else if (error?.networkError) {
        alert("ネットワークエラーが発生しました")
      } else {
        alert("予期せぬエラーが発生しました")
      }
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getEventsForDay = (day: number) => {
    return eventsData?.eventsByMonth?.filter((event: any) => event.day === day) || []
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDay(day)
      days.push(
        <Link
          key={day}
          href={`/groups/${groupId}/calendar/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${day}`}
          className="h-24 border border-gray-200 p-1 hover:bg-gray-50 cursor-pointer"
        >
          <div className="font-semibold">{day}</div>
          <div className="text-xs space-y-1">
            {dayEvents.slice(0, 2).map((event: any) => (
              <EventItem key={event.id} event={event} />
            ))}
            {dayEvents.length > 2 && <div className="text-gray-500">+{dayEvents.length - 2}件</div>}
          </div>
        </Link>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={groupData?.group?.name || "グループ"} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Calendar */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 border-b">
                <Button variant="outline" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                </h2>
                <Button variant="outline" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-0">
                {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                  <div key={day} className="p-2 text-center font-semibold border-b">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4">
            <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  予約作成
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新しい予約を作成</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="description">タイトル</Label>
                    <Input
                      id="description"
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="year">年</Label>
                      <Input
                        id="year"
                        type="number"
                        value={eventForm.year}
                        onChange={(e) => setEventForm({ ...eventForm, year: Number.parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="month">月</Label>
                      <Input
                        id="month"
                        type="number"
                        min="1"
                        max="12"
                        value={eventForm.month}
                        onChange={(e) => setEventForm({ ...eventForm, month: Number.parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="day">日</Label>
                      <Input
                        id="day"
                        type="number"
                        min="1"
                        max="31"
                        value={eventForm.day}
                        onChange={(e) => setEventForm({ ...eventForm, day: Number.parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="itemID">アイテム</Label>
                    <select
                      id="itemID"
                      value={eventForm.itemID}
                      onChange={(e) => setEventForm({ ...eventForm, itemID: e.target.value })}
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="important"
                      checked={eventForm.important}
                      onCheckedChange={(checked) => setEventForm({ ...eventForm, important: !!checked })}
                    />
                    <Label htmlFor="important">重要な用事</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="together"
                      checked={eventForm.together}
                      onCheckedChange={(checked) => setEventForm({ ...eventForm, together: !!checked })}
                    />
                    <Label htmlFor="together">一緒に使用可能</Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={createEventLoading}>
                    {createEventLoading ? "作成中..." : "予約を作成"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Link href={`/groups/${groupId}/items`}>
              <Button variant="outline" className="w-full bg-transparent">
                <Package className="w-4 h-4 mr-2" />
                アイテム
              </Button>
            </Link>

            <Link href={`/groups/${groupId}/members`}>
              <Button variant="outline" className="w-full bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                メンバー
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function EventItem({ event }: { event: any }) {
  const { data: itemData } = useQuery(GET_ITEM, {
    variables: { id: event.itemID },
  })

  return (
    <div className={`text-xs p-1 rounded ${event.important ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
      {itemData?.item?.name || "アイテム"}
    </div>
  )
}
