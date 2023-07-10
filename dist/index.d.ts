import { Manager, Plugin } from "erela.js";
export declare class LavaZing extends Plugin {
    querySource: string[] | undefined;
    zmp3_sid: string | undefined;
    constructor(options: {
        querySource: string[] | undefined;
        zmp3_sid: string | undefined;
    });
    load(manager: Manager): void;
}
