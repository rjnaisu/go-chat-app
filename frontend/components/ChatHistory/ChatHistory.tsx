'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/hooks/useChatSocket';
import styles from './ChatHistory.module.scss';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

function renderMessage(message: ChatMessage) {
  if (message.kind === 'join' || message.kind === 'leave') {
    const noticeClass = [
      styles.systemNotice,
      message.kind === 'join' ? styles.systemNoticeJoin : styles.systemNoticeLeave,
    ].join(' ');

    return (
      <p key={message.id} className={noticeClass}>
        {message.body}
      </p>
    );
  }

  const className = [
    styles.message,
    message.isSelf ? styles.selfMessage : styles.userMessage,
  ]
    .filter(Boolean)
    .join(' ');

  const ownerLabel = message.isSelf ? 'You' : message.author ?? 'System';

  return (
    <article key={message.id} className={className}>
      <header className={styles.messageMeta}>
        <span>{ownerLabel}</span>
      </header>
      <p>{message.body}</p>
    </article>
  );
}

export default function ChatHistory({ messages }: ChatHistoryProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scroll({
      top: list.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <section className={styles.chatHistory}>
      <h2>Chat History</h2>
      <div ref={listRef} className={styles.messageList}>
        {messages.length === 0 ? (
          <p className={styles.placeholder}>No messages yet. Say hello!</p>
        ) : (
          messages.map(renderMessage)
        )}
      </div>
    </section>
  );
}
