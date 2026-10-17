# A案アセットの出所と制作方法

原本: オーナー添付 `19954.png`。実ファイルはJPEG形式のため、内容を変えず `reference-a.jpg` として保管。

原本オフィスの正確な切り出し: 素材パック `MONOHUNT_A_stage2_v2.zip` の `office_reference_exact.png`。原本比較用に可逆WebPへ変換した `reference-office.webp`。

背景・人物の再制作: 組み込みImageGen。API／追加有料サービスは利用していない。

## プロンプトセット

背景編集: supplied panoramic MONOHUNT office reference; keep exact composition, perspective, city windows, warm light, plants, shelves, cats, desks, thin monitors, books, floor and detailed game illustration style. Remove only the four seated humans, hands and held mug/paper; inpaint hidden background. Remove speech bubbles and header UI panels, replacing with continuous room/windows. Keep desks and monitors; no people, no new objects. Return a wide clean office panorama faithful to input.

人物抽出・再制作: 4 isolated transparent character cutouts from the MONOHUNT reference. Preserve the detailed pixel-anime identity, faces, proportions and clothing. One row: green-haired boy with square black glasses, green headset and green hoodie typing; blue-haired girl with blue headset and pale blue shirt typing; smiling brown ponytail girl in cream/orange clothes holding white coffee cup; pink ponytail girl with square black glasses in pink clothes reading white paper. Complete waist-up silhouettes, same visual scale, baseline aligned, clean alpha, include hands and held objects. No desks, monitors, chairs, plants, background, text or speech bubbles. No redesign.

生成後のWeb用処理: 人物4枚を個別範囲でトリミング、透明度を保持してWebP化。背景をWeb用サイズへ縮小。机の下部を前景用にトリミング。モニターと人物の前後関係はCSSのクリップで制御。人物を図形や絵文字で描き直していない。

最終素材: `room-clean.webp`、`desks-foreground.webp`、`research.webp`、`comparison.webp`、`buying.webp`、`quality.webp`。
