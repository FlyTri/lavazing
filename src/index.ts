import { LoadTypes, Manager, Plugin } from "erela.js";
import { Main } from "./Main";
const regex =
  /^(?:https?:\/\/)?(?:www\.)?zingmp3\.vn\/(?:bai-hat|album)\/[a-zA-Z0-9-]+\/[a-zA-Z0-9]+\.(html|php)$/;
type Track = {
  type: number;
  playStatus: number | undefined;
  streamingStatus: number | undefined;
  id: string;
  encodeId: string;
  thumbnail: string | undefined;
  thumb: any | undefined;
  link: any;
};

export class LavaZing extends Plugin {
  public querySource = ["zingmp3"];
  public zmp3_sid: string;
  constructor({ zmp3_sid }) {
    super();
    this.zmp3_sid = zmp3_sid;
  }
  load(manager: Manager) {
    manager.options.allowedLinksRegexes.push(
      /^https?:\/\/.*\.zmdcdn\.me\//,
      /^https?:\/\/zingmp3\.vn\//
    );
    const zing = new Main(this.zmp3_sid);
    const defaultSearch = manager.search.bind(manager);

    manager.search = async (query, requester) => {
      const _query = typeof query == "string" ? { query } : query;

      if (
        regex.test(_query.query) ||
        this.querySource.includes(_query.source)
      ) {
        if (
          !regex.test(_query.query) &&
          this.querySource.includes(_query.source)
        ) {
          const suggestions: Track[] =
            (await zing.suggestions(_query.query)).items[1]?.suggestions || [];
          const result = suggestions.filter(
            (track) => track.type == 1 && track.playStatus == 2
          );
          const tracks = await Promise.all(
            result.map((track) =>
              zing.loadTrack(track, requester, defaultSearch)
            )
          );

          return {
            loadType: LoadTypes.SearchResult,
            exception: null,
            tracks,
          };
        }

        const [type, , id] = _query.query.split(".vn/")[1].split(/\/|.html/g);

        switch (type) {
          case "bai-hat": {
            const track = await zing.getInfoMusic(id);

            return {
              loadType:
                track.streamingStatus == 1
                  ? LoadTypes.TrackLoaded
                  : LoadTypes.NoMatches,
              exception: null,
              tracks:
                track.streamingStatus == 1
                  ? [await zing.loadTrack(track, requester, defaultSearch)]
                  : [],
            };
          }
          case "album": {
            const album = await zing.getDetailPlaylist(id);
            const tracks = await Promise.all(
              album.song.items
                .filter((track: Track) => track.streamingStatus == 1)
                .map((track: Track) =>
                  zing.loadTrack(track, requester, defaultSearch)
                )
            );

            return {
              loadType: LoadTypes.PlaylistLoaded,
              playlist: {
                name: album.title,
                duration: album.song.totalDuration * 1000,
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
