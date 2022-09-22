export declare class InlineWorker {
    postMessage: (data: any) => void;
    terminate: () => void;
    onerror?: (error: Error) => void;
    onmessage?: (data: any) => void;
    constructor(func: Function);
}
