# Quick setup script for Project Hub on Windows (PowerShell)
# Usage: .\setup-db.ps1

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Project Hub - Local Setup Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    $dockerStatus = docker ps 2>$null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "⚠️  Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    Write-Host ""
    Write-Host "To start Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  - Press Windows key and type 'Docker'" 
    Write-Host "  - Click on Docker Desktop"
    Write-Host "  - Wait 30 seconds for it to fully start"
    Write-Host ""
    Read-Host "Press Enter when Docker is started"
    exit 1
}

# Check if database container already exists
Write-Host "Checking for existing database container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --format "{{.Names}}" 2>$null | Where-Object { $_ -eq "project_hub_db" }

if ($existingContainer) {
    Write-Host "Stopping existing database container..." -ForegroundColor Yellow
    docker stop project_hub_db 2>$null | Out-Null
    docker rm project_hub_db 2>$null | Out-Null
    Write-Host "✓ Cleaned up old container" -ForegroundColor Green
}

# Start PostgreSQL container
Write-Host ""
Write-Host "Starting PostgreSQL database..." -ForegroundColor Yellow

$result = docker run --name project_hub_db `
  -e POSTGRES_PASSWORD=projecthub2025 `
  -e POSTGRES_DB=project_hub `
  -p 5432:5432 `
  -d postgres:15-alpine 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start PostgreSQL" -ForegroundColor Red
    Write-Host $result
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ PostgreSQL started successfully" -ForegroundColor Green

# Wait for database to be ready
Write-Host ""
Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Database Setup Complete!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next, run these commands in your terminal:" -ForegroundColor Yellow
Write-Host ""
Write-Host "    npm run db:generate" -ForegroundColor Cyan
Write-Host "    npm run db:push" -ForegroundColor Cyan
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then visit: " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view your database:" -ForegroundColor Yellow
Write-Host "    npm run db:studio" -ForegroundColor Cyan
Write-Host ""

