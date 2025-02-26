// Generate placeholder PNG images for tech stack icons
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Define the tech stack icons we need
const techIcons = [
  // Need to create these
  'microservices', 'vercel', 'terraform', 'github-actions', 'framer',
  'oauth', 'jwt', 'owasp', 'pci', 'hipaa', '508',
  'ai-ml', 'llm', 'web3', 'vector-db', 'quantum', 'innovation'
];

// Directory where the tech stack icons should be
const techStackDir = path.join(__dirname, '../public/images/tech-stack');

// Create the directory if it doesn't exist
if (!fs.existsSync(techStackDir)) {
  fs.mkdirSync(techStackDir, { recursive: true });
}

// Check which icons are missing
const existingIcons = fs.readdirSync(techStackDir)
  .filter(file => file.endsWith('.png'))
  .map(file => file.replace('.png', ''));

const missingIcons = techIcons.filter(icon => !existingIcons.includes(icon));

console.log('Generating placeholder icons for:', missingIcons);

// Generate a simple placeholder icon for each missing icon
missingIcons.forEach(icon => {
  // Create a canvas
  const size = 64;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background with a light color
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, size, size);
  
  // Draw a border
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, size - 4, size - 4);
  
  // Draw the first letter of the icon name
  const letter = icon.charAt(0).toUpperCase();
  ctx.fillStyle = '#555555';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, size / 2, size / 2);
  
  // Save the canvas as a PNG file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(techStackDir, `${icon}.png`), buffer);
  
  console.log(`Created placeholder icon for: ${icon}`);
});

console.log('Done! Replace these placeholder icons with real ones when available.');
console.log('Icons are saved to:', techStackDir);

// Note: To use this script, you need to install the 'canvas' package:
// npm install canvas
// If you have issues installing canvas, you can use a different approach to generate icons. 