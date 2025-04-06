# PetVally - Next.JS
===============

🚀 Getting Started
------------------

### 📦 1. Install Dependencies

Make sure you have **Node.js** and **npm** installed. Then run:

bash

Copy

`npm install`

### ⚙️ 2. Create Your Own Environment File

⚠️ Do not use any .env file from this repo (if any exists).

Create your own .env.local file in the root directory.

Your .env.local file should look like this:

env

Copy
```bash
DATABASE_URL = your_database_url_here 
JWT_SECRET = your_jwt_secret_here 
NEXT_PUBLIC_APP_URL = http://localhost:3000 (change in prod)
CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name 
CLOUDINARY_API_KEY = your_cloudinary_api_key 
CLOUDINARY_API_SECRET = your_cloudinary_api_secret
```

🛑 Never commit your .env.local file to version control.

### 🧪 3. Run the Development Server

bash

Copy

`npm run dev`

Open your browser and visit: [http://localhost:3000](http://localhost:3000)
