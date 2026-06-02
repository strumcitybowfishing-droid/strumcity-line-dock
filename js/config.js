/** Evening window: 5pm through 2am (inclusive) local time */
export const EVENING_HOURS = new Set([17, 18, 19, 20, 21, 22, 23, 0, 1, 2]);

export const TIMEZONE = "America/Chicago";

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
  { id: "conditions", label: "Water Report" },
  { id: "reports", label: "Fishing Report" },
  { id: "radar", label: "Radar" },
  { id: "charter", label: "Boat & Trip" },
  { id: "photos", label: "Photos" },
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
