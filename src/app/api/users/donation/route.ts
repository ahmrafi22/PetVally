import { type NextRequest, NextResponse } from "next/server";
import {
  getAllDonationPosts,
  getDonationPostsInArea,
  createDonationPost,
} from "@/controllers/donation-post-data";
import { verifyJwtToken } from "@/lib/auth";

// Get all donation posts
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");

    // Check if the authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const payload = await verifyJwtToken(token);

    if (!payload || payload.role !== "user") {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    let posts;
    if (city && area && city.trim() !== "" && area.trim() !== "") {
      // Get posts in user's area
      posts = await getDonationPostsInArea(city.trim(), area.trim());
    } else {
      // Get all posts
      posts = await getAllDonationPosts();
    }

    // Return the posts
    return NextResponse.json(
      {
        message: "Donation posts retrieved successfully",
        posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving donation posts:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Create a new donation post
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");

    // Check if the authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const payload = await verifyJwtToken(token);

    if (!payload || payload.role !== "user") {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Get the user ID from the payload
    const userId = payload.id as string;

    // Get the request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "imageBase64",
      "country",
      "city",
      "area",
      "species",
      "breed",
      "gender",
      "age",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the donation post
    const post = await createDonationPost(userId, {
      title: body.title,
      description: body.description,
      imageBase64: body.imageBase64,
      country: body.country,
      city: body.city,
      area: body.area,
      species: body.species,
      breed: body.breed,
      gender: body.gender,
      age: Number.parseInt(body.age),
      vaccinated: body.vaccinated || false,
      neutered: body.neutered || false,
    });

    // Return the post
    return NextResponse.json(
      {
        message: "Donation post created successfully",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating donation post:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
