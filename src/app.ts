import express from "express";
import bodyParser = require("body-parser");
import cors = require("cors");
import createError from "http-errors";
import DHT = require("bittorrent-dht");

const app = express();
const port = process.env.PORT || 3000;
const dht = new DHT();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dht.listen(20000, function () {
  console.log("now listening");
});

app.get("/", async (req, res, next) => {
  //get query string
  //sample ?infoHash=8B08A4C2DD7EFBC48DC2CE35C2219CFD2F744B26
  let infoHash = (req.query.infoHash as string) || null;
  let targetCount: number = parseInt(req.query.targetCount as string) || 300;
  let minTime: number = parseInt(req.query.minTime as string) || 2000;
  let timeOutMs: number = parseInt(req.query.timeOut as string) || 8000;
  let peerCount: number = 0;
  let startTime: number = Date.now();
  let peers = [];
  let cancelled = false;

  if (!infoHash) {
    return res.send(createError("401", "need infoHash"));
  }
  //set custom Timeout
  let timeOut = setTimeout(() => {
    //abort lookup and send the collected peers
    abort();
    res.send(peers);
  }, timeOutMs);

  dht.on("peer", function (peer, infoHash, from) {
    /* console.log(
      "found potential peer " +
        peer.host +
        ":" +
        peer.port +
        " through " +
        from.address +
        ":" +
        from.port
    ); */
    //if cancelled already, return
    if (cancelled) {
      return;
    }
    //push peers
    peers.push(peer);
    peerCount++;
    //if time is less than continue, else if peerCount reach targetCount then send res
    if (Date.now() - startTime < minTime) {
    } else if ((peerCount = targetCount)) {
      cancelled = true;
      clearTimeout(timeOut);
      abort();
      res.send(peers);
    }
  });
  // find peers for the given torrent info hash
  let abort = dht.lookup(infoHash);
});

//error handling middleware
app.use(function (err, req, res, next) {
  console.log("its here");
  if (err) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
