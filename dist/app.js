"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = require("body-parser");
const cors = require("cors");
const http_errors_1 = __importDefault(require("http-errors"));
const DHT = require("bittorrent-dht");
const app = express_1.default();
const port = process.env.PORT || 3000;
const dht = new DHT();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dht.listen(20000, function () {
    console.log("now listening");
});
app.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //get query string
    let infoHash = req.query.infoHash || null;
    let targetCount = parseInt(req.query.targetCount) || 300;
    let minTime = parseInt(req.query.minTime) || 2000;
    let timeOutMs = parseInt(req.query.timeOut) || 8000;
    let peerCount = 0;
    let startTime = Date.now();
    let peers = [];
    let cancelled = false;
    if (!infoHash) {
        return res.send(http_errors_1.default("401", "need infoHash"));
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
        }
        else if ((peerCount = targetCount)) {
            cancelled = true;
            clearTimeout(timeOut);
            abort();
            res.send(peers);
        }
    });
    // find peers for the given torrent info hash
    let abort = dht.lookup(infoHash);
}));
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
//# sourceMappingURL=app.js.map