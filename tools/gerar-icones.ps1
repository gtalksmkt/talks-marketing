# Gera os icones do app (simbolo Talks branco sobre o vermelho do brand).
# Uso: powershell -ExecutionPolicy Bypass -File tools\gerar-icones.ps1
param([string]$Saida = (Join-Path $PSScriptRoot '..\icons'))
Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $Saida | Out-Null

# Simbolo = 3 circulos de raio r, cada um com um quarto "quadrado" apontando para fora.
# Centros: TL (0,0)  TR (2r,0)  B (r, 1.732r). Caixa: largura 4r, altura 3.732r.
function Novo-Simbolo([float]$x0, [float]$y0, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $cx = $x0 + $r; $cy = $y0 + $r
  $p.StartFigure(); $p.AddLine($cx - $r, $cy - $r, $cx, $cy - $r); $p.AddArc($cx - $r, $cy - $r, 2 * $r, 2 * $r, 270, 270); $p.CloseFigure()
  $cx = $x0 + 3 * $r
  $p.StartFigure(); $p.AddLine($cx, $cy - $r, $cx + $r, $cy - $r); $p.AddLine($cx + $r, $cy - $r, $cx + $r, $cy); $p.AddArc($cx - $r, $cy - $r, 2 * $r, 2 * $r, 0, 270); $p.CloseFigure()
  $cx = $x0 + 2 * $r; $cy = $y0 + $r + 1.7320508 * $r
  $p.StartFigure(); $p.AddLine($cx + $r, $cy, $cx + $r, $cy + $r); $p.AddLine($cx + $r, $cy + $r, $cx, $cy + $r); $p.AddArc($cx - $r, $cy - $r, 2 * $r, 2 * $r, 90, 270); $p.CloseFigure()
  return $p
}

function Novo-Icone([int]$S, [double]$fracao, [string]$nome) {
  $bmp = New-Object System.Drawing.Bitmap $S, $S
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'; $g.PixelOffsetMode = 'HighQuality'; $g.CompositingQuality = 'HighQuality'
  $rect = New-Object System.Drawing.Rectangle 0, 0, $S, $S
  $fundo = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(232, 48, 63)), ([System.Drawing.Color]::FromArgb(160, 3, 15)), 55
  $g.FillRectangle($fundo, $rect)
  # brilho suave no canto de cima
  $brilho = New-Object System.Drawing.Drawing2D.GraphicsPath
  $brilho.AddEllipse([float](-$S * 0.35), [float](-$S * 0.45), [float]($S * 1.2), [float]($S * 0.9))
  $pb = New-Object System.Drawing.Drawing2D.PathGradientBrush $brilho
  $pb.CenterColor = [System.Drawing.Color]::FromArgb(60, 255, 255, 255)
  $pb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
  $g.FillPath($pb, $brilho)
  $w = $S * $fracao; $r = $w / 4; $h = 3.7320508 * $r
  $x0 = ($S - $w) / 2; $y0 = ($S - $h) / 2 + $S * 0.005
  $simb = Novo-Simbolo $x0 $y0 $r
  $g.FillPath([System.Drawing.Brushes]::White, $simb)
  $g.Dispose()
  $bmp.Save((Join-Path $Saida $nome), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Novo-Icone 512 0.56 'icon-512.png'
Novo-Icone 192 0.56 'icon-192.png'
Novo-Icone 512 0.42 'icon-maskable-512.png'
Novo-Icone 180 0.56 'apple-touch-icon.png'
Novo-Icone 32 0.72 'favicon-32.png'
Write-Host "Icones gerados em $Saida"
