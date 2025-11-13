'use client';

const sections = [
  {
    title: 'Transport & Backend',
    description:
      'Go hosts the WebSocket server (`backend/main.go`) and routes each connection through the pool found in `pkg/websocket`. The pool coordinates registrations, broadcasts, and disconnections so every client sees the same stream.',
    bullets: [
      '`pkg/websocket/pool.go` keeps channels for register/unregister/broadcast events.',
      '`pkg/websocket/client.go` upgrades each HTTP request into a WebSocket client and pushes messages into the pool.',
      '`backend/main.go` wires the `/ws` route and starts the pool goroutine.',
    ],
  },
  {
    title: 'Frontend WebSocket hook',
    description:
      '`hooks/useChatSocket.ts` is the single place where the browser talks to the Go server. It normalizes each `{type, body}` payload, generates friendly labels (User 1, User 2, …), and exposes connection state + message history to React.',
    bullets: [
      'Strict-mode-safe reducer resets status/messages per connection.',
      'Join/leave system events are converted into user-friendly strings.',
      'Exports `sendMessage`, `activeUsers`, and computed status text.',
    ],
  },
  {
    title: 'UI Composition',
    description:
      '`components/chat/ChatPanel.tsx` splits the UI into two columns: connection controls on the left and the scrollable history on the right. `ChatHistory` renders the enriched message list with color-coded system notices.',
    bullets: [
      '`components/ChatHistory` is a client component so it can respond to live message updates without prop drilling.',
      '`components/Header` renders a lightweight top bar shared via `app/layout.tsx`.',
      'Styling mixes Tailwind utility classes with local SCSS modules for reusable blocks.',
    ],
  },
];

export default function ImplementationMenu() {
  return (
    <section className="w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-lg backdrop-blur">
      <h2 className="text-xl font-semibold text-zinc-900">Implementation Menu</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Quick reference for how the Go backend and Next.js frontend fit together.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {sections.map(section => (
          <details
            key={section.title}
            className="group rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-indigo-600 focus:outline-none">
              {section.title}
            </summary>
            <p className="mt-3 text-sm text-zinc-600">{section.description}</p>
            <ul className="mt-3 space-y-1 text-sm text-zinc-500">
              {section.bullets.map(bullet => (
                <li key={bullet}>• {bullet}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
