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

app.get("/", async (req, res) => {
  //get query string
  let infoHash = (req.query.infoHash as string) || null;
  let targetCount: number = parseInt(req.query.targetCount as string) || 300;
  let timeOut: number = parseInt(req.query.timeOut as string) || 10000;
  let peerCount: number = 0;
  let startTime: number = Date.now();
  let peers = [];

  if (!infoHash) {
    createError("401", "need infoHash");
  }

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
    peers.push(peer);
    peerCount++;
  });
  // find peers for the given torrent info hash
  let abort = dht.lookup(infoHash);

  //check status every half a second
  let interval = setInterval(() => {
    //if Timeout or peerCount reach targetCount, return peers
    if (peerCount >= targetCount || Date.now() - startTime == timeOut) {
      //abort the dht lookup
      abort();
      res.send(peers);
      clearInterval(interval);
    } else {
      console.log("still looking");
    }
  }, 500);
});

//error handling middleware
app.use(function (err, req, res, next) {
  if (err) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
});

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
