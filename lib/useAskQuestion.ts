import { useState, useCallback } from "react";
import { DocumentChunk } from "@/types";

interface AskState {
  isLoading: boolean;
  answer: string | null;
  sources: DocumentChunk[];
  error: string | null;
}

export function useAskQuestion() {
  const [state, setState] = useState<AskState>({
    isLoading: false,
    answer: null,
    sources: [],
    error: null,
  });

  const askQuestion = useCallback(async (question: string) => {
    setState({
      isLoading: true,
      answer: null,
      sources: [],
      error: null,
    });

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to get answer");
      }

      setState({
        isLoading: false,
        answer: result.data.answer,
        sources: result.data.sources,
        error: null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState({
        isLoading: false,
        answer: null,
        sources: [],
        error: message,
      });
    }
  }, []);

  const clearAnswer = useCallback(() => {
    setState({
      isLoading: false,
      answer: null,
      sources: [],
      error: null,
    });
  }, []);

  return {
    ...state,
    askQuestion,
    clearAnswer,
  };
}