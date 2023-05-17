import { CSVLoader } from "langchain/document_loaders";

export const parseCsv = async (fileName) => {
  const loader = new CSVLoader(fileName);

  const rawDocs = await loader.load();
  loader.column = "folder";
  const sources = await loader.load();

  const formattedDocs = rawDocs.map((doc, index) => {
    return {
      ...doc,
      metadata: {
        ...doc.metadata,
        title: `Reactivísima ${sources[index].pageContent.replace("LS", "")}`,
        link: `https://reactivísima.com/#${sources[index].pageContent}`,
      },
    };
  });

  return formattedDocs;
};
