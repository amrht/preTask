import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import GoogleAuthProviderWrapper from './components/GoogleAuthProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleAuthProviderWrapper>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleAuthProviderWrapper>
  </React.StrictMode>
);
