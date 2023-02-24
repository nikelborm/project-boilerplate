import { useEffect } from 'react';
import { Manager } from 'socket.io-client';

const manager = new Manager({
  transports: ['websocket', 'polling'],
  path: '/api/ws',
  autoConnect: false,
});

export function Profile() {
  const socket = manager.socket('/test', {
    auth: {
      token: '123',
    },
  });

  useEffect(() => {
    socket.on('connect', () => {});

    socket.on('disconnect', () => {});

    socket.on('exception', (error) => {
      // eslint-disable-next-line no-console
      console.error('error: ', error);
    });

    socket.connect();
    return () => {
      // do not forget to off every new socket.on event handlers
      socket.off('connect');
      socket.off('disconnect');
      socket.off('exception');
    };
  }, []);

  return <div>Profile page</div>;
}
