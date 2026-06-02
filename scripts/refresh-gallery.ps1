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
  "https://www.facebook.com/StrumCityBowfishing/posts/the-high-water-in-the-lake-has-brought-some-fish-shallow-give-me-a-shout-to-book/1601167965351893/",
  "https://www.facebook.com/StrumCityBowfishing/posts/bowfishing-season-is-fast-approaching-booking-will-open-and-first-available-will/1185933663541994/",
  "https://www.facebook.com/StrumCityBowfishing/posts/191-crappie-in-35hrs-today-cant-really-get-any-better-fishing-than-that/1521478836654140/",
  "https://www.facebook.com/StrumCityBowfishing/posts/lake-conroe-i-have-availability-this-weekend-for-bowfishing-936-668-9014-captjoh/1593989409403082/",
  "https://www.facebook.com/StrumCityBowfishing/posts/2024-bowfishing-booking-is-openwe-are-opening-up-the-calendar-for-booking-the-re/901724265296270/",
  "https://www.facebook.com/StrumCityBowfishing/posts/its-not-daylight-yet-but-good-luck-everyone-for-texas-archery-season-opener-be-c/811067004361997/",
  "https://www.facebook.com/StrumCityBowfishing/posts/chandler-is-out-here-in-the-shop-tonight-applying-high-end-auto-paint-on-the-21f/1014091117392917/",
  "https://www.facebook.com/StrumCityBowfishing/posts/last-minute-cancelation-for-tonight-ill-cut-a-deal-at-200person-2-4-people-all-e/1749361465414505/",
  "https://www.facebook.com/StrumCityBowfishing/posts/chans-family-came-into-town-for-a-unique-experience-season-isnt-quiet-there-but-/1548282407307116/"
)

$urls = [System.Collections.Generic.List[string]]::new()
foreach ($p in $posts) {
  $img = Get-OgImage $p
  if ($img -and -not $urls.Contains($img)) { $urls.Add($img) }
}

$html = (Invoke-WebRequest "https://strumcitybowfishing.com" -UseBasicParsing -Headers @{"User-Agent" = "Mozilla/5.0"}).Content
[regex]::Matches($html, "isteam/ip/[^""'\s]+") | ForEach-Object {
  $u = "https://img1.wsimg.com/$($_.Value)/:/rs=w:1200,h:1200,cg:true,m/cr=w:1200,h:1200"
  if (-not $urls.Contains($u)) { $urls.Add($u) }
}

# Load current hashes to avoid re-downloading duplicates
$currentHashes = @{}
Get-ChildItem $dir -Filter *.jpg | ForEach-Object {
  try { $h = (Get-FileHash $_.FullName -Algorithm MD5).Hash; $currentHashes[$h] = $true } catch {}
}

$newAdded = 0
$maxExisting = (Get-ChildItem $dir -Filter "photo-*.jpg" | ForEach-Object { try { [int]($_.BaseName -replace 'photo-','') } catch { 0 } } | Measure-Object -Maximum).Maximum
$nextNum = if ($maxExisting -gt 0) { $maxExisting + 1 } else { 1 }

foreach ($u in $urls) {
  try {
    $temp = Join-Path $env:TEMP ("temp_photo_$([guid]::NewGuid()).jpg")
    Invoke-WebRequest -Uri $u -OutFile $temp -UseBasicParsing -Headers @{"User-Agent" = "Mozilla/5.0"} -TimeoutSec 30
    $h = (Get-FileHash $temp -Algorithm MD5).Hash
    if (-not $currentHashes.ContainsKey($h)) {
      $padded = $nextNum.ToString().PadLeft(3, '0')
      $out = Join-Path $dir "photo-$padded.jpg"
      Move-Item $temp $out -Force
      $currentHashes[$h] = $true
      $nextNum++
      $newAdded++
      Write-Host "Added new: $out"
    } else {
      Remove-Item $temp -Force
    }
  } catch {
    Write-Warning "Skip $u : $_"
  }
}
Write-Host "Added $newAdded new unique photos from FB + site."

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