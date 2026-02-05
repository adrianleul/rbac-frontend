import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import App from './App';
import './index.css';
import { LanguageProvider } from "./contexts/LanguageContext";
import AppInitializer from './components/AppInitializer';
import { ToastProvider } from './components/alert/Toast';
import React from 'react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LanguageProvider>
          <AppInitializer>
            {/* Disable console output in production to avoid leaking logs */}
            {import.meta.env.PROD && (() => {
              const methods = ['log', 'info', 'warn', 'error', 'debug', 'trace'] as const;
              methods.forEach((m) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (console as any)[m] = () => {};
              });
              return null;
            })()}
            <ToastProvider>
              <App />
            </ToastProvider>
          </AppInitializer>
        </LanguageProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);