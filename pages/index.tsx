import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import { Tsumiki } from "../components/Tsumiki";
import styles from "../styles/Home.module.css";

export type E = JSX.IntrinsicElements;

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Holodata</title>
        <meta name="description" content="data shrimp collective" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      <Tsumiki />
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <a href="https://github.com/holodata">
          <Image src="/logo.svg" height={60} width={60} alt="Logo" />
        </a>
      </div>
    </div>
  );
};

export default Home;
