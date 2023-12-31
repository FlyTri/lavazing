"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LavaZing = void 0;
const tslib_1 = require("tslib");
const erela_js_1 = require("erela.js");
const Main_1 = require("./Main");
const regex = /^(?:https?:\/\/)?(?:www\.)?zingmp3\.vn\/(?:bai-hat|album)\/[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\.(html|php)$/;
class LavaZing extends erela_js_1.Plugin {
    constructor(options) {
        super();
        this.querySource = (options === null || options === void 0 ? void 0 : options.querySource) || [
            "zmp3search",
            "zmp3s",
            "zmp3",
            "zingmp3",
            "zingmp3s",
            "zingmp3search",
        ];
        this.zmp3_sid = options === null || options === void 0 ? void 0 : options.zmp3_sid;
    }
    load(manager) {
        manager.options.allowedLinksRegexes.push(/^https?:\/\/.*\.zmdcdn\.me\//, /^https?:\/\/zingmp3\.vn\//);
        const zing = new Main_1.Main(this.zmp3_sid);
        const defaultSearch = manager.search.bind(manager);
        manager.search = (query, requester, customNode) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            const _query = typeof query == "string" ? { query } : query;
            if (regex.test(_query.query) ||
                this.querySource.includes(_query.source)) {
                if (!regex.test(_query.query) &&
                    this.querySource.includes(_query.source)) {
                    const suggestions = ((_a = (yield zing.suggestions(_query.query)).items[1]) === null || _a === void 0 ? void 0 : _a.suggestions) || [];
                    const result = suggestions.filter((track) => track.type == 1 && track.playStatus == 2);
                    const tracks = yield Promise.all(result.map((track) => zing.loadTrack(track, requester, defaultSearch, customNode)));
                    return {
                        loadType: "search",
                        exception: null,
                        tracks,
                    };
                }
                const [type, , id] = _query.query.split(".vn/")[1].split(/\/|.html/g);
                switch (type) {
                    case "bai-hat": {
                        const track = yield zing.getInfoMusic(id);
                        return {
                            loadType: track.streamingStatus == 1 ? "track" : "empty",
                            exception: null,
                            tracks: track.streamingStatus == 1
                                ? [
                                    yield zing.loadTrack(track, requester, defaultSearch, customNode),
                                ]
                                : [],
                        };
                    }
                    case "album": {
                        const album = yield zing.getDetailPlaylist(id);
                        const tracks = yield Promise.all(album.song.items
                            .filter((track) => track.streamingStatus == 1)
                            .map((track) => zing.loadTrack(track, requester, defaultSearch, customNode)));
                        return {
                            loadType: "playlist",
                            playlist: {
                                name: album.title,
                                duration: tracks.map((track) => track.duration),
                            },
                            exception: null,
                            tracks,
                        };
                    }
                    default: {
                        return defaultSearch(query, requester);
                    }
                }
            }
            return defaultSearch(query, requester);
        });
    }
}
exports.LavaZing = LavaZing;
