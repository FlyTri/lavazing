import { Manager, Node, Plugin, Track } from "erela.js";
import { Main } from "./Main";
const regex =
  /^(?:https?:\/\/)?(?:www\.)?zingmp3\.vn\/(?:bai-hat|album)\/[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\.(html|php)$/;

export class LavaZing extends Plugin {
  public querySource: string[] | undefined;
  public zmp3_sid: string | undefined;
  constructor(options: {
    querySource: string[] | undefined;
    zmp3_sid: string | undefined;
  }) {
    super();
    this.querySource = options?.querySource || [
      "zmp3search",
      "zmp3s",
      "zmp3",
      "zingmp3",
      "zingmp3s",
      "zingmp3search",
    ];
    this.zmp3_sid = options?.zmp3_sid;
  }
  load(manager: Manager) {
    manager.options.allowedLinksRegexes.push(
      /^https?:\/\/.*\.zmdcdn\.me\//,
      /^https?:\/\/zingmp3\.vn\//
    );
    const zing = new Main(this.zmp3_sid);
    const defaultSearch = manager.search.bind(manager);

    manager.search = async (query, requester, customNode?: Node) => {
      const _query = typeof query == "string" ? { query } : query;

      if (
        regex.test(_query.query) ||
        this.querySource.includes(_query.source)
      ) {
        if (
          !regex.test(_query.query) &&
          this.querySource.includes(_query.source)
        ) {
          const suggestions: any[] =
            (await zing.suggestions(_query.query)).items[1]?.suggestions || [];
          const result = suggestions.filter(
            (track) => track.type == 1 && track.playStatus == 2
          );
          const tracks = await Promise.all(
            result.map((track) =>
              zing.loadTrack(track, requester, defaultSearch, customNode)
            )
          );

          return {
            loadType: "search",
            exception: null,
            tracks,
          };
        }

        const [type, , id] = _query.query.split(".vn/")[1].split(/\/|.html/g);

        switch (type) {
          case "bai-hat": {
            const track = await zing.getInfoMusic(id);

            return {
              loadType: track.streamingStatus == 1 ? "track" : "empty",
              exception: null,
              tracks:
                track.streamingStatus == 1
                  ? [
                      await zing.loadTrack(
                        track,
                        requester,
                        defaultSearch,
                        customNode
                      ),
                    ]
                  : [],
            };
          }
          case "album": {
            const album = await zing.getDetailPlaylist(id);
            const tracks: Track[] = await Promise.all(
              album.song.items
                .filter((track: any) => track.streamingStatus == 1)
                .map((track: any) =>
                  zing.loadTrack(track, requester, defaultSearch, customNode)
                )
            );

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
    };
  }
}
