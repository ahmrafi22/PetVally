import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data to avoid duplicates during development
  await prisma.upvote.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.adoptionForm.deleteMany({})
  await prisma.donationPost.deleteMany({})
  await prisma.notification.deleteMany({})

  console.log("Cleared existing data")

//   // Create two users with the same email/password pattern and location
//   const password = await hash("password123", 10)

//   const user1 = await prisma.user.create({
//     data: {
//       name: "Rahifsdfdsm Ahmed",
//       email: "rahifsdfsdfm@example.com",
//       password,
//       country: "Bangladesh",
//       city: "dhaka", // Stored as lowercase for easier matching
//       area: "badda", // Stored as lowercase for easier matching
//       dailyAvailability: 3,
//       hasOutdoorSpace: true,
//       hasChildren: false,
//       hasAllergies: false,
//       experienceLevel: 2,
//     },
//   })

//   const user2 = await prisma.user.create({
//     data: {
//       name: "Karifsdfsfm Khan",
//       email: "kardfsfsdfim@example.com",
//       password,
//       country: "Bangladesh",
//       city: "dhaka", // Stored as lowercase for easier matching
//       area: "badda", // Stored as lowercase for easier matching
//       dailyAvailability: 4,
//       hasOutdoorSpace: true,
//       hasChildren: true,
//       hasAllergies: false,
//       experienceLevel: 3,
//     },
//   })

//   console.log("Created users:", user1.name, user2.name)

//   // Create donation post for an orange cat (from user1)
//   const catPost = await prisma.donationPost.create({
//     data: {
//       title: "Adopt This Friendly Orange Cat",
//       description:
//         "Meet Milo, a sweet and playful orange tabby looking for a new loving home. He has a small white patch on his chest and bright green eyes. We're looking for someone who can take good care of him. Milo is vaccinated and neutered. Available for adoption in Badda.",
//       images: "/placeholder.svg?height=300&width=300",
//       country: "Bangladesh",
//       city: "dhaka",
//       area: "badda",
//       species: "Cat",
//       breed: "Domestic Shorthair",
//       gender: "male",
//       age: 3,
//       vaccinated: true,
//       neutered: true,
//       isAvailable: true,
//       upvotesCount: 0,
//       userId: user1.id,
//     },
//   })

//   // Create donation post for a dog (from user2)
//   const dogPost = await prisma.donationPost.create({
//     data: {
//       title: "German Shepherd Puppy for Adoption",
//       description:
//         "Rex is a loyal and intelligent German Shepherd looking for a caring new home. He's a well-trained dog with a black and tan coat. Great with families and children. Fully vaccinated and ready for adoption in Badda.",
//       images: "/placeholder.svg?height=300&width=300",
//       country: "Bangladesh",
//       city: "dhaka",
//       area: "badda",
//       species: "Dog",
//       breed: "German Shepherd",
//       gender: "male",
//       age: 4,
//       vaccinated: true,
//       neutered: false,
//       isAvailable: true,
//       upvotesCount: 0,
//       userId: user2.id,
//     },
//   })

//   console.log("Created donation posts:", catPost.title, dogPost.title)

//   // Add some comments to make the posts more interactive
//   const comment1 = await prisma.comment.create({
//     data: {
//       content: "Milo looks adorable! Is he friendly with other cats?",
//       userId: user2.id,
//       donationPostId: catPost.id,
//     },
//   })

//   const comment2 = await prisma.comment.create({
//     data: {
//       content: "I’m interested in Rex! Is he okay around kids?",
//       userId: user1.id,
//       donationPostId: dogPost.id,
//     },
//   })

//   console.log("Created comments on posts")

//   console.log("Seed data created successfully")
// }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
