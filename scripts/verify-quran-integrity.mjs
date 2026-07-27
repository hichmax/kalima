import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const fixture = JSON.parse(
  await readFile(new URL("../src/data/canonical-quran.fixture.json", import.meta.url), "utf8"),
);

if (fixture.ayahs.length !== 7) throw new Error("Expected 7 ayahs for Al-Fatiha");
const seen = new Set();
fixture.ayahs.forEach((ayah, index) => {
  const expectedId = `1:${index + 1}`;
  if (ayah.id !== expectedId) throw new Error(`Unexpected ayah order: ${ayah.id}`);
  if (seen.has(ayah.id)) throw new Error(`Duplicate ayah: ${ayah.id}`);
  if (!ayah.text || ayah.text.trim() !== ayah.text) throw new Error(`Invalid text: ${ayah.id}`);
  seen.add(ayah.id);
});

const canonical = fixture.ayahs.map((ayah) => `${ayah.id}|${ayah.text}`).join("\n");
const checksum = createHash("sha256").update(canonical, "utf8").digest("hex");
if (checksum !== fixture.expectedSha256) {
  throw new Error(`Checksum mismatch: expected ${fixture.expectedSha256}, received ${checksum}`);
}

console.log(`Quran fixture integrity OK: ${fixture.ayahs.length} ayahs`);
console.log(`SHA-256: ${checksum}`);
