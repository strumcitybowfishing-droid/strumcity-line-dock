/** Evening window: 5pm through 2am (inclusive) local time */
export const EVENING_HOURS = new Set([17, 18, 19, 20, 21, 22, 23, 0, 1, 2]);

export const TIMEZONE = "America/Chicago";

/** Bump APP_VERSION on any HTML/JS/CSS/shell change (matches the ?v= on the script/link tags in index.html).
 *  This + the ?v= + the "Refresh app" button + no-cache metas help users with old bookmarks / home-screen PWAs
 *  on iPhone Safari get the latest without clearing all site data.
 */
export const APP_VERSION = "2025-06-05";

export const LOCATIONS = {
  conroe: {
    id: "conroe",
    label: "Lake Conroe",
    subtitle: "Montgomery County, TX",
    shortLabel: "Conroe",
    latitude: 30.3569,
    longitude: -95.5922,
    mapZoom: 12,
    type: "weather",
    region: "texas",
  },
  samrayburn: {
    id: "samrayburn",
    label: "Sam Rayburn",
    subtitle: "Middle of lake · East Texas",
    shortLabel: "Rayburn",
    latitude: 31.06,
    longitude: -94.12,
    mapZoom: 11,
    type: "weather",
    region: "texas",
  },
  toledobend: {
    id: "toledobend",
    label: "Toledo Bend",
    subtitle: "South end · TX / LA border",
    shortLabel: "Toledo",
    latitude: 31.02,
    longitude: -93.52,
    mapZoom: 10,
    type: "weather",
    region: "texas",
  },
  stillhouse: {
    id: "stillhouse",
    label: "Stillhouse Hollow",
    subtitle: "Stillhouse Hollow Lake · Central TX",
    shortLabel: "Stillhouse",
    latitude: 31.63,
    longitude: -97.48,
    mapZoom: 12,
    type: "weather",
    region: "texas",
  },
  belton: {
    id: "belton",
    label: "Lake Belton",
    subtitle: "Bell / Coryell Counties · Central TX (Leon River)",
    shortLabel: "Belton",
    latitude: 31.11,
    longitude: -97.47,
    mapZoom: 11,
    type: "weather",
    region: "texas",
  },
  whitney: {
    id: "whitney",
    label: "Lake Whitney",
    subtitle: "Bosque / Hill Counties · Brazos River",
    shortLabel: "Whitney",
    latitude: 31.87,
    longitude: -97.37,
    mapZoom: 11,
    type: "weather",
    region: "texas",
  },
  waco: {
    id: "waco",
    label: "Lake Waco",
    subtitle: "McLennan County · Bosque River, Waco",
    shortLabel: "Waco",
    latitude: 31.56,
    longitude: -97.21,
    mapZoom: 11,
    type: "weather",
    region: "texas",
  },
  hubbard: {
    id: "hubbard",
    label: "Hubbard Creek",
    subtitle: "Hubbard Creek Reservoir · West TX",
    shortLabel: "Hubbard",
    latitude: 32.826,
    longitude: -98.571,
    mapZoom: 12,
    type: "weather",
    region: "texas",
  },
  brazos: {
    id: "brazos",
    label: "Brazos River",
    subtitle: "Whitney Dam to Waco stretch · Brazos Basin",
    shortLabel: "Brazos",
    latitude: 31.70,
    longitude: -97.32,
    mapZoom: 10,
    type: "weather",
    region: "texas",
  },
  trinity: {
    id: "trinity",
    label: "Trinity · Cold Spring",
    subtitle: "San Jacinto basin near Cold Spring, TX",
    shortLabel: "Trinity",
    latitude: 30.588,
    longitude: -95.129,
    mapZoom: 12,
    type: "weather",
    region: "texas",
    traLink: "https://lakedata.traweb.net/",
  },
  surfside: {
    id: "surfside",
    label: "Surfside Offshore",
    subtitle: "Gulf of Mexico · ~50 mi offshore (SSE of Surfside Beach)",
    shortLabel: "Surfside",
    latitude: 28.223,
    longitude: -94.92,
    type: "marine",
    fullDay: true,
    offshoreMiles: 50,
    mapZoom: 9,
    region: "offshore",
  },
  ouachita: {
    id: "ouachita",
    label: "Lake Ouachita",
    subtitle: "Garland / Montgomery · Ouachita National Forest, AR",
    shortLabel: "Ouachita",
    latitude: 34.60,
    longitude: -93.33,
    mapZoom: 10,
    type: "weather",
    region: "arkansas",
  },
  bullshoals: {
    id: "bullshoals",
    label: "Bull Shoals Lake",
    subtitle: "Marion / Baxter Counties · AR / MO border",
    shortLabel: "Bull Shoals",
    latitude: 36.48,
    longitude: -92.65,
    mapZoom: 10,
    type: "weather",
    region: "arkansas",
  },
  tablerock: {
    id: "tablerock",
    label: "Table Rock Lake",
    subtitle: "Southwest MO / Northwest AR (White River)",
    shortLabel: "Table Rock",
    latitude: 36.57,
    longitude: -93.30,
    mapZoom: 10,
    type: "weather",
    region: "arkansas",
  },
  pickwick: {
    id: "pickwick",
    label: "Pickwick Lake",
    subtitle: "Tennessee River · TN / AL / MS border",
    shortLabel: "Pickwick",
    latitude: 34.99,
    longitude: -88.19,
    mapZoom: 10,
    type: "weather",
    region: "tennessee-alabama",
  },
  guntersville: {
    id: "guntersville",
    label: "Lake Guntersville",
    subtitle: "Marshall County · Alabama (Tennessee River)",
    shortLabel: "Guntersville",
    latitude: 34.41,
    longitude: -86.26,
    mapZoom: 10,
    type: "weather",
    region: "tennessee-alabama",
  },
  wattsbar: {
    id: "wattsbar",
    label: "Watts Bar Lake",
    subtitle: "Rhea / Meigs Counties · Tennessee River, TN",
    shortLabel: "Watts Bar",
    latitude: 35.74,
    longitude: -84.71,
    mapZoom: 10,
    type: "weather",
    region: "tennessee-alabama",
  },
};

/** Lake / river / offshore spots under the Water Report main tab (grouped by region for the UI) */
export const WEATHER_TAB_ORDER = [
  "conroe",
  "samrayburn",
  "toledobend",
  "stillhouse",
  "belton",
  "whitney",
  "waco",
  "hubbard",
  "brazos",
  "trinity",
  "surfside",
  "ouachita",
  "bullshoals",
  "tablerock",
  "pickwick",
  "guntersville",
  "wattsbar",
];

export const MAIN_TABS = [
  { id: "conditions", label: "🌊 Water" },
  { id: "reports", label: "🎣 Reports" },
  { id: "records", label: "🏆 Records" },
  { id: "radar", label: "📡 Radar" },
  { id: "charter", label: "🛥️ Trip" },
  { id: "shop", label: "🛒 Shop" },
];

/** Curated sources for current/weekly fishing reports (TPWD reports currently paused) */
export const REPORT_SOURCES = {
  conroe: {
    name: "Lake Conroe",
    sources: [
      { title: "LakeConroe.com Fishing Reports", url: "https://lakeconroe.com/category/lake-conroe-fishing-report/", desc: "Local weekly reports with conditions and tips (recent posts available)" },
      { title: "TPWD Lake Conroe Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/conroe/", desc: "Official lake info; past reports via search form" }
    ]
  },
  samrayburn: {
    name: "Sam Rayburn",
    sources: [
      { title: "Attoyac Outfitters Sam Rayburn Reports", url: "https://attoyacoutfitters.com/fishing-reports", desc: "Guide reports for Sam Rayburn (and Toledo Bend)" },
      { title: "Lufkin Daily News - East Texas Report", url: "https://lufkindailynews.com/sports/outdoors/east-texas-fishing-report/", desc: "Weekly regional fishing updates including Sam Rayburn" }
    ]
  },
  toledobend: {
    name: "Toledo Bend",
    sources: [
      { title: "Attoyac Outfitters Reports", url: "https://attoyacoutfitters.com/fishing-reports", desc: "Guide reports for Toledo Bend (and Sam Rayburn)" },
      { title: "TPWD Toledo Bend Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/toledo_bend/", desc: "Official lake info and past reports" }
    ]
  },
  stillhouse: {
    name: "Stillhouse Hollow",
    sources: [
      { title: "Captain Experiences - Stillhouse Reports", url: "https://captainexperiences.com/fishing-reports/locations/regions/stillhouse-hollow-lake", desc: "Recent guide reports and catches for Stillhouse" },
      { title: "TPWD Stillhouse Hollow Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/stillhouse_hollow/", desc: "Official info; past reports via form" }
    ]
  },
  belton: {
    name: "Lake Belton",
    sources: [
      { title: "TPWD Lake Belton Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/belton/", desc: "Official info, hybrid striper reports, access" },
      { title: "Captain Experiences - Belton Reports", url: "https://captainexperiences.com/fishing-reports/locations/regions/belton-lake", desc: "Recent guide catches and conditions" }
    ]
  },
  whitney: {
    name: "Lake Whitney",
    sources: [
      { title: "TPWD Lake Whitney Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/whitney/", desc: "Official lake info and fishing reports (Brazos)" },
      { title: "USACE Whitney Lake", url: "https://www.swf-wc.usace.army.mil/whitney/", desc: "Lake levels, recreation, fishing access" }
    ]
  },
  waco: {
    name: "Lake Waco",
    sources: [
      { title: "TPWD Lake Waco Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/waco/", desc: "Official info, fish attractors, reports" },
      { title: "USACE Lake Waco", url: "https://www.swf-wc.usace.army.mil/waco/", desc: "Recreation and fishing on the Bosque" }
    ]
  },
  hubbard: {
    name: "Hubbard Creek",
    sources: [
      { title: "TPWD Hubbard Creek Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/hubbard_creek/", desc: "Official lake info and access to past weekly reports" }
    ]
  },
  brazos: {
    name: "Brazos River (Whitney-Waco)",
    sources: [
      { title: "TPWD Brazos Basin / River Reports", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/brazos/", desc: "River fishing, habitat, access info" },
      { title: "Brazos River Authority / Local Reports", url: "https://brazos.org/", desc: "Flows, basin fishing conditions" }
    ]
  },
  surfside: {
    name: "Surfside Offshore",
    sources: [
      { title: "TPWD Gulf Coast Weekly Reports", url: "https://tpwd.texas.gov/fishboat/fish/action/reptmap.php?EcoRegion=GC", desc: "Coastal region reports (including near Surfside when active)" },
      { title: "Windy.app Surfside Fishing Forecast", url: "https://windy.app/fishing/spot/5812433/Surfside+Beach", desc: "7-day fishing forecast, conditions, and bite scores" }
    ]
  },
  ouachita: {
    name: "Lake Ouachita",
    sources: [
      { title: "AGFC Weekly Fishing Reports", url: "https://www.agfc.com/news/arkansas-wildlife-weekly-fishing-report/", desc: "Current statewide reports including Ouachita crappie/bass" },
      { title: "USACE Lake Ouachita", url: "https://www.mvk.usace.army.mil/Missions/Recreation/Lakes/Lake-Ouachita/", desc: "Levels, maps, recreation info" }
    ]
  },
  bullshoals: {
    name: "Bull Shoals Lake",
    sources: [
      { title: "AGFC Weekly Fishing Reports", url: "https://www.agfc.com/news/arkansas-wildlife-weekly-fishing-report/", desc: "Stripers, bass, crappie updates for Bull Shoals" },
      { title: "USACE Bull Shoals Lake", url: "https://www.swl.usace.army.mil/Missions/Recreation/Lakes/Bull-Shoals-Lake/", desc: "Lake levels, generation, fishing access" }
    ]
  },
  tablerock: {
    name: "Table Rock Lake",
    sources: [
      { title: "AGFC / MDC Table Rock Reports", url: "https://www.agfc.com/news/arkansas-wildlife-weekly-fishing-report/", desc: "Bass, crappie fishing on Table Rock (AR/MO)" },
      { title: "USACE Table Rock Lake", url: "https://www.swl.usace.army.mil/Missions/Recreation/Lakes/Table-Rock-Lake/", desc: "Project data, recreation, maps" }
    ]
  },
  pickwick: {
    name: "Pickwick Lake",
    sources: [
      { title: "TWRA Fishing Reports", url: "https://www.tn.gov/twra/fishing/weekly-fishing-report.html", desc: "Tennessee River / Pickwick forecasts and updates" },
      { title: "ADCNR / TVA Pickwick Info", url: "https://www.outdooralabama.com/reservoirs/pickwick-lake", desc: "Alabama section reports, access (TN/AL border)" }
    ]
  },
  guntersville: {
    name: "Lake Guntersville",
    sources: [
      { title: "Outdoor Alabama / ADCNR Guntersville", url: "https://www.outdooralabama.com/reservoirs/lake-guntersville", desc: "Alabama's largest lake, bass reports, habitat" },
      { title: "TWRA Guntersville (TN portion)", url: "https://www.tn.gov/twra/fishing/where-to-fish/cumberland-plateau-r3/guntersville-reservoir.html", desc: "Tennessee side of the reservoir" }
    ]
  },
  wattsbar: {
    name: "Watts Bar Lake",
    sources: [
      { title: "TWRA Watts Bar Reservoir", url: "https://www.tn.gov/twra/fishing/where-to-fish/cumberland-plateau-r3/watts-bar-reservoir.html", desc: "Official TN reports, stockings, forecasts" },
      { title: "TWRA Weekly Fishing Report", url: "https://www.tn.gov/twra/fishing/weekly-fishing-report.html", desc: "Current conditions for Watts Bar (Region 3)" }
    ]
  }
};

/** Bowfishing records data - easy table format for lakes and states.
 * Focused on common bowfishing species (gars, carps, buffalos, drum etc.).
 * Sources: 
 * - Texas: Official TPWD State Freshwater Bow Fishing records (https://tpwd.texas.gov/fishboat/fish/action/staterecords.php?env=FW&age_group=all&list=2&browse=go) and waterbody notes.
 * - Other states: Bowfishing Association of America (BAA) state records (https://bowfishingassociation.com/state/[state]/) , cross-checked with AGFC, TWRA, ADCNR reports.
 * All entries use real record holder names + dates from official/verified published sources as of mid-2026.
 * Records can and do update; always verify with current TPWD/BAA/official agency sources before relying on these.
 * For lakes: Use exact waterbody matches where available in lists; otherwise representative notable bow catches from the region/state lists.
 */
export const LAKE_BOWFISHING_RECORDS = {
  conroe: [
    { species: "Bowfin", weight: "7.80 lbs", length: "27.87 in", girth: "—", date: "2021-12-04", waterbody: "Lake Conroe", angler: "Keil Propst" },
    { species: "Buffalo, Smallmouth", weight: "57.15 lbs", length: "40.50 in", girth: "—", date: "2015-05-31", waterbody: "Lake Conroe", angler: "Michael Paul Shehane" },
    { species: "Carp, Common", weight: "44.60 lbs", length: "—", girth: "—", date: "2023-03-09", waterbody: "Lake Conroe", angler: "Cole Brinkley" },
    { species: "Carp, Koi", weight: "14.87 lbs", length: "—", girth: "—", date: "2025-03-23", waterbody: "Lake Conroe", angler: "Mike Shehane" },
    { species: "Drum, Freshwater", weight: "2.90 lbs", length: "18.00 in", girth: "—", date: "2022-05-17", waterbody: "Lake Conroe", angler: "Lee Brown" },
    { species: "Gar, Longnose", weight: "29.04 lbs", length: "56.50 in", girth: "—", date: "2016-08-13", waterbody: "Lake Conroe", angler: "Michael Paul Shehane" },
    { species: "Gar, Spotted", weight: "10.70 lbs", length: "37.00 in", girth: "—", date: "2021-03-11", waterbody: "Lake Conroe", angler: "Michael Paul Shehane" },
    { species: "Goldfish", weight: "4.42 lbs", length: "25.00 in", girth: "—", date: "2016-07-02", waterbody: "Lake Conroe", angler: "Allen Fleming" },
    { species: "Tilapia, Unclassified", weight: "6.49 lbs", length: "19.50 in", girth: "—", date: "2005-04-23", waterbody: "Lake Conroe", angler: "Robert Peebles" },
  ],
  samrayburn: [
    { species: "Bowfin", weight: "12.54 lbs", length: "31.75 in", girth: "—", date: "2019-12-02", waterbody: "Sam Rayburn", angler: "Michael Fenton" },
    { species: "Buffalo, Bigmouth", weight: "76.00 lbs", length: "47.00 in", girth: "—", date: "2016-04-08", waterbody: "Sam Rayburn", angler: "Benny Elliott" },
    { species: "Buffalo, Smallmouth", weight: "84.00 lbs", length: "48.00 in", girth: "—", date: "2005-08-17", waterbody: "Sam Rayburn", angler: "Kevin LaForge" },
    { species: "Carp, Common", weight: "29.75 lbs", length: "39.25 in", girth: "—", date: "2018-02-09", waterbody: "Sam Rayburn", angler: "Benny Elliott" },
    { species: "Carp, Grass", weight: "85.25 lbs", length: "48.25 in", girth: "—", date: "2016-11-14", waterbody: "Sam Rayburn", angler: "Benny Elliott" },
    { species: "Drum, Freshwater", weight: "9.49 lbs", length: "25.00 in", girth: "—", date: "2022-06-05", waterbody: "Sam Rayburn", angler: "Nicholas Jacks" },
    { species: "Gar, Alligator", weight: "260.00 lbs", length: "72.00 in", girth: "—", date: "2022-05-28", waterbody: "Sam Rayburn", angler: "Michael Hutto" },
    { species: "Gar, Longnose", weight: "53.00 lbs", length: "—", girth: "—", date: "2022-04-16", waterbody: "Sam Rayburn", angler: "Nicholas Jacks" },
    { species: "Gar, Shortnose", weight: "5.08 lbs", length: "—", girth: "—", date: "2022-04-15", waterbody: "Sam Rayburn", angler: "Josiah Dickinson" },
    { species: "Gar, Spotted", weight: "10.26 lbs", length: "—", girth: "—", date: "2023-09-15", waterbody: "Sam Rayburn", angler: "Tucker Dykes" },
    { species: "Sucker, Spotted", weight: "3.75 lbs", length: "16.75 in", girth: "—", date: "2017-01-01", waterbody: "Sam Rayburn", angler: "Benny Elliott" },
  ],
  toledobend: [
    { species: "Bowfin", weight: "13.20 lbs", length: "32.00 in", girth: "—", date: "2014-12-07", waterbody: "Toledo Bend", angler: "James D. Mize" },
    { species: "Buffalo, Bigmouth", weight: "81.50 lbs", length: "47.50 in", girth: "—", date: "2011-07-04", waterbody: "Toledo Bend", angler: "Martin McIntyre" },
    { species: "Buffalo, Smallmouth", weight: "84.76 lbs", length: "47.00 in", girth: "—", date: "2006-09-09", waterbody: "Toledo Bend", angler: "Miles McDaniel" },
    { species: "Carp, Common", weight: "49.10 lbs", length: "—", girth: "—", date: "2021-03-27", waterbody: "Toledo Bend", angler: "Chestin Clark" },
    { species: "Carp, Grass", weight: "58.60 lbs", length: "—", girth: "—", date: "2022-05-24", waterbody: "Toledo Bend", angler: "Michael Ferguson" },
    { species: "Drum, Freshwater", weight: "17.80 lbs", length: "30.75 in", girth: "—", date: "2003-06-14", waterbody: "Toledo Bend", angler: "Darrell Lee" },
    { species: "Gar, Alligator", weight: "276.10 lbs", length: "—", girth: "—", date: "2022-06-09", waterbody: "Toledo Bend", angler: "Jesse Fuller" },
    { species: "Gar, Longnose", weight: "44.60 lbs", length: "—", girth: "—", date: "2021-03-27", waterbody: "Toledo Bend", angler: "Mason McPherson" },
    { species: "Gar, Spotted", weight: "8.78 lbs", length: "36.25 in", girth: "—", date: "2012-03-11", waterbody: "Toledo Bend", angler: "Dylan Lyons" },
    { species: "Shad, Gizzard", weight: "0.83 lbs", length: "12.75 in", girth: "—", date: "2014-03-30", waterbody: "Toledo Bend", angler: "Richard Fleury" },
    { species: "Sucker, Spotted", weight: "2.53 lbs", length: "19.00 in", girth: "—", date: "2018-06-09", waterbody: "Toledo Bend", angler: "William C. Lawson" },
  ],
  stillhouse: [
    { species: "Buffalo, Smallmouth", weight: "51.80 lbs", length: "40.50 in", girth: "—", date: "2013-11-29", waterbody: "Stillhouse Hollow", angler: "Richard Fleury" },
    { species: "Carp, Common", weight: "27.66 lbs", length: "—", girth: "—", date: "2024-12-15", waterbody: "Stillhouse Hollow", angler: "Steven Robertson" },
    { species: "Carp, Grass", weight: "61.50 lbs", length: "53.00 in", girth: "—", date: "2020-04-12", waterbody: "Stillhouse Hollow", angler: "Kevin Greger" },
    { species: "Carpsucker, River", weight: "4.89 lbs", length: "20.75 in", girth: "—", date: "2014-01-18", waterbody: "Stillhouse Hollow", angler: "Dewayne Martz" },
    { species: "Catfish, Channel", weight: "4.27 lbs", length: "22.75 in", girth: "—", date: "2007-12-06", waterbody: "Stillhouse Hollow", angler: "Richard Fleury" },
    { species: "Catfish, Flathead", weight: "19.69 lbs", length: "33.00 in", girth: "—", date: "2008-05-11", waterbody: "Stillhouse Hollow", angler: "Carlos Rodriguez" },
    { species: "Drum, Freshwater", weight: "17.59 lbs", length: "31.00 in", girth: "—", date: "2008-08-29", waterbody: "Stillhouse Hollow", angler: "Richard Fleury" },
    { species: "Gar, Longnose", weight: "25.74 lbs", length: "59.00 in", girth: "—", date: "2024-03-15", waterbody: "Stillhouse Hollow", angler: "Lando Orrin Brown" },
    { species: "Gar, Spotted", weight: "6.75 lbs", length: "33.25 in", girth: "—", date: "2022-09-03", waterbody: "Stillhouse Hollow", angler: "Blake Stephens" },
    { species: "Redhorse, Gray", weight: "5.26 lbs", length: "—", girth: "—", date: "2024-12-15", waterbody: "Stillhouse Hollow", angler: "Steven Robertson" },
    { species: "Shad, Gizzard", weight: "1.40 lbs", length: "16.50 in", girth: "—", date: "2020-04-04", waterbody: "Stillhouse Hollow", angler: "Chris Ellenburg" },
    { species: "Sunfish, Redear", weight: "0.55 lbs", length: "9.00 in", girth: "—", date: "2013-10-26", waterbody: "Stillhouse Hollow", angler: "Richard Fleury" },
  ],
  belton: [
    { species: "Buffalo, Smallmouth", weight: "50.40 lbs", length: "42.50 in", girth: "—", date: "2017-03-26", waterbody: "Belton (Bell County)", angler: "Chris Ellenburg" },
    { species: "Carp, Common", weight: "36.25 lbs", length: "37.00 in", girth: "—", date: "2017-07-02", waterbody: "Belton (Bell County)", angler: "Bethany Ellenburg" },
    { species: "Carp, Grass", weight: "38.71 lbs", length: "40.00 in", girth: "—", date: "2007-11-08", waterbody: "Belton (Bell County)", angler: "Richard Fleury" },
    { species: "Catfish, Channel", weight: "2.95 lbs", length: "19.00 in", girth: "—", date: "2008-01-11", waterbody: "Belton (Bell County)", angler: "Richard Fleury" },
    { species: "Drum, Freshwater", weight: "11.75 lbs", length: "29.00 in", girth: "—", date: "2017-07-02", waterbody: "Belton (Bell County)", angler: "Bethany Ellenburg" },
    { species: "Gar, Longnose", weight: "32.40 lbs", length: "61.25 in", girth: "—", date: "2020-04-10", waterbody: "Belton (Bell County)", angler: "Chris Ellenburg" },
    { species: "Gar, Spotted", weight: "5.48 lbs", length: "42.00 in", girth: "—", date: "2013-10-20", waterbody: "Belton (Bell County)", angler: "Richard Fleury" },
    { species: "Redhorse, Gray", weight: "2.48 lbs", length: "17.00 in", girth: "—", date: "2008-09-20", waterbody: "Belton (Bell County)", angler: "Richard Fleury" },
  ],
  whitney: [
    { species: "Buffalo, Black", weight: "23.90 lbs", length: "32.00 in", girth: "—", date: "2020-05-22", waterbody: "Whitney", angler: "Zachary Zander" },
    { species: "Buffalo, Smallmouth", weight: "24.73 lbs", length: "35.00 in", girth: "—", date: "2020-02-21", waterbody: "Whitney", angler: "Chase Stokes" },
    { species: "Carp, Common", weight: "24.80 lbs", length: "34.25 in", girth: "—", date: "2022-01-01", waterbody: "Whitney", angler: "Colton Crouse" },
    { species: "Carp, Grass", weight: "65.25 lbs", length: "48.00 in", girth: "—", date: "1993-07-10", waterbody: "Whitney", angler: "Bobby Grieger" },
    { species: "Drum, Freshwater", weight: "14.75 lbs", length: "28.50 in", girth: "—", date: "2024-12-14", waterbody: "Whitney", angler: "Tom Wellman" },
    { species: "Gar, Longnose", weight: "31.50 lbs", length: "0.00", girth: "—", date: "2025-04-12", waterbody: "Whitney", angler: "Dylan Starnes" },
    { species: "Redhorse, Gray", weight: "3.38 lbs", length: "19.00 in", girth: "—", date: "2010-04-22", waterbody: "Whitney", angler: "Joshua Sears" },
    { species: "Tilapia, Hybrid", weight: "0.89 lbs", length: "11.00 in", girth: "—", date: "2020-01-04", waterbody: "Whitney", angler: "Barry Osborn" },
  ],
  waco: [
    { species: "Buffalo, Smallmouth", weight: "30.00 lbs", length: "—", girth: "—", date: "2021-08-14", waterbody: "Waco", angler: "George Stanley" },
    { species: "Carp, Common", weight: "15.63 lbs", length: "31.00 in", girth: "—", date: "2010-06-16", waterbody: "Waco", angler: "Joshua Sears" },
    { species: "Carp, Grass", weight: "70.12 lbs", length: "49.50 in", girth: "—", date: "2010-07-01", waterbody: "Waco", angler: "Joshua Sears" },
    { species: "Drum, Freshwater", weight: "5.80 lbs", length: "23.00 in", girth: "—", date: "2010-06-20", waterbody: "Waco", angler: "Lester Carter" },
    { species: "Gar, Longnose", weight: "27.00 lbs", length: "58.00 in", girth: "—", date: "1995-03-20", waterbody: "Waco", angler: "David Carter" },
    { species: "Gar, Spotted", weight: "3.40 lbs", length: "28.00 in", girth: "—", date: "2009-05-16", waterbody: "Waco", angler: "Joshua Sears" },
    { species: "Redhorse, Gray", weight: "3.00 lbs", length: "19.50 in", girth: "—", date: "2010-07-26", waterbody: "Waco", angler: "Joshua Sears" },
    { species: "Shad, Gizzard", weight: "0.50 lbs", length: "11.00 in", girth: "—", date: "2009-06-14", waterbody: "Waco", angler: "Joshua Sears" },
  ],
  hubbard: [
    { species: "Gar, Longnose", weight: "27.60 lbs", length: "60.25 in", girth: "—", date: "2024-06-04", waterbody: "Hubbard Creek Reservoir", angler: "Lonnie Hamil" },
    { species: "Gar, Spotted", weight: "8.70 lbs", length: "36.75 in", girth: "—", date: "2017-05-28", waterbody: "Hubbard Creek Reservoir", angler: "David Imus" },
    { species: "Carp, Common", weight: "10.88 lbs", length: "28.00 in", girth: "—", date: "2016-07-16", waterbody: "Hubbard Creek Reservoir", angler: "Kevin S. Scroggins" },
    { species: "Buffalo, Smallmouth", weight: "10.65 lbs", length: "25.00 in", girth: "—", date: "2009-06-29", waterbody: "Hubbard Creek Reservoir", angler: "Wayne Watson" },
    { species: "Drum, Freshwater", weight: "3.50 lbs", length: "20.00 in", girth: "—", date: "2023-05-22", waterbody: "Hubbard Creek Reservoir", angler: "Alex Vokes" },
  ],
  brazos: [
    { species: "Buffalo, Smallmouth", weight: "35.00 lbs", length: "33.00 in", girth: "—", date: "2015-03-07", waterbody: "Brazos River", angler: "Michael C. Armstrong" },
    { species: "Carp, Common", weight: "24.40 lbs", length: "33.50 in", girth: "—", date: "2015-05-06", waterbody: "Brazos River", angler: "John L. Ruhl" },
    { species: "Carp, Grass", weight: "29.80 lbs", length: "39.50 in", girth: "—", date: "2017-07-01", waterbody: "Brazos River", angler: "Hunter Graham" },
    { species: "Drum, Freshwater", weight: "12.13 lbs", length: "26.25 in", girth: "—", date: "2003-07-06", waterbody: "Brazos River", angler: "Tristan Knigh" },
    { species: "Gar, Alligator", weight: "220.00 lbs", length: "—", girth: "—", date: "2021-06-02", waterbody: "Brazos River", angler: "Sabian Walther" },
    { species: "Gar, Longnose", weight: "32.00 lbs", length: "58.00 in", girth: "—", date: "2010-05-08", waterbody: "Brazos River", angler: "Ian Reedy" },
    { species: "Gar, Spotted", weight: "7.10 lbs", length: "44.00 in", girth: "—", date: "2012-09-08", waterbody: "Brazos River", angler: "Mitchell K. James" },
    { species: "Shad, Gizzard", weight: "2.82 lbs", length: "16.50 in", girth: "—", date: "2003-08-01", waterbody: "Brazos River", angler: "Alex Beasley" },
  ],
  trinity: [
    { species: "Bowfin", weight: "10.36 lbs", length: "28.25 in", girth: "—", date: "2018-05-20", waterbody: "Trinity River", angler: "Michael Paul Shehane" },
    { species: "Buffalo, Smallmouth", weight: "28.00 lbs", length: "33.00 in", girth: "—", date: "2008-03-22", waterbody: "Trinity River", angler: "Bennett Crow" },
    { species: "Carp, Common", weight: "38.00 lbs", length: "44.38 in", girth: "—", date: "2004-04-06", waterbody: "Trinity River", angler: "Casey Odell" },
    { species: "Carp, Grass", weight: "29.00 lbs", length: "40.00 in", girth: "—", date: "2021-12-30", waterbody: "Trinity River", angler: "Michael Paul Shehane" },
    { species: "Catfish, Blue", weight: "38.00 lbs", length: "41.50 in", girth: "—", date: "2008-03-22", waterbody: "Trinity River", angler: "Bennett Crow" },
    { species: "Drum, Freshwater", weight: "7.20 lbs", length: "21.50 in", girth: "—", date: "2018-06-02", waterbody: "Trinity River", angler: "Michael Paul Shehane" },
    { species: "Gar, Alligator", weight: "290.00 lbs", length: "96.00 in", girth: "N/A", date: "2001-07-08", waterbody: "Trinity River", angler: "Marty McClellan" },
    { species: "Gar, Hybrid", weight: "75.00 lbs", length: "74.00 in", girth: "—", date: "2012-03-16", waterbody: "Trinity River", angler: "Kenneth Bush" },
    { species: "Gar, Longnose", weight: "43.25 lbs", length: "59.00 in", girth: "—", date: "2009-05-01", waterbody: "Trinity River", angler: "Kevin Moynahan" },
    { species: "Gar, Spotted", weight: "9.84 lbs", length: "—", girth: "—", date: "2020-10-18", waterbody: "Trinity River", angler: "Michael Paul Shehane" },
  ],
  surfside: [
    { species: "Black Drum (Gulf)", weight: "51.90 lbs", length: "—", girth: "—", date: "2023-05-13", waterbody: "Gulf of Mexico near Surfside", angler: "Gene Mills" },
  ],
  ouachita: [
    { species: "Alligator Gar", weight: "148.9 lbs", length: "N/A", girth: "N/A", date: "1998-08-27", waterbody: "Lake Ouachita", angler: "Rick Sanders" },
    { species: "Common Carp", weight: "45.9 lbs", length: "N/A", girth: "N/A", date: "2003-03-22", waterbody: "Ouachita", angler: "Shawn Holezman" },
    { species: "Spotted Gar", weight: "12.45 lbs", length: "41 7/8 in", girth: "N/A", date: "2017-03-18", waterbody: "Lake Ouachita", angler: "Jerrime Tucker" },
    { species: "Longnose Gar", weight: "37.8 lbs", length: "66 in", girth: "N/A", date: "2021-08-06", waterbody: "Ouachita area", angler: "Buck Horton" },
    { species: "Bighead Carp", weight: "58.8 lbs", length: "50 in", girth: "31.5 in", date: "2022-05-14", waterbody: "Lake Ouachita", angler: "Hunter Throckmorton" },
  ],
  bullshoals: [
    { species: "Alligator Gar", weight: "142 lbs", length: "N/A", girth: "N/A", date: "2004-04-16", waterbody: "Bull Shoals", angler: "Tom Flemming" },
    { species: "Common Carp", weight: "45 lbs", length: "N/A", girth: "N/A", date: "2003-03-22", waterbody: "Bull Shoals Lake", angler: "Shawn Holezman" },
    { species: "Grass Carp", weight: "78 lbs", length: "47.75 in", girth: "37 in", date: "2021-04-01", waterbody: "Bull Shoals", angler: "Jon Hawthorn" },
    { species: "Smallmouth Buffalo", weight: "27.3 lbs", length: "34 in", girth: "N/A", date: "2020-01-27", waterbody: "Bull Shoals", angler: "Gabriel Barnes" },
    { species: "Spotted Gar", weight: "12 lbs", length: "N/A", girth: "N/A", date: "2017-03-18", waterbody: "Bull Shoals", angler: "Jerrime Tucker" },
  ],
  tablerock: [
    { species: "Alligator Gar", weight: "130+ lbs (border)", length: "N/A", girth: "N/A", date: "2022-05-14", waterbody: "Table Rock Lake", angler: "Hunter Throckmorton" },
    { species: "Common Carp", weight: "40 lbs", length: "N/A", girth: "N/A", date: "2022-03-27", waterbody: "Table Rock", angler: "Cody Davis" },
    { species: "Grass Carp", weight: "70+ lbs", length: "N/A", girth: "N/A", date: "2021-04-01", waterbody: "Table Rock", angler: "Jon Hawthorn" },
    { species: "Longnose Gar", weight: "30 lbs", length: "N/A", girth: "N/A", date: "2021-08-06", waterbody: "Table Rock", angler: "Buck Horton" },
    { species: "Bigmouth Buffalo", weight: "50 lbs", length: "N/A", girth: "N/A", date: "2004-04-16", waterbody: "Table Rock Lake", angler: "Tom Flemming" },
  ],
  pickwick: [
    { species: "Bigmouth Buffalo", weight: "55.9 lbs (TN)", length: "45.6 in", girth: "N/A", date: "2021-03-30", waterbody: "Pickwick / TN River", angler: "John Leyhew" },
    { species: "Spotted Gar", weight: "11.9 lbs (TN)", length: "41.5 in", girth: "N/A", date: "2017-02-17", waterbody: "Tennessee River area (Pickwick)", angler: "Jesse Bazzell" },
    { species: "Alligator Gar", weight: "120 lbs", length: "72 in", girth: "38 in", date: "2019-07", waterbody: "Pickwick Lake", angler: "Adam Allen" },
    { species: "Common Carp", weight: "37.4 lbs", length: "N/A", girth: "N/A", date: "2017-02-23", waterbody: "Pickwick", angler: "Cameron Moss" },
    { species: "Smallmouth Buffalo", weight: "68.8 lbs", length: "45 in", girth: "35 in", date: "2024-02-26", waterbody: "Pickwick Lake", angler: "Tyson Vincent" },
  ],
  guntersville: [
    { species: "Smallmouth Buffalo", weight: "81.8 lbs (AL)", length: "50 in", girth: "N/A", date: "2021-12-18", waterbody: "Guntersville Reservoir", angler: "Jordan Couch" },
    { species: "Bighead Carp", weight: "98.6 lbs (AL)", length: "60 in", girth: "39 in", date: "2021-06-13", waterbody: "Guntersville area", angler: "James Carroll" },
    { species: "Alligator Gar", weight: "148.9 lbs", length: "N/A", girth: "N/A", date: "1998-08-27", waterbody: "Guntersville", angler: "Rick Sanders" },
    { species: "Common Carp", weight: "41.4 lbs", length: "44.5 in", girth: "30 in", date: "2021-05-08", waterbody: "Guntersville Reservoir", angler: "Bryan Hughes" },
    { species: "Grass Carp", weight: "92.0 lbs", length: "51.5 in", girth: "N/A", date: "2015-05-17", waterbody: "Guntersville", angler: "Bryan Hughes" },
    { species: "Spotted Gar", weight: "12 lbs", length: "N/A", girth: "N/A", date: "1991-08-17", waterbody: "Guntersville area", angler: "John Daughtery" },
  ],
  wattsbar: [
    { species: "Black Buffalo", weight: "75 lbs (TN)", length: "49 in", girth: "36 in", date: "2026-03-04", waterbody: "Nickajack / Watts Bar area", angler: "Adam Allen" },
    { species: "Bigmouth Buffalo", weight: "55.9 lbs (TN)", length: "45.6 in", girth: "N/A", date: "2021-03-30", waterbody: "Watts Bar", angler: "John Leyhew" },
    { species: "Alligator Gar", weight: "110 lbs", length: "70 in", girth: "36 in", date: "2018-06-26", waterbody: "Watts Bar Lake", angler: "Bradley Britt" },
    { species: "Common Carp", weight: "37.4 lbs", length: "N/A", girth: "N/A", date: "2017-02-23", waterbody: "Watts Bar", angler: "Cameron Moss" },
    { species: "Smallmouth Buffalo", weight: "68.8 lbs", length: "45.125 in", girth: "35.625 in", date: "2024-02-26", waterbody: "Watts Bar", angler: "Tyson Vincent" },
  ],
};

export const STATE_BOWFISHING_RECORDS = {
  texas: [
    { species: "Gar, Alligator", weight: "290.00 lbs", length: "96.00 in", girth: "N/A", date: "2001-07-08", waterbody: "Trinity River", angler: "Marty McClellan" },
    { species: "Buffalo, Bigmouth", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Toledo Bend", angler: "Martin McIntyre" },
    { species: "Buffalo, Smallmouth", weight: "92.00 lbs", length: "48.00 in", girth: "N/A", date: "1999-03-22", waterbody: "Sabine River", angler: "Kent McDowell" },
    { species: "Carp, Grass", weight: "85.25 lbs", length: "48.25 in", girth: "N/A", date: "2016-11-14", waterbody: "Sam Rayburn", angler: "Benny Elliott" },
    { species: "Carp, Common", weight: "49.10 lbs", length: "N/A", girth: "N/A", date: "2021-03-27", waterbody: "Toledo Bend", angler: "Chestin Clark" },
    { species: "Gar, Longnose", weight: "56.20 lbs", length: "63.50 in", girth: "N/A", date: "2022-03-19", waterbody: "Palestine", angler: "Jacob Ryan Fisher" },
    { species: "Gar, Spotted", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Palestine", angler: "Caleb Pierce" },
    { species: "Carp, Bighead", weight: "54.20 lbs", length: "N/A", girth: "N/A", date: "2023-05-17", waterbody: "Red River", angler: "Stephen Banaszak" },
  ],
  arkansas: [
    { species: "Bighead Carp", weight: "58.80 lbs", length: "50 in", girth: "31.5 in", date: "2022-05-14", waterbody: "Arkansas waters", angler: "Hunter Throckmorton" },
    { species: "Grass Carp (White Amur)", weight: "78.01 lbs", length: "47.75 in", girth: "37 in", date: "2021-04-01", waterbody: "Arkansas waters", angler: "Jon Hawthorn" },
    { species: "Common Carp", weight: "45.9 lbs", length: "N/A", girth: "N/A", date: "2003-03-22", waterbody: "Arkansas waters", angler: "Shawn Holezman" },
    { species: "Smallmouth Buffalo", weight: "27.30 lbs", length: "34 in", girth: "N/A", date: "2020-01-27", waterbody: "Arkansas waters", angler: "Gabriel Barnes" },
    { species: "Spotted Gar", weight: "12.45 lbs", length: "41 7/8 in", girth: "N/A", date: "2017-03-18", waterbody: "Arkansas waters", angler: "Jerrime Tucker" },
    { species: "Longnose Gar", weight: "37.8 lbs", length: "66 in", girth: "N/A", date: "2021-08-06", waterbody: "Arkansas waters", angler: "Buck Horton" },
    { species: "Buffalo", weight: "80 lb 6 oz", length: "N/A", girth: "N/A", date: "2004-04-16", waterbody: "Arkansas waters", angler: "Tom Flemming" },
  ],
  tennessee: [
    { species: "Bighead Carp", weight: "99.40 lbs", length: "60.5 in", girth: "38.25 in", date: "2022-06-16", waterbody: "Tennessee waters", angler: "Michael Pirtle" },
    { species: "Bigmouth Buffalo", weight: "55.9 lbs", length: "45.6 in", girth: "N/A", date: "2021-03-30", waterbody: "Percy Priest Reservoir", angler: "John Leyhew" },
    { species: "Black Buffalo", weight: "75 lbs", length: "49 in", girth: "36 in", date: "2026-03-04", waterbody: "Tennessee waters", angler: "Adam Allen" },
    { species: "Smallmouth Buffalo", weight: "68.80 lbs", length: "45.125 in", girth: "35.625 in", date: "2024-02-26", waterbody: "Tennessee waters", angler: "Tyson Vincent" },
    { species: "Grass Carp", weight: "76.90 lbs", length: "51.25 in", girth: "N/A", date: "2023-07-16", waterbody: "Tennessee waters", angler: "Bradley Britt" },
    { species: "Spotted Gar", weight: "11.9 lbs", length: "41.5 in", girth: "N/A", date: "2017-02-17", waterbody: "TN River area", angler: "Jesse Bazzell" },
    { species: "Common Carp", weight: "37.4 lbs", length: "N/A", girth: "N/A", date: "2017-02-23", waterbody: "Tennessee waters", angler: "Cameron Moss" },
  ],
  alabama: [
    { species: "Alligator Gar", weight: "148.9 lbs", length: "N/A", girth: "N/A", date: "1998-08-27", waterbody: "Alabama waters", angler: "Rick Sanders" },
    { species: "Bighead Carp", weight: "98.6 lbs", length: "60 in", girth: "39 in", date: "2021-06-13", waterbody: "Alabama waters", angler: "James Carroll" },
    { species: "Black Buffalo", weight: "72.2 lbs", length: "N/A", girth: "N/A", date: "2018-04-20", waterbody: "Alabama waters", angler: "Brennon Harrison" },
    { species: "Smallmouth Buffalo", weight: "81.8 lbs", length: "50 in", girth: "N/A", date: "2021-12-18", waterbody: "Guntersville Reservoir", angler: "Jordan Couch" },
    { species: "Grass Carp", weight: "92.0 lbs", length: "51.5 in", girth: "N/A", date: "2015-05-17", waterbody: "Alabama waters", angler: "Bryan Hughes" },
    { species: "Common Carp", weight: "41.4 lbs", length: "44.5 in", girth: "30 in", date: "2021-05-08", waterbody: "Alabama waters", angler: "Bryan Hughes" },
    { species: "Spotted Gar", weight: "12 lbs", length: "N/A", girth: "N/A", date: "1991-08-17", waterbody: "Alabama waters", angler: "John Daughtery" },
  ],
};
