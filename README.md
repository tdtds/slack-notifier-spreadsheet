# Slack Notifier Spreadsheet
## Slack Notifier Spreadsheetとは?
Slack Notifier Spreadsheetは、Googleスプレッドシートで指定した時刻になったらメッセージをSlackの指定チャンネルに投稿してくれるSlackボットです。その際、指定した複数の延長時間をボタンで表示して、次の通知時刻を再予約できます。一定時間おきに実行するタスクがあって、次のタスクの実施時間がそのタスクの状況次第でいくつかの選択肢があるような場合に有用です。

たとえば、ポモドーロタイマーを作るとしましょう。ポモドーロテクニックでは、25分の作業と5分の休憩を交互に行います。作業スタートの通知で、次の通知を25分後に設定し、その次の通知で5分に設定……これを繰り返せれば良さそうです。しかしSlack組み込みのリマインダは、20分、1時間、3時間といった変更できないお仕着せの間隔でしか延長できないので、使えません。このような場合にSlack Notifier Spreadsheetが使えます。

以下はSlack Notifier Spreadsheetの動作イメージです。まず、指定したメッセージと延長時間の選択肢が通知されます:

![メッセージとともに選択肢として10時間と3時間の延長を表示している](https://lh3.googleusercontent.com/TYWOUzwPJItlsT6VJm1xwxXADKn_hFHf2OnZ-17-z3ODtOfA62GrWR3KonrAraRN_KzmmTJlwrGf6AtKm94k36GqA0uMzadp9sbPd-g7gzsB0P7Evb0HevsoWSmBpku-006yd4_qT22Ay2NjPVpopZlPFcPqaRZT2L9rV-2ORgEPwxBhMnSbh2DuW0uASIbP5rQWN63_YFlb3_hFyrDU5ztMzrSDZ31TjicDD4ITLv97te2LFecqDoJrX1_uDnlo3Jr8uAr-7-skKT5h20m8uftewy12J6ADn_UnHhTLeP4N9v-3yp0M98QrM85K5xMgfZ1WyT_3qsXwmgHZ8jrH6ukrlriaat1nWuomw8ZWgK1OBFlRD_vTUEH8d4x8fQ42_oBaCbOfMGJjlLySppdSthBlJtd_jjYf0XsGJI0_-JRNiutFfL97fbcNk7vBx6gJnYTUjH5ZW0cvUrMLenkzuCgUFfP9YYxg7OF-JFWZUQeUiT3hQqgAdV3YRP0Cx2PcJi7TdOClwKCNUdshYiqffE_S8JpMwBlbdxMafgMzMmTeNzzXAP_CXMJwYB3Ap0RjYcp5ooRgU7CwsALrl04ez1iQFoaW54FQ3_KZuHmi=w720-h504-no)

10hoursを選択すると、10時間後に同じ通知をしてくれます:

![10hoursを選択すると、10時間後に同じ通知をしてくれる](https://lh3.googleusercontent.com/pXp-iCIYDWfuNUmGle07Fa7yTSFQOI6lRn7OxxVspxxpBr55QxTwuY7U3eIZL5NwNGN3_RCWaOjbjTD_V5ttAlxKi1xD0E7UVsvEC_wnNgLQP3r6G9rL24p85pjv5e5UAI5rRwVsxJkR7zBdGrHvqn07p1FF3eQ1sTfkOMqo9HdzDHxA-9yMWfqQo-veZ4w2coLqqkffLXzDkkJp2WMDPZVc5uOhAeyXIqAxlT-hlA_pbOL_AwqWRLjimmBem0CnQgKMn22MkbfhZ5AnDXfrOprCmqCtq4lQTvdMCV6gucsn28oWVa60Zine88O7fnkJOZjkNBeN8XWqH8KkuVqGLseJM1WsJanNjF4-7uiRrfCtWMMwEvDiXsJq1P4akYaOZvTt_U2Wk5yqArTOcoB-2dNVOZw0A30O2_TR5mkEg_AUOc6_dVFTeUnOsmOPjZPjqWdzFDvpmoVdbk1Xe3brw7HCKCnOdp15fGNaBF08NBzVlGuCPtGNdwdxy4KDTU6ACTsuoFn7ra6ELJYAzuDWWtUj-6J3lHETLXhOLzdxYR-JaBOsJgLWMuaqwlyNtERj9NlDVK_vDbDiZJVNz0HC5ZC_n4B8kT_JZlCbmnJn=w720-h144-no)

Slack Notifier Spreadsheetは個人で利用するSlackボットなので、ユーザによるインストールが必要です。以下の手順に従ってインストールをしてください。

## SlackAppを作る
まず、Slack側でSlackAppをひとつ作ります。 https://api.slack.com/ にて新規アプリをしましょう。「App Name」はアプリがSlack上で発言する場合の表示名のデフォルトになります。アプリを端的にあらわす短い名前をつけましょう。「Development Slack Workspace」でアプリを開発するためのWorkspaceを指定します。このアプリは自分用なので、自分の好きにできるWorkspaceを選びます。

アプリができたら設定をします。まず「Incoming Webhooks」を選んで有効にします。そして「Add New Webhook to Workspace」で通知をするチャンネルを選び、接続します。チャンネルだけでなくDMも選択できます。テスト用なら自分へのDMにしても良いでしょう。ここで作ったWebhook URL (`https://hooks.slack.com/services/XXXXX/XXXXX/XXXXX`)はあとで使うので控えておきます。

## Googleスプレッドシート上でボットを動かす
続いて、このボットのロジックを実行する部分をGoogleスプレッドシート上に作ります。ここでボットは以下の動作をします:

1. 一定時間おきにスプレッドシートシートの内容を確認して、通知が必要なタスクをみつける
2. Slack上にそのタスクを通知する。その際、延長時間の選択肢を一緒に添付する
3. Slack上で選択された延長時間に基づいて、次のタスクをスプレッドシートに追加する

### スプレッドシートをつくる
まず、空のスプレッドシートをひとつ作ります。シート名を「tasks」に変更してください。ボットは「tasks」という名前のシートからタスクを取得します。

仮に適当なタスクを入力してみましょう。実験用なので、日時は過去の時刻にしておきます。なお、1行目は無視するので、カラムの説明を入れておきましょう。1カラム目は空です。

|  | 日時 | メッセージ | ボタン |  |  |
---|------|-----------|-------|--|--
|  | 2018-03-20 12:30 | テストメッセージ | 1min | 1hour | 1day

### スクリプトの設定をする
次に「ツール」→「スクリプト エディタ」でスクリプトエディタを開きます。空のエディタに、このプロジェクトにある[slack_notifier.gs](https://github.com/tdtds/slack-notifier-spreadsheet/blob/master/slack_notifier.gs)の中身をまるっとコピーします。

スクリプトエディタの「ファイル」→「プロジェクトのプロパティ」を選択します。途中でプロジェクト名を入力するように言われるので、適当に名前をつけておきます。「プロジェクトのプロパティ」で「スクリプトのプロパティ」タブを選択し、以下の1行追加します:

* プロパティ : slackWebhook
* 値 : さきほど控えておいたSkackAppのWebhook URL

入力が済んだら保存します。ためしに実行してみましょう。「実行」→「関数を実行」→「triggerEvent」を選ぶと(このとき、スクリプトの実行権限に関する認証ウィンドウが出るはずなので、自分のGoogleアカウントで認証します)、Skackの指定したチャンネルへメッセージとともに3つの選択肢が表示されます。ただし、まだ設定が終わっていないので、ボタンを押してもエラーになるだけです。スプレッドシートでは、最初のカラムに「済」が入力されているはずです:

|  | 日時 | メッセージ | ボタン |  |  |
---|------|-----------|-------|--|--
| 済 | 2018-03-20 12:30 | テストメッセージ | 1min | 1hour | 1day

うまく動いたら、この動作を定期的に実行するトリガーを指定します。スクリプトエディタの「編集」→「現在プロジェクトのトリガー」で、新規のトリガーを追加します。使うのは時間主導型のタイマーで、間隔は期待する精度に合わせて指定してください。一番高頻度なのは「分タイマー」の「1分ごと」になります。

### Webアプリケーションとして後悔する
最後に、このボットをSlackからアクセスできるように公開します。「公開」→「Webアプリケーションとして導入...」を選びます。「プロジェクト バージョン」を「新規作成」、「アプリケーションにアクセスできるユーザー」を「全員 (匿名ユーザを含む)」にして「導入」します。続いて表示された「現在のWebアプリケーションのURL」を控えておきます。

これでボットが動き始めました。

## SlackApp側の最終設定をする
最後に、Slack側で延長ボタンを押したときにGoogleスプレッドシート上のボットに選択肢を伝える設定をすれば完了です。

SlackAppの設定ページに戻り、右側のメニューから「Interactive Components」を選びます。「Interactive Components」を有効にすると「Request URL」を入力できるようになるので、ここに先ほど公開したボットの「現在のWebアプリケーションのURL」を指定しましょう。

これで、スプレッドシート→Slack→スプレッドシートというルートがすべて埋まりました。さきほどテストで表示されたメッセージから、「1min」を選んでみましょう。「ok, notice you again after 1min」というメッセージが表示され、スプレッドシートに1分後のタスクが追加されていれば成功です。

## タスクの入力について
スプレッドシート上のタスクは、以下のルールで入力します:

* 1カラム目 : 空なら未実施、「済」なら実施済みです。「済」になったら行ごと削除してかまいません(自動では消えません)
* 2カラム目 : タスクの実施時刻を指定します
* 3カラム目以降 : 延長する時間を指定します。数字の直後の英字によって「m(分)」「h(時)」「d(日)」が選べます。単位の判断は1文字だけでしていますが、人間に読みやすいように「min」「hours」「days」などと入力するのはかまいません。
