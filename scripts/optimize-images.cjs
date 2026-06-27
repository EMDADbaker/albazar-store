// One-off bandwidth fix: source images in public/img are full camera resolution
// (up to 4500x6800, 8MB). Cap the longest side at 2000px and re-encode with
// good compression. next/image downscales further per display, so 2000px is
// plenty for full-screen heroes. Writes in place only when the result is
// smaller. Recoverable via git.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = 'public/img';
const MAX = 2000;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function walk(dir) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else if (EXTS.has(path.extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

(async () => {
  const files = walk(ROOT);
  let before = 0, after = 0, changed = 0;
  const bigSavings = [];
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    const orig = fs.statSync(f).size;
    before += orig;
    try {
      // Read into a buffer so sharp never holds an OS file handle on the source
      // (avoids Windows "open" lock errors and lets us overwrite in place).
      const input = fs.readFileSync(f);
      const m = await sharp(input, { failOn: 'none' }).metadata();
      let pipe = sharp(input, { failOn: 'none' }).rotate(); // bake EXIF orientation
      if (Math.max(m.width || 0, m.height || 0) > MAX) {
        pipe = pipe.resize(MAX, MAX, { fit: 'inside', withoutEnlargement: true });
      }
      if (ext === '.png') pipe = pipe.png({ compressionLevel: 9 });
      else if (ext === '.webp') pipe = pipe.webp({ quality: 80 });
      else pipe = pipe.jpeg({ quality: 80, mozjpeg: true, progressive: true });
      const buf = await pipe.toBuffer();
      if (buf.length < orig) {
        fs.writeFileSync(f, buf);
        changed++;
        after += buf.length;
        if (orig - buf.length > 1_000_000)
          bigSavings.push(`${f}: ${(orig / 1048576).toFixed(1)}MB -> ${(buf.length / 1048576).toFixed(1)}MB`);
      } else {
        after += orig;
      }
    } catch (e) {
      after += orig;
      console.error('skip', f, e.message);
    }
  }
  console.log(`\nProcessed ${files.length} images, rewrote ${changed}`);
  console.log(`Total: ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
  console.log(`Saved: ${((before - after) / 1048576).toFixed(1)}MB (${(100 * (before - after) / before).toFixed(0)}%)`);
  console.log('\nBiggest reductions:');
  bigSavings.sort().slice(0, 12).forEach((s) => console.log('  ' + s));
})();
