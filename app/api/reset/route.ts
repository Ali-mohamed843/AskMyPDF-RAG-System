import { NextResponse } from "next/server";
import { deleteAllChunks } from "@/lib/vectorClient";

export async function POST() {
  try {
    await deleteAllChunks();

    return NextResponse.json({
      success: true,
      message: "Database reset. Please re-upload your PDFs.",
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset database" },
      { status: 500 }
    );
  }
}