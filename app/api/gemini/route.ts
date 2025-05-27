// app/api/gemini/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in .env");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    console.log("Sending request to Gemini API with prompt length:", prompt.length);

    // Updated Gemini API endpoint and model (as of April 2025)
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt, // e.g., "Enhance this text (fix grammar, improve style): Diwali, also called..."
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Gemini API request failed: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data).substring(0, 200) + "...");
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Unexpected response format from Gemini API:", data);
      return NextResponse.json(
        { error: "Unexpected response format from Gemini API" },
        { status: 500 }
      );
    }
    
    const enhancedText = data.candidates[0].content.parts[0].text || prompt;

    return NextResponse.json({ suggestion: enhancedText });
  } catch (error) {
    console.error("Error in /api/gemini:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}