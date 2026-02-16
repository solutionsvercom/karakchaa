import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux"; // Redux Provider
import { store } from "./store/Store"; // Redux Store
import AuthLoader from "./AuthLoader";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import ThemeProvider from "./components/ThemeProvider";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
     <ThemeProvider>
      <AuthLoader>
      <App />
      </AuthLoader>
    </ThemeProvider>
    </Provider>
  </React.StrictMode>
);