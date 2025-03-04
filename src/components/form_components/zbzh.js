import { number } from "echarts";

function bd09ToGcj02(lon, lat) {
  const x = lon - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * Math.PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * Math.PI);
  const gcj_lon = z * Math.cos(theta);
  const gcj_lat = z * Math.sin(theta);

  // 纠正误差，实际应用中可根据精度要求多次调整
  const correctionLon = Number(Number(gcj_lon).toFixed(6))*1.000153;//经度
  const correctionLat = Number(Number(gcj_lat).toFixed(6))*0.999848;//经纬度

  return { gcj_lon: correctionLon.toFixed(6), gcj_lat: correctionLat.toFixed(6) };
}
export {
  bd09ToGcj02
}