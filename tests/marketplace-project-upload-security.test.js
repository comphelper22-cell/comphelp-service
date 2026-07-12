const assert = require("assert");
const upload = require("../api/marketplace-project-upload");

assert.strictEqual(typeof upload.validateUploadFiles, "function");

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const valid = upload.validateUploadFiles([{ fileName: "camera.png", contentType: "image/png", buffer: png, size: png.length }]);
assert.strictEqual(valid[0].mediaType, "image");

assert.throws(
  () => upload.validateUploadFiles([{ fileName: "fake.jpg", contentType: "image/jpeg", buffer: Buffer.from("not an image"), size: 12 }]),
  /Unsupported or spoofed media file/
);
assert.throws(
  () => upload.validateUploadFiles([{ fileName: "huge.png", contentType: "image/png", buffer: png, size: 25 * 1024 * 1024 + 1 }]),
  /exceeds 25 MB/
);
assert.throws(
  () => upload.validateUploadFiles(Array.from({ length: 13 }, (_, i) => ({ fileName: `${i}.png`, contentType: "image/png", buffer: png, size: png.length }))),
  /Maximum 12 files/
);

console.log(JSON.stringify({ ok: true, projectUploadValidation: "validated" }, null, 2));
