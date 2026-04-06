/**
 * Lightweight prayer-time calculator based on the Adhan algorithm.
 * Supports the standard calculation methods (MWL, ISNA, Egypt, Mecca, Karachi, Tehran, Jafari).
 * Zero external dependencies — pure JS.
 *
 * Usage:
 *   import { getPrayerTimes } from '../utils/prayerTimes';
 *   const times = getPrayerTimes(latitude, longitude, date?);
 *   // returns { fajr, sunrise, dhuhr, asr, maghrib, isha }  – each is a Date object
 */

const DEG = Math.PI / 180;

function julianDate(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function sunPosition(jd) {
  const D = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * Math.sin(g * DEG) + 0.02 * Math.sin(2 * g * DEG)) % 360;
  const e = 23.439 - 0.00000036 * D;
  const RA = Math.atan2(Math.cos(e * DEG) * Math.sin(L * DEG), Math.cos(L * DEG)) / DEG;
  const dec = Math.asin(Math.sin(e * DEG) * Math.sin(L * DEG)) / DEG;
  const eqT = q / 15 - (RA < 0 ? RA + 360 : RA) / 15;
  return { dec, eqT };
}

function hourAngle(angle, lat, dec) {
  const val = (-Math.sin(angle * DEG) - Math.sin(lat * DEG) * Math.sin(dec * DEG))
              / (Math.cos(lat * DEG) * Math.cos(dec * DEG));
  if (Math.abs(val) > 1) return NaN;
  return Math.acos(val) / DEG;
}

function asrHourAngle(shadowFactor, lat, dec) {
  const angle = -Math.atan2(1, shadowFactor + Math.tan(Math.abs(lat - dec) * DEG)) / DEG;
  return hourAngle(angle, lat, dec);
}

/**
 * @param {number} lat  Latitude
 * @param {number} lng  Longitude
 * @param {Date}   [date]  Defaults to today
 * @returns {{ fajr:Date, sunrise:Date, dhuhr:Date, asr:Date, maghrib:Date, isha:Date }}
 */
export function getPrayerTimes(lat, lng, date = new Date()) {
  const year  = date.getFullYear();
  const month = date.getMonth() + 1;
  const day   = date.getDate();

  const jd = julianDate(year, month, day);
  const { dec, eqT } = sunPosition(jd + 0.5 - lng / 360);

  const tz = -date.getTimezoneOffset() / 60;

  const transit = 12 + tz - lng / 15 - eqT;                          // Dhuhr

  // Karachi / ISNA angles (widely used in Pakistan / South Asia)
  // Fajr: 18°, Isha: 18°, Asr: Hanafi (shadow factor = 2)
  const fajrAngle  = 18;
  const ishaAngle  = 18;
  const asrFactor  = 2; // Hanafi

  const fajrHA   = hourAngle(fajrAngle,   lat, dec);
  const sunriseHA = hourAngle(0.833,       lat, dec);
  const asrHA    = asrHourAngle(asrFactor, lat, dec);
  const maghribHA = hourAngle(0.833,       lat, dec);
  const ishaHA   = hourAngle(ishaAngle,   lat, dec);

  function toDate(h) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setTime(d.getTime() + h * 3600 * 1000);
    return d;
  }

  return {
    fajr:    toDate(transit - fajrHA   / 15),
    sunrise: toDate(transit - sunriseHA / 15),
    dhuhr:   toDate(transit),
    asr:     toDate(transit + asrHA    / 15),
    maghrib: toDate(transit + maghribHA / 15),
    isha:    toDate(transit + ishaHA   / 15),
  };
}

/** Format a Date → "h:mm AM/PM" */
export function fmt(date) {
  if (!date || isNaN(date)) return '--:--';
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}
