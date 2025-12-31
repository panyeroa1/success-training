import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_ID = process.env.GEMINI_TRANSLATE_MODEL || "gemini-flash-lite-latest";

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const { text, target_lang, source_lang = "auto" } = await request.json();

    if (!text || !target_lang) {
      return NextResponse.json(
        { error: "Missing required fields: text and target_lang" },
        { status: 400 }
      );
    }

    const prompt = `Translate the following text from ${source_lang} to ${target_lang}. Return ONLY the translated text without any explanations or extra characters:

"${text}"`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch translation from Gemini" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!translatedText) {
      return NextResponse.json(
        { error: "Empty translation received from Gemini" },
        { status: 500 }
      );
    }

    // Clean up quotes if Gemini accidentally included them
    const cleanedText = translatedText.replace(/^"|"$/g, '');

    return NextResponse.json({ translated_text: cleanedText });
  } catch (error) {
    console.error("Translation route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
