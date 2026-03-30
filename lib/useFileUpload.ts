import { useState, useCallback } from "react";
import { UploadedDocument } from "@/types";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  documents: UploadedDocument[];
}

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    documents: [],
  });

  const uploadFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setState((prev) => ({ ...prev, error: "Only PDF files are allowed." }));
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState((prev) => ({
        ...prev,
        error: "File size must be under 10MB.",
      }));
      return null;
    }

    setState((prev) => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }));

    try {
      setState((prev) => ({ ...prev, progress: 30 }));

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setState((prev) => ({ ...prev, progress: 70 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();

      setState((prev) => ({ ...prev, progress: 100 }));

      const newDoc: UploadedDocument = {
        id: result.data.documentId,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        totalChunks: result.data.totalChunks,
        status: "ready",
      };

      setState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 0,
        documents: [...prev.documents, newDoc],
      }));

      return newDoc;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setState((prev) => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: message,
      }));
      return null;
    }
  }, []);

  const removeDocument = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    uploadFile,
    removeDocument,
    clearError,
  };
}