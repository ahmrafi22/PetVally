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
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/tvdfquw4xujsn3rxty9i",
      category: "food",
    },
    {
      name: "Kitten Formula",
      description:
        "Specially formulated food for kittens up to 12 months old. Rich in proteins and nutrients essential for growth. Contains DHA for brain and vision development. Easy to digest and perfect for developing digestive systems.",
      price: 24.99,
      stock: 35,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/xrokpkkayp89hjdllalq",
      category: "food",
    },
    {
      name: "Senior Cat Food",
      description:
        "Formulated for cats over 7 years old. Contains joint support supplements and reduced phosphorus for kidney health. Lower in calories to prevent weight gain in less active senior cats. Includes antioxidants to support immune function.",
      price: 27.99,
      stock: 40,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/zxscvhdutpu369basolb",
      category: "food",
    },
    {
      name: "Large Breed Puppy Food",
      description:
        "Specially formulated for large breed puppies to support healthy growth and development. Contains glucosamine and chondroitin for joint health. Balanced calcium and phosphorus for proper bone development. Supports immune system with added vitamins.",
      price: 34.99,
      stock: 30,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/throcu3ywbri2jaf9vrq",
      category: "food",
    },
    {
      name: "Grain-Free Dog Food",
      description:
        "Premium grain-free formula for dogs with food sensitivities. Made with real meat as the first ingredient. Free from corn, wheat, and soy. Contains sweet potatoes and peas as alternative carbohydrate sources.",
      price: 39.99,
      stock: 25,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/lyyrhx2smyzn4yrauhj1",
      category: "food",
    },

    // Toy category
    {
      name: "Interactive Cat Toy",
      description:
        "Engaging toy that stimulates your cat's hunting instincts. Features unpredictable movements to keep cats interested. Battery-operated with automatic shut-off to save power. Durable construction for long-lasting play.",
      price: 19.99,
      stock: 45,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/tjltn29ymxmx09yhg5an",
      category: "toy",
    },
    {
      name: "Durable Dog Chew Toy",
      description:
        "Tough and long-lasting chew toy for aggressive chewers. Made from non-toxic, pet-safe materials. Helps clean teeth and massage gums. Textured surface for better grip and added dental benefits.",
      price: 14.99,
      stock: 60,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/mbfzv6ecm0qsl43efeoi",
      category: "toy",
    },
    {
      name: "Bird Swing",
      description:
        "Colorful swing toy for small to medium-sized birds. Made from bird-safe materials with non-toxic colors. Easy to attach to most bird cages. Encourages exercise and prevents boredom.",
      price: 9.99,
      stock: 30,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/fnkaoavxu5lbzwkoxerm",
      category: "toy",
    },
    {
      name: "Small Animal Exercise Ball",
      description:
        "Safe exercise ball for hamsters, gerbils, and other small pets. Provides exercise while keeping pets safe outside their cage. Ventilation slots ensure proper airflow. Secure locking door prevents escapes.",
      price: 7.99,
      stock: 40,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/jjxi0vdaijy3o4c5x74w",
      category: "toy",
    },
    {
      name: "Puzzle Feeder for Dogs",
      description:
        "Interactive puzzle toy that dispenses treats as your dog plays. Stimulates mental activity and prevents boredom. Adjustable difficulty levels for dogs of all intelligence levels. Dishwasher safe for easy cleaning.",
      price: 22.99,
      stock: 35,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/olmjoyolk685txceacod",
      category: "toy",
    },

    // Medicine category
    {
      name: "Flea and Tick Treatment",
      description:
        "Monthly topical treatment to prevent and eliminate fleas and ticks. Waterproof formula remains effective after bathing. Kills fleas, ticks, and mosquitoes. Prevents reinfestation for up to 30 days.",
      price: 45.99,
      stock: 50,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/p76shdfwyjphzhozeohn",
      category: "medicine",
    },
    {
      name: "Joint Supplement for Dogs",
      description:
        "Chewable tablets to support joint health in dogs of all ages. Contains glucosamine, chondroitin, and MSM for comprehensive joint support. Helps maintain mobility in senior dogs. Supports cartilage development in growing puppies.",
      price: 32.99,
      stock: 40,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/virp4jdaedc0jfgetzpb",
      category: "medicine",
    },
    {
      name: "Cat Hairball Control",
      description:
        "Tasty treats that help prevent hairballs in cats. Contains natural fiber to help hair pass through the digestive system. Promotes healthy skin and coat. Includes vitamins and minerals for overall health.",
      price: 18.99,
      stock: 45,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/skjmwblf7mp0xkjjozpu",
      category: "medicine",
    },
    {
      name: "Pet Dental Spray",
      description:
        "Easy-to-use spray that promotes dental health in dogs and cats. Helps reduce plaque and tartar buildup. Freshens breath naturally. No brushing required - simply spray in pet's mouth.",
      price: 15.99,
      stock: 55,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/qlr2oeu0sfe1nxodsykl",
      category: "medicine",
    },
    {
      name: "Calming Aid for Pets",
      description:
        "Natural supplement to reduce anxiety and stress in dogs and cats. Helps during thunderstorms, fireworks, and travel. Contains L-theanine and chamomile for gentle calming. Non-drowsy formula won't affect normal behavior.",
      price: 29.99,
      stock: 35,
      image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/jimlxbbsqspqydrgvt8j",
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
