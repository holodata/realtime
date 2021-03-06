import { useEffect } from "react";
import io from "socket.io-client";

export interface SuperChat {
  amo: number;
  aut: string;
  cid: string;
  cur: string;
  id: string;
  msg: string;
  ocid: string;
  ovid: string;
  sig: number;
  ts: string;
  title: string;
  channel: string;
  photo?: string;
}

export interface Chat {
  aut: string;
  cid: string;
  id: string;
  msg: string;
  ocid: string;
  ovid: string;
  ts: string;
}

const socket = io();
let socketInitialized = false;

export default function useSocket<T>(eventName: string, cb: (data: T) => void) {
  useEffect(() => {
    socket.on(eventName, cb);

    if (!socketInitialized) {
      socketInitialized = true;
      socket.emit("init");
    }

    return () => {
      socket.off(eventName, cb);
    };
  }, [eventName, cb]);

  return socket;
}
