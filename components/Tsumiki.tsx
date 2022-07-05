import {
  Physics,
  PlaneProps,
  Triplet,
  useBox,
  usePlane,
  useSphere,
} from "@react-three/cannon";
import { Canvas, Color, useFrame } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import * as T from "three";
import { Mesh } from "three";
import useSocket, { SuperChat } from "../utils/kafka";
import { rand } from "../utils/random";
import { ToastContainer, toast } from "react-toastify";
import styles from "../styles/Tsumiki.module.css";

import Image from "next/image";

import "react-toastify/dist/ReactToastify.css";

export type E = JSX.IntrinsicElements;

interface Item {
  id: string;
  position: Triplet;
  geometry: T.BufferGeometry;
  sig: number;
}

// const ibg = new T.IcosahedronBufferGeometry(2);

const sigMap = {
  1: "rgb(21, 101, 192)",
  2: "rgb(0, 229, 255)",
  3: "rgb(29, 233, 141)",
  4: "rgb(255, 202, 40)",
  5: "rgb(245, 124, 0)",
  6: "rgb(235, 50, 112)",
  7: "rgb(239, 51, 41)",
} as Record<number, Color>;

const textColorMap = {
  1: "rgb(17, 46, 79)",
  2: "rgb(14, 67, 73)",
  3: "rgb(16, 77, 50)",
  4: "rgb(81, 65, 17)",
  5: "rgb(101, 62, 23)",
  6: "rgb(60, 11, 27)",
  7: "rgb(40, 17, 17)",
} as Record<number, string>;

function sigToColor(sig: number): Color {
  return sigMap[sig] ?? "black";
}

function Plane(props: PlaneProps) {
  const [ref] = usePlane(
    () => ({
      rotation: [-Math.PI / 2, 0, 0],
      ...props,
    }),
    useRef<Mesh>(null)
  );
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <shadowMaterial color="#171717" transparent opacity={0.2} />
    </mesh>
  );
}

function Cube({ position, sig }: { position?: Triplet; sig: number }) {
  const [ref] = useBox(
    () => ({
      mass: 5,
      position: position ?? [0, 5, 0],
      rotation: [rand(), rand(), rand()],
      args: [3, 2, 0.3],
    }),
    useRef<Mesh>(null)
  );
  return (
    <mesh receiveShadow castShadow ref={ref}>
      <boxGeometry args={[3, 2, 0.3]} />
      <meshLambertMaterial color={sigToColor(sig)} />
    </mesh>
  );
}

function Sphere({ position, sig }: { position?: Triplet; sig: number }) {
  const [ref, api] = useSphere(
    () => ({
      mass: 1,
      position: position ?? [0, 10, 0],
      args: [sig],
    }),
    useRef<Mesh>(null)
  );

  useFrame(({ clock }) => {
    ref.current!.scale.x = Math.max(ref.current!.scale.x - sig / 500, 0);
    ref.current!.scale.y = Math.max(ref.current!.scale.x - sig / 500, 0);
    ref.current!.scale.z = Math.max(ref.current!.scale.x - sig / 500, 0);
  });

  return (
    <mesh receiveShadow castShadow ref={ref}>
      <sphereGeometry args={[sig, 20, 20]} />
      <meshLambertMaterial color={"#d3bcce"} />
    </mesh>
  );
}

export function Tsumiki() {
  const [items, setItems] = useState<Item[]>([]);
  // const [chats, setChats] = useState<Item[]>([]);
  const initialized = useRef<boolean>(false);

  // useSocket("chats", (events: Chat[]) => {
  //   setChats((prev) => {
  //     const newer = events
  //       .map((e) => {
  //         return {
  //           id: e.id,
  //           position: [rand() * 2, rand() * 5 + 10, rand() * 2],
  //           sig: (e.msg.length / 120) * 4,
  //         } as Item;
  //       })
  //       .slice(0, 5);
  //     return [...prev, ...newer].slice(-100);
  //   });
  // });

  const handleSuperChats = useCallback((events: SuperChat[]) => {
    if (initialized.current) {
      for (const e of events.slice(0, 10)) {
        // console.log(e);
        toast(
          <>
            <div className={styles.toastHeader}>
              {e.photo && (
                <Image width={20} height={20} alt={e.channel} src={e.photo} />
              )}
              <a
                href={`https://www.youtube.com/channel/${e.ocid}`}
                target="_blank"
                rel="noreferrer"
                className={styles.toastTitle}
              >
                {e.channel}
              </a>
            </div>
            <div className={styles.toastContent}>
              <div className={styles.toastBody}>
                {e.amo} {e.cur}
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${e.ovid}`}
                className={styles.toastAction}
                target="_blank"
                rel="noreferrer"
              >
                Go to Stream
              </a>
            </div>
          </>,
          {
            style: {
              background: sigMap[e.sig] as string,
              color: textColorMap[e.sig],
            },
          }
        );
      }
    }

    initialized.current = true;

    setItems((prev) => {
      const newer = events.map((e) => {
        return {
          id: e.id,
          position: [rand() * 5 + 10, rand() * 3 + 20, rand() * 20],
          sig: e.sig,
        } as Item;
      });
      return [...prev, ...newer].slice(-100);
    });
  }, []);

  useSocket("superchats", handleSuperChats);

  // const transition = useTransition(chats, {
  //   from: { scale: [0, 0, 0] },
  //   enter: ({}) => ({
  //     scale: [1, 1, 1],
  //   }),
  //   leave: { scale: [0, 0, 0] },
  //   config: { mass: 5, tension: 1000, friction: 100 },
  //   trail: 100,
  // });

  return (
    <>
      <Canvas
        shadows
        // dpr={[1, 2]}
        gl={{ alpha: false, antialias: true }}
        camera={{
          position: [-1, 0.5, 0.5],
          zoom: 50,
          far: 200,
          near: -200,
        }}
        orthographic={true}
      >
        <color attach="background" args={["#584974"]} />
        <ambientLight />
        <directionalLight
          position={[20, 20, 10]}
          castShadow
          intensity={0.5}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <Physics>
          <Plane position={[0, -2.5, 0]} />
          {items.map((item) => (
            <Cube key={item.id} position={item.position} sig={item.sig} />
          ))}
          {/* {chats.map((chat) => (
          <Sphere key={chat.id} position={chat.position} sig={chat.sig} />
        ))} */}
        </Physics>
      </Canvas>
      <ToastContainer
        position={"top-right"}
        autoClose={10000}
        hideProgressBar={false}
        closeOnClick={false}
        pauseOnHover={true}
        closeButton={false}
        limit={3}
        theme={"light"}
      />
    </>
  );
}
