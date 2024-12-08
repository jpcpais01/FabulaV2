import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative story writer. Write engaging, original stories that are appropriate for all ages. Keep the total length around 1000 words."
        },
        {
          role: "user",
          content: "Write an engaging story. Do not start with 'Once upon a time'. Make it original and creative. Do not include a title."
        }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No story generated");
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
