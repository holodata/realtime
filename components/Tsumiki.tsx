import {
  Physics,
  PlaneProps,
  Triplet,
  useBox,
  usePlane,
  useSphere,
} from "@react-three/cannon";
import { Canvas, Color, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as T from "three";
import { Mesh } from "three";
import useSocket, { SuperChat } from "../utils/kafka";
import { rand } from "../utils/random";

export type E = JSX.IntrinsicElements;

interface Item {
  id: string;
  position: Triplet;
  geometry: T.BufferGeometry;
  sig: number;
}

const ibg = new T.IcosahedronBufferGeometry(2);

const sigMap = {
  1: "rgb(21, 101, 192)",
  2: "rgb(0, 229, 255)",
  3: "rgb(29, 233, 182)",
  4: "rgb(255, 202, 40)",
  5: "rgb(245, 124, 0)",
  6: "rgb(233, 30, 99)",
  7: "rgb(230, 33, 23)",
} as Record<number, Color>;

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

  useSocket("superchats", (events: SuperChat[]) => {
    for (const e of events) {
      console.log(e.amo, e.cur);
    }
    setItems((prev) => {
      const newer = events.map((e) => {
        return {
          id: e.id,
          position: [rand() * 2, rand() * 5 + 10, rand() * 2],
          sig: e.sig,
        } as Item;
      });
      return [...prev, ...newer].slice(-100);
    });
  });

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
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ alpha: false }}
      camera={{ position: [-1, 5, 5], fov: 60 }}
    >
      <color attach="background" args={["#6b3094"]} />
      <ambientLight />
      <directionalLight
        position={[10, 10, 10]}
        castShadow
        shadow-mapSize={[2048, 2048]}
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
  );
}
