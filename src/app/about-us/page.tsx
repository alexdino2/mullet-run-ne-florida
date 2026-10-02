import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About Us: The Story Behind Florida Mullet Run",
  description:
    "A cast net full of mullet on Mickler's Beach and years of watching mullet jump on a Cape Coral canal: how Florida Mullet Run got started, and what it's for.",
  alternates: { canonical: "/about-us" },
};

export default function AboutUsPage() {
  return (
    <InfoPage
      title="About Us"
      lede="How a full cast net on Mickler’s Beach turned into Florida Mullet Run."
    >
      <figure className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
        <Image
          src="/images/about/cast-net-surf.jpg"
          alt="Wading into the Atlantic surf with a cast net over one shoulder"
          width={1200}
          height={1600}
          priority
          sizes="(min-width: 768px) 720px, 100vw"
          className="h-auto max-h-[32rem] w-full object-cover object-[50%_40%]"
        />
        <figcaption className="px-4 py-2 text-xs text-slate-500">
          Heading out with the cast net. Sometimes that’s all the plan you need.
        </figcaption>
      </figure>

      <InfoSection title="A net full of mullet at Mickler’s">
        <p>
          A lot of my favorite mullet run memories didn’t come from a fishing
          report. They came from being at the beach when something happened to
          be going on.
        </p>
        <p>
          One late afternoon I took my two boys to Mickler’s Beach. We had a
          couple of rods, a cast net and maybe an hour of daylight left, with no
          real idea what we’d catch, if anything.
        </p>
        <p>
          Then a school of mullet came working down the beach, close enough to
          shore to reach with the net. I waded out into the surf and threw it,
          and as soon as I started pulling it back I could feel the weight. It
          was full.
        </p>
        <p>
          The boys came running down the sand, and for the next few minutes we
          stood there laughing at a pile of flipping mullet and trying to figure
          out what we were going to do with all of them. There was no special
          technique involved. We were just in the right spot at the right time,
          which is a big part of why the mullet run is so much fun.
        </p>
      </InfoSection>

      <InfoSection title="Holidays on a Cape Coral canal">
        <p>
          We spend a lot of holidays at my mother-in-law’s house in Cape Coral,
          which sits on a canal. Sit out back long enough and you start noticing
          the mullet. You hear one jump, then another, and some days they’re
          popping out of the water all the way across the canal.
        </p>
        <p>
          It never gets old. You can be out there at Thanksgiving or Christmas,
          talking with family, and hear one slap the water behind you. Before
          long I was watching for them on purpose and wondering about them. Where
          were they headed? Why were there so many today and hardly any
          yesterday? Was it the tide, the water temperature, the wind?
        </p>
        <p>Once you start asking those questions, it’s hard to stop.</p>
      </InfoSection>

      <InfoSection title="Why finding mullet is harder than it sounds">
        <p>
          Between that afternoon at Mickler’s and all the time on that canal, I
          kept coming back to how hard it actually is to find mullet when you
          want them.
        </p>
        <p>
          Every fall the posts start showing up on Facebook, Reddit, the fishing
          forums and the local groups: “They’re at the inlet.” “Big schools
          heading south.” “Mullet everywhere this morning.” The trouble is that by
          the time you read one, the fish have often moved on. Conditions change,
          and a stretch of beach that was empty at breakfast can have thousands of
          mullet running past it by lunch.
        </p>
        <p>
          I couldn’t find one place that pulled all of that together for the
          whole Florida coast, so I started building FloridaMulletRun.com.
        </p>
      </InfoSection>

      <InfoSection title="What the site is for">
        <p>
          The question behind it is a simple one: where are the mullet right now?
        </p>
        <p>
          There will never be a perfect answer, because fishing doesn’t work that
          way. But if you put sightings from anglers next to water temperature,
          tides, wind, weather and what we know about how the run moves down each
          coast, you get a much better guess than any single Facebook post can
          give you. (If you want the details, here’s{" "}
          <Link href="/about#opportunity-score">how the Opportunity Score works</Link>.)
        </p>
        <p>
          It might help someone decide between fishing Jacksonville Beach or
          driving farther south. It might tell a dad that mullet are moving past
          his local beach, so he can take the kids down after school. Or it might
          put someone who’s in Florida for a week in front of a big school of
          mullet getting blown up by tarpon, sharks, snook and jacks.
        </p>
        <p>
          Those are the days people remember. I still think about pulling that
          net up on Mickler’s with my boys standing next to me, and about
          evenings on that Cape Coral canal watching mullet jump while everyone
          else was inside talking.
        </p>
        <p>
          That’s really all this site is for: helping more people find the
          mullet, and maybe make a few memories of their own.
        </p>
      </InfoSection>

      <InfoSection title="Seen mullet lately?">
        <p>
          Every report makes the map more useful for the next person.{" "}
          <Link href="/sightings">Log a sighting</Link>, check the{" "}
          <Link href="/">latest conditions</Link>, or{" "}
          <Link href="/contact">get in touch</Link> if you’ve got a local tip.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
