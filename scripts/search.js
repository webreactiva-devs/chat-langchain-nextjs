import path from "path";
import { CSVLoader } from "langchain/document_loaders";
import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const directory = path.resolve(process.cwd(), "database/docs/reactivisima");


const main = async () => {
  const loadedVectorStore = await HNSWLib.load(
    directory,
    new OpenAIEmbeddings()
  );
  const result = await loadedVectorStore.similaritySearch("Pipedream", 2);
  //console.log(result);
};

await main();
