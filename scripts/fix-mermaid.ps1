$docsDir = "$env:USERPROFILE\empresaiq-ebook\docs"
$files = Get-ChildItem "$docsDir\*.md"
$pattern = "\n+`mermaid\n[\s\S]*?\n`\n+"
$fixed = 0

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    # Check for single-backtick mermaid line
    if ($content -match "(?m)^``mermaid$") {
        $newContent = [regex]::Replace($content, $pattern, "`n`n")
        if ($newContent -ne $content) {
            Set-Content $f.FullName $newContent -NoNewline
            Write-Host "FIXED: $($f.Name)"
            $fixed++
        } else {
            Write-Host "PATTERN NOT MATCHED: $($f.Name)"
        }
    }
}

Write-Host ""
Write-Host "Total fixed: $fixed"
