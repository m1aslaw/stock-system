# 🚀 How to Deploy Your App 24/7 (Free)

To make your system accessible **24/7** without keeping your laptop on, you need to upload it to a cloud server.
We recommend **Render.com** because it has a generous free tier for Node.js.

## Prerequisites
1.  **GitHub Account**: You need to upload your code to GitHub first.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **MongoDB Atlas**: You are already using this! (Keep your `MONGO_URI` handy).

## Step 1: Upload to GitHub
1.  Initialize Git (if not done):
    ```bash
    git init
    git add .
    git commit -m "Ready for deploy"
    ```
2.  Create a new Repository on [GitHub.com](https://github.com/new).
3.  Push your code:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy on Render
1.  Log in to [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure Settings**:
    *   **Name**: `stock-system` (or similar)
    *   **Region**: `Frankfurt` or `Oregon` (closest to you)
    *   **Branch**: `main`
    *   **Root Directory**: `.` (leave empty)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
    *   **Instance Type**: `Free`

5.  **Environment Variables** (Important!):
    Scroll down to "Environment Variables" and add these:
    *   `MONGO_URI`: (Paste the value from your `.env` file)
    *   `JWT_SECRET`: (Paste from `.env` or make a new random code)
    *   `NODE_ENV`: `production`

6.  Click **Create Web Service**.

## Step 3: Access 24/7
*   Render will process the build (taking 2-5 minutes).
*   Once it says **Live**, it will give you a URL like: `https://stock-system.onrender.com`.
*   **Share that URL** with your customers. It works 24/7!

## Note on "Free Tier" activity
*   Render's free tier "sleeps" after 15 minutes of inactivity.
*   The **first load** after sleeping might take 30-50 seconds.
*   Once awake, it is fast.
