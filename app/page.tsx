"use client";

import { useState } from "react";
import PDFUpload from "@/components/PDFUpload";
import QuestionForm from "@/components/QuestionForm";
import AnswerDisplay from "@/components/AnswerDisplay";
import { useAskQuestion } from "@/lib/useAskQuestion";
import { UploadedDocument } from "@/types";

export default function Home() {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const { isLoading, answer, sources, error, askQuestion } = useAskQuestion();

  const handleDocumentUploaded = (doc: UploadedDocument) => {
    setUploadedDocs((prev) => [...prev, doc]);
  };

  const hasDocuments = uploadedDocs.length > 0;

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
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Ask a Question
            </h2>
            <QuestionForm
              onAskQuestion={askQuestion}
              isLoading={isLoading}
              disabled={!hasDocuments}
            />
          </div>

          <AnswerDisplay
            answer={answer}
            sources={sources}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <span className="text-green-600">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">
              Step 4 Complete: Question & Answer
            </p>
            <p className="text-xs text-green-700">
              Full RAG pipeline working: Upload PDF → Ask question → Get AI answer with sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}