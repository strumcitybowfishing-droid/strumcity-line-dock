# Shopify Dropshipping Setup for Line & Dock Bowfishing Gear Shop

**IMPORTANT: I cannot take control of your browser, mouse, keyboard, or log into Shopify for you.** 
This is a hard technical and security limitation. I can't see or interact with your other monitor's browser session directly.

**What I *can* do extremely well:**
- Give you **exact, copy-paste, click-by-click instructions**.
- Suggest specific products, descriptions, prices, and suppliers tailored to bowfishing.
- Help you generate the right embed code.
- Once you have products in Shopify, I'll update the `renderShopPage()` in the site code to display them beautifully (Buy Buttons or custom via Storefront API).
- Read **screenshots** you take **live**: Save a screenshot of your Shopify admin (e.g. File > Save or Windows Snipping Tool to Desktop as `shopify-step1.png` or similar), reply here with the **full exact path** (example: `C:\Users\johnn\Desktop\shopify-dashboard.png`), and I'll immediately use tools to read/view the image and tell you the precise next action ("Click the green 'Add product' button in the top right...").

This lets us do real-time guided setup even though I can't control your mouse/keyboard.

**Workflow we'll use:**
1. You log into Shopify on your other monitor.
2. Follow my numbered steps here.
3. When you hit a screen, take a screenshot → tell me the path (e.g., `C:\Users\johnn\Desktop\shopify-step1.png`).
4. I read it and reply with next exact actions.
5. We repeat until products are live and embeds are in your Line & Dock Shop tab.
6. Test end-to-end (order on local :3456 or live site → Shopify checkout → "dropship" flow).

This is the same collaborative way we've built the rest of the site.

## Prerequisites (do these first)
- You already have a Shopify account (good).
- Create a new Shopify store if you don't have one dedicated for this (recommended: separate from any personal store for clean branding).
- Basic store setup: Add your business name "StrumCity Line & Dock Gear", logo if you have one, contact info, policies (returns, shipping – even for dropship, disclose that manufacturers ship directly).
- Payment setup: Shopify Payments or other gateway.
- Domain: You can use a subdomain like shop.strumcitylinedock.com or keep the default .myshopify.com for now.

## Step 1: Choose Dropshipping Suppliers / Apps for Bowfishing Gear
Bowfishing gear (bows, reels, arrows, rests, lights, line, barbed points) is niche sporting/hunting/fishing equipment. Focus on US-based or fast-shipping suppliers to keep customers happy (avoid long China waits if possible).

Recommended apps/suppliers (2026 current):
- **Spocket** or **Zendrop**: Good for US/EU inventory, fast shipping on outdoor/sporting goods.
- **Doba**: Wholesale marketplace with fishing, hunting, archery gear.
- **Syncee** or **EPROLO**: Global, good for branded sporting products.
- **Inventory Source** or specialized fishing suppliers (search "bowfishing wholesale dropship").
- For specific brands: Contact manufacturers directly (AMS Bowfishing, Muzzy, Cajun Bowfishing, etc.) – many have wholesale/dropship programs for retailers/guides.
- Print-on-demand alternatives not ideal here (these are physical durable goods).

**Action for you:**
1. In Shopify admin → Apps → Visit Shopify App Store.
2. Search and install 1-2 (e.g., Spocket + Doba).
3. Connect and browse catalogs for "bowfishing", "archery fishing", "bow fishing reel", "barbed fishing arrow".

Take a screenshot of the supplier catalog results and give me the path.

## Step 2: Add Your First Products (Markup + Dropship Ready)
Aim for 8-12 starter products to launch the shop tab.

**Suggested initial products** (realistic bowfishing niche items that guides use and are hard to source/compare online; prices are example markups – adjust based on your supplier costs):

1. **AMS Bowfishing Kit** (complete bow + reel + arrow setup) – Sell $179.99 (typical wholesale ~$110-130)
2. **Muzzy Bowfishing Arrow with Gar Point** (carbon, 2-pack) – Sell $49.99
3. **Cajun Bowfishing Spin Cast Reel** – Sell $89.99
4. **AMS Retriever Bowfishing Reel** (heavy duty) – Sell $129.99
5. **Barbed Bowfishing Points** (3-pack, stainless) – Sell $24.99
6. **Bowfishing Arrow Rest** (full containment for fishing bows) – Sell $34.99
7. **200lb Hi-Vis Bowfishing Line** (spool, 100 yards) – Sell $19.99
8. **LED Underwater Bowfishing Light** (green, 1000+ lumens, bow mountable) – Sell $79.99
9. **Bowfishing Safety Float / Harness Kit** (for night fishing) – Sell $44.99
10. **Replacement Bowfishing Arrow Tips** (assorted pack) – Sell $29.99

For each:
- Use high-quality images from supplier.
- Detailed description: "Proven on Texas lakes like Conroe and Rayburn by StrumCity guides. Ships direct from manufacturer."
- Enable the dropship app for auto-order.
- Collections: Group into "Kits & Bows", "Reels & Line", "Arrows & Points", "Lights & Accessories".

Take a screenshot after adding 2-3 and share the path so I can review titles/descriptions and suggest tweaks.

For each product in Shopify:
- Title: Clear, searchable (e.g., "AMS Bowfishing Complete Kit - StrumCity Edition").
- Description: Benefits for guides (durable, used by pros on Texas lakes, etc.). Include "Ships direct from manufacturer".
- Price: Your markup (e.g., supplier $89 → you sell $129).
- Variants: Size, color, left/right hand if applicable.
- Images: Use supplier images or your own (high quality).
- Inventory: Set to "Continue selling when out of stock" or use the app's sync.
- Shipping: Since dropship, use supplier's rates or flat (configure in Shopify shipping).
- Tags: "bowfishing", "bows", "reels", "guides-recommended".
- In the app: Enable the dropship supplier for that product so orders auto-forward.

**Exact steps (once logged in):**
1. Left sidebar → **Products** → big green **Add product** button.
2. Fill title, description (use AI in Shopify for help if available).
3. Add images (upload or from supplier).
4. Pricing & inventory section: Set price, compare at price (optional), connect to dropship app.
5. Save.
6. Repeat for 5-8 products.

**Pro tip:** Use collections: Create "Bows & Kits", "Reels & Line", "Arrows & Points", "Lights & Accessories".

Take screenshots of your product list or a product edit screen and share the file path so I can review descriptions/pricing and suggest improvements.

## Step 3: Configure Dropshipping Automation
In the apps you installed:
- Link your supplier accounts.
- For each product, map it to the supplier's SKU.
- Set rules so when an order comes in on Shopify, it automatically creates a purchase order with the manufacturer and they ship direct (you get notified, customer gets tracking).

This is the "no handling shipping" part.

## Step 4: Set Up Buy Buttons or Storefront for Line & Dock Site
This is where the integration happens.

**Easiest for your vanilla JS site: Buy Button (copy-paste embeds)**
- In Shopify: Sales channels (left) → **Buy Button**.
- Select a product or collection.
- Customize appearance (match your green accent #32ff6a if possible).
- Generate code.
- Shopify gives you a <script> tag and a <div> with id.
- In your site code (we'll update `renderShopPage()`), paste the div where you want the product card, and ensure the script is loaded.

Once you generate the first one, copy the full code snippet and paste it here (or screenshot the "Embed code" screen). I'll immediately update the site's Shop tab code to use it.

**Advanced (better UX):** Use Storefront API + JS Buy SDK for fully custom product grid + cart that lives on your site, then redirects to Shopify checkout. We already have the SDK script loading in the current code.

## Step 5: Test the Flow
1. On your local Line & Dock (http://localhost:3456), go to Shop tab.
2. "Buy" a demo product (we'll wire real buttons).
3. Complete checkout on Shopify.
4. Verify order appears in Shopify → triggers dropship to supplier.
5. You get paid the margin.

## Next Actions for You Right Now
1. Log into your Shopify admin on the other monitor.
2. Reply here with:
   - Your Shopify store URL (e.g., yourstore.myshopify.com or custom domain).
   - Which supplier apps you want to try first (or screenshot the App Store search results).
   - A list of 5 specific products you want to start with (or let me suggest based on bowfishing niche).
3. Take your first screenshot of the Shopify dashboard (Products page or home) and tell me the exact file path (e.g., `C:\Users\johnn\Desktop\shopify-dashboard.png` or wherever you save it). I'll read it and give the next click.

I'll stay in this loop with you: you act on your screen, I read screenshots + give next exact instructions, we update the site code in parallel.

We can get the first 4-6 products live and the Shop tab pulling real Buy Buttons today if we move fast.

What’s the first thing you see when you open Shopify admin? Paste a description or (better) the screenshot path.

Let's build this shop! 🎣🛒

(Files updated in project: This guide + previous Shop tab code ready for your embeds.)

---

## Your Real Advantage (Updated After Your Notes)

You already have the two things most dropship shops lack:

1. **Built-in promotion & trust** — Your charter + tournament team name is already known/semi-widely recognized in the bowfishing community. Being active in the 100k-member Bowfishing Nation FB group (and having your name come up there) is gold. Posts like "Restocked the exact points/line/lights the StrumCity guys are running in tournaments this week — shop tab on the Line & Dock site" will drive real, targeted traffic without paid ads.

2. **Authentic repeat demand & curation signal** — You personally buy/replace "multiple things every week just to play" (charters + tournaments). That means you know exactly which consumables turn over (line, points, arrows, lights, safety slides, etc.), what actually holds up on the water, and what the serious guys complain about. Use that. The shop becomes "the convenient all-in-one spot for the stuff the local tournament/guide team actually burns through."

This is **not** a generic product dump. The site positions as the community's practical one-stop for proven gear. People will come back because it's easier than juggling manufacturer sites + Amazon, and because it comes from someone whose reports and boats they already follow.

### Recommended Structure We're Using on the Shop Tab
- StrumCity Picks / "What We're Running This Week" (easy to rotate the hot/relevant stuff)
- Reels & Kits
- Arrows, Points & Rests (high-wear repeat buys)
- Lights & Night Gear
- Line, Safety & Consumables (your weekly volume items — highlight these)
- Bows & Extras

Use **Collections** in Shopify (not just single products) so one embed can power a whole category. That keeps it clean even when you have 30–60+ SKUs.

The copy on the live shop tab now calls out the tournament/community angle and the "we buy this every week" credibility directly.

### Quick Tips to Lean Into Your Strengths
- When you post in Bowfishing Nation or your pages, mention the shop tab + "the exact setup we're using on [lake] this month."
- On the Fishing Reports pages we'll add light "gear that performs here → Shop" callouts (no need to link every single SKU).
- For the high-turnover consumables you buy constantly, price them competitively or as "team restock" bundles — those drive frequency.
- Real photos from your boats/hauls will crush generic stock images.

Update this guide or the code anytime as your supplier list or first products evolve. Just say the word (or drop a screenshot of your Shopify admin / Buy Button screen) and we'll wire the first real embeds and polish further.

Ready when you are — this has strong legs because of who you already are in the scene.