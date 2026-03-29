export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    documentName: string;
    pageNumber: number;
    chunkIndex: number;
  };
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  totalChunks: number;
  status: "processing" | "ready" | "error";
}

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  sources: DocumentChunk[];
  timestamp: Date;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}