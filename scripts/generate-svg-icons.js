// Generate placeholder SVG images for tech stack icons
const fs = require('fs');
const path = require('path');

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
  .filter(file => file.endsWith('.png') || file.endsWith('.svg'))
  .map(file => file.replace(/\.(png|svg)$/, ''));

const missingIcons = techIcons.filter(icon => !existingIcons.includes(icon));

console.log('Generating placeholder SVG icons for:', missingIcons);

// Generate a simple placeholder SVG icon for each missing icon
missingIcons.forEach(icon => {
  // Create a simple SVG with the first letter of the icon name
  const letter = icon.charAt(0).toUpperCase();
  
  // Generate a color based on the icon name (for variety)
  const hash = icon.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const hue = hash % 360;
  const bgColor = `hsl(${hue}, 70%, 85%)`;
  const textColor = `hsl(${hue}, 70%, 30%)`;
  
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="8" fill="${bgColor}" />
  <text x="32" y="32" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${letter}</text>
  <text x="32" y="48" font-family="Arial, sans-serif" font-size="8" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${icon}</text>
</svg>`;
  
  // Save the SVG file
  fs.writeFileSync(path.join(techStackDir, `${icon}.svg`), svgContent);
  
  console.log(`Created placeholder SVG icon for: ${icon}`);
});

console.log('Done! Replace these placeholder icons with real ones when available.');
console.log('Icons are saved to:', techStackDir); 