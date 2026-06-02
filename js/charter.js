const LICENSE_URL = "https://tpwd.texas.gov/business/licenses/online_sales/";
const LICENSE_INFO_URL =
  "https://tpwd.texas.gov/regulations/outdoor-annual/licenses/fishing-licenses-stamps-tags-packages/fishing-licenses-and-packages";
const PHONE = "9366689014";
const PHONE_DISPLAY = "(936) 668-9014";

export function renderCharterPage() {
  return `
    <div class="charter-page">
      <section class="info-card">
        <h2>The boat</h2>
        <p>Strum City Fishing Charter runs <strong>custom-built boats</strong> set up for bowfishing, lake charters, river trips, and offshore runs. Every trip includes a <strong>licensed captain</strong> and a professional setup built around safety and putting you on fish.</p>
        <p class="info-note">Award-winning, multi-lake experience · All skill levels welcome.</p>
      </section>

      <section class="info-card info-card-accent">
        <h2>What we provide</h2>
        <ul class="info-list">
          <li><strong>Licensed captain</strong> on every charter</li>
          <li><strong>Deckhand</strong> on every charter — you focus on fishing</li>
          <li><strong>All equipment</strong> for the trip (bows, fishing gear, safety gear, lighting &amp; boat systems as needed)</li>
          <li><strong>Ice and bottled water</strong> in a cooler</li>
          <li><strong>Cooler space</strong> for drinks and snacks you want to bring</li>
        </ul>
      </section>

      <section class="info-card">
        <h2>What you need to bring</h2>
        <ul class="info-list">
          <li><strong>Valid Texas fishing license</strong> (required) — see links below</li>
          <li>Texas ID or proof required to purchase a license online</li>
          <li>Sunscreen, sunglasses, and weather-appropriate clothes</li>
          <li>Any <strong>beverages or extra snacks</strong> you want (we have cooler space)</li>
          <li>Camera / phone for photos (optional)</li>
        </ul>
        <p class="info-note">Bowfishing trips: dress for night on the water. Offshore: non-skid shoes recommended.</p>
      </section>

      <section class="info-card">
        <h2>Texas fishing license</h2>
        <p>Texas does not offer a multi-day tourist license like some states. Most guests use a <strong>One-Day All-Water Fishing License</strong> or an <strong>annual</strong> license if you fish often.</p>
        <div class="license-actions">
          <a class="btn-primary" href="${LICENSE_URL}" target="_blank" rel="noopener">Buy license online (TPWD)</a>
          <a class="btn-secondary" href="${LICENSE_INFO_URL}" target="_blank" rel="noopener">License types &amp; prices</a>
        </div>
        <p class="info-fine">Official Texas Parks &amp; Wildlife site. Licenses are also sold at many retailers (Walmart, Academy, etc.).</p>
      </section>

      <section class="info-card">
        <h2>Book a trip</h2>
        <p>Questions or ready to reserve?</p>
        <p><a class="contact-link" href="tel:${PHONE}">${PHONE_DISPLAY}</a></p>
        <p><a class="contact-link" href="https://www.facebook.com/StrumCityBowfishing/" target="_blank" rel="noopener">Message on Facebook</a></p>
        <p><a class="contact-link" href="https://strumcitybowfishing.com" target="_blank" rel="noopener">strumcitybowfishing.com</a></p>
      </section>
    </div>
  `;
}