import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Clear existing pets to avoid duplicates during development
  await prisma.petOrder.deleteMany({})
  await prisma.pet.deleteMany({})

  // Create admin users with hashed passwords
  const admin1Password = await hash("admin123", 10)
  const admin2Password = await hash("admin456", 10)

  // Check if admins already exist
  const existingAdmin1 = await prisma.admin.findUnique({
    where: { username: "admin1" },
  })

  const existingAdmin2 = await prisma.admin.findUnique({
    where: { username: "admin2" },
  })

  // Create admin1 if it doesn't exist
  if (!existingAdmin1) {
    await prisma.admin.create({
      data: {
        username: "admin1",
        password: admin1Password,
      },
    })
    console.log("Admin1 created successfully")
  }

  // Create admin2 if it doesn't exist
  if (!existingAdmin2) {
    await prisma.admin.create({
      data: {
        username: "admin2",
        password: admin2Password,
      },
    })
    console.log("Admin2 created successfully")
  }

  // Create pets
  const pets = [
    // Dogs
    {
      name: "Max",
      breed: "Golden Retriever",
      age: 3,
      price: 350.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Friendly and energetic golden retriever who loves to play fetch.",
      description:
        "Max is a beautiful golden retriever with a heart of gold. He's great with children and other pets. He's been trained for basic commands and is house-trained. Max loves outdoor activities and would be perfect for an active family.",
      energyLevel: 4,
      spaceRequired: 4,
      maintenance: 3,
      childFriendly: true,
      allergySafe: false,
    },
    {
      name: "Bella",
      breed: "Beagle",
      age: 2,
      price: 300.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Curious and playful beagle who loves to explore.",
      description:
        "Bella is a sweet beagle who loves to follow her nose on adventures. She's very affectionate and loves to cuddle. Bella is good with children but might need some training with other pets. She has a melodious howl that she uses when excited.",
      energyLevel: 5,
      spaceRequired: 3,
      maintenance: 3,
      childFriendly: true,
      allergySafe: false,
    },
    {
      name: "Rocky",
      breed: "German Shepherd",
      age: 4,
      price: 400.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Loyal and intelligent German Shepherd with excellent training.",
      description:
        "Rocky is a well-trained German Shepherd with a calm and confident demeanor. He's extremely loyal and protective of his family. Rocky has completed advanced obedience training and knows many commands. He's great with children but needs an experienced owner who understands the breed.",
      energyLevel: 4,
      spaceRequired: 5,
      maintenance: 4,
      childFriendly: true,
      allergySafe: false,
    },
    // Cats
    {
      name: "Luna",
      breed: "Siamese",
      age: 2,
      price: 250.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Elegant and vocal Siamese cat who loves attention.",
      description:
        "Luna is a beautiful Siamese cat with striking blue eyes. She's very vocal and will let you know when she wants attention. Luna is independent but also enjoys cuddle time. She's litter-trained and good with older children who understand how to respect cats.",
      energyLevel: 3,
      spaceRequired: 2,
      maintenance: 2,
      childFriendly: true,
      allergySafe: false,
    },
    {
      name: "Oliver",
      breed: "Maine Coon",
      age: 4,
      price: 275.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Gentle giant Maine Coon who loves to lounge.",
      description:
        "Oliver is a magnificent Maine Coon with a luxurious coat. Despite his large size, he's very gentle and patient. He enjoys lounging in sunny spots and being brushed. Oliver is good with children and other pets, making him a perfect family cat.",
      energyLevel: 2,
      spaceRequired: 3,
      maintenance: 4,
      childFriendly: true,
      allergySafe: false,
    },
    {
      name: "Milo",
      breed: "Bengal",
      age: 1,
      price: 325.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Playful Bengal cat with stunning spotted coat.",
      description:
        "Milo is a young Bengal cat with a beautiful spotted coat that resembles a wild leopard. He's extremely playful and athletic, enjoying climbing and interactive toys. Milo is intelligent and can be trained to do tricks. He needs an active household that can provide plenty of stimulation.",
      energyLevel: 5,
      spaceRequired: 3,
      maintenance: 3,
      childFriendly: true,
      allergySafe: false,
    },
    // Birds
    {
      name: "Charlie",
      breed: "Cockatiel",
      age: 1,
      price: 150.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Cheerful cockatiel who loves to whistle tunes.",
      description:
        "Charlie is a delightful cockatiel who brings joy with his whistling. He's been hand-raised and is comfortable being handled. Charlie enjoys learning new tunes and interacting with people. He's a perfect companion for someone who appreciates musical pets.",
      energyLevel: 3,
      spaceRequired: 1,
      maintenance: 3,
      childFriendly: true,
      allergySafe: true,
    },
    {
      name: "Kiwi",
      breed: "Budgerigar",
      age: 2,
      price: 75.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Colorful budgie with a friendly personality.",
      description:
        "Kiwi is a vibrant green and yellow budgie who loves to chatter and play. He's very social and enjoys being around people. Kiwi can learn to mimic words and sounds with patient training. He's a low-maintenance pet perfect for first-time bird owners.",
      energyLevel: 4,
      spaceRequired: 1,
      maintenance: 2,
      childFriendly: true,
      allergySafe: true,
    },
    // Rabbits
    {
      name: "Thumper",
      breed: "Holland Lop",
      age: 1,
      price: 120.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Adorable Holland Lop rabbit with floppy ears.",
      description:
        "Thumper is a sweet Holland Lop rabbit with characteristic floppy ears. He's gentle and enjoys being petted. Thumper is litter-trained and has a playful personality. He makes a wonderful indoor pet for families looking for a quiet, cuddly companion.",
      energyLevel: 3,
      spaceRequired: 2,
      maintenance: 3,
      childFriendly: true,
      allergySafe: false,
    },
    {
      name: "Cinnamon",
      breed: "Lionhead",
      age: 2,
      price: 135.0,
      images: "/placeholder.svg?height=300&width=300",
      bio: "Fluffy Lionhead rabbit with a mane of fur.",
      description:
        "Cinnamon is a beautiful Lionhead rabbit with a distinctive mane of fur around her head. She has a gentle temperament and enjoys exploring her surroundings. Cinnamon is litter-trained and enjoys fresh vegetables and hay. She's a delightful pet for someone who can appreciate her unique appearance and personality.",
      energyLevel: 2,
      spaceRequired: 2,
      maintenance: 4,
      childFriendly: true,
      allergySafe: false,
    },
  ]

  for (const pet of pets) {
    await prisma.pet.create({
      data: pet,
    })
  }

  console.log("Seed data created successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

