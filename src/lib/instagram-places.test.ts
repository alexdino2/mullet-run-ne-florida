import assert from "node:assert/strict";
import { test } from "node:test";
import { STATIONS } from "@/lib/beaches";
import {
  PLACES,
  extractHashtags,
  inferLocationFromCaption,
  matchPlaces,
  nearestStation,
} from "@/lib/instagram-places";

test("names a spot from plain caption text", () => {
  const loc = inferLocationFromCaption("Mullet run is ON at Mickler's this morning! Birds everywhere #mulletrun");
  assert.equal(loc?.name, "Mickler's Landing");
  assert.equal(loc?.confidence, "high");
  assert.equal(nearestStation(loc!)?.station.id, "micklers");
});

test("matches hashtags with spaces removed and suffixes", () => {
  const loc = inferLocationFromCaption("Bait pods thick 🐟 #jaxbeachfishing #floridamulletrun");
  assert.equal(loc?.name, "Jacksonville Beach");
  assert.equal(nearestStation(loc!)?.station.id, "jax-beach");
});

test("prefers the specific spot over the town", () => {
  const loc = inferLocationFromCaption("St. Augustine Pier was loaded with finger mullet");
  assert.equal(loc?.name, "St. Augustine Beach");
});

test("spells Saint as st", () => {
  assert.equal(inferLocationFromCaption("Saint Pete Beach jetty")?.name, "St. Pete Beach");
});

test("a town alone is medium confidence", () => {
  const loc = inferLocationFromCaption("Mullet everywhere in Daytona today");
  assert.equal(loc?.name, "Daytona Beach");
  assert.equal(loc?.confidence, "medium");
});

test("places far apart make the result low confidence", () => {
  const loc = inferLocationFromCaption("Drove from Mayport down to Sebastian Inlet following the run");
  assert.equal(loc?.confidence, "low");
});

test("Gulf Coast posts map to Gulf stations", () => {
  const loc = inferLocationFromCaption("Boca Grande pass stacked with silver mullet #mulletrun");
  assert.equal(nearestStation(loc!)?.station.id, "boca-grande-pass");
});

test("ignores first names and places abroad that share a word", () => {
  assert.equal(inferLocationFromCaption("Sebastian and Stuart threw the cast net"), null);
  assert.equal(inferLocationFromCaption("Mullet run at Melbourne Victoria #mulletrun"), null);
  assert.equal(inferLocationFromCaption("Great mullet haircut #mulletrun"), null);
});

test("does not match an alias inside a longer word", () => {
  // "ami" must not match inside "tsunami"; "pcb" not inside "pcbs".
  assert.equal(matchPlaces("tsunami of bait, pcbs").length, 0);
});

test("extracts unique lowercase hashtags", () => {
  assert.deepEqual(extractHashtags("#MulletRun #mulletrun #JaxBeach"), ["mulletrun", "jaxbeach"]);
});

test("no station is suggested far outside Florida", () => {
  assert.equal(nearestStation({ lat: -28.0, lon: 153.4 }), null); // Gold Coast, Australia
});

test("every place is in Florida and within 100 km of a station", () => {
  for (const p of PLACES) {
    assert.ok(p.lat > 24 && p.lat < 31.2 && p.lon > -88 && p.lon < -79.5, p.name);
    assert.ok(nearestStation(p, STATIONS), `${p.name} has no station within 100 km`);
  }
});
