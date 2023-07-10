import { Node, Track } from "erela.js";
export declare class Main {
    time: number;
    cookies: string[];
    constructor(zmp3_sid: string);
    getHash256(str: string): string;
    getHmac512(str: string, key: string): string;
    getFullInfo(id: string): Promise<any>;
    getDetailPlaylist(id: string): Promise<any>;
    getInfoMusic(id: string): Promise<any>;
    getStreaming(id: string): Promise<any>;
    suggestions(keyword: string): Promise<any>;
    request({ path, params }: {
        path: any;
        params?: {};
    }, withLogin?: boolean): Promise<any>;
    hashParam(path: any, params?: {}, haveParam?: boolean): string;
    loadTrack({ id, encodeId, thumbnail, thumb, link }: {
        id: any;
        encodeId: any;
        thumbnail: any;
        thumb: any;
        link: any;
    }, requester: unknown, search: any, node: Node): Promise<Track>;
}
