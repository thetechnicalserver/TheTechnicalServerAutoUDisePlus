$Host.UI.RawUI.WindowTitle="The Technical Server Auto UDISE Plus"
$Host.UI.RawUI.BackgroundColor="Black"
Clear-Host

$RepoZip="https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip"

function Line{
Write-Host "==========================================================" -ForegroundColor DarkCyan
}

function PauseMenu{
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor DarkGray
[Console]::ReadKey($true)>$null
}

function MenuItem($n,$t){

Write-Host "  [$n] " -ForegroundColor Yellow -NoNewline
Write-Host $t -ForegroundColor White

}

function DownloadExtension{

Clear-Host

Line
Write-Host "         DOWNLOADING EXTENSION" -ForegroundColor Cyan
Line

$temp="$env:TEMP\TheTechnicalServer.zip"
$folder="C:\TheTechnicalServerAutoUDisePlus-main"

try{

if(Test-Path $folder){

Remove-Item `
$folder `
-Recurse `
-Force `
-ErrorAction SilentlyContinue

}

Invoke-WebRequest `
-Uri $RepoZip `
-OutFile $temp

Expand-Archive `
$temp `
-DestinationPath "C:\" `
-Force

Remove-Item `
$temp `
-Force

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host ""

Write-Host "Installed Location:" -ForegroundColor Cyan
Write-Host $folder -ForegroundColor White

Write-Host ""

try{

Start-Process explorer $folder
Start-Process chrome "chrome://extensions/"

}
catch{}

}
catch{

Write-Host ""
Write-Host "FAILED" -ForegroundColor Red

}

PauseMenu

}

function AboutMenu{

while($true){

Clear-Host

Line

Write-Host "              CONNECT WITH ME" -ForegroundColor Magenta

Line

Write-Host ""

Write-Host "THE TECHNICAL SERVER" -ForegroundColor Cyan
Write-Host "Managed by @mr_ariph_ansari" -ForegroundColor Gray

Write-Host ""

MenuItem "1" "Facebook"
MenuItem "2" "YouTube"
MenuItem "3" "Twitter (X)"
MenuItem "4" "Telegram"
MenuItem "5" "Instagram"
MenuItem "6" "Close"

Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{
Start-Process "https://facebook.com/thetechnicalserver"
}

'2'{
Start-Process "https://youtube.com/@thetechnicalserver"
}

'3'{
Start-Process "https://x.com/thetechnicalserver"
}

'4'{
Start-Process "https://t.me/thetechnicalserver"
}

'5'{
Start-Process "https://instagram.com/mr_ariph_ansari"
}

'6'{
return
}

}

}

}

while($true){

Clear-Host

Line

Write-Host "        THE TECHNICAL SERVER" -ForegroundColor Cyan
Write-Host "            Auto UDISE Plus" -ForegroundColor White

Line

Write-Host ""

MenuItem "1" "Open Blog"
MenuItem "2" "Open GitHub Profile"
MenuItem "3" "Direct Download Extension"
MenuItem "4" "Reload Extension"
MenuItem "5" "Download By GitHub Portal"
MenuItem "6" "About Me"
MenuItem "7" "Close"

Write-Host ""

Line

Write-Host ""
Write-Host "One Click  •  Faster  •  Smarter" -ForegroundColor Yellow
Write-Host ""
Write-Host "Created By @mr_ariph_ansari" -ForegroundColor DarkGray
Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{

Start-Process `
"https://thesunshineghazipur.co.in"

}

'2'{

Start-Process `
"https://github.com/thetechnicalserver"

}

'3'{

DownloadExtension

}

'4'{

iex (
irm `
"https://raw.githubusercontent.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/main/install.ps1"
)

exit

}

'5'{

Start-Process chrome `
"https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus"

}

'6'{

AboutMenu

}

'7'{

Clear-Host

Write-Host ""
Write-Host "Thank for choosing us." -ForegroundColor Green
Write-Host ""
Write-Host "Have a great day." -ForegroundColor Cyan
Write-Host ""

Start-Sleep 2

exit

}

}

}
