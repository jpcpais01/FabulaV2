import { Groq } from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, prompt } = body;

    console.log('Generating title for:', { type, prompt }); // Debug log

    const systemPrompt = "You are a title generator. Your ONLY job is to generate a short, creative title between 2-5 words. NEVER output more than 5 words. Do not include any punctuation, quotes, or explanations. But always add a '.' after the title. Just output the title words!!!!!!!!!!!!!!!!";
    const userPrompt = `Generate a ${type} story title ${prompt ? `related to: ${prompt}` : ''}. REMEMBER: Output ONLY 2-5 words, nothing more!!!!!!!!`;

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
      temperature: 1.3,
      max_tokens: 20,
      top_p: 0.8,
      stream: false
    });

    let title = completion.choices[0]?.message?.content?.trim() || '';
    console.log('Raw generated title:', title); // Debug log

    // Clean up the title - only remove quotes and extra spaces
    title = title
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    console.log('Final title:', title); // Debug log

    if (!title) {
      throw new Error("No title generated");
    }

    return NextResponse.json({ title });
  } catch (error: Error | unknown) {
    console.error("Error generating title:", error);
    return NextResponse.json({ 
      title: "Untitled Story" 
    });
  }
}
