import json, urllib.request, datetime, time
from urllib.parse import urlencode

BASE = "https://monohunt.com/wp-json/wp/v2/posts"
items = []
error = None
try:
    for page in range(1, 51):
        url = BASE + "?" + urlencode({"per_page": 100, "page": page, "_fields": "id,date,modified,link,title,status", "status": "publish"})
        req = urllib.request.Request(url, headers={"User-Agent": "MONOHUNT-Dashboard/1.0 (public posts only)", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                batch = json.load(response)
        except urllib.error.HTTPError as exc:
            if exc.code == 400 and page > 1:
                break
            raise
        if not isinstance(batch, list):
            raise ValueError("WordPress API returned unexpected data")
        items.extend(batch)
        if len(batch) < 100:
            break
        time.sleep(0.2)
    data = {
        "source": "MONOHUNT public WordPress REST API",
        "checked_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "status": "ok",
        "published_count": len(items),
        "posts": [{"id": p["id"], "title": p.get("title", {}).get("rendered", ""), "modified": p.get("modified"), "date": p.get("date"), "link": p.get("link")} for p in items]
    }
except Exception as exc:
    # Do not replace the last known successful snapshot with misleading zeros.
    raise SystemExit("Public WordPress data fetch failed: " + str(exc))
with open("wp-status.json", "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False, indent=2)
    file.write("\n")
