import { useState, useRef, useEffect, useMemo } from "react";
import Head from "next/head";
import styles from "@/styles/Chat.module.css";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Message } from "@/types";
import content from "../config/content";
import settings from "../config/settings";
import TranscriptNote from "../components/TranscriptNote";
import { Document } from "langchain/document";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sourceDocs, setSourceDocs] = useState<Document[]>([]);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: settings.firstPrompt,
        type: "apiMessage",
      },
    ],
    history: [],
    pendingSourceDocs: [],
  });
  const { messages, pending, history, pendingSourceDocs } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList.scrollHeight;
    }
  }, [messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const question = userInput.trim();
    if (question === "") {
      return;
    }

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
      ],
      pending: undefined,
    }));

    setLoading(true);
    setUserInput("");
    setMessageState((state) => ({ ...state, pending: "" }));

    const ctrl = new AbortController();

    fetchEventSource("/api/chat/conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        history,
      }),
      signal: ctrl.signal,
      onmessage: (event) => {
        if (event.data === "[DONE]") {
          setMessageState((state) => ({
            history: [...state.history, [question, state.pending ?? ""]],
            messages: [
              ...state.messages,
              {
                type: "apiMessage",
                message: state.pending ?? "",
                sourceDocs: state.pendingSourceDocs,
              },
            ],
            pending: undefined,
            pendingSourceDocs: undefined,
          }));
          setLoading(false);
          ctrl.abort();
        } else {
          const data = JSON.parse(event.data);
          console.dir(data);
          if (data.sourceDocs) {
            setMessageState((state) => ({
              ...state,
              pendingSourceDocs: data.sourceDocs,
            }));
          } else {
            setMessageState((state) => ({
              ...state,
              pending: (state.pending ?? "") + data.data,
            }));
          }
        }
      },
    });
  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e: any) => {
    if (e.key === "Enter" && userInput) {
      if (!e.shiftKey && userInput) {
        handleSubmit(e);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [
            {
              type: "apiMessage",
              message: pending,
              sourceDocs: pendingSourceDocs,
            },
          ]
        : []),
    ];
  }, [messages, pending, pendingSourceDocs]);

  return (
    <>
      <Head>
        <title>{content.siteTitle}</title>
        <meta name="description" content="LangChain documentation chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/robotito.png" />
      </Head>
      <div className={styles.topnav}>
        <div className={styles.navlogo}>{content.siteName}</div>
        <div className={styles.navlinks}>
          <a href={content.menuExternalLink} target="_blank">
            {content.menuExternalText}
          </a>
        </div>
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {chatMessages.map((message, index) => {
              let icon;
              let className;

              if (message.type === "apiMessage") {
                icon = (
                  <Image
                    src="/robotito.png"
                    alt="AI"
                    width="30"
                    height="30"
                    className={styles.boticon}
                    priority
                  />
                );
                className = styles.apimessage;
              } else {
                icon = (
                  <Image
                    src="/usericon.png"
                    alt="Me"
                    width="30"
                    height="30"
                    className={styles.usericon}
                    priority
                  />
                );

                // The latest message sent by the user will be animated while waiting for a response
                className =
                  loading && index === chatMessages.length - 1
                    ? styles.usermessagewaiting
                    : styles.usermessage;
              }
              return (
                <>
                  <div key={index} className={className}>
                    {icon}
                    <div className={styles.markdownanswer}>
                      <ReactMarkdown linkTarget="_blank">
                        {message.message}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {message.sourceDocs && message.sourceDocs.length > 0 && (
                    <div className="p-5 text-white" key={`sourceDocs-${index}`}>
                      <h2 className="text-xl font-bold">Referencias</h2>
                      {message.sourceDocs.map((doc, index2) => (
                        <div
                          className="mt-2"
                          key={`messageSourceDocs-${index2}`}
                        >
                          <h3 className="text-lg">
                            <a href={doc.metadata.link} target="_blank">
                              {doc.metadata.title}
                            </a>
                          </h3>
                          <TranscriptNote lineClamp="line-clamp-1">
                            {doc.pageContent}
                          </TranscriptNote>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })}
            {sourceDocs.length > 0 && (
              <div className="p-5 text-white">
                <h2 className="text-xl font-bold">Referencias</h2>
                {sourceDocs.map((doc, index) => (
                  <div className="mt-2" key={`sourceDocsGlobal-${index}`}>
                    <h3 className="text-lg">
                      <a href={doc.metadata.link} target="_blank">
                        {doc.metadata.title}
                      </a>
                    </h3>
                    <TranscriptNote lineClamp="line-clamp-1">
                      {doc.pageContent}
                    </TranscriptNote>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                id="userInput"
                name="userInput"
                placeholder={
                  loading ? content.loadingText2 : content.placeholderChat2
                }
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? (
                  <div className={styles.loadingwheel}>Loading..</div>
                ) : (
                  // Send icon SVG in input field
                  <svg
                    viewBox="0 0 20 20"
                    className={styles.svgicon}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
