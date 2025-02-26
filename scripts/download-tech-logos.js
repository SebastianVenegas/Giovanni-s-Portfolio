const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Create directory if it doesn't exist
const downloadDir = path.join(__dirname, '../public/images/tech-stack-downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Tech stack logos with their source URLs
const techLogos = [
  {
    name: 'react',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png'
  },
  {
    name: 'nextjs',
    url: 'https://seeklogo.com/images/N/next-js-icon-logo-EE302D5DBD-seeklogo.com.png'
  },
  {
    name: 'typescript',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png'
  },
  {
    name: 'javascript',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/JavaScript-logo.png/800px-JavaScript-logo.png'
  },
  {
    name: 'nodejs',
    url: 'https://nodejs.org/static/images/logo.svg'
  },
  {
    name: 'python',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png'
  },
  {
    name: 'php',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/PHP-logo.svg/2560px-PHP-logo.svg.png'
  },
  {
    name: 'laravel',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Laravel.svg/1200px-Laravel.svg.png'
  },
  {
    name: 'graphql',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/2048px-GraphQL_Logo.svg.png'
  },
  {
    name: 'aws',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1280px-Amazon_Web_Services_Logo.svg.png'
  },
  {
    name: 'azure',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/1200px-Microsoft_Azure.svg.png'
  },
  {
    name: 'docker',
    url: 'https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png'
  },
  {
    name: 'kubernetes',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Kubernetes_logo_without_workmark.svg/1200px-Kubernetes_logo_without_workmark.svg.png'
  },
  {
    name: 'tailwind',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tailwind_CSS_Logo.svg/2048px-Tailwind_CSS_Logo.svg.png'
  },
  {
    name: 'mongodb',
    url: 'https://www.mongodb.com/assets/images/global/leaf.svg'
  },
  {
    name: 'mysql',
    url: 'https://www.mysql.com/common/logos/logo-mysql-170x115.png'
  },
  {
    name: 'git',
    url: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png'
  },
  {
    name: 'vercel',
    url: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png'
  },
  {
    name: 'terraform',
    url: 'https://www.datocms-assets.com/2885/1620155116-brandhcterraformverticalcolor.svg'
  },
  {
    name: 'github-actions',
    url: 'https://github.githubassets.com/images/modules/site/features/actions-icon-actions.svg'
  },
  {
    name: 'microservices',
    url: 'https://cdn-icons-png.flaticon.com/512/8636/8636835.png'
  },
  {
    name: 'ai-ml',
    url: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
  },
  {
    name: 'llm',
    url: 'https://cdn-icons-png.flaticon.com/512/6295/6295417.png'
  },
  {
    name: 'web3',
    url: 'https://cdn-icons-png.flaticon.com/512/7858/7858975.png'
  }
];

// Function to download a file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
      
      file.on('error', err => {
        fs.unlink(destination, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', err => {
      fs.unlink(destination, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Function to convert SVG to PNG using ImageMagick if available
function convertSvgToPng(svgPath, pngPath) {
  try {
    execSync(`convert -background none ${svgPath} -resize 200x200 ${pngPath}`);
    console.log(`Converted SVG to PNG: ${pngPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to convert SVG to PNG: ${error.message}`);
    return false;
  }
}

// Download all logos
async function downloadLogos() {
  for (const logo of techLogos) {
    const fileExtension = path.extname(logo.url).toLowerCase();
    const isDirectPng = fileExtension === '.png';
    const isSvg = fileExtension === '.svg';
    
    const tempPath = path.join(downloadDir, `${logo.name}${fileExtension}`);
    const finalPath = path.join(downloadDir, `${logo.name}.png`);
    
    try {
      await downloadFile(logo.url, tempPath);
      
      if (isDirectPng) {
        // If it's already a PNG, just rename it
        fs.renameSync(tempPath, finalPath);
      } else if (isSvg) {
        // If it's an SVG, try to convert it to PNG
        const converted = convertSvgToPng(tempPath, finalPath);
        if (!converted) {
          console.log(`Please manually convert ${tempPath} to PNG`);
        }
      } else {
        console.log(`Please manually convert ${tempPath} to PNG`);
      }
    } catch (error) {
      console.error(`Error processing ${logo.name}: ${error.message}`);
    }
  }
  
  console.log('\nDownload complete!');
  console.log(`Logos saved to: ${downloadDir}`);
  console.log('Please check the directory and manually convert any SVGs that couldn\'t be automatically converted.');
}

// Start the download process
downloadLogos().catch(error => {
  console.error('Download process failed:', error);
}); 