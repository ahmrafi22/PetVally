// api/users/vetchat/route.ts
import { NextResponse } from 'next/server';
import { getVetResponse } from '@/controllers/vetchat';

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const formData = await request.formData();
    const text = formData.get('text') as string;
    
    // Get the image data from the form
    const imageDataString = formData.get('imageData') as string;
    let imageData: { base64: string; mimeType: string } | undefined = undefined;
    
    // Process image data if it exists
    if (imageDataString) {
      try {
        imageData = JSON.parse(imageDataString);
      } catch (e) {
        console.error('Error parsing image data:', e);
      }
    }

    if (!text && !imageData) {
      return NextResponse.json({ error: 'No text or image provided' }, { status: 400 });
    }

    // Get the response from the Gemini API
    const aiResponse = await getVetResponse(text, imageData);

    // Send the AI's response back to the frontend
    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}