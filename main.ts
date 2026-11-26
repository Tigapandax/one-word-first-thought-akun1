import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function fail(reason: string): never {
  console.error(`INVALID: ${reason}`);
  process.exit(1);
}

const source = new URL("./one-word.txt", import.meta.url);
const raw = readFileSync(source, "utf8");
const word = raw.replace(/\r?\n$/, "");

if (word.length === 0) fail("word is empty");
const points = Array.from(word).length;
if (points > 24) fail(`word is ${points} code points, over the 24 limit`);
if (/[\u0000-\u001f\u007f]/.test(word)) fail("word contains a control character");
if (/\s/.test(word)) fail("word contains whitespace, so it is not a single word");
if (!/^[A-Za-z]+$/.test(word)) fail("word must contain letters only");

const target = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(target, { recursive: true });
const entryPath = join(target, "entry.txt");
writeFileSync(entryPath, word, "utf8");
const roundTrip = readFileSync(entryPath, "utf8");
if (roundTrip !== word) fail("written entry.txt does not match the word");
console.log(word);
console.log(`Wrote ${points} code points (${Buffer.byteLength(word, "utf8")} bytes) to entry.txt.`);
