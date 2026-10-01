import type { Coast, Sighting } from "@/lib/types";
import {
  conditionsAt,
  stationTimeZone,
  summarizeByDay,
  windText,
  type ScoreHour,
} from "@/lib/score-history";
import { ratingClasses, ratingLabel, SIZE_META } from "@/lib/ui";

/** Too little history reads as noise; wait for a day of hourly readings. */
const MIN_HOURS = 24;

/**
 * A station's measured record for the season so far: a written summary of
 * the score and water-temperature trend, a day-by-day table, and the
 * conditions logged when each sighting here was reported. Server-rendered,
 * so it is part of the page HTML.
 */
export function ScoreHistory({
  beachId,
  beachName,
  coast,
  hours,
  sightings,
}: {
  beachId: string;
  beachName: string;
  coast: Coast;
  hours: ScoreHour[];
  sightings: Sighting[];
}) {
  if (hours.length < MIN_HOURS) return null;

  const timeZone = stationTimeZone(beachId);
  const days = summarizeByDay(hours, timeZone);
  const peak = hours.reduce((a, b) => (b.score > a.score ? b : a));
  const average = Math.round(
    hours.reduce((sum, h) => sum + h.score, 0) / hours.length,
  );
  const oldest = days[days.length - 1];
  const newest = days[0];

  const dayLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      timeZone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const timeLabel = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      timeZone,
      hour: "numeric",
    });
  // A YYYY-MM-DD date read at local noon, so it prints as the same day.
  const dateLabel = (date: string) => dayLabel(`${date}T17:00:00Z`);

  const scoreName = coast === "gulf" ? "Gulf exit score" : "surf score";
  const peakWind = windText(peak);
  const span = days.length === 1 ? "the last day" : `the last ${days.length} days`;

  let trend = "";
  if (days.length >= 3) {
    const diff = newest.average - oldest.average;
    trend =
      Math.abs(diff) < 5
        ? ` Daily averages have held steady around ${newest.average}.`
        : ` Daily averages have ${diff > 0 ? "risen" : "fallen"} from ${oldest.average} to ${newest.average}.`;
  }

  let water = "";
  if (
    days.length >= 2 &&
    oldest.waterTempF !== null &&
    newest.waterTempF !== null
  ) {
    const diff = newest.waterTempF - oldest.waterTempF;
    water =
      Math.abs(diff) < 2
        ? ` Water temperature has stayed near ${newest.waterTempF}°F.`
        : ` Water temperature has ${diff < 0 ? "dropped" : "climbed"} from ${oldest.waterTempF}°F to ${newest.waterTempF}°F${
            diff < 0 ? ", the cooling that pushes mullet to move" : ""
          }.`;
  }

  const since = new Date(hours[0].observedHour).getTime();
  const matched = sightings
    .filter((s) => new Date(s.observed_at).getTime() >= since)
    .map((s) => ({ sighting: s, at: conditionsAt(hours, s) }))
    .filter(
      (m): m is { sighting: Sighting; at: ScoreHour } => m.at !== null,
    );

  return (
    <section aria-labelledby="score-history">
      <h2 id="score-history" className="text-lg font-bold text-slate-900">
        Score history at {beachName}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
        Over {span}, the {scoreName} here averaged {average} and peaked at{" "}
        {peak.score} ({ratingLabel(peak.rating)}) on {dayLabel(peak.observedHour)}{" "}
        around {timeLabel(peak.observedHour)}
        {peakWind ? `, with ${peakWind} of wind` : ""}
        {peak.tideStage ? ` on a ${peak.tideStage} tide` : ""}.{trend}
        {water}
      </p>

      <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Day</th>
              <th scope="col" className="px-3 py-2 font-semibold">High</th>
              <th scope="col" className="px-3 py-2 font-semibold">Avg</th>
              <th scope="col" className="px-3 py-2 font-semibold">Best hour</th>
              <th scope="col" className="px-3 py-2 font-semibold">Water</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {days.map((d) => {
              const { bg, text } = ratingClasses(d.best.rating);
              return (
                <tr key={d.date}>
                  <td className="whitespace-nowrap px-3 py-2">{dateLabel(d.date)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 font-bold ${bg} ${text}`}>
                      {d.high}
                    </span>
                  </td>
                  <td className="px-3 py-2">{d.average}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {timeLabel(d.best.observedHour)}
                    {windText(d.best) ? ` · ${windText(d.best)}` : ""}
                  </td>
                  <td className="px-3 py-2">
                    {d.waterTempF !== null ? `${d.waterTempF}°F` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Scored hourly from NOAA tide, buoy and weather data. Times are local.
      </p>

      {matched.length > 0 && (
        <>
          <h3 className="mt-5 text-base font-bold text-slate-900">
            Conditions when bait was reported
          </h3>
          <ul className="mt-2 space-y-1.5">
            {matched.map(({ sighting, at }) => {
              const wind = windText(at);
              return (
                <li
                  key={sighting.id}
                  className="text-[15px] leading-relaxed text-slate-700"
                >
                  <span className="font-semibold">
                    {dayLabel(sighting.observed_at)},{" "}
                    {timeLabel(sighting.observed_at)}
                  </span>{" "}
                  · {SIZE_META[sighting.school_size].label.toLowerCase()} school ·
                  score {at.score} ({ratingLabel(at.rating)})
                  {wind ? `, wind ${wind}` : ""}
                  {at.waterTempF !== null ? `, water ${Math.round(at.waterTempF)}°F` : ""}
                  {at.tideStage ? `, ${at.tideStage} tide` : ""}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
