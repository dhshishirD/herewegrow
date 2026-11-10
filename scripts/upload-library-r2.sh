#!/usr/bin/env bash
# Uploads the library Word files and pack zips to the private R2 bucket (herewegrow-files).
# Usage: scripts/upload-library-r2.sh /path/to/hwg-r2-upload
# Needs: `npx wrangler login` once (or CLOUDFLARE_API_TOKEN set). Safe to re-run: same keys are overwritten.
set -euo pipefail
dir="${1:?Give the folder that holds the .docx and .zip files}"
bucket="herewegrow-files"
count=0
for f in "$dir"/*.docx "$dir"/pack-lib-*.zip; do
  [ -e "$f" ] || continue
  key="$(basename "$f")"
  case "$key" in
    *.docx) type="application/vnd.openxmlformats-officedocument.wordprocessingml.document" ;;
    *.zip)  type="application/zip" ;;
  esac
  npx wrangler r2 object put "$bucket/$key" --file "$f" --content-type "$type" --remote >/dev/null
  count=$((count + 1))
  echo "uploaded $key ($count)"
done
echo "done: $count files in $bucket"
