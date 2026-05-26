$dest="C:\TheTechnicalServerAutoUDisePlus"

if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force
}

$temp="$env:TEMP\udise.zip"

Invoke-WebRequest `
"https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip" `
-OutFile $temp

Expand-Archive `
$temp `
-DestinationPath $dest `
-Force

Remove-Item $temp -Force

Write-Host ""
Write-Host "Installed Successfully"
Write-Host "Location: $dest"
