const { createServer } = require("http");
const { parse } = require("url");
const uuidv4 = require("uuid").v4;
const next = require("next");
const { Server } = require("socket.io");
const { Kafka } = require("kafkajs");
const LRU = require("lru-cache");
// const { groupBy } = require("masterchat");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || "3000";
const hostname = process.env.HOSTNAME || "localhost";
const kafkaHostname = process.env.KAFKA_HOST;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const MAX_CACHE_ENTRY = 20;
const scCache = [];

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // WebSockets
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.emit("superchats", scCache);

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  // Kafka
  const kafka = new Kafka({
    clientId: "holodata.org",
    brokers: [kafkaHostname],
  });
  const consumer = kafka.consumer({ groupId: uuidv4() });
  await consumer.connect();
  // await consumer.subscribe({ topic: "chats" });
  await consumer.subscribe({ topic: "superchats" });

  consumer.run({
    eachBatch: async ({ batch }) => {
      switch (batch.topic) {
        // case "chats": {
        //   const messages = batch.messages.map((msg) =>
        //     JSON.parse(msg.value.toString())
        //   );
        //   const grouped = groupBy(messages, "ocid");
        //   io.sockets.emit("chats", messages);
        //   break;
        // }
        case "superchats": {
          const messages = batch.messages
            .map((msg) => JSON.parse(msg.value.toString()))
            .map((e) => ({ id: e.id, sig: e.sig, amo: e.amo, cur: e.cur }));

          io.sockets.emit("superchats", messages);

          scCache.push(...messages);
          scCache.splice(0, scCache.length - MAX_CACHE_ENTRY);

          break;
        }
      }
    },
  });

  // Fire up server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
