'use client';

import { FormEvent, useMemo, useState } from 'react';
import ChatHistory from '@/components/ChatHistory/ChatHistory';
import { useChatSocket } from '@/hooks/useChatSocket';

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws';

export default function ChatPanel() {
  const [username, setUsername] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');
  const [message, setMessage] = useState('');

  const { messages, sendMessage, status, error, connectionIndicator, activeUsers } = useChatSocket(
    DEFAULT_WS_URL,
    { enabled: Boolean(username), username },
  );

  const isSendingDisabled = useMemo(
    () => !username || status !== 'open' || message.trim().length === 0,
    [status, message, username],
  );

  const statusColor =
    status === 'open'
      ? 'bg-emerald-400'
      : status === 'connecting'
        ? 'bg-amber-400'
        : status === 'error'
          ? 'bg-rose-500'
          : 'bg-zinc-300';

  const handleJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = usernameDraft.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    setUsernameDraft('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setMessage('');
  };

  const handleResetUsername = () => {
    setUsername('');
    setMessage('');
    setUsernameDraft('');
  };

  if (!username) {
    return (
      <section className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white/90 p-8 text-center shadow-2xl">
        <h2 className="text-3xl font-semibold text-zinc-900">Choose a username to join</h2>
        <p className="mt-3 text-base text-zinc-600">
          The chat connects once you introduce yourself. Pick any handle—it will tag every message you send.
        </p>
        <form onSubmit={handleJoin} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            className="flex-1 rounded-2xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. go-fan-42"
            value={usernameDraft}
            onChange={event => setUsernameDraft(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-2xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-40"
            disabled={usernameDraft.trim().length === 0}
          >
            Enter chat
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="w-full max-w-6xl rounded-3xl border border-zinc-200 bg-white/95 p-8 shadow-2xl">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-500">Signed in as</p>
                <p className="text-lg font-semibold text-zinc-900">{username}</p>
              </div>
              <button
                onClick={handleResetUsername}
                className="text-sm font-semibold text-indigo-600 underline-offset-2 hover:underline"
                type="button"
              >
                Switch
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">WebSocket status</p>
                <p className="text-base font-semibold text-zinc-900">{connectionIndicator}</p>
              </div>
              <span className={`h-3 w-3 rounded-full ${statusColor}`} aria-label={`Connection status: ${status}`} />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-700">
              Connected Users <span className="text-zinc-500">({activeUsers.length})</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeUsers.length === 0 ? (
                <span className="rounded-full bg-white px-3 py-1 text-sm text-zinc-400 shadow-sm">No users online</span>
              ) : (
                activeUsers.map(user => (
                  <span
                    key={`${user}`}
                    className={`rounded-full px-3 py-1 text-sm font-medium shadow-sm ${
                      user === username ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'
                    }`}
                  >
                    {user}
                  </span>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <label className="text-sm font-medium text-zinc-700">Send a message</label>
            <input
              className="rounded-xl border border-zinc-200 px-4 py-3 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={event => setMessage(event.target.value)}
              disabled={status !== 'open'}
            />
            <button
              type="submit"
              disabled={isSendingDisabled}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
            {error && <p className="text-sm text-rose-500">{error}</p>}
          </form>
        </div>

        <div className="flex-1">
          <ChatHistory messages={messages} />
        </div>
      </div>
    </section>
  );
}
