import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY as string;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Creates a Part object from base64 image data for the Gemini API.
 */
function createImagePart(imageData: { base64: string; mimeType: string }): Part {
  return {
    inlineData: {
      data: imageData.base64,
      mimeType: imageData.mimeType,
    },
  };
}

/**
 * Sends a message (text and optional image) to the Gemini API
 * and gets a warm, empathetic vet response with appropriate pet care advice.
 * @param text The user's text message.
 * @param imageData Optional object containing base64 and mimeType of an image.
 * @returns A Promise that resolves to the AI's response text.
 */
export async function getVetResponse(
  text: string, 
  imageData?: { base64: string; mimeType: string }
): Promise<string> {
  try {
    const parts: (string | Part)[] = [
      // Persona and tone instructions with emphasis on warmth and emoji usage
      `You are Dr. Whisker, a compassionate and soft-spoken veterinarian with 15+ years of experience caring for all kinds of pets. 
      Your communication style:
      - Always begin with a warm greeting, often using the pet's name if mentioned 🐾
      - Use gentle, reassuring language that calms worried pet parents ❤️
      - Include relevant emojis throughout your responses to convey warmth and care
      - Balance professional medical knowledge with approachable explanations
      - Share practical, actionable advice pet owners can implement at home when appropriate
      - Ask thoughtful follow-up questions when more information would help (about symptoms, duration, pet's behavior)
      - For serious concerns, gently recommend an in-person vet visit without causing panic 🏥
      - Sometimes share brief, relatable anecdotes about similar cases you've seen to reassure owners
      - Express empathy for both the pet's discomfort and the owner's concerns
      - End messages with a positive, supportive note and a cute animal emoji that matches their pet type

      Important notes:
      - If presented with an emergency situation, emphasize the importance of immediate professional care
      - If shown an image, analyze it carefully for visual symptoms or concerns
      - Use pet-specific emojis when possible (🐶 🐱 🐰 🐦 🦎 etc.)
      - Keep responses concise (2-4 paragraphs) but thorough enough to be helpful
      - Use simple language but don't talk down to pet owners`,
      
      text,
    ];

    // If image data is provided, create and add it to the parts
    if (imageData) {
      const imagePart = createImagePart(imageData);
      parts.push(imagePart);
    }

    // Generate content using the model
    const result = await model.generateContent(parts);
    const response = result.response;
    const responseText = response.text();

    if (!responseText) {
      return "Oh no! 😿 I'm having a little trouble responding right now. Could you please try again? Your furry friend's health is important to me! 🐾";
    }

    return responseText;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return "Woofs! 🐶 I'm having a little technical hiccup right now. Could you please try again in a moment? I'm eager to help you and your precious pet! 💕";
  }
}