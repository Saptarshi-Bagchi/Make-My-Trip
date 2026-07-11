import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "../store";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../store";
import { Component } from "lucide-react";
import Head from "next/head";

const Myapp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      store.dispatch(setUser(JSON.parse(storedUser)));
    }
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />
      <Component {...pageProps} />
    </div>
  )
};

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <Head>
        <title>MakeMyTour</title>
      </Head>
      <Myapp {...props}></Myapp>
    </Provider>
  );
}
