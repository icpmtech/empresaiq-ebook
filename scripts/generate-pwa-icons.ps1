Add-Type -AssemblyName System.Drawing

function New-Icon {
  param(
    [int]$Size,
    [string]$Path
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = 'AntiAlias'

  $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
  $bg1 = [System.Drawing.ColorTranslator]::FromHtml('#1D2951')
  $bg2 = [System.Drawing.ColorTranslator]::FromHtml('#141e3c')
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $bg1, $bg2, 160
  $graphics.FillRectangle($brush, $rect)

  $spineWidth = [Math]::Max(8, [int]($Size * 0.06))
  $spineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#E8720C'))
  $graphics.FillRectangle($spineBrush, 0, 0, $spineWidth, $Size)

  $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 255, 255, 255), 1)
  $step = [Math]::Max(20, [int]($Size * 0.08))
  for ($i = 0; $i -lt $Size; $i += $step) {
    $graphics.DrawLine($gridPen, 0, $i, $Size, $i)
    $graphics.DrawLine($gridPen, $i, 0, $i, $Size)
  }

  $hexSize = [int]($Size * 0.44)
  $hexX = [int](($Size - $hexSize) / 2)
  $hexY = [int]($Size * 0.22)
  $hexPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [Math]::Max(2, [int]($Size * 0.01)))
  $hexPen.Alignment = 'Center'
  $hexRect = New-Object System.Drawing.Rectangle($hexX, $hexY, $hexSize, [int]($Size * 0.36))
  $graphics.DrawRectangle($hexPen, $hexRect)

  $coreSize = [int]($Size * 0.2)
  $coreRect = New-Object System.Drawing.Rectangle([int](($Size - $coreSize) / 2), [int]($Size * 0.34), $coreSize, $coreSize)
  $coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 232, 114, 12))
  $graphics.FillRectangle($coreBrush, $coreRect)
  $corePen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#E8720C'), [Math]::Max(2, [int]($Size * 0.01)))
  $graphics.DrawRectangle($corePen, $coreRect)

  $fontTitle = New-Object System.Drawing.Font('Arial', [int]($Size * 0.11), [System.Drawing.FontStyle]::Bold)
  $fontSubtitle = New-Object System.Drawing.Font('Arial', [int]($Size * 0.035), [System.Drawing.FontStyle]::Regular)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = 'Center'
  $format.LineAlignment = 'Center'

  $titleRect = New-Object System.Drawing.Rectangle(0, [int]($Size * 0.68), $Size, [int]($Size * 0.12))
  $subRect = New-Object System.Drawing.Rectangle(0, [int]($Size * 0.80), $Size, [int]($Size * 0.10))
  $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

  $eqSize = $graphics.MeasureString('EQ', $fontTitle)
  $eqPoint = New-Object System.Drawing.PointF([float](($coreRect.X + (($coreRect.Width - $eqSize.Width) / 2))), [float](($coreRect.Y + (($coreRect.Height - $eqSize.Height) / 2))))
  $titleSize = $graphics.MeasureString('EMPRESAIQ', $fontTitle)
  $titlePoint = New-Object System.Drawing.PointF([float](($titleRect.X + (($titleRect.Width - $titleSize.Width) / 2))), [float]($titleRect.Y))
  $subSize = $graphics.MeasureString('IA LOCAL • OLLAMA • QWEN2.5', $fontSubtitle)
  $subPoint = New-Object System.Drawing.PointF([float](($subRect.X + (($subRect.Width - $subSize.Width) / 2))), [float]($subRect.Y))

  $graphics.DrawString('EQ', $fontTitle, $whiteBrush, $eqPoint)
  $graphics.DrawString('EMPRESAIQ', $fontTitle, $whiteBrush, $titlePoint)
  $graphics.DrawString('IA LOCAL • OLLAMA • QWEN2.5', $fontSubtitle, $whiteBrush, $subPoint)

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bmp.Dispose()
}

$imgDir = Join-Path $PSScriptRoot '..\static\img'
New-Item -ItemType Directory -Force -Path $imgDir | Out-Null
New-Icon -Size 192 -Path (Join-Path $imgDir 'icon-192.png')
New-Icon -Size 512 -Path (Join-Path $imgDir 'icon-512.png')
Write-Host 'Generated icon-192.png and icon-512.png'
