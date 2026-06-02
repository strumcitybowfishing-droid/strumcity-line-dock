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
    usgs: {
      coldspring: {
        site: "08069800",
        name: "E Fk San Jacinto Rv at SH 150 nr Coldspring, TX",
        note: "River flow at Cold Spring area (East Fork San Jacinto).",
      },
    },
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
  { id: "charter", label: "Boat & Trip" },
  { id: "photos", label: "Photos" },
];