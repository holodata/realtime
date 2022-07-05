const { createServer } = require("http");
const { parse } = require("url");
const uuidv4 = require("uuid").v4;
const next = require("next");
const { Server } = require("socket.io");
const { Kafka } = require("kafkajs");
const axios = require("axios");
const schedule = require("node-schedule");
// const { groupBy } = require("masterchat");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || "3000";
const hostname = process.env.HOSTNAME || "localhost";
const kafkaHostname = process.env.KAFKA_HOST;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const HOLODEX_API_KEY = process.env.HOLODEX_API_KEY;
const MAX_CACHE_ENTRY = 90;

const scCache = [];
let streamCache = [];

async function refreshLiveStreams() {
  try {
    const res = await axios.get(
      `https://holodex.net/api/v2/live?max_upcoming_hours=9999`,
      {
        headers: {
          "user-agent": "holodata/holodata",
          "X-APIKEY": HOLODEX_API_KEY,
        },
      }
    );
    const streams = res.data;
    streamCache = streams;
    console.log(`Refreshed ${streams.length} streams`);
  } catch (err) {
    console.log(err);
  }
}

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
    console.log("a user connected:", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("user disconnected:", reason);
    });

    socket.on("init", () => {
      console.log("init request received:", socket.id);
      socket.emit("superchats", scCache);
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

  await refreshLiveStreams();

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
            .map((e) => {
              const stream = streamCache.find((stream) => stream.id === e.ovid);
              const title = stream ? stream.title : e.ovid;
              const channel = stream
                ? stream.channel.english_name || stream.channel.name
                : e.ocid;
              return {
                id: e.id,
                sig: e.sig,
                amo: e.amo,
                cur: e.cur,
                ocid: e.ocid,
                ovid: e.ovid,
                title,
                channel,
                photo: stream ? stream.channel.photo : undefined,
              };
            });

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

    schedule.scheduleJob("*/5 * * * *", refreshLiveStreams);

    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
