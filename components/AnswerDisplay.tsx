"use client";

import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { DocumentChunk } from "@/types";

interface AnswerDisplayProps {
  answer: string | null;
  sources: DocumentChunk[];
  isLoading: boolean;
  error: string | null;
}

export default function AnswerDisplay({
  answer,
  sources,
  isLoading,
  error,
}: AnswerDisplayProps) {
  const [showSources, setShowSources] = useState(false);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-900">Error</h2>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
        <div className="mt-4 space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Searching documents and generating answer...
        </p>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm italic text-gray-400">
            Upload a PDF and ask a question to get started...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Answer</h2>
      
      <div className="mt-4 prose prose-gray max-w-none">
        <div className="whitespace-pre-wrap text-gray-700">{answer}</div>
      </div>

      {sources.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-gray-700">
              Sources ({sources.length} chunks used)
            </span>
            {showSources ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {showSources && (
            <div className="mt-3 space-y-3">
              {sources.map((source, index) => (
                <div
                  key={source.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span className="font-medium">
                      {source.metadata.documentName}
                    </span>
                    <span>•</span>
                    <span>Page {source.metadata.pageNumber}</span>
                    <span>•</span>
                    <span>Source {index + 1}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}