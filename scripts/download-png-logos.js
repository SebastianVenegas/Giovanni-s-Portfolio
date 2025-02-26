const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directory if it doesn't exist
const downloadDir = path.join(__dirname, '../public/images/tech-stack');

// Tech stack logos with their source URLs (PNG only)
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
    url: 'https://cdn.iconscout.com/icon/free/png-256/free-node-js-1174925.png'
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
    url: 'https://cdn.iconscout.com/icon/free/png-256/free-aws-1869025-1583149.png'
  },
  {
    name: 'azure',
    url: 'https://www.vectorlogo.zone/logos/microsoft_azure/microsoft_azure-icon.png'
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
    url: 'https://cdn.iconscout.com/icon/free/png-256/free-mongodb-5-1175140.png'
  },
  {
    name: 'mysql',
    url: 'https://cdn.iconscout.com/icon/free/png-256/free-mysql-3628940-3030165.png'
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
    url: 'https://cdn.iconscout.com/icon/free/png-256/free-terraform-2752012-2284829.png'
  },
  {
    name: 'github-actions',
    url: 'https://cdn.iconscout.com/icon/free/png-256/free-github-actions-7127790-5813968.png'
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

// Download all logos
async function downloadLogos() {
  console.log(`Downloading logos to: ${downloadDir}`);
  
  for (const logo of techLogos) {
    const destination = path.join(downloadDir, `${logo.name}.png`);
    
    // Skip if file already exists
    if (fs.existsSync(destination)) {
      console.log(`Skipping ${logo.name}.png (already exists)`);
      continue;
    }
    
    try {
      await downloadFile(logo.url, destination);
    } catch (error) {
      console.error(`Error downloading ${logo.name}: ${error.message}`);
    }
  }
  
  console.log('\nDownload complete!');
  console.log(`Logos saved to: ${downloadDir}`);
}

// Start the download process
downloadLogos().catch(error => {
  console.error('Download process failed:', error);
}); 