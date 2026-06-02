export async function fetchUsgsFlow(siteId) {
  const url = new URL("https://waterservices.usgs.gov/nwis/iv/");
  url.searchParams.set("format", "json");
  url.searchParams.set("sites", siteId);
  url.searchParams.set("parameterCd", "00060");
  url.searchParams.set("siteStatus", "all");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`USGS request failed (${res.status})`);
  const data = await res.json();
  const series = data?.value?.timeSeries?.[0];
  if (!series) return null;

  const point = series.values?.[0]?.value?.[0];
  if (!point) return null;

  return {
    siteId,
    siteName: series.sourceInfo?.siteName ?? siteId,
    cfs: Number(point.value),
    observedAt: point.dateTime,
    qualifier: point.qualifiers?.[0] ?? "",
  };
}