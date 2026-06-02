# Re-download Strum City photos from Facebook posts and website into images/gallery/
# Then regenerates js/photos-manifest.js

$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent
$dir = Join-Path $root "images\gallery"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

function Get-OgImage($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{"User-Agent" = "Mozilla/5.0"} -TimeoutSec 20
    $m = [regex]::Match($r.Content, 'property="og:image" content="([^"]+)"')
    if ($m.Success) { return ($m.Groups[1].Value -replace "&amp;", "&") }
  } catch {}
  return $null
}

$posts = @(
  "https://www.facebook.com/StrumCityBowfishing/posts/these-guys-came-out-as-first-time-bowfisherman-and-left-as-pros-thanks-again-guy/1173089969708327/",
  "https://www.facebook.com/StrumCityBowfishing/posts/season-is-open-to-start-booking-trinity-river-combo-trips-the-night-time-combo-p/667673685367997/",
  "https://www.facebook.com/StrumCityBowfishing/posts/strum-city-baby-they-are-biting-out-deep-mahi-tuna-and-snapper/917018575315469/",
  "https://www.facebook.com/StrumCityBowfishing/posts/those-fish-didnt-stand-a-chance-we-were-on-em-at-80-miles-before-the-sun-came-up/790504379751593/",
  "https://www.facebook.com/StrumCityBowfishing/posts/the-high-water-in-the-lake-has-brought-some-fish-shallow-give-me-a-shout-to-book/1601167965351893/"
)

$urls = [System.Collections.Generic.List[string]]::new()
foreach ($p in $posts) {
  $img = Get-OgImage $p
  if ($img -and -not $urls.Contains($img)) { $urls.Add($img) }
}

$html = (Invoke-WebRequest "https://strumcitybowfishing.com" -UseBasicParsing).Content
[regex]::Matches($html, "isteam/ip/[^""'\s]+") | ForEach-Object {
  $u = "https://img1.wsimg.com/$($_.Value)/:/rs=w:1200,h:1200,cg:true,m/cr=w:1200,h:1200"
  if (-not $urls.Contains($u)) { $urls.Add($u) }
}

$i = 0
foreach ($u in $urls) {
  $i++
  $out = Join-Path $dir ("photo-{0:D3}.jpg" -f $i)
  try {
    Invoke-WebRequest -Uri $u -OutFile $out -UseBasicParsing -Headers @{"User-Agent" = "Mozilla/5.0"}
  } catch {
    Write-Warning "Skip $i"
  }
}

$files = Get-ChildItem $dir -Filter *.jpg | Where-Object { $_.Length -gt 8000 } | Sort-Object Name
$lines = $files | ForEach-Object { "  `"images/gallery/$($_.Name)`"," }
$js = @"
/** Auto-generated gallery file list. Run scripts/refresh-gallery.ps1 to update. */
export const GALLERY_PHOTOS = [
$($lines -join "`n")
];
"@
Set-Content -Path (Join-Path $root "js\photos-manifest.js") -Value $js -Encoding UTF8
Write-Host "Done. $($files.Count) photos in manifest."