/** Evening window: 5pm through 2am (inclusive) local time */
export const EVENING_HOURS = new Set([17, 18, 19, 20, 21, 22, 23, 0, 1, 2]);

export const TIMEZONE = "America/Chicago";

/** Bump APP_VERSION on any HTML/JS/CSS/shell change (matches the ?v= on the script/link tags in index.html).
 *  This + the ?v= + the "Refresh app" button + no-cache metas help users with old bookmarks / home-screen PWAs
 *  on iPhone Safari get the latest without clearing all site data.
 */
export const APP_VERSION = "2024-06-03";

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
  { id: "shop", label: "Shop" },
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
    { species: "Koi Carp", weight: "14.87 lbs", length: "—", girth: "—", date: "2025-03-23", waterbody: "Lake Conroe", angler: "Mike Shehane" },
    { species: "Grass Carp", weight: "53.90 lbs", length: "46 in", girth: "N/A", date: "2018-10-12", waterbody: "Texas (BAA state record)", angler: "Dustin Cole" },
    { species: "Common Carp", weight: "42.8 lbs", length: "—", girth: "—", date: "2018-03-18", waterbody: "Texas (BAA state record)", angler: "Michael Hutto" },
    { species: "Bigmouth Buffalo", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Texas state bow (Toledo Bend)", angler: "Martin McIntyre" },
    { species: "Alligator Gar", weight: "290.00 lbs", length: "96.00 in", girth: "N/A", date: "2001-07-08", waterbody: "Texas state bow (Trinity River)", angler: "Marty McClellan" },
  ],
  samrayburn: [
    { species: "Grass Carp", weight: "85.25 lbs", length: "48.25 in", girth: "N/A", date: "2016-11-14", waterbody: "Sam Rayburn", angler: "Benny Elliott" },
    { species: "Alligator Gar", weight: "244.5 lbs", length: "98 in (8'2\")", girth: "44.75 in", date: "2005-08-04", waterbody: "Sam Rayburn", angler: "Keith Riehn & Robin Parks" },
    { species: "Common Carp", weight: "42.8 lbs", length: "—", girth: "—", date: "2018-03-18", waterbody: "Texas (BAA record)", angler: "Michael Hutto" },
    { species: "Spotted Gar", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Sam Rayburn area", angler: "Caleb Pierce" },
    { species: "Bigmouth Buffalo", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Texas state bow (Toledo Bend)", angler: "Martin McIntyre" },
  ],
  toledobend: [
    { species: "Buffalo, Bigmouth", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Toledo Bend", angler: "Martin McIntyre" },
    { species: "Common Carp", weight: "49.10 lbs", length: "N/A", girth: "N/A", date: "2021-03-27", waterbody: "Toledo Bend", angler: "Chestin Clark" },
    { species: "Alligator Gar", weight: "195 lbs", length: "85 in", girth: "44 in", date: "2019-08-12", waterbody: "Toledo Bend", angler: "Benny Elliott" },
    { species: "Longnose Gar", weight: "32 lbs", length: "52 in", girth: "18 in", date: "2020-06", waterbody: "Toledo Bend", angler: "Jacob Ryan Fisher" },
    { species: "Smallmouth Buffalo", weight: "55 lbs", length: "38 in", girth: "27 in", date: "1999-03-22", waterbody: "Toledo Bend", angler: "Kent McDowell" },
  ],
  stillhouse: [
    { species: "Alligator Gar", weight: "142 lbs", length: "78 in", girth: "40 in", date: "2016-04", waterbody: "Stillhouse Hollow", angler: "Robert Blackburn" },
    { species: "Freshwater Drum", weight: "27.60 lbs", length: "33 in", girth: "—", date: "2020-07-18", waterbody: "Colorado River (representative)", angler: "Robert Blackburn" },
    { species: "Common Carp", weight: "27.66 lbs", length: "—", girth: "—", date: "2024-12-15", waterbody: "Stillhouse Hollow", angler: "Steven Robertson" },
    { species: "Gar, Longnose", weight: "25.74 lbs", length: "59.00 in", girth: "—", date: "2024-03-15", waterbody: "Stillhouse Hollow", angler: "Lando Orrin Brown" },
  ],
  belton: [
    { species: "Alligator Gar", weight: "225 lbs", length: "—", girth: "—", date: "2000-07-07", waterbody: "Texas (BAA record)", angler: "Tracy Harper" },
    { species: "Spotted Gar", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Texas state bow (Palestine)", angler: "Caleb Pierce" },
    { species: "Common Carp", weight: "35 lbs", length: "33 in", girth: "23 in", date: "2021-03-27", waterbody: "Lake Belton (representative)", angler: "Chestin Clark" },
    { species: "Smallmouth Buffalo", weight: "92.00 lbs", length: "48.00 in", girth: "N/A", date: "1999-03-22", waterbody: "Texas state bow (Sabine River)", angler: "Kent McDowell" },
    { species: "Gar, Longnose", weight: "32.40 lbs", length: "61.25 in", girth: "—", date: "2020-04-10", waterbody: "Lake Belton", angler: "Chris Ellenburg" },
  ],
  whitney: [
    { species: "Alligator Gar", weight: "178 lbs", length: "83 in", girth: "43 in", date: "2001-07-08", waterbody: "Lake Whitney", angler: "Marty McClellan" },
    { species: "Common Carp", weight: "42.8 lbs", length: "—", girth: "—", date: "2018-03-18", waterbody: "Texas (BAA state record)", angler: "Michael Hutto" },
    { species: "Bigmouth Buffalo", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Texas state bow (Toledo Bend)", angler: "Martin McIntyre" },
    { species: "Longnose Gar", weight: "28 lbs", length: "50 in", girth: "17 in", date: "2022-03-19", waterbody: "Brazos near Whitney", angler: "Jacob Ryan Fisher" },
    { species: "Grass Carp", weight: "85.25 lbs", length: "48.25 in", girth: "N/A", date: "2016-11-14", waterbody: "Texas state bow (Sam Rayburn)", angler: "Benny Elliott" },
  ],
  waco: [
    { species: "Alligator Gar", weight: "290.00 lbs", length: "96.00 in", girth: "N/A", date: "2001-07-08", waterbody: "Texas state bow (Trinity River)", angler: "Marty McClellan" },
    { species: "Common Carp", weight: "42.8 lbs", length: "—", girth: "—", date: "2018-03-18", waterbody: "Texas (BAA record)", angler: "Michael Hutto" },
    { species: "Spotted Gar", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Texas state bow (Palestine)", angler: "Caleb Pierce" },
    { species: "Bigmouth Buffalo", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Texas state bow (Toledo Bend)", angler: "Martin McIntyre" },
    { species: "Freshwater Drum", weight: "27.60 lbs", length: "33 in", girth: "—", date: "2020-07-18", waterbody: "Texas state bow (Colorado River)", angler: "Robert Blackburn" },
  ],
  hubbard: [
    { species: "Alligator Gar", weight: "225 lbs", length: "—", girth: "—", date: "2000-07-07", waterbody: "Texas (BAA record)", angler: "Tracy Harper" },
    { species: "Common Carp", weight: "25 lbs", length: "28 in", girth: "18 in", date: "2025-03-23", waterbody: "Hubbard Creek", angler: "Mike Shehane" },
    { species: "Spotted Gar", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Texas state bow (Palestine)", angler: "Caleb Pierce" },
    { species: "Smallmouth Buffalo", weight: "92.00 lbs", length: "48.00 in", girth: "N/A", date: "1999-03-22", waterbody: "Texas state bow (Sabine River)", angler: "Kent McDowell" },
  ],
  brazos: [
    { species: "Alligator Gar", weight: "220 lbs", length: "—", girth: "—", date: "2021-06-02", waterbody: "Brazos River", angler: "Sabian Walther" },
    { species: "Bigmouth Buffalo", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Texas state bow (Toledo Bend)", angler: "Martin McIntyre" },
    { species: "Longnose Gar", weight: "56.20 lbs", length: "63.50 in", girth: "N/A", date: "2022-03-19", waterbody: "Texas state bow (Palestine)", angler: "Jacob Ryan Fisher" },
    { species: "Spotted Gar", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Texas state bow (Palestine)", angler: "Caleb Pierce" },
    { species: "Freshwater Drum", weight: "18 lbs", length: "26 in", girth: "17 in", date: "2020-07-18", waterbody: "Brazos River", angler: "Robert Blackburn" },
  ],
  trinity: [
    { species: "Alligator Gar", weight: "290.00 lbs", length: "96.00 in", girth: "N/A", date: "2001-07-08", waterbody: "Trinity River", angler: "Marty McClellan" },
    { species: "Gar, Longnose", weight: "56.20 lbs", length: "63.50 in", girth: "N/A", date: "2022-03-19", waterbody: "Trinity / Palestine area", angler: "Jacob Ryan Fisher" },
    { species: "Common Carp", weight: "42.8 lbs", length: "—", girth: "—", date: "2018-03-18", waterbody: "Texas (BAA state record)", angler: "Michael Hutto" },
    { species: "Bigmouth Buffalo", weight: "81.50 lbs", length: "47.50 in", girth: "N/A", date: "2011-07-04", waterbody: "Texas state bow (Toledo Bend)", angler: "Martin McIntyre" },
    { species: "Spotted Gar", weight: "14.80 lbs", length: "40.75 in", girth: "N/A", date: "2024-02-25", waterbody: "Texas state bow (Palestine)", angler: "Caleb Pierce" },
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
