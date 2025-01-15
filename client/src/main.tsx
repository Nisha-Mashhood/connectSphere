import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { persistor, store } from "./redux/store.js";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="262075947289-3srj88lb2ga44dn7pms9tcaiptic7bvh.apps.googleusercontent.com">
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter>
        <NextUIProvider>
          <App />
        </NextUIProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
  </GoogleOAuthProvider>
);
