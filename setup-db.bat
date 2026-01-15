@echo off
REM Quick setup script for Project Hub on Windows

echo.
echo ====================================
echo  Project Hub - Local Setup Script
echo ====================================
echo.

REM Check if Docker is running
echo Checking Docker status...
docker ps >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  Docker is not running. Please start Docker Desktop and run this script again.
    echo.
    echo To start Docker Desktop:
    echo   - Press Windows key and type "Docker"
    echo   - Click on Docker Desktop
    echo   - Wait 30 seconds for it to fully start
    echo.
    pause
    exit /b 1
)

echo ✓ Docker is running

REM Check if database container already exists
docker ps -a --format "{{.Names}}" | findstr /R "project_hub_db" >nul
if %errorlevel% equ 0 (
    echo.
    echo Stopping existing database container...
    docker stop project_hub_db >nul 2>&1
    docker rm project_hub_db >nul 2>&1
    echo ✓ Cleaned up old container
)

echo.
echo Starting PostgreSQL database...
docker run --name project_hub_db ^
  -e POSTGRES_PASSWORD=projecthub2025 ^
  -e POSTGRES_DB=project_hub ^
  -p 5432:5432 ^
  -d postgres:15-alpine

if errorlevel 1 (
    echo ✗ Failed to start PostgreSQL
    pause
    exit /b 1
)

echo ✓ PostgreSQL started successfully

REM Wait for database to be ready
echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak

echo.
echo ====================================
echo   Database Setup Complete!
echo ====================================
echo.
echo Next, run these commands in your terminal:
echo.
echo    npm run db:generate
echo    npm run db:push
echo    npm run dev
echo.
echo Then visit: http://localhost:3000
echo.
echo To view your database:
echo    npm run db:studio
echo.
pause


