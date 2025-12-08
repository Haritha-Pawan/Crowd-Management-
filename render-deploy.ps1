<#
render-deploy.ps1

Purpose: Read local secrets from `render-secrets.json`, set environment variables
for the backend and frontend Render services (assumes the services already exist
with names `crowd-management-api` and `crowd-management-frontend`) and then
trigger deployments.

Usage:
1. Copy `render-secrets.example.json` -> `render-secrets.json` and fill values.
2. Create two services in Render manually first (recommended):
   - Web Service: name `crowd-management-api`, Root Directory `Crowd/Backend`
   - Static Site: name `crowd-management-frontend`, Root Directory `Crowd/Frontend`
3. Run in PowerShell (from repo root):
   ```powershell
   pwsh .\render-deploy.ps1
   ```

This script will:
- Read your Render API key from `render-secrets.json` (or environment var RENDER_API_KEY)
- Find the two services by name
- Upsert environment variables using Render API
- Trigger a manual deploy for each service and wait for the deploy to finish
- Print the resulting service domains and deploy status

Note: This script never uploads secrets to a remote store other than Render's own
environment variables via their API. Keep `render-secrets.json` local and do not
commit it to Git.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Helper: Read secrets file
$secretsPath = Join-Path -Path (Get-Location) -ChildPath 'render-secrets.json'
if (-not (Test-Path $secretsPath)) {
    Write-Error "Secrets file not found: $secretsPath`nPlease copy render-secrets.example.json -> render-secrets.json and fill values."
    exit 1
}

$secrets = Get-Content $secretsPath | Out-String | ConvertFrom-Json
$apiKey = $null
if ($env:RENDER_API_KEY) { $apiKey = $env:RENDER_API_KEY }
if (-not $apiKey -and $secrets.RENDER_API_KEY) { $apiKey = $secrets.RENDER_API_KEY }
if (-not $apiKey) { Write-Error "Render API key not found. Set environment variable RENDER_API_KEY or add RENDER_API_KEY to render-secrets.json"; exit 1 }

$headers = @{ Authorization = "Bearer $apiKey"; 'Content-Type' = 'application/json' }
$baseApi = 'https://api.render.com/v1'

function Get-RenderServices {
    Write-Host "Fetching services list from Render..."
    $resp = Invoke-RestMethod -Uri "$baseApi/services" -Headers $headers -Method Get
    return $resp
}

function Find-ServiceByName($name) {
    $services = Get-RenderServices
    foreach ($s in $services) {
        if ($s.name -eq $name) { return $s }
    }
    return $null
}

function Upsert-EnvVar($serviceId, $key, $value, [bool]$secure=$true) {
    if (-not $value) { return }
    # Check existing
    $existing = Invoke-RestMethod -Uri "$baseApi/services/$serviceId/env-vars" -Headers $headers -Method Get
    foreach ($ev in $existing) {
        if ($ev.key -eq $key) {
            Write-Host "Updating env var '$key' for service $serviceId"
            $body = @{ key = $key; value = $value; secure = $secure } | ConvertTo-Json
            Invoke-RestMethod -Uri "$baseApi/services/$serviceId/env-vars/$($ev.id)" -Headers $headers -Method Patch -Body $body
            return
        }
    }
    Write-Host "Creating env var '$key' for service $serviceId"
    $body = @{ key = $key; value = $value; secure = $secure } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseApi/services/$serviceId/env-vars" -Headers $headers -Method Post -Body $body
}

function Trigger-Deploy($serviceId) {
    Write-Host "Triggering deploy for service $serviceId..."
    $body = @{ } | ConvertTo-Json
    $deploy = Invoke-RestMethod -Uri "$baseApi/services/$serviceId/deploys" -Headers $headers -Method Post -Body $body
    return $deploy
}

function Wait-For-Deploy($serviceId, $deployId, [int]$timeoutSec=600) {
    $start = [DateTime]::UtcNow
    while (([DateTime]::UtcNow - $start).TotalSeconds -lt $timeoutSec) {
        Start-Sleep -Seconds 3
        $d = Invoke-RestMethod -Uri "$baseApi/services/$serviceId/deploys/$deployId" -Headers $headers -Method Get
        Write-Host "Deploy status: $($d.state) | $($d.message)"
        if ($d.state -in @('success','failed')) { return $d }
    }
    throw "Deploy timed out after $timeoutSec seconds"
}

# Names of services -- editable
$backendName = $secrets.BACKEND_SERVICE_NAME -or 'crowd-management-api'
$frontendName = $secrets.FRONTEND_SERVICE_NAME -or 'crowd-management-frontend'

# Find services
$backend = Find-ServiceByName $backendName
$frontend = Find-ServiceByName $frontendName

if (-not $backend) { Write-Host "Backend service '$backendName' not found. Please create it first in Render or verify the name in render-secrets.json"; exit 1 }
if (-not $frontend) { Write-Host "Frontend service '$frontendName' not found. Please create it first in Render or verify the name in render-secrets.json"; exit 1 }

Write-Host "Found backend service: $($backend.name) (id: $($backend.id))"
Write-Host "Found frontend service: $($frontend.name) (id: $($frontend.id))"

# Backend environment variables to upsert
$backendEnv = @{
    PORT = ($secrets.PORT -or '5000')
    NODE_ENV = ($secrets.NODE_ENV -or 'production')
    MONGODB_URI = $secrets.MONGODB_URI
    JWT_SECRET = $secrets.JWT_SECRET
    FRONTEND_URL = $secrets.FRONTEND_URL
    TWILIO_ACCOUNT_SID = $secrets.TWILIO_ACCOUNT_SID
    TWILIO_AUTH_TOKEN = $secrets.TWILIO_AUTH_TOKEN
    TWILIO_PHONE_NUMBER = $secrets.TWILIO_PHONE_NUMBER
    NODEMAILER_EMAIL = $secrets.NODEMAILER_EMAIL
    NODEMAILER_PASSWORD = $secrets.NODEMAILER_PASSWORD
}

foreach ($k in $backendEnv.Keys) {
    $v = $backendEnv[$k]
    if ($null -eq $v -or $v -eq '') { Write-Host "Skipping empty backend var: $k"; continue }
    Upsert-EnvVar -serviceId $backend.id -key $k -value $v -secure $true
}

# Frontend environment variables to upsert
$frontendEnv = @{
    VITE_API_BASE_URL = $secrets.VITE_API_BASE_URL
    VITE_SOCKET_URL = $secrets.VITE_SOCKET_URL
}

foreach ($k in $frontendEnv.Keys) {
    $v = $frontendEnv[$k]
    if ($null -eq $v -or $v -eq '') { Write-Host "Skipping empty frontend var: $k"; continue }
    Upsert-EnvVar -serviceId $frontend.id -key $k -value $v -secure $false
}

# Trigger deploys
$backendDeploy = Trigger-Deploy $backend.id
Write-Host "Backend deploy id: $($backendDeploy.id)"
$backendResult = Wait-For-Deploy -serviceId $backend.id -deployId $backendDeploy.id -timeoutSec 900
Write-Host "Backend deploy finished: $($backendResult.state)"

$frontendDeploy = Trigger-Deploy $frontend.id
Write-Host "Frontend deploy id: $($frontendDeploy.id)"
$frontendResult = Wait-For-Deploy -serviceId $frontend.id -deployId $frontendDeploy.id -timeoutSec 900
Write-Host "Frontend deploy finished: $($frontendResult.state)"

# Print service URLs
$backendUpdated = Invoke-RestMethod -Uri "$baseApi/services/$($backend.id)" -Headers $headers -Method Get
$frontendUpdated = Invoke-RestMethod -Uri "$baseApi/services/$($frontend.id)" -Headers $headers -Method Get

Write-Host "\n=== Deployment complete ==="
Write-Host "Backend URL: $($backendUpdated.serviceDetails?.defaultDomain ?? $backendUpdated.defaultDomain)"
Write-Host "Frontend URL: $($frontendUpdated.serviceDetails?.defaultDomain ?? $frontendUpdated.defaultDomain)"
Write-Host "You can now visit the frontend and verify the app connects to the backend."
