Param(
  [string]$Path = ".",
  [string]$Branch = "main",
  [int]$DebounceMs = 1500
)

Write-Host "Starting auto-commit/push watcher on $Path (branch: $Branch)" -ForegroundColor Green

function Commit-And-Push {
  param([string]$ChangedPath)
  try {
    git add -A | Out-Null
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $message = "chore(auto): sync changes at $timestamp"
    # Create commit only if there are staged changes
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
      git commit -m $message | Out-Null
      git push origin $Branch | Out-Null
      Write-Host "Pushed: $message" -ForegroundColor Cyan
    }
  } catch {
    Write-Host "Auto push failed: $($_.Exception.Message)" -ForegroundColor Red
  }
}

$fsw = New-Object System.IO.FileSystemWatcher
$fsw.Path = (Resolve-Path $Path)
$fsw.IncludeSubdirectories = $true
$fsw.EnableRaisingEvents = $true
$fsw.Filter = "*.*"

$lastEvent = [DateTime]::MinValue

$action = {
  $now = Get-Date
  if (($now - $lastEvent).TotalMilliseconds -lt $DebounceMs) { return }
  $lastEvent = $now
  Commit-And-Push -ChangedPath $Event.SourceEventArgs.FullPath
}

Register-ObjectEvent $fsw Changed -Action $action | Out-Null
Register-ObjectEvent $fsw Created -Action $action | Out-Null
Register-ObjectEvent $fsw Deleted -Action $action | Out-Null
Register-ObjectEvent $fsw Renamed -Action $action | Out-Null

while ($true) { Start-Sleep -Seconds 1 }


