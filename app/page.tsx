import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="ItemShare" />

      <main className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">ItemShareへようこそ</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              グループでアイテムを共有し、効率的に管理できるプラットフォームです。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">グループ管理</h3>
              <p className="text-gray-600">複数のグループを作成し、メンバーを招待してアイテムを共有できます。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">予約システム</h3>
              <p className="text-gray-600">カレンダー機能でアイテムの予約状況を一目で確認できます。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">簡単招待</h3>
              <p className="text-gray-600">QRコードやリンクで簡単にメンバーをグループに招待できます。</p>
            </div>
          </div>

          <div className="space-x-4">
            <Link href="/signup">
              <Button size="lg">今すぐ始める</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                ログイン
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
