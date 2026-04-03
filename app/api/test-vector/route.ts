import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/embeddingClient";
import { queryChunks, getCollectionInfo } from "@/lib/vectorClient";
import { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    const info = await getCollectionInfo();

    if (!query) {
      return NextResponse.json<ApiResponse<{ collection: typeof info }>>({
        success: true,
        data: { collection: info },
      });
    }

    const queryEmbedding = await generateEmbedding(query);
    const results = await queryChunks(queryEmbedding, 3);

    return NextResponse.json<
      ApiResponse<{
        collection: typeof info;
        query: string;
        results: typeof results;
      }>
    >({
      success: true,
      data: {
        collection: info,
        query,
        results,
      },
    });
  } catch (error) {
    console.error("Test vector error:", error);
    const message =
      error instanceof Error ? error.message : "Vector test failed";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}