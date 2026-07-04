$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Get-CimInstance Win32_Process |
    Where-Object {
        ($_.CommandLine -like "*love.py*") -or
        ($_.CommandLine -like "*start_public_love.ps1*") -or
        ($_.Name -eq "cloudflared.exe" -and $_.CommandLine -like "*tunnel*--url*")
    } |
    ForEach-Object {
        try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {}
    }

"Love public website stopped." | Set-Content -LiteralPath (Join-Path $Root "public_status.txt") -Encoding UTF8
