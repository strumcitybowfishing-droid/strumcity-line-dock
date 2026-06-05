import { GALLERY_PHOTOS } from "./photos-manifest.js?v=20250608";

const FACEBOOK = "https://www.facebook.com/StrumCityBowfishing/";
const INSTAGRAM = "https://www.instagram.com/strumcityoutdoors/";

export function renderPhotosPage() {
  const tiles = GALLERY_PHOTOS.map(
    (src, i) => `
    <figure class="photo-tile">
      <img src="${src}" alt="Strum City charter photo ${i + 1}" loading="lazy" decoding="async" />
    </figure>
  `
  ).join("");

  return `
    <div class="photos-page">
      <p class="photos-intro">
        A curated selection of our favorite / most awesome photos — a little of everything (bowfishing hauls & trophies, families & groups, rod & reel, offshore catches, boat action, and more).
        Follow for more —
        <a href="${FACEBOOK}" target="_blank" rel="noopener">Facebook</a>
        ·
        <a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
      </p>
      <div class="photo-grid" role="list">${tiles}</div>
    </div>
  `;
}