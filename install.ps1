$Host.UI.RawUI.WindowTitle="The Technical Server Auto UDISE Plus"
$Host.UI.RawUI.BackgroundColor="Black"
Clear-Host

$RepoZip="https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip"
$ReloadUrl="https://raw.githubusercontent.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/main/install.ps1"

function Line{
Write-Host "======================================================" -ForegroundColor DarkCyan
}

function PauseMenu{
Write-Host ""
Write-Host "Press any key..." -ForegroundColor DarkGray
[Console]::ReadKey($true)>$null
}

function MenuItem($n,$text){

Write-Host " [$n] " -ForegroundColor Yellow -NoNewline
Write-Host $text -ForegroundColor White

}

function OpenChrome($url){

$paths=@(
"$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
"$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe",
"$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)

$chrome=$paths |
Where-Object {
Test-Path $_
} |
Select-Object -First 1

if($chrome){

Start-Process `
-FilePath $chrome `
-ArgumentList "--new-window $url"

}
else{

Start-Process $url

}

}

function DownloadExtension{

Clear-Host

Line
Write-Host "DOWNLOADING EXTENSION" -ForegroundColor Cyan
Line

$temp="$env:TEMP\TheTechnicalServer.zip"
$folder="C:\TheTechnicalServerAutoUDisePlus-main"

Write-Host ""
Write-Host "Checking old files..." -ForegroundColor Yellow

if(Test-Path $folder){

Remove-Item `
$folder `
-Recurse `
-Force `
-ErrorAction SilentlyContinue

}

if(Test-Path $temp){

Remove-Item `
$temp `
-Force `
-ErrorAction SilentlyContinue

}

Write-Host ""
Write-Host "Downloading..." -ForegroundColor Cyan

try{

Invoke-WebRequest `
-Uri $RepoZip `
-OutFile $temp

}
catch{

Write-Host ""
Write-Host "Download Failed" `
-ForegroundColor Red

PauseMenu

return

}

if(!(Test-Path $temp)){

Write-Host ""
Write-Host "ZIP Missing" `
-ForegroundColor Red

PauseMenu

return

}

Write-Host ""
Write-Host "Download Completed" `
-ForegroundColor Green

Write-Host ""
Write-Host "Extracting..." `
-ForegroundColor Cyan

try{

Expand-Archive `
$temp `
-DestinationPath "C:\" `
-Force

}
catch{

Write-Host ""
Write-Host "Extraction Failed" `
-ForegroundColor Red

PauseMenu

return

}

Remove-Item `
$temp `
-Force `
-ErrorAction SilentlyContinue

if(!(Test-Path $folder)){

Write-Host ""
Write-Host "Folder Missing" `
-ForegroundColor Red

PauseMenu

return

}

Write-Host ""
Write-Host "Verified Successfully" `
-ForegroundColor Green

Start-Process explorer `
$folder

OpenChrome `
"chrome://extensions/"

Write-Host ""
Line

Write-Host "NEXT STEP" `
-ForegroundColor Yellow

Write-Host ""
Write-Host "1 → Turn ON Developer Mode"
Write-Host "2 → Click Load unpacked"
Write-Host "3 → Select:"
Write-Host ""

Write-Host `
$folder `
-ForegroundColor Cyan

Write-Host ""

Line

PauseMenu

}

function AboutMenu{

while($true){

Clear-Host

Line

Write-Host "CONNECT WITH ME" `
-ForegroundColor Magenta

Line

Write-Host ""
Write-Host "THE TECHNICAL SERVER" `
-ForegroundColor Cyan

Write-Host "@mr_ariph_ansari" `
-ForegroundColor Gray

Write-Host ""

MenuItem 1 "Facebook"
MenuItem 2 "YouTube"
MenuItem 3 "Twitter (X)"
MenuItem 4 "Telegram"
MenuItem 5 "Instagram"
MenuItem 6 "Close"

Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{
OpenChrome "https://facebook.com/thetechnicalserver"
}

'2'{
OpenChrome "https://youtube.com/@thetechnicalserver"
}

'3'{
OpenChrome "https://x.com/thetechnicalserver"
}

'4'{
OpenChrome "https://t.me/thetechnicalserver"
}

'5'{
OpenChrome "https://instagram.com/mr_ariph_ansari"
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

Write-Host "THE TECHNICAL SERVER" `
-ForegroundColor Cyan

Write-Host "Auto UDISE Plus" `
-ForegroundColor White

Line

Write-Host ""

MenuItem 1 "Open Blog"
MenuItem 2 "Open GitHub Profile"
MenuItem 3 "Direct Download Extension"
MenuItem 4 "Reload Extension"
MenuItem 5 "Download By GitHub Portal"
MenuItem 6 "About Me"
MenuItem 7 "Close"

Write-Host ""

Line

Write-Host ""
Write-Host "One Click • Faster • Smarter" `
-ForegroundColor Yellow

Write-Host ""
Write-Host "Created By @mr_ariph_ansari" `
-ForegroundColor DarkGray

Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{
OpenChrome "https://www.thetechnicalserver.blogspot.com"
}

'2'{
OpenChrome "https://github.com/thetechnicalserver"
}

'3'{
DownloadExtension
}

'4'{

iex (
irm $ReloadUrl
)

exit

}

'5'{
OpenChrome `
"https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus"
}

'6'{
AboutMenu
}

'7'{

Clear-Host

Write-Host ""
Write-Host "Thank for choosing us." `
-ForegroundColor Green

Start-Sleep 2

exit

}

}

}
