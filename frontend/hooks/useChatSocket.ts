'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

const DEFAULT_WS_URL = 'ws://localhost:8080/ws';

export type ChatSocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';
export type MessageKind = 'message' | 'join' | 'leave' | 'system' | 'roster';

export interface ChatMessage {
  id: string;
  type: number;
  body: string;
  author?: string;
  event?: string;
  users?: string[];
  kind: MessageKind;
  isSystem: boolean;
  isSelf: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  status: ChatSocketStatus;
  error: string | null;
  activeUsers: string[];
}

type ChatAction =
  | { type: 'connecting' }
  | { type: 'open' }
  | { type: 'message'; payload: ChatMessage }
  | { type: 'closed' }
  | { type: 'error'; payload: string }
  | { type: 'reset' }
  | { type: 'activeUsers'; payload: string[] };

const initialState: ChatState = {
  messages: [],
  status: 'idle',
  error: null,
  activeUsers: [],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'connecting':
      return { messages: [], status: 'connecting', error: null, activeUsers: [] };
    case 'open':
      return { ...state, status: 'open', error: null };
    case 'message':
      return action.payload.kind === 'roster'
        ? state
        : { ...state, messages: [...state.messages, action.payload] };
    case 'closed':
      return { ...state, status: 'closed' };
    case 'error':
      return { ...state, status: 'error', error: action.payload };
    case 'reset':
      return initialState;
    case 'activeUsers':
      return { ...state, activeUsers: action.payload };
    default:
      return state;
  }
}

interface ServerMessage {
  type?: number;
  body?: string;
  author?: string;
  event?: string;
  users?: string[];
}

function deriveKind(event?: string): MessageKind {
  switch (event) {
    case 'join':
      return 'join';
    case 'leave':
      return 'leave';
    case 'roster':
      return 'roster';
    case 'message':
      return 'message';
    default:
      return 'system';
  }
}

function normalizeMessage(payload: string | ServerMessage): ServerMessage {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch {
      return { body: payload };
    }
  }
  return payload;
}

interface UseChatSocketOptions {
  enabled?: boolean;
  username?: string;
}

export function useChatSocket(
  wsUrl: string = DEFAULT_WS_URL,
  { enabled = true, username }: UseChatSocketOptions = {},
) {
  const socketRef = useRef<WebSocket | null>(null);
  const usernameRef = useRef<string | undefined>(username);
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    usernameRef.current = username?.trim() || undefined;
  }, [username]);

  useEffect(() => {
    if (!enabled || !usernameRef.current) {
      socketRef.current?.close();
      socketRef.current = null;
      dispatch({ type: 'reset' });
      return;
    }

    dispatch({ type: 'connecting' });

    const url = new URL(wsUrl);
    url.searchParams.set('username', usernameRef.current);
    const socket = new WebSocket(url.toString());
    socketRef.current = socket;

    socket.onopen = () => {
      dispatch({ type: 'open' });
    };

    socket.onmessage = event => {
      const raw = normalizeMessage(event.data);
      const kind = deriveKind(raw.event);

      if (kind === 'roster' && Array.isArray(raw.users)) {
        dispatch({ type: 'activeUsers', payload: raw.users });
        return;
      }

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        type: typeof raw.type === 'number' ? raw.type : 0,
        body: raw.body ?? '',
        author: raw.author,
        event: raw.event,
        users: raw.users,
        kind,
        isSystem: kind !== 'message',
        isSelf:
          kind === 'message' && !!raw.author && !!usernameRef.current
            ? raw.author.toLowerCase() === usernameRef.current.toLowerCase()
            : false,
      };

      dispatch({ type: 'message', payload: message });
    };

    socket.onclose = () => {
      dispatch({ type: 'closed' });
      socketRef.current = null;
    };

    socket.onerror = event => {
      console.error('Socket error', event);
      dispatch({ type: 'error', payload: 'Unable to communicate with the chat server.' });
    };

    return () => {
      socket.close();
    };
  }, [wsUrl, enabled, username]);

  const sendMessage = useCallback((message: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn('Socket not ready, message not sent:', message);
      return;
    }

    socket.send(message);
  }, []);

  const connectionIndicator = useMemo(() => {
    switch (state.status) {
      case 'open':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      case 'closed':
        return 'Disconnected';
      default:
        return 'Idle';
    }
  }, [state.status]);

  return {
    messages: state.messages,
    status: state.status,
    error: state.error,
    connectionIndicator,
    activeUsers: state.activeUsers,
    sendMessage,
  };
}
