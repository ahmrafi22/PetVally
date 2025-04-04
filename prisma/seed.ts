import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clear existing pets to avoid duplicates during development
  await prisma.petOrder.deleteMany({})
  await prisma.pet.deleteMany({})

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
    // Bird
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

