const fs = require("fs");
const path = require("path");
const { writeLogReport } = require("../database");

const ROOT = path.resolve(__dirname, "..");
const BACKUP_DIR = path.join(ROOT, "backups");
const EXCLUDED_DIRS = new Set([".git", "node_modules", "backups", ".vercel"]);
const EXCLUDED_FILES = new Set([".env", ".env.local"]);

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function shouldSkip(file) {
  const relative = path.relative(ROOT, file).replace(/\\/g, "/");
  const parts = relative.split("/");
  if (parts.some((part) => EXCLUDED_DIRS.has(part))) return true;
  if (EXCLUDED_FILES.has(path.basename(file))) return true;
  return false;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (shouldSkip(full)) continue;
    if (entry.isDirectory()) walk(full, files);
    if (entry.isFile()) files.push(full);
  }
  return files;
}

function crc32(buffer) {
  let crc = -1;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(files, target) {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = path.relative(ROOT, file).replace(/\\/g, "/");
    const nameBuffer = Buffer.from(name);
    const data = fs.readFileSync(file);
    const checksum = crc32(data);
    const stamp = dosDateTime(fs.statSync(file).mtime);
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(stamp.time), u16(stamp.day),
      u32(checksum), u32(data.length), u32(data.length), u16(nameBuffer.length), u16(0), nameBuffer, data
    ]);
    chunks.push(local);
    central.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(stamp.time), u16(stamp.day),
      u32(checksum), u32(data.length), u32(data.length), u16(nameBuffer.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), nameBuffer
    ]));
    offset += local.length;
  }
  const centralStart = offset;
  const centralBuffer = Buffer.concat(central);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(centralBuffer.length), u32(centralStart), u16(0)
  ]);
  fs.writeFileSync(target, Buffer.concat([...chunks, centralBuffer, end]));
}

function runBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const files = walk(ROOT);
  const filename = `comphelp-service-${timestamp()}.zip`;
  const target = path.join(BACKUP_DIR, filename);
  createZip(files, target);
  return writeLogReport("backup-report.json", {
    ok: true,
    backup: {
      file: path.relative(ROOT, target).replace(/\\/g, "/"),
      files: files.length,
      size: fs.statSync(target).size,
      excludes: ["node_modules", ".git", ".env", ".env.local", "backups"]
    }
  });
}

if (require.main === module) {
  console.log(JSON.stringify(runBackup(), null, 2));
}

module.exports = { runBackup };
