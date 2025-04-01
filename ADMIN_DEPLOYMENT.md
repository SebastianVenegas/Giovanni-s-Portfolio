# Admin Portal Deployment Guide

This document provides instructions for deploying the admin portal securely in a production environment.

## Environment Variables

The admin portal uses environment variables for secure authentication. In production, you must set these variables:

```
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
NODE_ENV=production
```

### Important Notes:

1. **Change Default Password**: Always change the default admin password (`Aaron3209`) to a strong, unique password in production.

2. **Set Production Environment**: Make sure `NODE_ENV` is set to `production` to disable development fallbacks.

## Deployment Steps

1. **Set Environment Variables on Your Hosting Platform**

   - If using Vercel:
     - Go to your project dashboard
     - Navigate to Settings → Environment Variables
     - Add the variables listed above
     - Deploy with production environment

   - If using Netlify:
     - Go to Site settings → Build & deploy → Environment
     - Add the variables listed above

   - For other hosting platforms, refer to their documentation for setting environment variables

2. **Verify Authentication**

   After deployment:
   
   - Visit the `/admin-access` route on your production site
   - Verify that the login works with your new password
   - Confirm that the fallback password no longer works

## Security Considerations

1. **Password Storage**: Store your admin password securely - do not commit it to your repository.

2. **Session Security**: The admin session expires after 24 hours for security.

3. **Access Logs**: Consider implementing access logging for the admin portal.

4. **HTTPS**: Ensure your site uses HTTPS to protect credentials in transit.

## Troubleshooting

If you have issues with admin authentication in production:

1. Verify environment variables are correctly set on your hosting platform
2. Check browser console and server logs for error messages
3. Ensure your API routes are properly deployed
4. Clear browser cache and cookies if needed
5. Try a private/incognito browser window

## Development vs Production

- In development: The fallback password (`Aaron3209`) will work
- In production: Only the password set in environment variables will work

Remember to implement additional security measures according to your organization's requirements. 