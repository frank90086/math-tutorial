#!/bin/bash
cd ~/Documents/math
rm -f .git/HEAD.lock .git/index.lock 2>/dev/null
git add -A
git commit -m "Update: $(date '+%Y-%m-%d %H:%M')"
git push
echo "✅ 部署完成"
