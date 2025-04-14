import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Clear existing data to avoid duplicates during development
  await prisma.productRating.deleteMany({})
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  await prisma.cartItem.deleteMany({})
  await prisma.cart.deleteMany({})
  await prisma.product.deleteMany({})
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

  // Create products
  const products = [
    // Food category
    {
      name: "Premium Dog Food",
      description:
        "High-quality dog food made with real chicken and vegetables. Perfect for adult dogs of all breeds. Contains essential vitamins and minerals for a balanced diet. Promotes healthy digestion and a shiny coat.",
      price: 29.99,
      stock: 50,
      image: "/placeholder.svg?height=300&width=300",
      category: "food",
    },
    {
      name: "Kitten Formula",
      description:
        "Specially formulated food for kittens up to 12 months old. Rich in proteins and nutrients essential for growth. Contains DHA for brain and vision development. Easy to digest and perfect for developing digestive systems.",
      price: 24.99,
      stock: 35,
      image: "/placeholder.svg?height=300&width=300",
      category: "food",
    },
    {
      name: "Senior Cat Food",
      description:
        "Formulated for cats over 7 years old. Contains joint support supplements and reduced phosphorus for kidney health. Lower in calories to prevent weight gain in less active senior cats. Includes antioxidants to support immune function.",
      price: 27.99,
      stock: 40,
      image: "/placeholder.svg?height=300&width=300",
      category: "food",
    },
    {
      name: "Large Breed Puppy Food",
      description:
        "Specially formulated for large breed puppies to support healthy growth and development. Contains glucosamine and chondroitin for joint health. Balanced calcium and phosphorus for proper bone development. Supports immune system with added vitamins.",
      price: 34.99,
      stock: 30,
      image: "/placeholder.svg?height=300&width=300",
      category: "food",
    },
    {
      name: "Grain-Free Dog Food",
      description:
        "Premium grain-free formula for dogs with food sensitivities. Made with real meat as the first ingredient. Free from corn, wheat, and soy. Contains sweet potatoes and peas as alternative carbohydrate sources.",
      price: 39.99,
      stock: 25,
      image: "/placeholder.svg?height=300&width=300",
      category: "food",
    },

    // Toy category
    {
      name: "Interactive Cat Toy",
      description:
        "Engaging toy that stimulates your cat's hunting instincts. Features unpredictable movements to keep cats interested. Battery-operated with automatic shut-off to save power. Durable construction for long-lasting play.",
      price: 19.99,
      stock: 45,
      image: "/placeholder.svg?height=300&width=300",
      category: "toy",
    },
    {
      name: "Durable Dog Chew Toy",
      description:
        "Tough and long-lasting chew toy for aggressive chewers. Made from non-toxic, pet-safe materials. Helps clean teeth and massage gums. Textured surface for better grip and added dental benefits.",
      price: 14.99,
      stock: 60,
      image: "/placeholder.svg?height=300&width=300",
      category: "toy",
    },
    {
      name: "Bird Swing",
      description:
        "Colorful swing toy for small to medium-sized birds. Made from bird-safe materials with non-toxic colors. Easy to attach to most bird cages. Encourages exercise and prevents boredom.",
      price: 9.99,
      stock: 30,
      image: "/placeholder.svg?height=300&width=300",
      category: "toy",
    },
    {
      name: "Small Animal Exercise Ball",
      description:
        "Safe exercise ball for hamsters, gerbils, and other small pets. Provides exercise while keeping pets safe outside their cage. Ventilation slots ensure proper airflow. Secure locking door prevents escapes.",
      price: 7.99,
      stock: 40,
      image: "/placeholder.svg?height=300&width=300",
      category: "toy",
    },
    {
      name: "Puzzle Feeder for Dogs",
      description:
        "Interactive puzzle toy that dispenses treats as your dog plays. Stimulates mental activity and prevents boredom. Adjustable difficulty levels for dogs of all intelligence levels. Dishwasher safe for easy cleaning.",
      price: 22.99,
      stock: 35,
      image: "/placeholder.svg?height=300&width=300",
      category: "toy",
    },

    // Medicine category
    {
      name: "Flea and Tick Treatment",
      description:
        "Monthly topical treatment to prevent and eliminate fleas and ticks. Waterproof formula remains effective after bathing. Kills fleas, ticks, and mosquitoes. Prevents reinfestation for up to 30 days.",
      price: 45.99,
      stock: 50,
      image: "/placeholder.svg?height=300&width=300",
      category: "medicine",
    },
    {
      name: "Joint Supplement for Dogs",
      description:
        "Chewable tablets to support joint health in dogs of all ages. Contains glucosamine, chondroitin, and MSM for comprehensive joint support. Helps maintain mobility in senior dogs. Supports cartilage development in growing puppies.",
      price: 32.99,
      stock: 40,
      image: "/placeholder.svg?height=300&width=300",
      category: "medicine",
    },
    {
      name: "Cat Hairball Control",
      description:
        "Tasty treats that help prevent hairballs in cats. Contains natural fiber to help hair pass through the digestive system. Promotes healthy skin and coat. Includes vitamins and minerals for overall health.",
      price: 18.99,
      stock: 45,
      image: "/placeholder.svg?height=300&width=300",
      category: "medicine",
    },
    {
      name: "Pet Dental Spray",
      description:
        "Easy-to-use spray that promotes dental health in dogs and cats. Helps reduce plaque and tartar buildup. Freshens breath naturally. No brushing required - simply spray in pet's mouth.",
      price: 15.99,
      stock: 55,
      image: "/placeholder.svg?height=300&width=300",
      category: "medicine",
    },
    {
      name: "Calming Aid for Pets",
      description:
        "Natural supplement to reduce anxiety and stress in dogs and cats. Helps during thunderstorms, fireworks, and travel. Contains L-theanine and chamomile for gentle calming. Non-drowsy formula won't affect normal behavior.",
      price: 29.99,
      stock: 35,
      image: "/placeholder.svg?height=300&width=300",
      category: "medicine",
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product,
    })
  }

  // Create some sample users if they don't exist
  const testUser1Password = await hash("password123", 10)
  const testUser2Password = await hash("password456", 10)

  const existingUser1 = await prisma.user.findUnique({
    where: { email: "user1@example.com" },
  })

  const existingUser2 = await prisma.user.findUnique({
    where: { email: "user2@example.com" },
  })

  let user1, user2

  if (!existingUser1) {
    user1 = await prisma.user.create({
      data: {
        name: "Test User 1",
        email: "user1@example.com",
        password: testUser1Password,
      },
    })
    console.log("Test User 1 created successfully")
  } else {
    user1 = existingUser1
  }

  if (!existingUser2) {
    user2 = await prisma.user.create({
      data: {
        name: "Test User 2",
        email: "user2@example.com",
        password: testUser2Password,
      },
    })
    console.log("Test User 2 created successfully")
  } else {
    user2 = existingUser2
  }

  // Add some product ratings
  const allProducts = await prisma.product.findMany()

  // Sample ratings for products
  const ratings = [
    // Ratings for Premium Dog Food
    {
      userId: user1.id,
      productId: allProducts[0].id,
      rating: 5,
      comment: "My dog loves this food! His coat is shinier and he has more energy.",
    },
    {
      userId: user2.id,
      productId: allProducts[0].id,
      rating: 4,
      comment: "Good quality food, but a bit pricey.",
    },

    // Ratings for Interactive Cat Toy
    {
      userId: user1.id,
      productId: allProducts[5].id,
      rating: 5,
      comment: "My cat can't get enough of this toy! Best purchase ever.",
    },
    {
      userId: user2.id,
      productId: allProducts[5].id,
      rating: 5,
      comment: "Very durable and keeps my cat entertained for hours.",
    },

    // Ratings for Flea and Tick Treatment
    {
      userId: user1.id,
      productId: allProducts[10].id,
      rating: 4,
      comment: "Works well, but application can be a bit messy.",
    },

    // Add more ratings to other products
    {
      userId: user2.id,
      productId: allProducts[1].id,
      rating: 5,
      comment: "My kitten is growing so well with this food!",
    },
    {
      userId: user1.id,
      productId: allProducts[6].id,
      rating: 3,
      comment: "Decent toy, but my dog destroyed it within a week.",
    },
    {
      userId: user2.id,
      productId: allProducts[11].id,
      rating: 5,
      comment: "Noticed improvement in my dog's mobility within weeks.",
    },
  ]

  for (const rating of ratings) {
    await prisma.productRating.create({
      data: rating,
    })
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
      neutered: true,
      vaccinated: true,
      tags: ["dog", "friendly", "energetic", "trained", "family-friendly"],
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
      neutered: false,
      vaccinated: true,
      tags: ["dog", "curious", "playful", "affectionate", "vocal"],
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
      neutered: true,
      vaccinated: true,
      tags: ["dog", "loyal", "intelligent", "protective", "trained"],
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
      neutered: true,
      vaccinated: true,
      tags: ["cat", "elegant", "vocal", "attention-seeking", "independent"],
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
      neutered: true,
      vaccinated: false,
      tags: ["cat", "gentle", "large", "patient", "family-friendly"],
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
      neutered: false,
      vaccinated: true,
      tags: ["cat", "playful", "athletic", "intelligent", "active"],
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
      neutered: false, // Not applicable for birds, but keeping for consistency
      vaccinated: true,
      tags: ["bird", "musical", "cheerful", "hand-raised", "interactive"],
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
      neutered: false, // Not applicable for birds, but keeping for consistency
      vaccinated: false,
      tags: ["bird", "colorful", "social", "talkative", "beginner-friendly"],
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
      neutered: true,
      vaccinated: true,
      tags: ["rabbit", "gentle", "litter-trained", "playful", "quiet"],
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
      neutered: false,
      vaccinated: true,
      tags: ["rabbit", "fluffy", "gentle", "litter-trained", "unique"],
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
