export declare class Main {
    time: number;
    cookies: string[];
    constructor(zmp3_sid: any);
    getHash256(str: any): string;
    getHmac512(str: any, key: any): string;
    getFullInfo(id: any): Promise<any>;
    getDetailPlaylist(id: any): Promise<any>;
    getInfoMusic(id: any): Promise<any>;
    getStreaming(id: any): Promise<any>;
    suggestions(keyword: any): Promise<any>;
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
    }, requester: any, search: any): Promise<any>;
}
