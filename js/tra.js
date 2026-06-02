const TRA_SYSTEM_KEY = "007ebaa8-6078-4ee3-abf3-11db1fa7ff36";
const ONERAIN_URL = `http://localhost:8080/OneRain/DataAPI?method=GetSensorData&system_key=${TRA_SYSTEM_KEY}`;
const TRA_DIRECT_PROXY = `https://lakedata.traweb.net/export/proxy/?mode=native&url=${encodeURIComponent(ONERAIN_URL)}`;

/**
 * Livingston Dam discharge (cfs) and lake level from TRA / OneRain — same feed as lakedata.traweb.net.
 */
export async function fetchTraLivingston() {
  const urls = ["/api/tra/livingston", TRA_DIRECT_PROXY];
  let lastError;

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TRA request failed (${res.status})`);
      const xml = await res.text();
      return parseTraXml(xml);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("Could not load TRA dam data");
}

function parseTraXml(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("Invalid TRA data response");
  }

  const rows = [...doc.querySelectorAll("row")];
  const read = (sensorId) => {
    const row = rows.find((r) => r.querySelector("sensor_id")?.textContent === sensorId);
    if (!row) return null;
    return {
      value: Number(row.querySelector("data_value")?.textContent),
      units: row.querySelector("units")?.textContent?.trim() ?? "",
      observedAt: row.querySelector("data_time")?.textContent?.trim() ?? "",
      siteId: row.querySelector("site_id")?.textContent?.trim() ?? "",
    };
  };

  const discharge = read("gate_flow");
  const lakeLevel = read("lake_level");

  if (!discharge?.value && discharge?.value !== 0) {
    throw new Error("TRA discharge (gate_flow) not found in response");
  }

  return {
    discharge: {
      cfs: Math.round(discharge.value),
      observedAt: discharge.observedAt,
      label: "Livingston Dam discharge",
      source: "Trinity River Authority · lakedata.traweb.net",
    },
    lakeLevel: lakeLevel?.value
      ? {
          feet: Number(lakeLevel.value.toFixed(2)),
          observedAt: lakeLevel.observedAt,
        }
      : null,
  };
}

export function formatTraObserved(isoLike) {
  if (!isoLike) return "";
  const d = new Date(isoLike.replace(" ", "T") + "-05:00");
  if (Number.isNaN(d.getTime())) return `${isoLike} CT`;
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}