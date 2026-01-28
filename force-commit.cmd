@echo off
setlocal
set GIT_TERMINAL_PROMPT=0
git add --all
git commit -m "Fix sidebar logo and text layout - balanced spacing and sizing" --no-verify
git push --force-with-lease
echo Done
