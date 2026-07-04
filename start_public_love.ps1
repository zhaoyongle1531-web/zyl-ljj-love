$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Cloudflared = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $Cloudflared) {
    $Cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
}
if (-not (Test-Path -LiteralPath $Cloudflared)) {
    throw "cloudflared.exe was not found. Please reinstall Cloudflare cloudflared."
}

$ShareFile = Join-Path $Root "share_link.txt"
$PublicFile = Join-Path $Root "public_link.txt"
$OutLog = Join-Path $Root "cloudflared.out.log"
$ErrLog = Join-Path $Root "cloudflared.err.log"

function Stop-OldLoveProcesses {
    Get-CimInstance Win32_Process |
        Where-Object {
            ($_.CommandLine -like "*love.py*") -or
            ($_.Name -eq "cloudflared.exe" -and $_.CommandLine -like "*tunnel*--url*")
        } |
        ForEach-Object {
            try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
        }
}

function Wait-ForLocalUrl {
    for ($i = 0; $i -lt 30; $i++) {
        if (Test-Path -LiteralPath $ShareFile) {
            $local = Get-Content -LiteralPath $ShareFile |
                Where-Object { $_ -match "^http://127\.0\.0\.1:\d+/" } |
                Select-Object -First 1
            if ($local) {
                try {
                    Invoke-WebRequest -UseBasicParsing -Uri $local -TimeoutSec 3 | Out-Null
                    return $local
                } catch {}
            }
        }
        Start-Sleep -Seconds 1
    }
    throw "Local love website did not start."
}

function Wait-ForPublicUrl {
    for ($i = 0; $i -lt 90; $i++) {
        $text = ""
        if (Test-Path -LiteralPath $OutLog) {
            $text += Get-Content -LiteralPath $OutLog -Raw -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $ErrLog) {
            $text += "`n"
            $text += Get-Content -LiteralPath $ErrLog -Raw -ErrorAction SilentlyContinue
        }
        $match = [regex]::Match($text, "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
        if ($match.Success) {
            return $match.Value
        }
        Start-Sleep -Seconds 1
    }
    throw "Cloudflare public URL was not created. Check cloudflared.err.log."
}

Set-Location -LiteralPath $Root
Stop-OldLoveProcesses
Remove-Item -LiteralPath $ShareFile, $PublicFile, $OutLog, $ErrLog -Force -ErrorAction SilentlyContinue

$python = (Get-Command python -ErrorAction Stop).Source
$server = Start-Process -FilePath $python -ArgumentList @("love.py", "--no-browser") -WorkingDirectory $Root -WindowStyle Hidden -PassThru
$localUrl = Wait-ForLocalUrl

$tunnel = Start-Process -FilePath $Cloudflared `
    -ArgumentList @("tunnel", "--protocol", "http2", "--edge-ip-version", "4", "--url", $localUrl) `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -PassThru

$publicUrl = Wait-ForPublicUrl
$lines = @(
    "Love public website",
    "",
    "Copy this link to your partner. It works in mobile browsers:",
    $publicUrl,
    "",
    "Local preview:",
    $localUrl,
    "",
    "Important: keep this computer online and awake. If the computer sleeps, disconnects, or the tunnel stops, this public link will stop working."
)
$lines | Set-Content -LiteralPath $PublicFile -Encoding UTF8

Start-Process $publicUrl

Write-Host ""
Write-Host "Public love website is ready:"
Write-Host $publicUrl
Write-Host ""
Write-Host "The public link is saved in:"
Write-Host $PublicFile
Write-Host ""
Write-Host "Keep this window open if you started it by double-clicking."
Write-Host "Press Ctrl + C to stop. You can also double-click the close script."
Write-Host ""

try {
    while (-not $tunnel.HasExited) {
        Start-Sleep -Seconds 5
        $tunnel.Refresh()
    }
} finally {
    try { Stop-Process -Id $tunnel.Id -Force -ErrorAction SilentlyContinue } catch {}
    try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
}
