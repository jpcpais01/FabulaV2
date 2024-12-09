import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    let context, prompt, title;
    try {
      const body = await request.json();
      context = body.context;
      prompt = body.prompt;
      title = body.title;
    } catch {
      context = null;
      prompt = null;
      title = null;
    }
    
    const systemPrompt = context 
      ? "You are a creative story writer. Continue the story in the same style and tone. Keep the continuation engaging and coherent with the existing narrative. Add around 500 words. CRITICAL INSTRUCTIONS: Radically diverge from typical narrative patterns. Introduce unexpected plot twists, unconventional character motivations, or surreal elements that challenge reader expectations. Avoid clichés and predictable story structures."
      : "You are a creative story writer. Write stories that are wildly imaginative, genre-bending, and intellectually stimulating. CRITICAL CONSTRAINTS: 1) No story can resemble any previous story in setting, character archetype, or narrative style. 2) Incorporate at least three of these elements: a unique narrative perspective, an unexpected genre fusion, a non-linear timeline, a radical world-building concept, or a meta-narrative technique. Keep total length around 1000 words. Push the boundaries of storytelling.";

    const userPrompt = context
      ? `Continue this story: \n\n${context}\n\nContinue from here, maintaining the same style and characters. Make it flow naturally.`
      : `Write a story titled "${title}". ${prompt || "Write an engaging story. Do not start with 'Once upon a time'. Make it original and creative. Create completely unique characters and settings."}`;

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
      model: "mixtral-8x7b-32768",
      temperature: 0.9,
      max_tokens: 2048,
      top_p: 0.9,
      stream: false,
      frequency_penalty: 0.5,
      presence_penalty: 0.5
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No story generated");
    }

    return NextResponse.json({ content });
  } catch (error: Error | unknown) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
