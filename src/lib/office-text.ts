import { inflateRawSync } from "zlib";

type ZipEntry = { name: string; method: number; compressedSize: number; offset: number };

function readEntries(buffer: Buffer) {
  let end = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 65_557); index -= 1) if (buffer.readUInt32LE(index) === 0x06054b50) { end = index; break; }
  if (end < 0) return [] as ZipEntry[];
  const count = buffer.readUInt16LE(end + 10); let offset = buffer.readUInt32LE(end + 16); const entries: ZipEntry[] = [];
  for (let index = 0; index < count && offset + 46 <= buffer.length && buffer.readUInt32LE(offset) === 0x02014b50; index += 1) { const compressedSize = buffer.readUInt32LE(offset + 20); const nameLength = buffer.readUInt16LE(offset + 28); const extraLength = buffer.readUInt16LE(offset + 30); const commentLength = buffer.readUInt16LE(offset + 32); const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString("utf8"); entries.push({ name, method: buffer.readUInt16LE(offset + 10), compressedSize, offset: buffer.readUInt32LE(offset + 42) }); offset += 46 + nameLength + extraLength + commentLength; }
  return entries;
}

function unzipEntry(buffer: Buffer, entry: ZipEntry) {
  if (entry.offset + 30 > buffer.length || buffer.readUInt32LE(entry.offset) !== 0x04034b50) return "";
  const nameLength = buffer.readUInt16LE(entry.offset + 26); const extraLength = buffer.readUInt16LE(entry.offset + 28); const content = buffer.subarray(entry.offset + 30 + nameLength + extraLength, entry.offset + 30 + nameLength + extraLength + entry.compressedSize);
  if (entry.method === 0) return content.toString("utf8");
  if (entry.method === 8) return inflateRawSync(content).toString("utf8");
  return "";
}

function decode(text: string) { return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'"); }
function textFromXml(xml: string, tag: "w:t" | "a:t", paragraph: string) { return decode(xml.replace(new RegExp(`</${paragraph}>`, "g"), "\n").match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g"))?.map((part) => part.replace(new RegExp(`^<${tag}[^>]*>|</${tag}>$`, "g"), "")).join(" ") || "").replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n"); }

export function extractOfficeText(buffer: Buffer, extension: string) {
  try { const entries = readEntries(buffer); if (extension === ".docx") { const entry = entries.find((candidate) => candidate.name === "word/document.xml"); return entry ? textFromXml(unzipEntry(buffer, entry), "w:t", "w:p") : ""; } if (extension === ".pptx") return entries.filter((candidate) => /^ppt\/slides\/slide\d+\.xml$/.test(candidate.name)).sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true })).map((entry) => textFromXml(unzipEntry(buffer, entry), "a:t", "a:p")).filter(Boolean).join("\n\n"); return ""; } catch { return ""; }
}
