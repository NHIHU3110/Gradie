@echo off
echo Dang mo trinh duyet de dang nhap Vercel...
call vercel login
echo Dang day code (ca Website lan API) len Vercel...
call vercel --prod
echo Da day code xong! Ban co the tat cua so nay.
pause
