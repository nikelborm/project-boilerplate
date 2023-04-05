import type { Socket } from 'socket.io-client';
import { Manager } from 'socket.io-client';
import { useCallback, useEffect, useRef } from 'react';

const socketManager = new Manager({
  transports: ['websocket', 'polling'],
  path: '/api/ws',
  autoConnect: false,
});

export function useSocket({
  namespace,
  handlers,
  onConnect,
  onDisconnect,
}: {
  namespace: string;
  handlers: Record<string, (message?: any) => void>;
  onConnect?: (socket: Socket) => void;
  onDisconnect?: (socket: Socket) => void;
}) {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const socketToBeCached = socketManager.socket(namespace, {
      auth: {
        // TODO: подключить сюда токен из локалхоста
        token: '123',
      },
    });
    socketToBeCached.connect();

    socket.current = socketToBeCached;
    return () => {
      socketToBeCached.disconnect();
    };
  }, [namespace]);

  useEffect(() => {
    if (socket.current === null) return () => {};
    socket.current.on('connect', () => {
      if (socket.current === null) return;
      onConnect?.(socket.current);
    });
    return () => {
      if (socket.current === null) return;
      socket.current.off('connect');
    };
  }, [namespace, onConnect]);

  useEffect(() => {
    if (socket.current === null) return () => {};
    socket.current.on('disconnect', () => {
      if (socket.current === null) return;
      onDisconnect?.(socket.current);
    });
    return () => {
      if (socket.current === null) return;
      socket.current.off('disconnect');
    };
  }, [namespace, onDisconnect]);

  useEffect(() => {
    if (socket.current === null) return () => {};
    socket.current.on('exception', (backendError) => {
      // eslint-disable-next-line no-console
      console.error('error: ', backendError);
    });
    return () => {
      if (socket.current === null) return;
      socket.current.off('exception');
    };
  }, [namespace]);

  useEffect(() => {
    if (socket.current === null) return () => {};
    for (const [event, handler] of Object.entries(handlers)) {
      socket.current.on(event, handler);
    }

    socket.current.connect();
    return () => {
      if (socket.current === null) return;
      for (const event of Object.keys(handlers)) {
        socket.current.off(event);
      }
    };
  }, [namespace, handlers]);

  const send = useCallback(
    (event: string, data: any) => {
      if (socket.current === null) return;
      socket.current.emit(event, data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [namespace],
  );

  return {
    send,
  };
}
