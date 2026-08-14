"""
Downloads sculpture images from Wikimedia Commons for the deity classifier.

Usage:
    python wikimedia_scraper.py

Creates:
    deity_dataset/
        murugan/    *.jpg
        amman/      *.jpg
        perumal/    *.jpg
        shivan/     *.jpg
        manifest.json   (source + license info per image)
"""

import requests
import os
import time
import json
import sys

# Map your classes to Wikimedia Commons search terms.
# Add more specific terms here later if a class comes up short.
CATEGORY_QUERIES = {
    "murugan": [
        "Murugan sculpture",
        "Kartikeya sculpture",
        "Subrahmanya temple sculpture",
        "Palani Murugan",
        "Tiruchendur Murugan",
        "Skanda sculpture",
        "Murugan bronze idol",
        "Murugan temple statue",
        "Subramanya swamy idol",
        "Kartikeya bronze",
        "Velayudha swamy",
        "Murugan idol Tamil Nadu",
        "Six faced Murugan",
        "Arupadaiveedu sculpture",
    ],
    "amman": [
        "Meenakshi sculpture",
        "Mariamman sculpture",
        "Durga sculpture",
        "Kali sculpture",
        "Parvati sculpture",
    ],
    "perumal": [
        "Vishnu sculpture",
        "Ranganatha sculpture",
        "Vaishnavism sculpture",
        "Perumal temple idol",
        "Vishnu bronze idol",
        "Vishnu stone sculpture South India",
        "Ranganathaswamy idol",
        "four armed Vishnu sculpture",
    ],
    "shivan": [
        "Shiva sculpture",
        "Nataraja sculpture",
        "Shiva lingam",
        "Dakshinamurthy sculpture",
    ],
}

OUTPUT_DIR = "deity_dataset"
IMAGES_PER_QUERY = 60
API_URL = "https://commons.wikimedia.org/w/api.php"
# Wikimedia requires a descriptive User-Agent with real contact info, or it will
# rate-limit/block requests as non-compliant with its robot policy.
# Replace the email below with your own before running.
HEADERS = {
    "User-Agent": "DeityClassifierResearch/1.0 (contact: harishr.ad23@bitsathy.ac.in; "
                  "personal academic research project on Tamil temple iconography)"
}

session = requests.Session()
session.headers.update(HEADERS)


def request_with_retry(url, params=None, max_retries=5):
    """GET with exponential backoff on 429 (rate limit) responses."""
    delay = 2
    for attempt in range(max_retries):
        resp = session.get(url, params=params, timeout=30)
        if resp.status_code == 429:
            print(f"  rate-limited, waiting {delay}s before retry ({attempt+1}/{max_retries})...")
            time.sleep(delay)
            delay *= 2
            continue
        resp.raise_for_status()
        return resp
    raise RuntimeError(f"Gave up after {max_retries} retries (still rate-limited): {url}")


def search_commons_images(query, limit=60):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"{query} filetype:bitmap",
        "gsrnamespace": 6,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": 800,
    }
    resp = request_with_retry(API_URL, params=params)
    data = resp.json()
    pages = data.get("query", {}).get("pages", {})
    results = []
    for page in pages.values():
        info = page.get("imageinfo", [{}])[0]
        url = info.get("thumburl") or info.get("url")
        license_name = info.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "unknown")
        if url:
            results.append({"title": page.get("title"), "url": url, "license": license_name})
    return results


def download_image(url, dest_path):
    try:
        r = request_with_retry(url)
        with open(dest_path, "wb") as f:
            f.write(r.content)
        return True
    except Exception as e:
        print(f"  failed: {url} ({e})")
        return False


def main():
    # Usage: python wikimedia_scraper.py            -> scrapes all classes
    #        python wikimedia_scraper.py murugan perumal  -> scrapes only these classes
    only_classes = sys.argv[1:] if len(sys.argv) > 1 else list(CATEGORY_QUERIES.keys())

    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    manifest = []
    seen_titles = set()
    if os.path.exists(manifest_path):
        with open(manifest_path) as f:
            manifest = json.load(f)
        seen_titles = {item["source_title"] for item in manifest}
        print(f"Loaded existing manifest with {len(manifest)} images already recorded.")

    for class_name, queries in CATEGORY_QUERIES.items():
        if class_name not in only_classes:
            continue
        class_dir = os.path.join(OUTPUT_DIR, class_name)
        os.makedirs(class_dir, exist_ok=True)
        existing = len([f for f in os.listdir(class_dir) if not f.startswith(".")])
        count = existing
        seen_urls = set()
        for query in queries:
            print(f"[{class_name}] searching: {query}")
            time.sleep(2)
            results = search_commons_images(query, IMAGES_PER_QUERY)
            for item in results:
                if item["url"] in seen_urls or item["title"] in seen_titles:
                    continue
                seen_urls.add(item["url"])
                seen_titles.add(item["title"])
                ext = item["url"].split(".")[-1].split("?")[0][:4]
                filename = f"{class_name}_{count:04d}.{ext}"
                dest_path = os.path.join(class_dir, filename)
                if download_image(item["url"], dest_path):
                    manifest.append({
                        "file": dest_path,
                        "class": class_name,
                        "source_title": item["title"],
                        "license": item["license"],
                    })
                    count += 1
                time.sleep(1.5)
        print(f"[{class_name}] now has {count} images ({count - existing} new)\n")

    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print("=" * 50)
    print("DONE. Summary:")
    for class_name in CATEGORY_QUERIES:
        class_dir = os.path.join(OUTPUT_DIR, class_name)
        if os.path.exists(class_dir):
            n = len([f for f in os.listdir(class_dir) if not f.startswith(".")])
            print(f"  {class_name}: {n} images")
    print(f"\nTotal in manifest: {len(manifest)} images.")


if __name__ == "__main__":
    main()
