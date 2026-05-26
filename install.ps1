$RepoZip="https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip"

function WaitKey{
[void][Console]::ReadKey($true)
}

function DownloadExtension{

Clear-Host

$temp="$env:TEMP\TheTechnicalServer.zip"
$folder="C:\TheTechnicalServerAutoUDisePlus-main"

Write-Host ""
Write-Host "Preparing Setup..."
Write-Host ""

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

Start-Process explorer $folder

try{
Start-Process chrome "chrome://extensions/"
}
catch{
Start-Process "chrome://extensions/"
}

Clear-Host

Write-Host ""
Write-Host "==================================="
Write-Host " EXTENSION INSTALLATION GUIDE "
Write-Host "==================================="
Write-Host ""
Write-Host "STEP 1"
Write-Host "Chrome opened"
Write-Host ""
Write-Host "Turn ON:"
Write-Host "Developer Mode"
Write-Host ""
Write-Host "Top Right Corner"
Write-Host ""
Write-Host "Press any key"

WaitKey

Clear-Host

Write-Host ""
Write-Host "STEP 2"
Write-Host ""
Write-Host "Click:"
Write-Host ""
Write-Host "[ LOAD UNPACKED ]"
Write-Host ""
Write-Host "Press any key"

WaitKey

Clear-Host

Write-Host ""
Write-Host "STEP 3"
Write-Host ""
Write-Host "Select Folder:"
Write-Host ""
Write-Host $folder
Write-Host ""
Write-Host "Folder already opened"
Write-Host ""
Write-Host "Press any key after selecting"

WaitKey

Clear-Host

Write-Host ""
Write-Host "Completed"
Write-Host ""
Write-Host "Extension should now appear"
Write-Host ""
Write-Host "Thank for choosing us."
Write-Host ""
Write-Host "The Technical Server"
Write-Host "@mr_ariph_ansari"
Write-Host ""

WaitKey

}
catch{

Write-Host ""
Write-Host "Installation Failed"
Write-Host ""

WaitKey

}

}

function AboutMenu{

while($true){

Clear-Host

Write-Host ""
Write-Host "🌐 CONNECT WITH ME"
Write-Host ""
Write-Host "👨‍💻 THE TECHNICAL SERVER"
Write-Host "✨ Managed by @mr_ariph_ansari"
Write-Host ""
Write-Host "1 Facebook"
Write-Host "2 YouTube"
Write-Host "3 Twitter"
Write-Host "4 Telegram"
Write-Host "5 Instagram"
Write-Host "6 Close"
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

Write-Host ""
Write-Host "==================================="
Write-Host " THE TECHNICAL SERVER "
Write-Host "==================================="
Write-Host ""
Write-Host "1 Open Blog"
Write-Host "2 Open GitHub Profile"
Write-Host "3 Direct Download Extension"
Write-Host "4 Reload"
Write-Host "5 Download By GitHub Portal"
Write-Host "6 About Me"
Write-Host "7 Close"
Write-Host ""
Write-Host "Thank for choosing us."
Write-Host "Have a good day."
Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{
Start-Process "https://thesunshineghazipur.co.in"
}

'2'{
Start-Process "https://github.com/thetechnicalserver"
}

'3'{
DownloadExtension
}

'4'{
exit
}

'5'{
Start-Process `
"https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus"
}

'6'{
AboutMenu
}

'7'{

Clear-Host

Write-Host ""
Write-Host "Thank for choosing us."
Write-Host ""

Start-Sleep 2

exit

}

}

}
