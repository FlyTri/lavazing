import axios from "axios";
import { SearchResult, Track } from "erela.js";
import { createHash, createHmac } from "node:crypto";
const apiKey = "X5BM3w8N7MKozC0B85o4KMlzLZKhV00y";
const secretKey = "acOrvUS15XRW2o9JksiK1KgQ6Vbds8ZW";

export class Main {
  public time: number;
  public cookies: string[];
  constructor(zmp3_sid: string) {
    this.time = null;
    this.cookies = [zmp3_sid].filter(Boolean);
    if (zmp3_sid)
      axios("https://jr.zingmp3.vn/jr/userinfo", {
        headers: {
          Cookie: zmp3_sid,
          referer: "https://zingmp3.vn/",
        },
      }).then(({ data }) =>
        data.data.logged
          ? null
          : console.log(
              "\x1b[31m\x1b[1m[LavaZing]\x1b[0m | \x1b[31mInvalid zmp3_sid cookie was provided\x1b[0m"
            )
      );
  }

  getHash256(str: string) {
    return createHash("sha256").update(str).digest("hex");
  }

  getHmac512(str: string, key: string) {
    return createHmac("sha512", key)
      .update(Buffer.from(str, "utf8"))
      .digest("hex");
  }

  async getFullInfo(id: string) {
    const [infoMusic, streaming] = await Promise.all([
      this.getInfoMusic(id),
      this.getStreaming(id),
    ]);
    return { ...infoMusic, streaming };
  }

  getDetailPlaylist(id: string) {
    return this.request({
      path: "/api/v2/page/get/playlist",
      params: { id },
    });
  }

  getInfoMusic(id: string) {
    return this.request({
      path: "/api/v2/song/get/info",
      params: { id },
    });
  }

  getStreaming(id: string) {
    return this.request(
      {
        path: "/api/v2/song/get/streaming",
        params: { id },
      },
      true
    );
  }

  suggestions(keyword: string) {
    return this.request({
      path: "https://ac.zingmp3.vn/v1/web/ac-suggestions",
      params: {
        num: 25,
        query: keyword,
        language: "vi",
      },
    });
  }

  async request({ path, params = {} }, withLogin = false) {
    if (
      !this.cookies.filter((cookie) => !cookie.startsWith("zmp3_sid=")).length
    ) {
      const { headers } = await axios("https://zingmp3.vn/");
      this.cookies = [...this.cookies, ...headers["set-cookie"]];
    }

    const { data } = await axios(
      path.startsWith("http") ? path : `https://zingmp3.vn${path}`,
      {
        params: {
          ...params,
          sig: this.hashParam(path, params, Object.keys(params).length > 0),
          ctime: this.time,
          apiKey,
        },
        headers: {
          Cookie: this.cookies
            .filter((c) =>
              c.startsWith("zmp3_sid=") && !withLogin ? false : true
            )
            .join("; "),
        },
      }
    );

    if (data.err) {
      throw data.msg;
    }

    return data.data;
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

  async loadTrack(
    { id, encodeId, thumbnail, thumb, link },
    requester: unknown,
    search: any
  ): Promise<Track> {
    const artworkUrl = (thumbnail || thumb)?.split("/");
    if (artworkUrl?.length) {
      artworkUrl[3] = "w300_r1x1_jpeg";
    }
    const streaming = await this.getStreaming("ZO9DAACI");
    const track = await search(
      streaming["320"] && streaming["320"] != "VIP"
        ? streaming["320"]
        : streaming["128"],
      requester
    ).then((res: SearchResult) => res.tracks[0]);
    track.uri = link.startsWith("http") ? link : `https://zingmp3.vn${link}`;
    track.artworkUrl = artworkUrl.join("/");
    track.sourceName = "zingmp3";
    return track;
  }
}
