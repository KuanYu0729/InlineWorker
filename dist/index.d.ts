import { InlineWorker } from "./InlineWorker";
interface Constructable<T> {
    new (...args: any): T;
}
declare global {
    var InlineWorker: Constructable<InlineWorker>;
}
export {};
