import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    let context, type, prompt;
    try {
      const body = await request.json();
      context = body.context;
      type = body.type;
      prompt = body.prompt;
    } catch {
      context = null;
      type = null;
      prompt = null;
    }
    
    const systemPrompt = context 
      ? "You are a creative story writer. Continue the story in the same style and tone. Keep the continuation engaging and coherent with the existing narrative. Add around 500 words."
      : "You are a creative story writer. Write engaging, original stories that are appropriate for all ages. Keep the total length around 1000 words.";

    const userPrompt = context
      ? `Continue this story: \n\n${context}\n\nContinue from here, maintaining the same style and characters. Make it flow naturally.`
      : prompt || "Write an engaging story. Do not start with 'Once upon a time'. Make it original and creative. Do not include a title.";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama-3.3-70b-versatile",
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
