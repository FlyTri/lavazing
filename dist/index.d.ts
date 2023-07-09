import { Manager, Plugin } from "erela.js";
export declare class LavaZing extends Plugin {
    querySource: string[];
    zmp3_sid: string;
    constructor({ zmp3_sid }: {
        zmp3_sid: any;
    });
    load(manager: Manager): void;
}
