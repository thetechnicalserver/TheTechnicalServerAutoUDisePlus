$RepoZip="https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip"
$ReloadUrl="https://raw.githubusercontent.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/main/install.ps1"

function Key{
return [Console]::ReadKey($true).KeyChar
}

function PauseKey{
[void][Console]::ReadKey($true)
}

function DownloadExtension{

Clear-Host

$temp="$env:TEMP\TheTechnicalServer.zip"
$folder="C:\TheTechnicalServerAutoUDisePlus-main"

Write-Host ""
Write-Host "Downloading Extension..."
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

$guide=@"
<!DOCTYPE html>
<html>
<head>
<title>The Technical Server</title>
<style>
body{
font-family:Arial;
padding:50px;
background:#fafafa;
}
.box{
max-width:900px;
margin:auto;
padding:30px;
border-radius:16px;
border:1px solid #ddd;
}
.step{
padding:12px;
margin:10px 0;
background:#f2f2f2;
border-radius:10px;
}
</style>
</head>

<body>

<div class='box'>

<h1>The Technical Server</h1>

<h3>Extension Setup</h3>

<div class='step'>
1 → Select Chrome Profile (if shown)
</div>

<div class='step'>
2 → Turn ON Developer Mode
</div>

<div class='step'>
3 → Click Load unpacked
</div>

<div class='step'>
4 → Select Folder:
<br><br>
C:\TheTechnicalServerAutoUDisePlus-main
</div>

<br>

Managed by @mr_ariph_ansari

</div>

</body>
</html>
"@

$guideFile="$folder\install_guide.html"

$guide | Set-Content `
$guideFile `
-Encoding UTF8

Start-Process explorer $folder

try{

Start-Process chrome `
"chrome://extensions/"

Start-Sleep 1

Start-Process chrome `
$file:///$guideFile

}
catch{}

Clear-Host

Write-Host ""
Write-Host "Installed Successfully"
Write-Host ""
Write-Host "Location:"
Write-Host $folder
Write-Host ""
Write-Host "Guide Opened In Chrome"

}
catch{

Write-Host ""
Write-Host "Installation Failed"

}

PauseKey

}

function About{

while($true){

Clear-Host

Write-Host ""
Write-Host "🌐 Connect With Me"
Write-Host ""
Write-Host "👨‍💻 The Technical Server"
Write-Host "✨ Managed by @mr_ariph_ansari"
Write-Host ""
Write-Host "1 Facebook"
Write-Host "2 YouTube"
Write-Host "3 Twitter"
Write-Host "4 Telegram"
Write-Host "5 Instagram"
Write-Host "6 Close"
Write-Host ""

$c=Key

switch($c){

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
Write-Host "================================="
Write-Host "THE TECHNICAL SERVER"
Write-Host "================================="
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

$key=Key

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
iex (irm $ReloadUrl)
exit
}

'5'{
Start-Process "https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus"
}

'6'{
About
}

'7'{

Clear-Host

Write-Host ""
Write-Host "Thank for choosing us."
Write-Host "See you again."

Start-Sleep 2

exit

}

}

}
