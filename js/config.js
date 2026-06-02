/** Evening window: 5pm through 2am (inclusive) local time */
export const EVENING_HOURS = new Set([17, 18, 19, 20, 21, 22, 23, 0, 1, 2]);

export const TIMEZONE = "America/Chicago";

export const LOCATIONS = {
  conroe: {
    id: "conroe",
    label: "Lake Conroe",
    subtitle: "Montgomery County, TX",
    latitude: 30.3569,
    longitude: -95.5922,
    mapZoom: 12,
    type: "weather",
  },
  samrayburn: {
    id: "samrayburn",
    label: "Sam Rayburn",
    subtitle: "Middle of lake · East Texas",
    latitude: 31.06,
    longitude: -94.12,
    mapZoom: 11,
    type: "weather",
  },
  toledobend: {
    id: "toledobend",
    label: "Toledo Bend",
    subtitle: "South end · TX / LA border",
    latitude: 31.02,
    longitude: -93.52,
    mapZoom: 10,
    type: "weather",
  },
  stillhouse: {
    id: "stillhouse",
    label: "Stillhouse Hollow",
    subtitle: "Stillhouse Hollow Lake · Central TX",
    latitude: 31.63,
    longitude: -97.48,
    mapZoom: 12,
    type: "weather",
  },
  hubbard: {
    id: "hubbard",
    label: "Hubbard Creek",
    subtitle: "Hubbard Creek Reservoir · West TX",
    latitude: 32.826,
    longitude: -98.571,
    mapZoom: 12,
    type: "weather",
  },
  trinity: {
    id: "trinity",
    label: "Trinity · Cold Spring",
    subtitle: "San Jacinto basin near Cold Spring, TX",
    latitude: 30.588,
    longitude: -95.129,
    mapZoom: 12,
    type: "weather",
    traLink: "https://lakedata.traweb.net/",
  },
  surfside: {
    id: "surfside",
    label: "Surfside Offshore",
    subtitle: "Gulf of Mexico · ~50 mi offshore (SSE of Surfside Beach)",
    latitude: 28.223,
    longitude: -94.92,
    type: "marine",
    fullDay: true,
    offshoreMiles: 50,
    mapZoom: 9,
  },
};

/** Lake / river / offshore spots under the Water Report main tab */
export const WEATHER_TAB_ORDER = [
  "conroe",
  "samrayburn",
  "toledobend",
  "stillhouse",
  "hubbard",
  "trinity",
  "surfside",
];

export const MAIN_TABS = [
  { id: "conditions", label: "Water Report" },
  { id: "radar", label: "Radar" },
  { id: "charter", label: "Boat & Trip" },
  { id: "reports", label: "Reports" },
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
  hubbard: {
    name: "Hubbard Creek",
    sources: [
      { title: "TPWD Hubbard Creek Page", url: "https://tpwd.texas.gov/fishboat/fish/recreational/lakes/hubbard_creek/", desc: "Official lake info and access to past weekly reports" }
    ]
  },
  surfside: {
    name: "Surfside Offshore",
    sources: [
      { title: "TPWD Gulf Coast Weekly Reports", url: "https://tpwd.texas.gov/fishboat/fish/action/reptmap.php?EcoRegion=GC", desc: "Coastal region reports (including near Surfside when active)" },
      { title: "Windy.app Surfside Fishing Forecast", url: "https://windy.app/fishing/spot/5812433/Surfside+Beach", desc: "7-day fishing forecast, conditions, and bite scores" }
    ]
  }
};
