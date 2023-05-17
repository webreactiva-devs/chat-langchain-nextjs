import { ChatOpenAI } from "langchain/chat_models";
import {
  LLMChain,
  ChatVectorDBQAChain,
  loadQAStuffChain,
} from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
} from "langchain/prompts";
import { CallbackManager } from "langchain/callbacks";
import { OpenAIModel } from "@/types";

const CONDENSE_PROMPT = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
You can assume the question about the conversation containing all the messages exchanged between these people.

Chat History:
{chat_history}`),
  HumanMessagePromptTemplate.fromTemplate(`{question}`),
]);

const QA_PROMPT = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(`You are an AI assistant for answering questions about this online conversation between these people.
You are given the following extracted parts of a long document and a question. 
Provide a conversational answer that solely comes from this online conversation between these people and your interpretation.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Your responses should be informative, interesting, and engaging. You should respond thoroughly. 
Question: {question}
=========
{context}
=========
Answer in Spanish.
Answer always in Markdown format.
Answer:`),
  HumanMessagePromptTemplate.fromTemplate(`{question}`),
]);

const makeChain = (
  vectorstore: HNSWLib,
  onTokenStream?: (token: string) => Promise<void>
) => {
  const questionGenerator = new LLMChain({
    llm: new ChatOpenAI({
      temperature: 0,
      modelName: OpenAIModel.DAVINCI_TURBO,
    }),
    prompt: CONDENSE_PROMPT,
  });
  const docChain = loadQAStuffChain(
    new ChatOpenAI({
      temperature: 0,
      streaming: Boolean(onTokenStream),
      callbackManager: CallbackManager.fromHandlers({
        handleLLMNewToken: onTokenStream,
      }),
    }),
    // temporary until we fix this type upstream
    { prompt: QA_PROMPT as any as PromptTemplate }
  );

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: true,
    k: 3,
  });
};

export default makeChain;
