import { PrismaClient, User } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

// --- Helper Functions ---

// Get a random element from an array
function getRandomElement<T>(arr: T[]): T {
   // Added check for empty array to prevent errors
  if (arr.length === 0) {
     throw new Error("Cannot get random element from an empty array.");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get multiple unique random elements from an array
function getUniqueRandomElements<T>(arr: T[], count: number): T[] {
   // Added check for array size
  const effectiveCount = Math.min(count, arr.length);
  if (effectiveCount === 0) {
    return [];
  }
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, effectiveCount);
}

// Generate a purely random rating (1-5) - Used for non-specified products
function getRandomRating(): number {
  return Math.floor(Math.random() * 5) + 1;
}

// Generate a biased rating for Pet Dental Spray (High Average ~4.4)
function getPetDentalSprayRating(): number {
  const rand = Math.random();
  if (rand < 0.1) return 3; // 10% chance
  if (rand < 0.5) return 4; // 40% chance
  return 5;                // 50% chance
}

// Generate a biased rating for Kitten Formula (Medium-High Average ~4.0)
function getKittenFormulaRating(): number {
  const rand = Math.random();
  if (rand < 0.05) return 2; // 5% chance
  if (rand < 0.25) return 3; // 20% chance
  if (rand < 0.70) return 4; // 45% chance
  return 5;                // 30% chance
}

// Generate a biased rating for Bird Swing (Medium Average ~3.75)
function getBirdSwingRating(): number {
  const rand = Math.random();
  if (rand < 0.05) return 2; // 5% chance
  if (rand < 0.40) return 3; // 35% chance
  if (rand < 0.80) return 4; // 40% chance
  return 5;                // 20% chance
}

// --- Main Seeding Function ---
async function main() {
  console.log("Starting seeding process...");

  // Clear data (Based on user-provided code structure)
  console.log("Clearing previous ratings, orders, carts, and PRODUCTS...");
  await prisma.productRating.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.user.deleteMany({}) // USERS ARE NOT CLEARED in this version
  await prisma.product.deleteMany({}); // PRODUCTS ARE CLEARED in this version
  // Admins are not cleared
  console.log("Previous non-admin/user data and all product data cleared.");


  // --- Create Admins (Check existence) ---
  console.log("Ensuring admin users exist...");
  const admin1Password = await hash("admin123", 10);
  const admin2Password = await hash("admin456", 10);

  const existingAdmin1 = await prisma.admin.findUnique({ where: { username: "admin1" } });
  const existingAdmin2 = await prisma.admin.findUnique({ where: { username: "admin2" } });

  if (!existingAdmin1) {
    await prisma.admin.create({ data: { username: "admin1", password: admin1Password } });
    console.log("Admin1 created successfully.");
  } else {
    console.log("Admin1 already exists.");
  }

  if (!existingAdmin2) {
    await prisma.admin.create({ data: { username: "admin2", password: admin2Password } });
    console.log("Admin2 created successfully.");
  } else {
    console.log("Admin2 already exists.");
  }

  // --- Create Products (Recreate every time) ---
   console.log("Creating products...");
   const productsData = [
    // Food category
    { name: "Premium Dog Food", description: "High-quality dog food...", price: 29.99, stock: 50, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/tvdfquw4xujsn3rxty9i", category: "food", },
    { name: "Kitten Formula", description: "Specially formulated food for kittens...", price: 24.99, stock: 35, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/xrokpkkayp89hjdllalq", category: "food", }, // Needs 6 ratings, 4 comments, Medium-High Avg
    { name: "Senior Cat Food", description: "Formulated for cats over 7...", price: 27.99, stock: 40, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/zxscvhdutpu369basolb", category: "food", },
    { name: "Large Breed Puppy Food", description: "Specially formulated for large breed puppies...", price: 34.99, stock: 30, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/throcu3ywbri2jaf9vrq", category: "food", },
    { name: "Grain-Free Dog Food", description: "Premium grain-free formula...", price: 39.99, stock: 25, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/lyyrhx2smyzn4yrauhj1", category: "food", },
    // Toy category
    { name: "Interactive Cat Toy", description: "Engaging toy that stimulates...", price: 19.99, stock: 45, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/tjltn29ymxmx09yhg5an", category: "toy", },
    { name: "Durable Dog Chew Toy", description: "Tough and long-lasting chew toy...", price: 14.99, stock: 60, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/mbfzv6ecm0qsl43efeoi", category: "toy", },
    { name: "Bird Swing", description: "Colorful swing toy for birds...", price: 9.99, stock: 30, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/fnkaoavxu5lbzwkoxerm", category: "toy", }, // Needs 7 ratings, 3 comments, Medium Avg
    { name: "Small Animal Exercise Ball", description: "Safe exercise ball for hamsters...", price: 7.99, stock: 40, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/jjxi0vdaijy3o4c5x74w", category: "toy", },
    { name: "Puzzle Feeder for Dogs", description: "Interactive puzzle toy...", price: 22.99, stock: 35, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/olmjoyolk685txceacod", category: "toy", },
    // Medicine category
    { name: "Flea and Tick Treatment", description: "Monthly topical treatment...", price: 45.99, stock: 50, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/p76shdfwyjphzhozeohn", category: "medicine", },
    { name: "Joint Supplement for Dogs", description: "Chewable tablets to support joint health...", price: 32.99, stock: 40, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/virp4jdaedc0jfgetzpb", category: "medicine", },
    { name: "Cat Hairball Control", description: "Tasty treats that help prevent hairballs...", price: 18.99, stock: 45, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/skjmwblf7mp0xkjjozpu", category: "medicine", },
    { name: "Pet Dental Spray", description: "Easy-to-use spray...", price: 15.99, stock: 55, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/qlr2oeu0sfe1nxodsykl", category: "medicine", }, // Needs 12 ratings, 6 comments, Highest Avg
    { name: "Calming Aid for Pets", description: "Natural supplement to reduce anxiety...", price: 29.99, stock: 35, image: "https://res.cloudinary.com/doyqdfuxd/image/upload/v1744614389/products/jimlxbbsqspqydrgvt8j", category: "medicine", },
   ];

  // Since products are cleared, we always create them
  for (const product of productsData) {
      await prisma.product.create({ data: product });
  }
  console.log(`${productsData.length} products created successfully.`);

  // --- Create 15 New Users (Add only, no check/clear) ---
  // Note: If run multiple times, this will create duplicate users unless email is unique constraint
  // The getUniqueRandomElements will only use users created in *this run*
  console.log("Creating 15 new users for this run...");
  const usersData = [
     { name: "Alice Smith", email: "alice.s@example.com" }, { name: "Bob Johnson", email: "bob.j@example.com" },
     { name: "Charlie Brown", email: "charlie.b@example.com" }, { name: "Diana Prince", email: "diana.p@example.com" },
     { name: "Ethan Hunt", email: "ethan.h@example.com" }, { name: "Fiona Gallagher", email: "fiona.g@example.com" },
     { name: "George Costanza", email: "george.c@example.com" }, { name: "Hannah Abbott", email: "hannah.a@example.com" },
     { name: "Ian Malcolm", email: "ian.m@example.com" }, { name: "Jane Doe", email: "jane.d@example.com" },
     { name: "Kyle Broflovski", email: "kyle.b@example.com" }, { name: "Laura Palmer", email: "laura.p@example.com" },
     { name: "Michael Scott", email: "michael.s@example.com" }, { name: "Nancy Wheeler", email: "nancy.w@example.com" },
     { name: "Oscar Martinez", email: "oscar.m@example.com" },
  ];

  const createdUsers: User[] = []; // Users created ONLY in this execution
  for (const userData of usersData) {
    const userPassword = await hash(userData.email, 10);
    // Using create - assumes email isn't unique or duplicates are handled elsewhere/intended
    try {
        const user = await prisma.user.create({
            data: { ...userData, password: userPassword },
        });
        createdUsers.push(user);
    } catch (e :any) {
        // Handle potential errors, e.g., if email needs to be unique and already exists
        if (e.code === 'P2002') { // Unique constraint violation
             console.warn(`User with email ${userData.email} likely already exists. Skipping creation.`);
             // Optionally, find the existing user if needed for ratings
             // const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
             // if (existingUser) createdUsers.push(existingUser);
        } else {
            console.error(`Failed to create user ${userData.email}:`, e);
        }
    }
  }
  console.log(`${createdUsers.length} users processed/created in this run.`);

  // --- Add Product Ratings ---
  console.log("Adding product ratings...");
  const allProducts = await prisma.product.findMany(); // Fetch newly created products
  if (allProducts.length === 0) {
     console.error("No products found in database. Cannot add ratings.");
     return;
  }
   if (createdUsers.length === 0) {
     console.error("No users were created in this run. Cannot add ratings.");
     return;
  }

  const productRatingsData = [];

  // Find the specific products by name
  const birdSwing = allProducts.find((p) => p.name === "Bird Swing");
  const petDentalSpray = allProducts.find((p) => p.name === "Pet Dental Spray");
  const kittenFormula = allProducts.find((p) => p.name === "Kitten Formula");

  // --- Ratings for Bird Swing (7 ratings, >=3 comments, Medium Avg) ---
  if (birdSwing) {
    const usersForRating = getUniqueRandomElements(createdUsers, 7);
    const comments = [ "My cockatiel loves this!", "Great quality.", "Colors vibrant.", "Smaller than expected.", "Good value.", "Perfect addition.", "Bell fell off." ];
    if (usersForRating.length >= 7) {
        for (let i = 0; i < 7; i++) {
            productRatingsData.push({
                userId: usersForRating[i].id, productId: birdSwing.id,
                rating: getBirdSwingRating(), // <-- Use biased rating
                comment: i < 3 || Math.random() < 0.2 ? getRandomElement(comments) : null,
            });
        }
        console.log(`Prepared ${usersForRating.length} ratings for Bird Swing.`);
    } else { console.warn(`Could only find ${usersForRating.length} unique users for Bird Swing ratings.`); }
  } else { console.warn("Bird Swing product not found."); }

  // --- Ratings for Pet Dental Spray (12 ratings, >=6 comments, Highest Avg) ---
  if (petDentalSpray) {
    const usersForRating = getUniqueRandomElements(createdUsers, 12);
    const comments = [ "Fresher breath!", "Easy to use.", "Cat hates taste.", "Helps plaque.", "Good alternative.", "No difference.", "Bottle lasts.", "Needs mintier scent.", "Vet recommended.", "Affordable option.", "Dog doesn't mind.", "Plaque slightly reduced." ];
    if (usersForRating.length >= 12) {
        for (let i = 0; i < 12; i++) {
            productRatingsData.push({
                userId: usersForRating[i].id, productId: petDentalSpray.id,
                rating: getPetDentalSprayRating(), // <-- Use biased rating
                comment: i < 6 || Math.random() < 0.3 ? getRandomElement(comments) : null,
            });
        }
        console.log(`Prepared ${usersForRating.length} ratings for Pet Dental Spray.`);
    } else { console.warn(`Could only find ${usersForRating.length} unique users for Pet Dental Spray ratings.`); }
  } else { console.warn("Pet Dental Spray product not found."); }

  // --- Ratings for Kitten Formula (6 ratings, >=4 comments, Medium-High Avg) ---
  if (kittenFormula) {
    const usersForRating = getUniqueRandomElements(createdUsers, 6);
    const comments = [ "Kittens thrived!", "Mixes easily.", "Great nutrition.", "Pricey but worth it.", "Slight digestive upset.", "Kittens love taste." ];
    if (usersForRating.length >= 6) {
        for (let i = 0; i < 6; i++) {
            productRatingsData.push({
                userId: usersForRating[i].id, productId: kittenFormula.id,
                rating: getKittenFormulaRating(), // <-- Use biased rating
                comment: i < 4 || Math.random() < 0.4 ? getRandomElement(comments) : null,
            });
        }
        console.log(`Prepared ${usersForRating.length} ratings for Kitten Formula.`);
    } else { console.warn(`Could only find ${usersForRating.length} unique users for Kitten Formula ratings.`); }
  } else { console.warn("Kitten Formula product not found."); }


  // --- Ratings for Other Products (Random Avg) ---
  console.log("Adding ratings for remaining products...");
  const otherProducts = allProducts.filter(p =>
    p.id !== birdSwing?.id && p.id !== petDentalSpray?.id && p.id !== kittenFormula?.id
  );

  const genericComments: Record<string, string[]> = {
     food: ["Pet loves it!", "Good ingredients.", "Picky eater approved.", "Decent value.", "Stomach issues.", "Will buy again."],
     toy: ["Entertaining!", "Durable.", "Broke fast.", "Ignored it.", "Fun design!", "Good for play."],
     medicine: ["Effective.", "Easy to give.", "Pet refused.", "Helped quickly.", "No side effects.", "Vet approved."]
  };

  for (const product of otherProducts) {
    const numRatings = Math.floor(Math.random() * 4) + 1; // 1 to 4 ratings
    const usersForProduct = getUniqueRandomElements(createdUsers, numRatings);
    const commentPool = genericComments[product.category] || ["Good product.", "Okay."];

    if (usersForProduct.length > 0) {
       for (const user of usersForProduct) {
         productRatingsData.push({
           userId: user.id, productId: product.id,
           rating: getRandomRating(), // <-- Use purely random rating
           comment: Math.random() > 0.5 ? getRandomElement(commentPool) : null,
         });
       }
       console.log(`Prepared ${usersForProduct.length} ratings for ${product.name}.`);
    } else { console.warn(`Could not find unique users for ${product.name} ratings in this run.`); }
  }


  // --- Create all ratings in the database ---
  if (productRatingsData.length > 0) {
     console.log(`Attempting to create ${productRatingsData.length} ratings...`);
    try {
        const result = await prisma.productRating.createMany({
            data: productRatingsData,
            skipDuplicates: true, // Good practice, though less likely needed if users aren't reused heavily
        });
        console.log(`Successfully created ${result.count} product ratings.`);
    } catch (error) {
       console.error("Error creating product ratings:", error);
    }
  } else {
    console.log("No product ratings were generated to add.");
  }

  console.log("Seeding process finished.");
}

// --- Execute Seeding ---
main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  });