import React from 'react';
import 'reflect-metadata';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import {
  displayErrorNotification,
  SessionProvider,
  updateTokenPair,
} from 'utils';

import './assets/styles/index.css';
import './types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';

const onErrorHandler = (err: any) => {
  // eslint-disable-next-line no-console
  console.log('onErrorHandler err: ', err);
  if (
    err?.message ===
    'Your session was finished because of long inactivity.\nIf you used your account less than a week ago, your account can be hacked.\nPlease open your settings and click the "Logout on all devices" button'
  )
    updateTokenPair(null);

  displayErrorNotification(err);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      onError: onErrorHandler,
    },
    mutations: {
      onError: onErrorHandler,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
