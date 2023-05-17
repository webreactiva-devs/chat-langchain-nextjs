import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import settings from "@/config/settings";
import makeChain from "@/lib/chain";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  const directory = path.resolve(process.cwd(), settings.databaseFolder);

  // Vector DB
  const vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings());

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  const handleLLMNewToken = async (token: string) => {
    sendData(JSON.stringify({ data: token }));
  };

  sendData(JSON.stringify({ data: "" }));
  const chain = makeChain(vectorStore, handleLLMNewToken);

  try {
    const response = await chain.call({
      question: body.question,
      chat_history: body.history,
    });
    console.log({ response });
    //sendData(JSON.stringify({ data: response.text }));
    sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }));
  } catch (err) {
    console.error(err);
  } finally {
    sendData("[DONE]");
    res.end();
  }
}
