# Giovanni's Portfolio

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Deployment

This portfolio is automatically deployed to Vercel from GitHub. Any changes pushed to the main branch will trigger a new deployment.

- Production URL: https://portfolio-sebastianvenegas-projects.vercel.app

### Vercel Deployment Configuration

The project includes special configurations for successful deployment on Vercel:

1. **Runtime Configuration**: API routes that use Prisma or database operations use the Node.js runtime instead of Edge runtime. This is configured using `route.config.ts` files in the relevant API route directories.

2. **Build Settings**: The build process is streamlined to:
   - Run Prisma generate before build if needed
   - Skip TypeScript errors during build (configured in `next.config.js`)
   - Handle Edge runtime gracefully for routes that don't have direct database access

3. **Error Handling**: Routes have error handling for cases where the database might not be initialized, providing fallback responses.

## Development

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Email Configuration

The contact form uses Nodemailer to send emails. To configure email functionality:

1. Create or update the `.env.local` file with the following variables:
   ```
   EMAIL_SERVER=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_TO=recipient-email@example.com
   ```

2. For Gmail, you need to use an App Password instead of your regular password:
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification
   - Scroll down and select "App passwords"
   - Generate a new app password for "Mail" and "Other (Custom name)"
   - Use this generated password in your `.env.local` file

3. For production deployment on Vercel, add these environment variables in the Vercel project settings.

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Vercel

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.