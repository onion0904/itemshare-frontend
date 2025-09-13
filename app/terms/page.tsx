import { Header } from "@/components/header"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="利用規約" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-8">利用規約</h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. 免責事項</h2>
              <p className="text-gray-700">
                本サービスの利用により生じた金銭的損失や法的問題について、開発者は一切の責任を負いません。
                ユーザーは自己責任において本サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. 利用制限</h2>
              <p className="text-gray-700">
                過度なリクエストの送信や、サーバーに負荷をかける行為は禁止されています。
                システムの安定性を保つため、適切な利用をお願いします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. コンテンツに関する注意</h2>
              <p className="text-gray-700">
                誹謗中傷、差別的発言、その他不適切な内容の投稿は禁止されています。
                他のユーザーが不快に感じる可能性のある内容の投稿はお控えください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. お問い合わせ</h2>
              <p className="text-gray-700">
                本サービスに関してご質問や問題が発生した場合は、以下のメールアドレスまでご連絡ください：
              </p>
              <p className="text-blue-600 font-mono">takerudaze0904@gmail.com</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. 規約の変更</h2>
              <p className="text-gray-700">
                本利用規約は予告なく変更される場合があります。
                変更後も継続してサービスを利用される場合は、変更後の規約に同意したものとみなします。
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
