// Generate placeholder PNG images for tech stack icons
const fs = require('fs');
const path = require('path');

// Define the tech stack icons we need
const techIcons = [
  // Already have these
  'php', 'laravel', 'nodejs', 'python', 'graphql', 'aws', 'azure', 'docker', 
  'typescript', 'javascript', 'react', 'nextjs', 'tailwind',
  
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

console.log('Missing icons:', missingIcons);

// Create a simple HTML file to help create the missing icons
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tech Stack Icons</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
    }
    .instructions {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 20px;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: white;
    }
    .icon-name {
      margin-top: 10px;
      font-weight: bold;
    }
    .icon-placeholder {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f0f0f0;
      border-radius: 8px;
      font-size: 24px;
      color: #555;
    }
  </style>
</head>
<body>
  <h1>Missing Tech Stack Icons</h1>
  
  <div class="instructions">
    <p>The following tech stack icons are missing from your project. You need to:</p>
    <ol>
      <li>Find appropriate PNG icons for each technology (64x64px or larger)</li>
      <li>Save them to: <code>public/images/tech-stack/[name].png</code></li>
      <li>Make sure the background is transparent for best results</li>
    </ol>
  </div>
  
  <div class="icons-grid">
    ${missingIcons.map(icon => `
      <div class="icon-item">
        <div class="icon-placeholder">${icon.charAt(0).toUpperCase()}</div>
        <div class="icon-name">${icon}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'tech-icons-guide.html'), htmlContent);

console.log('Created tech-icons-guide.html to help you create the missing icons');
console.log('Please save the icons to:', techStackDir); 