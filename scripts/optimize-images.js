const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_DIR = path.join(__dirname, '../portfolio');
const OUTPUT_DIR = path.join(__dirname, '../portfolio/optimized');

const SIZES = [
  { name: 'thumb', width: 400, quality: 80 },
  { name: 'medium', width: 800, quality: 82 },
  { name: 'large', width: 1200, quality: 85 },
  { name: 'full', width: 2000, quality: 88 },
];

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

async function ensureDirectories() {
  // Create output directory structure
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const size of SIZES) {
    const sizeDir = path.join(OUTPUT_DIR, size.name);
    if (!fs.existsSync(sizeDir)) {
      fs.mkdirSync(sizeDir, { recursive: true });
    }
  }
}

function getImageFiles() {
  const files = fs.readdirSync(INPUT_DIR);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    const isImage = SUPPORTED_EXTENSIONS.includes(ext);
    const isNotInOptimized = !file.includes('optimized');
    return isImage && isNotInOptimized;
  });
}

function sanitizeFilename(filename) {
  // Remove extension, sanitize, then we'll add it back
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  // Replace spaces and special chars with hyphens, lowercase
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

async function processImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const sanitizedName = sanitizeFilename(filename);

  console.log(`Processing: ${filename} -> ${sanitizedName}`);

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  for (const size of SIZES) {
    // Skip if image is smaller than target size (don't upscale)
    const targetWidth = Math.min(size.width, metadata.width);

    // WebP output (metadata stripped by default in sharp)
    const webpOutputPath = path.join(OUTPUT_DIR, size.name, `${sanitizedName}.webp`);
    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF, then strip
      .resize(targetWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: size.quality })
      .withMetadata(false) // Strip all EXIF/metadata
      .toFile(webpOutputPath);

    // JPEG output (fallback)
    const jpegOutputPath = path.join(OUTPUT_DIR, size.name, `${sanitizedName}.jpg`);
    await sharp(inputPath)
      .rotate() // Auto-rotate based on EXIF, then strip
      .resize(targetWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: size.quality, progressive: true })
      .withMetadata(false) // Strip all EXIF/metadata (GPS, camera info, etc.)
      .toFile(jpegOutputPath);

    const webpStats = fs.statSync(webpOutputPath);
    const jpegStats = fs.statSync(jpegOutputPath);
    console.log(`  ${size.name}: WebP ${(webpStats.size / 1024).toFixed(0)}KB, JPEG ${(jpegStats.size / 1024).toFixed(0)}KB`);
  }

  return sanitizedName;
}

async function generateImageManifest(processedImages) {
  const manifest = {
    generated: new Date().toISOString(),
    images: processedImages.map(img => ({
      original: img.original,
      optimized: img.sanitized,
      sizes: SIZES.map(s => s.name)
    }))
  };

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest saved to: ${manifestPath}`);
}

async function main() {
  console.log('='.repeat(50));
  console.log('Zen Wild Om - Image Optimization Script');
  console.log('='.repeat(50));
  console.log('');

  await ensureDirectories();

  const imageFiles = getImageFiles();
  console.log(`Found ${imageFiles.length} images to process\n`);

  const processedImages = [];

  for (const file of imageFiles) {
    try {
      const sanitizedName = await processImage(file);
      processedImages.push({
        original: file,
        sanitized: sanitizedName
      });
      console.log('');
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
    }
  }

  await generateImageManifest(processedImages);

  console.log('='.repeat(50));
  console.log('Optimization complete!');
  console.log(`Processed: ${processedImages.length} images`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Update HTML to use srcset with optimized images');
  console.log('2. Use <picture> element for WebP with JPEG fallback');
  console.log('='.repeat(50));
}

main().catch(console.error);
