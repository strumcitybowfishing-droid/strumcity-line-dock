import { GALLERY_PHOTOS } from "./photos-manifest.js";

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
        ${GALLERY_PHOTOS.length} photos from Strum City posts, our site, and social.
        Follow for more —
        <a href="${FACEBOOK}" target="_blank" rel="noopener">Facebook</a>
        ·
        <a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a>
      </p>
      <div class="photo-grid" role="list">${tiles}</div>
    </div>
  `;
}