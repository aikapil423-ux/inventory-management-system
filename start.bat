@echo off
echo ========================================
echo   Haryana Police Inventory Management
echo ========================================
echo.

echo [1/3] Checking MongoDB connection...
echo.
echo IMPORTANT: Update server\.env with your MongoDB Atlas connection string
echo Get it from: MongoDB Atlas > Database > Connect > Connect your application
echo.

set /p MONGO_URI="Paste your MongoDB Atlas connection string (or press Enter to skip): "
if not "%MONGO_URI%"=="" (
    powershell -Command "(Get-Content 'server\.env') -replace 'MONGODB_URI=.*', 'MONGODB_URI=%MONGO_URI%' | Set-Content 'server\.env'"
    echo Connection string updated!
)

echo.
echo [2/3] Seeding database...
cd server
call npm run seed
cd ..

echo.
echo [3/3] Starting application...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
call npm run dev
pause
