// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import settings from "@/config/settings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.body.query;
  const directory = path.resolve(process.cwd(), settings.databaseFolder);

  const loadedVectorStore = await HNSWLib.load(
    directory,
    new OpenAIEmbeddings()
  );
  const searchResults = await loadedVectorStore.similaritySearch(query, 4);

  const results = searchResults.reduce((acc, result) => {
    const title = result.metadata.title;
    if (!acc[title]) {
      acc[title] = {};
      acc[title].contents = [];
      acc[title].metadata = result.metadata;
    }
    acc[title].contents.push(result.pageContent);
    return acc;
  }, {});

  console.dir({ results }, { depth: 5 });
  res.status(200).json({ results });
}
