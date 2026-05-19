## Build All Blender Dental Models → GLB
## Usage: powershell -File blender/build_all.ps1

$blender = "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe"
$scripts = @("export_tooth.py", "export_cyst.py", "export_resorption.py", "export_jaw.py", "export_tumor.py", "export_bone.py")
$dir     = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n=== Building 6 Dental GLB Models ===" -ForegroundColor Cyan

foreach ($script in $scripts) {
    $path = Join-Path $dir $script
    $name = $script -replace "export_","" -replace "\.py",""
    Write-Host "`n>> Building $name..." -ForegroundColor Yellow
    & $blender --background --python $path 2>&1 | Select-String "Exported:|Error"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Done: $name.glb" -ForegroundColor Green
    } else {
        Write-Host "   FAILED: $name" -ForegroundColor Red
    }
}

Write-Host "`n=== All models built ===" -ForegroundColor Cyan
Get-ChildItem (Join-Path $dir "..\public\models\*.glb") | Format-Table Name, @{N="Size(KB)";E={[math]::Round($_.Length/1KB, 1)}} -AutoSize
