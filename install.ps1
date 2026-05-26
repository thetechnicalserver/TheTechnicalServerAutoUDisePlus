$RepoZip="https://github.com/thetechnicalserver/TheTechnicalServerAutoUDisePlus/archive/refs/heads/main.zip"

function DownloadAndOpen{

$temp="$env:TEMP\TheTechnicalServer.zip"
$folder="C:\TheTechnicalServerAutoUDisePlus-main"

Clear-Host

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
<title>Extension Setup</title>
<style>
body{
font-family:Arial;
padding:40px;
}
.box{
border:2px solid #333;
padding:25px;
border-radius:12px;
}
h1{
color:#1976d2;
}
.step{
font-size:18px;
margin:16px 0;
}
</style>
</head>

<body>

<div class='box'>

<h1>The Technical Server</h1>

<p>Extension Downloaded Successfully</p>

<div class='step'>
1 → Open Chrome Extensions
</div>

<div class='step'>
2 → Turn ON Developer Mode
</div>

<div class='step'>
3 → Click Load unpacked
</div>

<div class='step'>
4 → Select:
<br><br>
C:\TheTechnicalServerAutoUDisePlus-main
</div>

<br>

<p>
Managed by @mr_ariph_ansari
</p>

</div>

</body>
</html>
"@

$guidePath="C:\TheTechnicalServerAutoUDisePlus-main\install_guide.html"

$guide | Set-Content `
$guidePath `
-Encoding UTF8

Start-Process explorer $folder

try{

Start-Process chrome `
"chrome://extensions/"

Start-Sleep 1

Start-Process chrome `
$filePath

}
catch{}

Write-Host ""
Write-Host "Completed"
Write-Host ""

}
catch{

Write-Host ""
Write-Host "Download Failed"

}

Pause

}

while($true){

Clear-Host

Write-Host ""
Write-Host "THE TECHNICAL SERVER"
Write-Host ""
Write-Host "1 Download Extension"
Write-Host "2 Open GitHub"
Write-Host "3 Exit"
Write-Host ""

$key=[Console]::ReadKey($true).KeyChar

switch($key){

'1'{

DownloadAndOpen

}

'2'{

Start-Process `
"https://github.com/thetechnicalserver"

}

'3'{

exit

}

}

}
