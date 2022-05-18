import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthStoreProvider } from 'utils';

import './assets/styles/index.css';
import './types';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthStoreProvider>
        <App />
      </AuthStoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
