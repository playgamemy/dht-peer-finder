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
const TorrentSearchApi = require("torrent-search-api");
TorrentSearchApi.enablePublicProviders();
const app = express_1.default();
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('The sedulous hyena ate the antelope!');
}));
app.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //get query string
    let query = req.query.query || '';
    let limit = req.query.limit || 20;
    let category = req.query.category || 'Video';
    let torrents = yield TorrentSearchApi.search(query, category, limit);
    res.send(torrents);
}));
app.listen(port, () => {
    console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map