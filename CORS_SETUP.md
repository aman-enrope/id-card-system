# Firebase Storage CORS Configuration Guide

## Problem
Your images are being blocked by CORS (Cross-Origin Resource Sharing) policy. This prevents images uploaded to Firebase Storage from being accessed by your localhost development server.

## Solution: Configure CORS on Firebase Storage

### Step 1: Install Google Cloud SDK (if not already installed)
```bash
# On macOS with Homebrew
brew install google-cloud-sdk

# On Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# On Windows
# Download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate with Google Cloud
```bash
gcloud auth login
```

### Step 3: Set your project
```bash
gcloud config set project printype-studio
```

### Step 4: Configure CORS
Run the following command from the project root (where cors.json is located):
```bash
gsutil cors set cors.json gs://printype-studio.firebasestorage.app
```

### Step 5: Verify CORS is configured
```bash
gsutil cors get gs://printype-studio.firebasestorage.app
```

You should see the CORS configuration listed.

## What This Fixes
- ✅ Uploaded images (logo, watermark, signature) will load in the browser
- ✅ Images will display in exports (html2canvas won't get CORS errors)
- ✅ No more "Access to image... has been blocked by CORS policy" errors

## Important Notes
- The `cors.json` file allows requests from **any origin** (`"origin": ["*"]`)
- In production, restrict the origin to your actual domain
- CORS configuration takes a few minutes to take effect
- If changes don't take effect immediately, clear browser cache (Ctrl+Shift+Delete)

## Troubleshooting
If images still don't load after configuring CORS:
1. Clear browser cache completely
2. Check browser console (F12) for any remaining CORS errors
3. Run `gsutil cors get gs://printype-studio.firebasestorage.app` to verify it's set
4. Wait a few minutes for Google Cloud to propagate the changes
