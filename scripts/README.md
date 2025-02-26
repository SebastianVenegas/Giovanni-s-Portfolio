# Tech Stack Icons Scripts

This directory contains scripts to help manage the tech stack icons used in the portfolio.

## Available Scripts

### 1. Generate Tech Icons Guide

```bash
node generate-tech-icons.js
```

This script:
- Checks which tech stack icons are missing
- Generates an HTML guide (`tech-icons-guide.html`) showing which icons you need to add
- The guide provides instructions on where to save the icons

### 2. Generate SVG Placeholder Icons

```bash
node generate-svg-icons.js
```

This script:
- Automatically generates placeholder SVG icons for all missing tech stack icons
- Each icon will have a colored background with the first letter of the technology name
- These are meant to be temporary until you can replace them with proper icons

### 3. Generate PNG Placeholder Icons (requires canvas package)

```bash
# First install the canvas package
npm install canvas

# Then run the script
node generate-placeholder-icons.js
```

This script:
- Generates PNG placeholder icons for missing tech stack icons
- Requires the `canvas` npm package to be installed
- Only use this if you prefer PNG over SVG placeholders

## Adding Your Own Icons

For the best results, you should replace the placeholder icons with proper tech stack icons:

1. Find appropriate icons for each technology (64x64px or larger)
2. Save them to: `public/images/tech-stack/[name].png`
3. Make sure the background is transparent for best results

## Icon Naming Convention

The icons should be named according to the technology they represent:

- `microservices.png` - for Microservices
- `vercel.png` - for Vercel
- `terraform.png` - for Terraform
- etc.

The names should match exactly what's used in the `about.tsx` component.

## Troubleshooting

If you encounter any issues with the scripts:

- Make sure Node.js is installed
- Check that you have write permissions to the `public/images/tech-stack` directory
- For the PNG generator, ensure the `canvas` package is properly installed 