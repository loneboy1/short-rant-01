// Short rant writer for "Angry Judge: The Short Rant Contest" (make.fun).
// Writes one short, funny rant about an everyday annoyance to
// $MAKEFUN_OUTPUT_DIR/entry.txt. Deterministic: no clock, no randomness, no
// network, no unordered iteration. Node 22, zero dependencies, TypeScript
// run as-is (erasable syntax only).
//
// The judge (a furious, permanently unimpressed model) weighs, most
// important first:
//   1. it is a funny rant about an everyday annoyance, not a general essay
//      or a list of complaints;
//   2. whether it is actually funny: a real laugh, not a smirk at how hard
//      it is trying;
//   3. a specific, concrete annoyance rather than a vague mood: the printer,
//      the bus, the person who says "circling back";
//   4. sharp, economical wording, every sentence earning its place and no
//      throat-clearing;
//   5. freshness: an angle on the annoyance you have not heard a hundred
//      times before.
// Length for its own sake does not count, and the rant must hold up on a
// re-read: the turn at the end has to reward reading it twice.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The scorer below mirrors that brief in the same order. Each candidate
// carries its rubric vector [rant, funny, specific, economy, fresh, reread]
// (maxima 10/20/12/10/8/10, total 70), scored during the build against the
// brief; the program picks the winner by deterministic argmax: highest
// total, then shortest, then lexicographic. (Ties on judge win rate go to
// the smaller text, then the earlier receipt, so short rants earn their
// keep.) Several setups appear in more than one wording so the rubric, not
// habit, picks the best turn.

// ---------------------------------------------------------------- candidates
// [text, rant, funny, specific, economy, fresh, reread]
const CANDIDATES: [string, number, number, number, number, number, number][] = [
  [
    "The printer has one job and it refuses to do it. It flashes 'paper jam' like a hostage note, and there is no paper jam. I opened it. I looked inside. It lied to my face and I still need the printout.",
    9, 15, 10, 7, 6, 8,
  ],
  [
    "My printer only breaks when something is due in ten minutes. It has never once failed on a quiet Tuesday. It waits. It watches the deadline, then jams.",
    8, 13, 8, 9, 5, 8,
  ],
  [
    "The printer says 'low ink' and means 'I have decided not to work today.' There is ink. I can see the ink. But the printer has made a lifestyle choice.",
    8, 16, 9, 8, 7, 9,
  ],
  [
    "The bus was due at 8:04. At 8:40 three of them arrived together, like they had been waiting round the corner to make a point. I caught the third one out of spite.",
    8, 14, 10, 8, 6, 8,
  ],
  [
    "I waited forty minutes for a bus that comes every ten. Three arrived at once, in a little convoy, as if they had carpooled. The timetable is fiction and the drivers know it.",
    8, 15, 9, 8, 6, 8,
  ],
  [
    "Monday morning is the only alarm that goes off twice and still loses. I snoozed it, it snoozed me back, and now the week has a head start I will never close.",
    7, 12, 7, 9, 5, 7,
  ],
  [
    "He said 'just circling back' on an email I answered yesterday. Circling back. Like a vulture. The answer has not changed since Tuesday and neither has his ability to read.",
    9, 16, 10, 7, 8, 9,
  ],
  [
    "She wrote 'per my last email' and attached the email. The email she is per-ing. I was there. I wrote it. She is quoting me back to me like a threat.",
    8, 15, 10, 7, 7, 8,
  ],
  [
    "The Wi-Fi only dies during the important call. Never during a video of a dog. Only when I am mid-sentence, saying something clever, and then I am a frozen face with my mouth open.",
    8, 16, 10, 7, 7, 9,
  ],
  [
    "My Wi-Fi has full bars and no internet, which is like a restaurant with a full menu and no food. The router blinks green, proudly, as if it has done its job.",
    8, 17, 9, 8, 7, 9,
  ],
  [
    "Autocorrect changed 'meeting' to 'melting' and sent it to my boss. Now he thinks I am melting at 2pm. I corrected it three times and it corrected me back, like it knows better.",
    8, 16, 10, 7, 6, 8,
  ],
  [
    "The self-checkout told me there is an unexpected item in the bagging area. The item is my shopping. I put it there. The machine watched me do it and still called for help.",
    9, 16, 11, 8, 6, 8,
  ],
  [
    "Self-checkout asked me if I brought my own bag, then charged me for one, then asked if I needed help. I am doing your job, machine. I should be getting paid.",
    8, 14, 9, 8, 5, 7,
  ],
  [
    "The microwave beeps when it is done, then beeps again to remind me, then beeps a third time out of spite. I am standing right here. I heard you the first time. We are in the same room.",
    8, 15, 9, 8, 7, 8,
  ],
  [
    "I have been on hold for twenty minutes listening to a saxophone apologise. The robot says my call is important to them. If it were important, a human would have picked up by now.",
    8, 16, 10, 8, 8, 9,
  ],
  [
    "The CAPTCHA asked me to click every traffic light, then told me I was wrong. I am a human. I know what a traffic light is. The test is testing the wrong species.",
    8, 15, 10, 8, 7, 8,
  ],
  [
    "I failed a CAPTCHA three times and now a website thinks I am a robot. I pay taxes. I have a dentist. A robot would not be this tired.",
    8, 17, 9, 8, 8, 9,
  ],
  [
    "My password expired, so I made a new one, and the system said I cannot reuse an old password. It was my password from yesterday. It remembers the ones I cannot use and forgets the ones I can.",
    8, 15, 10, 8, 6, 8,
  ],
  [
    "The website made me change my password, then rejected my new password for being too similar to the old one. So I added an exclamation mark, and now I am angry AND punctuated.",
    8, 16, 9, 8, 6, 9,
  ],
  [
    "The group chat has 47 unread messages and every single one says 'haha' or a thumbs-up. Nobody said anything. Forty-seven notifications of nothing, and I read all of them.",
    8, 15, 10, 8, 7, 8,
  ],
  [
    "Someone pressed every button in the elevator and got out on floor two. Now I am stopping at every floor like a tour bus, and the tour is of a building I already live in.",
    8, 15, 10, 8, 7, 8,
  ],
  [
    "The elevator doors close on me every morning as if I am a rumour. I press the button, it arrives, it leaves. It is a lift with commitment issues.",
    8, 14, 8, 9, 8, 8,
  ],
  [
    "He replied all to say 'thanks'. Two hundred people now know he is thankful. The email was about a fire drill. He thanked the fire drill, publicly, to everyone.",
    8, 15, 10, 8, 7, 8,
  ],
  [
    "My printer will not print in black and white because the yellow ink is empty. Yellow. The document has no yellow in it. The printer is holding my words hostage over a colour I never used.",
    9, 17, 11, 8, 7, 9,
  ],
  [
    "The office kettle takes nine minutes to boil and someone always unplugs it at eight. I have timed it. It is not an accident. It is a lifestyle.",
    7, 12, 8, 8, 6, 6,
  ],
  [
    "My neighbour starts the leaf blower at 7am on a Saturday. The leaves were not going anywhere. They have lived there for months. He is not cleaning, he is announcing himself.",
    8, 15, 9, 8, 8, 8,
  ],
  [
    "I set five alarms and slept through all of them, then woke up on my own at 6:02, two minutes late. My body has a snooze button and it is broken in the wrong direction.",
    7, 13, 8, 8, 5, 7,
  ],
  [
    "He opened with 'quick question' and it took forty minutes. It was not quick and it was not a question. It was a meeting wearing a trench coat.",
    8, 17, 9, 9, 8, 9,
  ],
  [
    "She sent a four-minute voice note to say 'call me'. Four minutes. The message is the call. I have now had the call, twice, and I still have to call her.",
    8, 15, 9, 8, 7, 8,
  ],
  [
    "My phone updated overnight and moved every app I use. It rearranged my home screen like a burglar with opinions. I spent the morning looking for my own calendar in my own phone.",
    8, 16, 9, 8, 7, 9,
  ],
  [
    "Someone squeezed the toothpaste from the middle again. The tube looks like a crime scene. We have lived together for years and the middle-squeezer remains at large.",
    8, 14, 9, 8, 6, 7,
  ],
  [
    "It only rains when I forget the umbrella, which is every time, because the forecast said 'partly cloudy' and partly cloudy is a lie told by people with cars.",
    7, 12, 8, 8, 5, 6,
  ],
  [
    "My printer refuses to print in black and white because the yellow ink is empty. Yellow. The document has no yellow in it. My words are being held hostage over a colour I never used.",
    9, 17, 11, 9, 7, 9,
  ],
  [
    "The printer will not print a black-and-white page because the yellow ink ran out. There is no yellow on the page. My document is being held hostage by a colour it never asked for.",
    9, 17, 11, 9, 8, 9,
  ],
  [
    "He opened with 'quick question' and it took forty minutes. It was not quick and it was not a question. It was a meeting in a trench coat.",
    8, 17, 9, 9, 8, 9,
  ],
  [
    "He wrote 'just circling back' on an email I answered yesterday. Circling back. Like a vulture. The answer has not changed since Tuesday, and neither has his ability to read.",
    9, 16, 10, 8, 8, 9,
  ],
  [
    "I have been on hold for twenty minutes while a saxophone apologises to me. The robot says my call is important to them. If it were important, a human would have picked up by now.",
    8, 16, 10, 9, 8, 9,
  ],
  [
    "My Wi-Fi has full bars and no internet, which is a restaurant with a full menu and no food. The router blinks green, proudly, like it has done its job.",
    8, 17, 9, 9, 7, 9,
  ],
  [
    "The self-checkout says there is an unexpected item in the bagging area. The item is my shopping. I put it there. The machine watched me do it and still called for help.",
    9, 16, 11, 9, 6, 8,
  ],
  [
    "Outlook marked my own email as junk. My own email. I wrote it, I sent it, and the filter looked at it and decided I was spam.",
    8, 16, 10, 9, 8, 9,
  ],
  [
    "The smoke alarm only beeps at 3am. Never at lunch. Only at 3am, once, like a ghost clearing its throat, and then it waits a week to do it again.",
    8, 16, 10, 9, 8, 9,
  ],
  [
    "The GPS says 'recalculating' in the tone of a disappointed parent. I missed one turn. One. And now it is punishing me with silence and a longer route.",
    8, 16, 10, 9, 8, 9,
  ],
  [
    "Someone microwaved fish in the office kitchen at 9am. Nine. In the morning. The whole floor smells like low tide and nobody will admit it was them.",
    8, 16, 10, 9, 8, 8,
  ],
  [
    "My bank charged me a fee for being poor. A maintenance fee. For maintaining nothing. They took money because there was not enough money, and that is somehow my fault.",
    8, 16, 9, 9, 8, 9,
  ],
  [
    "The lift has a mirror so I can watch myself wait. I have now seen my own face age in real time. The lift is not slow, it is a documentary about my life.",
    8, 15, 9, 9, 8, 9,
  ],
  [
    "My neighbour's car alarm goes off when a leaf falls on it. A leaf. The car is guarding itself against autumn.",
    8, 16, 9, 9, 8, 8,
  ],
  [
    "My printer will not print black and white because the yellow ink ran out. There is no yellow on the page. My document is being held hostage by a colour it never asked for.",
    9, 17, 11, 9, 8, 9,
  ],
  [
    "My printer will not print in black and white because the yellow ink is empty. Yellow. There is no yellow on the page. My document is being held hostage by a colour it never asked for.",
    9, 18, 11, 8, 8, 9,
  ],
  [
    "The printer refuses to print a black-and-white page because the yellow ink is empty. The page has no yellow on it. My document is being held hostage by a colour it never asked for.",
    9, 17, 11, 9, 8, 9,
  ],
  // Winner: the yellow-ink hostage, tightest shape. The one-word sentence
  // "Yellow." is the laugh, and the last sentence reframes the document as
  // a hostage that never asked for the colour: the turn that pays on a
  // second read.
  [
    "My printer will not print in black and white because the yellow ink is empty. Yellow. The document has no yellow in it. It is being held hostage by a colour it never asked for.",
    9, 18, 11, 8, 8, 10,
  ],
];

// Concrete, recognisable annoyances. A rant that names one earns its
// subject; a rant that names none is a vague mood and never reaches the
// judge.
const ANNOYANCES: string[] = [
  "printer", "ink", "paper jam", "bus", "timetable", "monday", "alarm",
  "email", "circling back", "wi-fi", "router", "autocorrect", "boss",
  "self-checkout", "bagging area", "microwave", "hold", "saxophone",
  "captcha", "traffic light", "password", "group chat", "elevator", "lift",
  "reply all", "fire drill", "kettle", "leaf blower", "voice note",
  "phone", "toothpaste", "umbrella", "forecast", "outlook", "smoke alarm",
  "gps", "recalculating", "fish", "bank", "car alarm", "neighbour",
  "quick question", "meeting",
];

// ------------------------------------------------------------------- scoring
function totalOf(c: (typeof CANDIDATES)[number]): number {
  return c[1] + c[2] + c[3] + c[4] + c[5] + c[6];
}

function isValid(text: string): boolean {
  // The gate: UTF-8 text of 1 to 400 characters, not only white space.
  if (text.length < 1 || text.length > 400) return false;
  if (text.trim().length === 0) return false;
  if (text.trim() !== text) return false;
  if (!text.endsWith(".")) return false;
  if (/\s{2,}/.test(text)) return false;
  if (/https?:\/\/|www\.|click here|subscribe|buy now/i.test(text)) return false;
  // On subject: a funny rant about a concrete everyday annoyance.
  const lower = text.toLowerCase();
  if (!ANNOYANCES.some((a) => lower.includes(a))) return false;
  if (!/\b(i|my|he|she|we|it)\b/.test(lower)) return false;
  return true;
}

// -------------------------------------------------------------- composition
interface Scored {
  text: string;
  score: number;
}

function buildCandidates(): Scored[] {
  const out: Scored[] = [];
  for (const c of CANDIDATES) {
    const text = c[0];
    if (!isValid(text)) continue;
    out.push({ text, score: totalOf(c) });
  }
  return out;
}

function rank(candidates: Scored[]): Scored[] {
  // Deterministic argmax: highest score, then shortest, then lexicographic.
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid rant candidate");
  const ranked = rank(candidates);
  const best = ranked[0];
  if (process.env.RANT_DEBUG) {
    for (const c of ranked.slice(0, 8)) {
      console.log(`[${c.score}] (${c.text.length}) ${c.text}`);
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // No trailing newline: the file is exactly the rant, byte for byte.
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();
