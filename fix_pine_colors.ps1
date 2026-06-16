# Pine Theme Color Fixer
# Run from: C:\Users\PCUser\desktop\wunschhimmel-v2

$files = @(
    "src\web\pages\impressum.tsx",
    "src\web\pages\agb.tsx",
    "src\web\pages\datenschutz.tsx",
    "src\web\pages\profile.tsx",
    "src\web\pages\list-detail.tsx",
    "src\web\pages\feed.tsx",
    "src\web\pages\shared.tsx",
    "src\web\components\ClipboardWishDetector.tsx",
    "src\web\components\ContactForm.tsx",
    "src\web\components\UpdatePost.tsx"
)

$replacements = @{
    '"#0F1923"' = '"#F1FDF4"'
    '"#162230"' = '"#FFFFFF"'
    '"#1E3A4A"' = '"#6EE7B7"'
    '"#E8F5F3"' = '"#1A3A2A"'
    '"#7FBFB5"' = '"#10B981"'
    '"#2DD4BF"' = '"#10B981"'
    "'#2DD4BF'" = "'#10B981'"
    '"#1A2D3E"' = '"#F1FDF4"'
    '"#1A2D3D"' = '"#E8FAF0"'
    '"linear-gradient(135deg, #2DD4BF, #0F9B8E)"' = '"linear-gradient(135deg, #34D399, #059669)"'
    '"linear-gradient(135deg, #2DD4BF, #0e9f8a)"' = '"linear-gradient(135deg, #34D399, #059669)"'
    '"0 4px 16px rgba(45,212,191,0.30)"' = '"0 4px 16px rgba(52,211,153,0.30)"'
    '"0 4px 14px rgba(45,212,191,0.25)"' = '"0 4px 14px rgba(52,211,153,0.25)"'
    'isPine ? "#0F1923" : "#FDF8FC"' = 'isPine ? "#F1FDF4" : "#FDF8FC"'
    'isPine ? "#0F1923" : "#FFF5FA"' = 'isPine ? "#F1FDF4" : "#FFF5FA"'
    'isPine ? "#162230" : "#FFF0F5"' = 'isPine ? "#FFFFFF" : "#FFF0F5"'
    'isPine ? "#1E3A4A" : "#FFF0F5"' = 'isPine ? "#E8FAF0" : "#FFF0F5"'
    'isPine ? "#1A2D3E" : "#FFF5FA"' = 'isPine ? "#F1FDF4" : "#FFF5FA"'
    'isPine ? "#1E3A4A" : "#FFF0F8"' = 'isPine ? "#D1FAE5" : "#FFF0F8"'
    'isPine ? "#0F1923" : "#fff"' = 'isPine ? "#1A3A2A" : "#fff"'
    'isPine ? "#0a2a1e" : "#F0FDF7"' = 'isPine ? "#F0FDF7" : "#F0FDF7"'
    'isPine ? "#1a0a0a" : "#FFF5F5"' = 'isPine ? "#FFF5F5" : "#FFF5F5"'
    'isPine ? "#2a0a0a" : "#FFF0F0"' = 'isPine ? "#FFF0F0" : "#FFF0F0"'
    'th.id === "pine" ? "#2DD4BF"' = 'th.id === "pine" ? "#059669"'
    '"linear-gradient(135deg, #0F1923, #0e4a5a)"' = '"linear-gradient(135deg, #D1FAE5, #6EE7B7)"'
}

foreach ($file in $files) {
    $fullPath = Join-Path (Get-Location) $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        foreach ($old in $replacements.Keys) {
            $content = $content.Replace($old, $replacements[$old])
        }
        Set-Content $fullPath $content -Encoding UTF8 -NoNewline
        Write-Host "OK: $file"
    } else {
        Write-Host "MISSING: $file"
    }
}

Write-Host ""
Write-Host "Fertig! Jetzt: git add . && git commit -m 'fix: Pine Theme Farben hell' && git push"
