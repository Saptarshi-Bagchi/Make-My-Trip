import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "../store";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store";

function LoadUser() {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
  }, [dispatch]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <LoadUser />
      <div className="min-h-screen">
        <Navbar />
        <Component {...pageProps} />
      </div>
    </Provider>
  );
}
