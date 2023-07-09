"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const node_crypto_1 = require("node:crypto");
const apiKey = "X5BM3w8N7MKozC0B85o4KMlzLZKhV00y";
const secretKey = "acOrvUS15XRW2o9JksiK1KgQ6Vbds8ZW";
class Main {
    constructor(zmp3_sid) {
        this.time = null;
        this.cookies = [zmp3_sid].filter(Boolean);
        if (zmp3_sid)
            (0, axios_1.default)("https://jr.zingmp3.vn/jr/userinfo", {
                headers: {
                    Cookie: zmp3_sid,
                    referer: "https://zingmp3.vn/",
                },
            }).then(({ data }) => data.data.logged
                ? null
                : console.log("\x1b[31m\x1b[1m[LavaZing]\x1b[0m | \x1b[31mInvalid zmp3_sid cookie was provided\x1b[0m"));
    }
    getHash256(str) {
        return (0, node_crypto_1.createHash)("sha256").update(str).digest("hex");
    }
    getHmac512(str, key) {
        return (0, node_crypto_1.createHmac)("sha512", key)
            .update(Buffer.from(str, "utf8"))
            .digest("hex");
    }
    getFullInfo(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const [infoMusic, streaming] = yield Promise.all([
                this.getInfoMusic(id),
                this.getStreaming(id),
            ]);
            return Object.assign(Object.assign({}, infoMusic), { streaming });
        });
    }
    getDetailPlaylist(id) {
        return this.request({
            path: "/api/v2/page/get/playlist",
            params: { id },
        });
    }
    getInfoMusic(id) {
        return this.request({
            path: "/api/v2/song/get/info",
            params: { id },
        });
    }
    getStreaming(id) {
        return this.request({
            path: "/api/v2/song/get/streaming",
            params: { id },
        }, true);
    }
    suggestions(keyword) {
        return this.request({
            path: "https://ac.zingmp3.vn/v1/web/ac-suggestions",
            params: {
                num: 25,
                query: keyword,
                language: "vi",
            },
        });
    }
    request({ path, params = {} }, withLogin = false) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.cookies.filter((cookie) => !cookie.startsWith("zmp3_sid=")).length) {
                const { headers } = yield (0, axios_1.default)("https://zingmp3.vn/");
                this.cookies = [...this.cookies, ...headers["set-cookie"]];
            }
            const { data } = yield (0, axios_1.default)(path.startsWith("http") ? path : `https://zingmp3.vn${path}`, {
                params: Object.assign(Object.assign({}, params), { sig: this.hashParam(path, params, Object.keys(params).length > 0), ctime: this.time, apiKey }),
                headers: {
                    Cookie: this.cookies
                        .filter((c) => c.startsWith("zmp3_sid=") && !withLogin ? false : true)
                        .join("; "),
                },
            });
            if (data.err) {
                throw data.msg;
            }
            return data.data;
        });
    }
    hashParam(path, params = {}, haveParam = false) {
        this.time = Math.floor(Date.now() / 1000);
        let strHash = `ctime=${this.time}`;
        if (haveParam) {
            Object.entries(params).forEach(([key, value]) => {
                strHash += `${key}=${value}`;
            });
        }
        const hash256 = this.getHash256(strHash);
        return this.getHmac512(path + hash256, secretKey);
    }
    loadTrack({ id, encodeId, thumbnail, thumb, link }, requester, search) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const artworkUrl = (_a = (thumbnail || thumb)) === null || _a === void 0 ? void 0 : _a.split("/");
            if (artworkUrl === null || artworkUrl === void 0 ? void 0 : artworkUrl.length) {
                artworkUrl[3] = "w300_r1x1_jpeg";
            }
            const streaming = yield this.getStreaming("ZO9DAACI");
            const track = yield search(streaming["320"] && streaming["320"] != "VIP"
                ? streaming["320"]
                : streaming["128"], requester).then((res) => res.tracks[0]);
            track.uri = link.startsWith("http") ? link : `https://zingmp3.vn${link}`;
            track.artworkUrl = artworkUrl.join("/");
            track.sourceName = "zingmp3";
            return track;
        });
    }
}
exports.Main = Main;
