import { OpenAIEmbeddings } from "langchain/embeddings";
import { HNSWLib } from "langchain/vectorstores";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIChat } from "langchain/llms";
import { CallbackManager } from "langchain/callbacks";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { OpenAIModel } from "@/types";
import settings from "@/config/settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Inputs
  const prompt = req.body.prompt;
  const directory = path.resolve(process.cwd(), settings.databaseFolder);
  let answer = "";

  // Vector DB
  const loadedVectorStore = await HNSWLib.load(
    directory,
    new OpenAIEmbeddings()
  );

  // Send data in SSE stream
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const sendData = (data: string) => {
    // console.log({ watch: "sendData", data });
    if (res.writableEnded) {
      console.log("Response has already ended, cannot write more data");
      return;
    }
    res.write(`data: ${data}\n\n`);
  };

  // Call LLM and stream output
  const model = new OpenAIChat({
    temperature: 0.0,
    streaming: true,
    modelName: OpenAIModel.DAVINCI_TURBO,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(token) {
        sendData(JSON.stringify({ data: token.replace(/["'\n\r]/g, "") }));
        answer += token.replace(/["'\n\r]/g, "");
      },
    }),
  });

  const chain = VectorDBQAChain.fromLLM(model, loadedVectorStore, {
    returnSourceDocuments: false,
    k: 4,
  });

  try {
    await chain.call({
      query: prompt,
    });
  } catch (err) {
    console.error(err);
  } finally {
    sendData(JSON.stringify({ data: "DONE" }));
    res.end();
    console.log({ answer });
  }
}
