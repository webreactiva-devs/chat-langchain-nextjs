export enum OpenAIModel {
  DAVINCI_TURBO = "gpt-3.5-turbo",
  GPT_4 = "gpt-4",
}

export type Chunk = {
  pageContent: string;
  source: string;
  metadata: Metadata;
  length: number;
};

interface Metadata {
  id: string;
  title: string;
  link: string;
}

export interface Message {
  type: "apiMessage" | "userMessage";
  message: string;
  isStreaming?: boolean;
  sourceDocs?: any[];
}
