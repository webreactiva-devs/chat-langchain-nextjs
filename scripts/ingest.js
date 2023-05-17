import { HNSWLib } from "langchain/vectorstores";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as path from "path";
import { fileURLToPath } from "url";
import { parseCsv } from "./parse-csv.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const run = async (fileName, outputDir) => {
  const ingestedPath = path.resolve(
    currentDir,
    `../database/${fileName}`
  );
  const docsPath = path.resolve(currentDir, `../database/docs/${outputDir}`);

  const formattedDocs = await parseCsv(ingestedPath);
  //console.log(formattedDocs)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.splitDocuments(formattedDocs);
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  await vectorStore.save(docsPath);
};

const filename_input = process.argv[2];
const directoryOutput = process.argv[3];
if (filename_input && directoryOutput) {
  run(filename_input, directoryOutput);
} else {
  console.log(
    "Please provide a filename and output directory e.g. \n npm run ingest <filename> <output directory>"
  );
}
