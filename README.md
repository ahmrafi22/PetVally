# PetVally - Next.JS 

## About This Project
`Project for CSE 470 - Software Engineering` 

![Petvally banner](./public/petvally.png)

### A comunity of petowners and caregivers.
- Get recomended pets based on your life style
- Shop for your pet
- Get notifiacition about missing pets near your, find all the post about missing pets near you.
- Find pets for adoption near you
- Find vet doctors Near you
- Ai chatbot as a professional vet 

### 💾 Tech Stack :
![Typescript](    https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Next JS](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Css3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)  ![Prisma](    https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![NeonDB](https://img.shields.io/badge/NeonDB-00E599?style=for-the-badge&logo=neon&logoColor=white) ![ShandCN](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) ![PostMan](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white) ![🐻 Zustand](https://img.shields.io/badge/🐻%20Zustand-000000?style=for-the-badge&logoColor=white)
 ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white) ![Gsap](https://img.shields.io/badge/GSAP-93CF2B?style=for-the-badge&logo=greensock&logoColor=white) ![LottieFiles](https://img.shields.io/badge/LottieFiles-0ABFBC?style=for-the-badge&logo=lottiefiles&logoColor=white) 


<!-- So Far time spent on this <br>
 [![wakatime](https://wakatime.com/badge/user/d7d5cf63-4ec9-422f-a677-8823091fc3db/project/990c11bf-1cc3-4dda-a67d-17cfaf30e6d1.svg)](https://wakatime.com/badge/user/d7d5cf63-4ec9-422f-a677-8823091fc3db/project/990c11bf-1cc3-4dda-a67d-17cfaf30e6d1)  -->

🚀 Getting Started
------------------

### 📦 1. Install Dependencies

Make sure you have **Node.js** and **npm** installed. Then run:


`npm install`

### ⚙️ 2. Create Your Own Environment File


Create your own .env file in the root directory.

Your .env file should look like this:




```bash
DATABASE_URL = your_database_url_here 
JWT_SECRET = your_jwt_secret_here 
CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name 
CLOUDINARY_API_KEY = your_cloudinary_api_key 
CLOUDINARY_API_SECRET = your_cloudinary_api_secret
```

🛑 Never commit your .env file to version control.


### 🧪 3. Run the Development Server

`npm run dev`


### 🚨 4. Properly add or edit "Prisma.Schema" 

Run These commands then

1. `npx prisma db push` <br>
2. `npx prisma generate` <br>
3. First run to seed pet data  `npx prisma db seed ` <br>
4. Now remane the `seed.ts` to something else and rename `seed2.ts` -> to -> `seed.ts` . <br>
5. Now again run `npx prisma db seed` this will update the product data
6. Check all data tables using `npx prisma studio` or go to [NeonDB](https://console.neon.tech/) and check your project's Table 


Open your browser and visit for local development : [http://localhost:3000](http://localhost:3000)
