$RepoZip="https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip"

function WaitKey{
[void][Console]::ReadKey($true)
}

function InstallExtension{

Clear-Host

$temp="$env:TEMP\AutoUDise.zip"
$folder="C:\TheTechnicalServerAutoUDisePlus-main"

Write-Host ""
Write-Host "Downloading..."
Write-Host ""

try{

if(Test-Path $folder){
Remove-Item $folder -Recurse -Force -ErrorAction SilentlyContinue
}

Invoke-WebRequest `
-Uri $RepoZip `
-OutFile $temp

Expand-Archive `
$temp `
-DestinationPath "C:\" `
-Force

Remove-Item $temp -Force

Write-Host ""
Write-Host "Download Completed"
Write-Host ""

Start-Process explorer $folder

try{
Start-Process chrome "chrome://extensions/"
}
catch{
Write-Host "Chrome launch failed."
}

Clear-Host

Write-Host ""
Write-Host "=================================="
Write-Host "Chrome Extension Setup"
Write-Host "=================================="
Write-Host ""
Write-Host "1. Select Chrome profile (if shown)"
Write-Host ""
Write-Host "2. Turn ON Developer Mode"
Write-Host ""
Write-Host "3. Click:"
Write-Host "   Load unpacked"
Write-Host ""
Write-Host "4. Select:"
Write-Host "   $folder"
Write-Host ""
Write-Host "5. Extension will appear"
Write-Host ""
Write-Host "Press any key to return"

WaitKey

}
catch{

Write-Host ""
Write-Host "Installation Failed"

WaitKey

}

}

while($true){

Clear-Host

Write-Host ""
Write-Host "=================================="
Write-Host "THE TECHNICAL SERVER"
Write-Host "=================================="
Write-Host ""
Write-Host "1 Download Extension"
Write-Host "2 Open GitHub"
Write-Host "3 Open Blog"
Write-Host "4 Exit"
Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{
InstallExtension
}

'2'{
Start-Process "https://github.com/thetechnicalserver"
}

'3'{
Start-Process "https://thesunshineghazipur.co.in"
}

'4'{
exit
}

}

}
