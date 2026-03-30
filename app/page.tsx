"use client";

import { useState } from "react";
import PDFUpload from "@/components/PDFUpload";
import { UploadedDocument } from "@/types";

export default function Home() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const handleDocumentUploaded = (doc: UploadedDocument) => {
    setUploadedDocs((prev) => [...prev, doc]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Ask Your Documents
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Upload PDFs, ask questions, and get AI-powered answers with source
          references.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <PDFUpload onDocumentUploaded={handleDocumentUploaded} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Ask a Question
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {uploadedDocs.length > 0
                ? `${uploadedDocs.length} document(s) ready. Question form coming in Step 4.`
                : "Upload a PDF first to ask questions."}
            </p>
            <div className="mt-4">
              <input
                type="text"
                placeholder="What is this document about?"
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-400"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm italic text-gray-400">
                Upload a PDF and ask a question to get started...
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-blue-600">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              Step 2 Complete: PDF Upload
            </p>
            <p className="text-xs text-blue-700">
              Drag-and-drop upload, text extraction, and chunking working. Next:
              vector DB integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}