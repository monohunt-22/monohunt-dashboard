# MONOHUNT｜各班の進捗報告

AI編集室は `progress/teams/{research,a,b,c}.json` を30秒間隔で取得します。画面が非表示の間は停止し、戻ったときに取得します。GitHub Pagesの配信反映には別途時間がかかります。

別のChatGPTチャットやWORKの会話・操作状況は自動監視できません。各班のWORKが作業の節目にこのリポジトリへ報告を保存することで、編集室へ自動表示されます。ブラウザーでの報告編集・各班への指示・WordPress接続は行いません。

## 各班が更新するファイル

| 班 | team_id | 更新対象 |
|---|---|---|
| 企画班 | research | progress/teams/research.json |
| A班 | a | progress/teams/a.json |
| B班 | b | progress/teams/b.json |
| C班 | c | progress/teams/c.json |

自班のファイルだけを変更してください。共通一覧を各班が上書きしない方式です。報告がない班はupdated_at=null、status=unconfirmedで、内容も未確認として表示します。過去の報告から現在の稼働状態を推測しません。

## 保存する情報（schema_version:1）

`team_id`、`status`、`task`（担当作業・160字以内）、`progress`（確認できた進捗・500字以内）、`last_report`（最終報告・2000字以内）、`issues`（確認済みの問題点・最大10件）、`source_urls`（根拠となる公開HTTPS URL・最大5件）を記録します。statusはin_progress／waiting／blocked／completed。未報告の場合のみunconfirmedを使います。

`updated_at`はタイムゾーン付きISO 8601。新規報告の入力JSONから省略すれば下記スクリプトが保存時刻を設定します。実測していない進捗率、未確認の実績、他班が稼働中という推測は入れないでください。問題点がない場合の空配列は「報告上なし」であり、全項目の検査合格ではありません。機密情報・認証情報は保存しません。

## WORKが節目に行う更新手順

1. 最新mainと自班のJSONを取得し、現在の報告・コミットSHAを確認する。
2. 実際に確認した担当作業・進捗・最終報告・問題点・根拠URLを入力JSONへ記録する。型は保存済みA班報告を参照し、内容・時刻は流用しない。
3. `python3 scripts/update_team_progress.py --team c --report /absolute/path/c-report.json` のように実行する。検査のみなら末尾に `--check`。自班以外のteam_idや不正なデータは拒否する。
4. 自班のJSONだけをコミットしてmainへ保存する。既存のGitHubコネクターを使う場合は自班のファイルをblob化し、最新mainのtreeをベースにcommitを作る。ref更新にはexpected_shaを付け、他の更新と競合したら最新mainと自班JSONを再取得してから判断する。force pushは禁止。他班・wp-status.json・画面のファイルを巻き戻さない。
5. GitHub保存成功とPages配信後、編集室で自班の最終報告・更新時刻を確認する。保存だけで表示反映を完了扱いにしない。

開始・区切り・問題発生・完了時に更新します。作業をしていないのに定期的に時刻だけ書き換える運用はしません。古い最終報告はその時点の報告であり、現在稼働中の証拠ではありません。

## 表示と障害時の扱い

- 初回取得失敗・不正なJSON：その班は未確認。接続の失敗を表示する。
- 次回取得失敗：直前に取得できた報告を「前回取得」と明示して残す。取得失敗を隠して最新と称しない。
- 最終報告から24時間超：時刻に加え、現在の状況は未確認と表示する。稼働中表示にしない。
- 個人タスクのlocalStorageとは別の情報。個人タスクをGitHubへ送信しない。

`office-standalone.html`および6a2be71以前のZIP・単体HTMLは、連携実装前の保存版です。今回の進捗連携の確認対象は公開office.htmlです。旧保存版へ連携を追加したとは扱いません。
