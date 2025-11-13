import ChatPanel from '@/components/chat/ChatPanel';
import Header from '@/components/Header/Header';
import ImplementationMenu from '@/components/Info/ImplementationMenu';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <main className="flex flex-1 flex-col items-center gap-10 px-4 py-12">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
            Powered by Go + Next.js
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900">
            Chat with your Go backend in real time
          </h1>
          <p className="text-lg text-zinc-600">
            Send a message below to test the WebSocket bridge. Messages will round-trip through the Go server.
          </p>
        </div>
        <ImplementationMenu />
        <ChatPanel />
      </main>
    </div>
  );
}
