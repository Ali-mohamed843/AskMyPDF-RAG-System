"use client";

import { useState, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

interface QuestionFormProps {
  onAskQuestion: (question: string) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
}

export default function QuestionForm({
  onAskQuestion,
  isLoading,
  disabled,
}: QuestionFormProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || isLoading || disabled) return;

    await onAskQuestion(question.trim());
    setQuestion("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="question"
          className="block text-sm font-medium text-gray-700"
        >
          Your Question
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={
              disabled
                ? "Upload a PDF first..."
                : "Ask anything about your documents..."
            }
            disabled={disabled || isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading || disabled}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </div>

      {disabled && (
        <p className="text-sm text-amber-600">
          ⚠️ Please upload at least one PDF before asking questions.
        </p>
      )}
    </form>
  );
}