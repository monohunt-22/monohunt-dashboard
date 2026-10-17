# C班WORKへの導入指示

MONOHUNTのAI編集室に、自班が実際に確認した作業状況を報告してください。

リポジトリ：`monohunt-22/monohunt-dashboard`。自班の更新先は `progress/teams/c.json`。共通手順は `progress/README.md`、検査・保存用スクリプトは `scripts/update_team_progress.py`。

開始・節目・問題発生・完了時に、担当作業／確認できた進捗／最終報告／問題点／公開の根拠URLを記録し、保存時刻を付けてGitHubへ保存します。書式はschema_version:1、team_id:c。statusは作業中in_progress、待機waiting、問題blocked、完了completedから実際の報告時点に合うものを選びます。報告がないうちはunconfirmed・updated_at:nullのままにしてください。

`python3 scripts/update_team_progress.py --team c --report /absolute/path/c-report.json` で検査し、自班JSONだけをコミットしてください。GitHubコネクターから保存する際も、最新mainのtreeをベースにし、expected_sha付きでrefを更新します。競合時は最新mainとC班ファイルを確認し、他班の報告を上書きしません。

保存後はGitHub Pagesの配信反映を待ち、公開office.htmlのC班欄で報告本文と時刻を確認してください。表示反映前に完了とは報告しません。公開画面は30秒ごとに取得します。

別チャットの会話を自動監視する仕組みではありません。C班自身が節目にGitHubへ報告する必要があります。A班が確認した結果をC班の独立検査として流用しないでください。WordPressは変更しません。
