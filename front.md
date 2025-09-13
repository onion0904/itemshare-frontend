フロントエンドはhttp://localhost:3000で動かす。
# ページ一覧（以下をこれからは番号で呼ぶ場合がある）
1. ホーム
2. サインアップ
3. ログイン
4. グループ管理
5. グループ作成
6. グループのカレンダー
7. 日ごとの予約一覧
8. 予約作成
9. アイテム一覧
10. アイテム追加
11. プロフィール
12. 利用規約
13. 招待承諾
14. グループメンバー一覧
15. メンバーのイベントルール変更

# GraphQL API ドキュメント

## 基本情報
- **エンドポイント**: `http://localhost:8080/query`
- **プロトコル**: GraphQL

## 認証
`@isAuthenticated` ディレクティブが付いているクエリ・ミューテーションには認証が必要です。

---

## スカラー型

### DateTime
`2025-02-02T12:00:00Z` のような ISO 8601 形式の日時を表します。

---


## 使用例

### ユーザー登録の例
```graphql
# 1. 認証コード送信
mutation {
  sendVerificationCode(email: "user@example.com")
}

# 2. ユーザー登録
mutation {
  signup(
    input: {
      lastName: "田中"
      firstName: "太郎"
      email: "user@example.com"
      password: "password123"
    }
    vcode: "123456"
  ) {
    token
    User {
      id
      lastName
      firstName
      email
    }
  }
}
```

### イベント取得の例
```graphql
query {
  eventsByMonth(
    input: {
      year: 2025
      month: 2
    }
    groupID: "group123"
  ) {
    id
    description
    date
    important
    together
  }
}
```


# ページごとの機能

## 1. ホーム
### ヘッダー
#### 左端
- **ページタイトル**: `ItemShare`
#### 中央（ナビゲーションバー）
1. **ホーム** - ホーム画面へのリンク
2. **グループ** - グループ画面へのリンク
3. **利用規約** - 利用規約画面へのリンク
#### 右端（認証状態により分岐）

##### 🔓 未認証状態（トークンを保持していない場合）
- **ログイン** ボタン - ログイン画面へのリンク
- **サインアップ** ボタン - サインアップ画面へのリンク
##### 🔒 認証済み状態（トークンを保持している場合）
- **プロフィールアイコン** - 円形アイコン内にユーザーのfirstnameを表示
  - クリック時：プロフィール画面（11番）へのリンク

- **ログアウト** ボタン - クリック時に以下を実行：
  1. 保存されているトークンを削除
  2. ホーム画面（1番）にリダイレクト（未認証状態）
### プロフィールアイコン用ユーザー情報取得
**使用API**: `user(id: String!): User! @isAuthenticated`

**実装方法**:
- `id`パラメータを指定せずに呼び出し
- トークンに含まれるユーザーIDを自動的に使用
- 自分自身の詳細情報を取得
**取得データ**:

```graphql
query {
  user {
    firstName  # プロフィール画面での表示用&プロフィールアイコンに表示
    lastName   # プロフィール画面での表示用
    id         # プロフィール画面での表示用
    email      # プロフィール画面での表示用
  }
}
```
**レスポンス例**:
```json
{
  "data": {
    "user": {
      "firstName": "太郎",
      "lastName": "田中",
      "id": "user123",
      "email": "taro@example.com"
    }
  }
}
```

- ボディ
	 - サイトの説明
	 -  使い方

- フッター
	 - 開発者のportfolioリンク(onion0904.dev)
	 - などなど
	   

## 2. サインアップ
いかで挙げる二つのページのbottomに「すでにアカウントをお持ちの方はログイン」と書き、ログインのaタグに3のログインのページに画面遷移するようにする
### メアドを入力するページ
メアドを入力して認証コードを送信ボタンをクリック
ここで以下を使用
15. sendVerificationCode

```graphql
sendVerificationCode(email: String!): Boolean!
```

**説明**: 認証コードをメール送信  
**必要な認証**: なし
それと同時にクリックされたら次のページに遷移する

### ユーザー情報を入力
姓の入力フォーム
名の入力フォーム
メアド入力フォーム
パスワード入力フォーム
認証コード入力フォーム
を用意
そしてサインアップボタンをクリックしたら以下を使用
16. signup
```graohql
input CreateUserInput {
  lastName: String!
  firstName: String!
  email: String!
  password: String!
}
```

```graphql
type AuthUserResponse {
  token: String!
  User: User!
}
type User {
  id: String!
  lastName: String!
  firstName: String!
  email: String!
  password: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  groupIDs: [String!]!
  eventIDs: [String!]!
}
```

```graphql
signup(input: CreateUserInput!, vcode: String!): AuthUserResponse!
```

**説明**: ユーザー新規登録  
**必要な認証**: なし

成功したらトークンとfirstnameを保持してホーム画面に移動
失敗したら失敗したことをアラートする


## 3. ログイン
ページのbottomに「アカウントをお持ちでない方はサインアップ」と書き、サインアップのaタグに2のサインアップのページに画面遷移するようにする
メアドとパスワードの入力フォームを設置
ログインボタンをクリックしたら以下を実行
17. signin

```graphql
signin(email: String!, password: String!): AuthUserResponse!
```

```graphql
type AuthUserResponse {
  token: String!
  User: User!
}
type User {
  id: String!
  lastName: String!
  firstName: String!
  email: String!
  password: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  groupIDs: [String!]!
  eventIDs: [String!]!
}
```
**説明**: ユーザーサインイン  
**必要な認証**: なし

成功したらトークンとfirstnameを保持してホーム画面に移動
失敗したら失敗したことをアラートする

## 4. グループ管理

### ヘッダー
 左端
- **ページタイトル**: `グループ`
その他のヘッダーは1のホームと同じ

### ボディ
カード形式でユーザーが所属するグループを表示
カードの中はグループ名と招待用QRコードボタンと招待リンクボタン。カードをクリックしたら6. グループのカレンダーページに画面遷移(ここでカードのグループIDを遷移先に渡す)。そしてページの右下に＋マーク(これをクリックしたら5. グループ作成ページをポップアップ)。

#### グループ名は
```
groupsByUserID: [Group!]! @isAuthenticated
```

```
type Group {
  id: String!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  userIDs: [String!]!
  eventIDs: [String!]!
}
```
で取得。

#### 招待用QRコードは以下を使用
8. generateGroupInviteQRCode

```graphql
generateGroupInviteQRCode(groupID: String!): String! @isAuthenticated
```

**説明**: 招待用のQRコードを生成 (Base64エンコードされた画像データ)  
**必要な認証**: あり
返されたものをimgタグのsrcに丸ごと入れるとQRコードを表示できる

#### 招待用リンクは以下を使用
7. generateGroupInviteLink

```graphql
generateGroupInviteLink(groupID: String!): String! @isAuthenticated
```

**説明**: 招待リンクを生成  
**必要な認証**: あり


## 5. グループ作成
このページは
4. グループ管理からのポップアップで表示される
グループ名を入力するフォームとグループ作成ボタンを設置。グループ作成ボタンで以下を実行
3. createGroup

```graphql
createGroup(name: String!): Group! @isAuthenticated
```

```graphql
type Group {
  id: String!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  userIDs: [String!]!
  eventIDs: [String!]!
}
```

**説明**: 新しいグループを作成  
**必要な認証**: あり

成功したらポップアップを閉じる
失敗したら失敗をアラート

## 6. グループごとのカレンダー

### ヘッダー
 左端
- **ページタイトル**: {グループ名}
4. グループ管理ページから受け取ったgroupIDを使用して以下を実行してグループ名を取得
2. group
```graphql
group(id: String!): Group! @isAuthenticated
```

```
type Group {
  id: String!
  name: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  userIDs: [String!]!
  eventIDs: [String!]!
}
```

**説明**: 指定されたIDのグループ情報を取得  
**必要な認証**: あり
その他のヘッダーは1のホームと同じ

### ボディ
左70%位を月ごとのカレンダー、右30%位に予約作成ボタン(8. 予約作成をポップアップする)とアイテムボタン(9. アイテム一覧に画面遷移groupIDを渡す)とメンバーボタン(14. グループメンバー一覧に画面遷移groupIDを渡す)を縦に並べる。

#### カレンダー
以下を実行して得られた情報を基にカレンダーを埋める
カレンダーの1日の枠の中にその日の予約されてるアイテム名を表示
5. eventsByMonth

```graphql
eventsByMonth(input: MonthlyEventInput!, groupID: String!): [Event!]! @isAuthenticated

とりあえず、最初は現在のyearとmonthをinputに入れる。
次の月ボタンなどを押されたら、それに応じてまたAPIを叩く
```

```
input MonthlyEventInput { year: Int! month: Int! }
```

**説明**: 指定された年月とグループのイベント一覧を取得  
**必要な認証**: あり

7. item

```graphql
item(id: String!): Item! @isAuthenticated
```

```
type Item {
  id: String!
  name: String!
  groupID: String!
}
```
**説明**: 指定されたIDのアイテム情報を取得  
**必要な認証**: あり

カレンダーの日にちを押したら7. 日ごとの予約一覧に画面遷移(選択したyear,month,dayとgroupIDを画面遷移先に渡す)

## 7. 日ごとの予約一覧
日付とカード形式でイベント情報を並べる。
イベント情報にはアイテム名、ユーザー名、普通か重要か、description内容、deleteボタンを入れる

イベント情報は以下で取得
6. グループのカレンダーから渡されたyear,month,dayとgroupIDを使用して以下を実行して情報を取得

6. eventsByDay
```graphql
eventsByDay(input: DailyEventInput!, groupID: String!): [Event!]! @isAuthenticated
```

```
input DailyEventInput { year: Int! month: Int! day: Int! }

type Event {
  id: String!
  userID: String!
  itemID: String!
  together: Boolean!
  description: String!
  year: Int!
  month: Int!
  day: Int!
  date: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
  startDate: DateTime!
  endDate: DateTime!
  important: Boolean!
}
```
**説明**: 指定された日とグループのイベント一覧を取得  
**必要な認証**: あり

7. item

```graphql
item(id: String!): Item! @isAuthenticated
```

```
type Item {
  id: String!
  name: String!
  groupID: String!
}
```
**説明**: 指定されたIDのアイテム情報を取得  
**必要な認証**: あり

deleteボタンでは以下を実行
11. deleteEvent

```graphql
deleteEvent(id: String!): Boolean! @isAuthenticated
```

**説明**: イベントを削除  
**必要な認証**: あり

## 8. 予約作成
タイトル、日付、メモの入力フォーム。
重要な用事かどうか、一緒に使うのは可能か、どのアイテムかアイテムのチェックボックス。
予約を作成のボタンを設置。
どのアイテムかは6. グループのカレンダーで受け取ったgroupIDを用いて以下を実行
8. itemsBygroupID
```graphql
itemsBygroupID(groupID: String!): [Item!]! @isAuthenticated
```

```
type Item {
  id: String!
  name: String!
  groupID: String!
}
```
**説明**: 指定されたグループIDのアイテム一覧を取得  
**必要な認証**: あり

予約作成ボタンを押されたら以下を実行
10. createEvent

```graphql
createEvent(input: CreateEventInput!, groupID: String!): Event! @isAuthenticated
```

```
input CreateEventInput {
  itemID: String!
  together: Boolean!
  description: String!
  year: Int!
  month: Int!
  day: Int!
  important: Boolean!
}
```
**説明**: 新しいイベントを作成  
**必要な認証**: あり

成功したら6. グループのカレンダーに画面遷移。失敗したら失敗をアラートする。

## 9. アイテム一覧
このページの右下に＋ボタンを設置(これをクリックしたら10. アイテム追加をポップアップ)。
アイテムをカード形式で表示
アイテムのカードにはアイテム名とdeleteボタンを含める。
6. グループのカレンダーから受け取ったgroupIDを用いて以下を実行してアイテム情報を取得
8. itemsBygroupID
```graphql
itemsBygroupID(groupID: String!): [Item!]! @isAuthenticated
```

```
type Item {
  id: String!
  name: String!
  groupID: String!
}
```
**説明**: 指定されたグループIDのアイテム一覧を取得  
**必要な認証**: あり

deleteボタンを押されたら以下を実行
13. deleteItem

```graphql
deleteItem(id: String!): Boolean! @isAuthenticated
```

**説明**: アイテムを削除  
**必要な認証**: あり

## 10. アイテムを追加
このページは9. アイテムを追加ページのポップアップで表示される。
アイテム名の入力フォームとアイテム作成ボタンを設置。
アイテム作成ボタンをクリックしたら以下を実行

12. createItem

```graphql
createItem(input: CreateItemInput!): Item! @isAuthenticated
```

```
input CreateItemInput { name: String! groupID: String! }
```
**説明**: 新しいアイテムを作成  
**必要な認証**: あり

成功したらポップアップを閉じる
失敗したら失敗をアラート

## 11. プロフィール
ユーザーのプロフィールを表示。以下でユーザー情報を取得。id無しの時に受け取れたら本人。それ以外はidありで受け取る。本人の時はidありでも本人の詳細情報は受け取れる。
1. user

```graphql
user(id: String!): User! @isAuthenticated
```

```
type User {
  id: String!
  lastName: String!
  firstName: String!
  email: String!
  password: String!
  createdAt: DateTime!
  updatedAt: DateTime!
  groupIDs: [String!]!
  eventIDs: [String!]!
}
```
**説明**: 指定されたIDのユーザー情報を取得  
**必要な認証**: あり
### 本人の時
- **プロフィールアイコン** - 円形アイコン内にユーザーのfirstnameを表示
- firstnameとlastnameをつなげたもの
- パスワード(表示を押されるまでは伏せてで表示する)
- 姓と名の入力フォーム
- 名前を変更ボタン
名前を変更ボタンを押されたら以下を実行
1. updateUser

```graphql
updateUser(input: UpdateUserInput!): User! @isAuthenticated
```

```
input UpdateUserInput {
  lastName: String
  firstName: String
}
```
**説明**: ユーザー情報を更新  
**必要な認証**: あり

### 本人じゃない時
id: String!
  lastName: String!
  firstName: String!
  この三つが返される
これを基に本人の時のように表示

## 12. 利用規約
金銭や法的な問題は開発者は責任を負いません。過度なリクエストを送るのはおやめください。誹謗中傷的な内容を入力することへの注意。何か問題があった場合はtakerudaze0904@gmail.comに。などのことを書く。
## 13. 招待承諾
これはグループの招待QRコード先orリンク先のページである。http://localhost:3000/invite?token=...このようなリンクを叩かれた先がここ。
このページでは招待されたグループに入りますか？という文字と「入る」「入らない」の二つのボタンを設置。
### 入るボタンを押されたら
以下を実行
9. acceptGroupInvitation

```graphql
acceptGroupInvitation(token: String!): Group! @isAuthenticated
```
このトークンにはhttp://localhost:3000/invite?token=...このクエリパラメータのトークンを使用
**説明**: 招待を承諾  
**必要な認証**: あり

もし、ユーザーの認証がされていない場合は2. サインアップ
3. ログインをさせてから入るを押しなおさせる。
成功したら4. グループ管理に画面遷移。
失敗したら失敗をアラート。
入らないを押されたら、ウィンドウを閉じる。

## 14. グループメンバー一覧
グループに所属しているユーザーをカード形式で表示。
カードの中には プロフィールアイコン(円形アイコン内にユーザーのfirstnameを表示)とルール変更ボタン(押されたら15. メンバーのイベントルール変更に画面遷移(groupIDとカードのuserIDを渡す))とdeleteボタンを設置。カードorプロフィールアイコンをクリックしたら11. プロフィールに画面遷移(userIDを渡す)。

### ユーザー情報の取得
6. グループのカレンダーから与えられたgroupIDを使用して以下を実行してユーザー情報を取得
2. group
```graphql
group(id: String!): Group! @isAuthenticated
```

**説明**: 指定されたIDのグループ情報を取得  
**必要な認証**: あり

1. user
Groupに含まれてるuserIDsを使用
トークンのidも使用するため、本人の時だけ詳細な情報が得られるため、安全。
```graphql
user(id: String!): User! @isAuthenticated
```

**説明**: 指定されたIDのユーザー情報を取得  
**必要な認証**: あり

### deleteボタンを押されたら
 グループのカレンダーから与えられたgroupIDを使用
 選択されたカードのuserIDを使用
以下を実行
6. removeUserFromGroup

```graphql
removeUserFromGroup(groupID: String!, userID: String!): Group! @isAuthenticated
```

**説明**: グループからユーザーを削除  
**必要な認証**: あり

## 15. メンバーのイベントルール変更
ドロップダウンメニューでアイテムを選択する。アイテムの一覧は以下で取得
8. itemsBygroupID
```graphql
itemsBygroupID(groupID: String!): [Item!]! @isAuthenticated
```
**説明**: 指定されたグループIDのアイテム一覧を取得  
**必要な認証**: あり

一週間に予約できる普通な用事の上限と重要な用事の上限の入力フォームを設置。
イベントルールの変更ボタンを設置。
イベントルールの変更ボタンを押されたら以下を実行。
14. グループメンバー一覧から渡されたuserIDとgroupIDを使用して以下を実行
14. UpsertEventRule

```graphql
UpsertEventRule(input: UpsertEventRuleInput!): Boolean! @isAuthenticated
```

```
input UpsertEventRuleInput { userID: String! itemID: String! NormalLimit: Int! ImportantLimit: Int! }
```
**説明**: イベントルールを作成または更新  
**必要な認証**: あり

成功したら14. グループメンバー一覧に画面遷移
失敗したら失敗をアラート
