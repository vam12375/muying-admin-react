import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider, App as AntdApp, message, Modal } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import App from './App'
import { store } from './store'
import { setGlobalMessage, setGlobalModal } from './utils/request'

// Global API Provider component
const GlobalAPIProvider = ({ children }: { children: React.ReactNode }) => {
  const antdApp = AntdApp.useApp();
  
  useEffect(() => {
    // Set global message API
    setGlobalMessage(antdApp.message);
    
    // Set global modal API
    setGlobalModal(antdApp.modal);
  }, [antdApp]);
  
  return <>{children}</>;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <AntdApp>
          <GlobalAPIProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </GlobalAPIProvider>
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
