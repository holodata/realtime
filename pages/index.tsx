import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
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
        <script
          async
          defer
          data-website-id="83ae72bb-13d0-443c-8d97-15a24b2a4685"
          src="https://analytics.uechi.io/umami.js"
        ></script>
      </Head>
      <Tsumiki />
      <div className={styles.header}>
        <a href="https://holodata.org/github">
          <Image
            src="/logo.svg"
            height={60}
            width={60}
            alt="Logo"
            className={styles.logo}
          />
        </a>
        <a href="https://github.com/holodata" target="_blank" rel="noreferrer">
          GitHub
        </a>{" "}
        <a href="https://holodata.org/discord" target="_blank" rel="noreferrer">
          Discord
        </a>
        <a
          href="https://www.kaggle.com/datasets/uetchy/vtuber-livechat"
          target="_blank"
          rel="noreferrer"
        >
          Kaggle
        </a>
        <a
          href="https://huggingface.co/holodata"
          target="_blank"
          rel="noreferrer"
        >
          Hugging Face
        </a>
      </div>
    </div>
  );
};

export default Home;
