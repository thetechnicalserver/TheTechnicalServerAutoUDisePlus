$Host.UI.RawUI.WindowTitle="The Technical Server Auto UDISE Plus"

function PauseMenu{
Write-Host ""
Write-Host "Press any key..."
[Console]::ReadKey($true)>$null
}

function DownloadExtension{

Clear-Host

Write-Host ""
Write-Host "Downloading Extension..."
Write-Host ""

$temp="$env:TEMP\TheTechnicalServer.zip"

try{

Invoke-WebRequest `
"https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip" `
-OutFile $temp

Expand-Archive `
$temp `
-DestinationPath "C:\" `
-Force

Remove-Item $temp -Force

Write-Host ""
Write-Host "Download Completed Successfully"
Write-Host ""
Write-Host "Location:"
Write-Host "C:\TheTechnicalServerAutoUDisePlus-main"
Write-Host ""

}
catch{

Write-Host ""
Write-Host "Download Failed"

}

PauseMenu

}

function AboutMenu{

while($true){

Clear-Host

Write-Host ""
Write-Host "======================================="
Write-Host "          CONNECT WITH ME"
Write-Host "======================================="
Write-Host ""
Write-Host "👨‍💻 The Technical Server"
Write-Host "✨ Managed by @mr_ariph_ansari"
Write-Host ""
Write-Host "1 📘 Facebook"
Write-Host "2 ▶️ YouTube"
Write-Host "3 🐦 Twitter (X)"
Write-Host "4 📩 Telegram"
Write-Host "5 📸 Instagram"
Write-Host ""
Write-Host "6 Close"
Write-Host ""
Write-Host "🚀 Follow for tech updates,"
Write-Host "projects, tutorials,"
Write-Host "extensions and more."
Write-Host ""
Write-Host "#TheTechnicalServer"
Write-Host "#MrAriphAnsari"
Write-Host "#Technology"
Write-Host "#Developer"
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

function MainMenu{

while($true){

Clear-Host

Write-Host ""
Write-Host "======================================="
Write-Host "      THE TECHNICAL SERVER"
Write-Host "======================================="
Write-Host ""
Write-Host "Auto UDISE Plus"
Write-Host ""
Write-Host "1 Open Blog"
Write-Host "2 Open GitHub Profile"
Write-Host "3 Direct Download Extension"
Write-Host "4 Reload Extension"
Write-Host "5 Download By GitHub Portal"
Write-Host "6 About Me"
Write-Host "7 Close"
Write-Host ""
Write-Host "Thank for choosing us."
Write-Host "Have a good day."
Write-Host ""
Write-Host "One Click • Faster • Smarter"
Write-Host ""
Write-Host "Created By"
Write-Host "@mr_ariph_ansari"
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
Write-Host "Thank for choosing us."
Write-Host ""
Write-Host "See you again."
Write-Host ""
Write-Host "Developed by"
Write-Host "@mr_ariph_ansari"

Start-Sleep 2

exit

}

}

}

}

MainMenu
