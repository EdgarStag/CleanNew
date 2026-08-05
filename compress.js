const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const driveDir = "/Users/edgarochoaaviles/Documents/ClenNew/drive-download-20260805T211607Z-1-001";
const publicVids = "public/videos";
const publicPosters = "public/images/posters";

if (!fs.existsSync(publicVids)) fs.mkdirSync(publicVids, { recursive: true });
if (!fs.existsSync(publicPosters)) fs.mkdirSync(publicPosters, { recursive: true });

const files = fs.readdirSync(driveDir);
console.log("Found " + files.length + " files in Drive folder.");

files.forEach((file, index) => {
  if (file.startsWith(".")) return;
  const ext = path.extname(file).toLowerCase();
  if (ext !== ".mp4" && ext !== ".mov") return;

  const inputPath = path.join(driveDir, file);
  let cleanName = file
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  if (!cleanName.endsWith("-mp4") && !cleanName.endsWith("-mov")) {
    cleanName += ".mp4";
  } else {
    cleanName = cleanName.replace(/-(mp4|mov)$/, ".mp4");
  }

  const outVid = path.join(publicVids, cleanName);
  const outPoster = path.join(publicPosters, cleanName.replace(/\.mp4$/, ".jpg"));

  console.log(`[${index + 1}/${files.length}] Processing: ${file} -> ${cleanName}`);
  try {
    execSync(`ffmpeg -y -i "${inputPath}" -vf "scale='min(720,iw)':-2" -c:v libx264 -crf 28 -preset faster -c:a aac -b:a 96k -movflags +faststart "${outVid}"`, { stdio: "inherit" });
    execSync(`ffmpeg -y -i "${outVid}" -vframes 1 -q:v 2 "${outPoster}"`, { stdio: "inherit" });
    console.log(`✓ Finished: ${cleanName}`);
  } catch (err) {
    console.error(`✗ Error processing ${file}:`, err.message);
  }
});

console.log("All videos compressed with FastStart!");
