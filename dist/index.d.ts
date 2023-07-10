import { Manager, Plugin } from "erela.js";
export declare class LavaZing extends Plugin {
    querySource: string[];
    zmp3_sid: string;
    constructor(options?: {
        querySource: string[];
        zmp3_sid: any;
    });
    load(manager: Manager): void;
}
