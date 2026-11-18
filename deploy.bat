@echo off
echo === STARTING GITHUB DEPLOY ===
git add .
git commit -m "Ready demo sites"
git branch -M main
echo.
echo === PUSHING TO GITHUB ===
git push -u origin main
echo.
echo === DEPLOY COMPLETED! GO TO GITHUB SETTINGS -> PAGES ===
pause
