import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function GET() {
  const urls = [
    `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
  ];

  const results: Record<string, unknown> = {};

  for (const url of urls) {
    const version = url.includes("v1beta") ? "v1beta" : "v1";
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.models) {
        results[version] = data.models.map(
          (m: { name: string; supportedGenerationMethods: string[] }) => ({
            name: m.name,
            methods: m.supportedGenerationMethods,
          })
        );
      } else {
        results[version] = data;
      }
    } catch (err) {
      results[version] = String(err);
    }
  }

  return NextResponse.json(results, { status: 200 });
}