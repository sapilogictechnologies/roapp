import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './app/store';
import AppRoutes from './routes/AppRoutes';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <PwaInstallPrompt />
        <Toaster position="top-right" toastOptions={{
          style:{background:'#fff',color:'#1e293b',border:'1px solid #e2e8f0',borderRadius:'12px',fontSize:'14px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)'},
          success:{iconTheme:{primary:'#10b981',secondary:'#fff'}},
          error:{iconTheme:{primary:'#ef4444',secondary:'#fff'}},
        }}/>
      </BrowserRouter>
    </Provider>
  );
}
