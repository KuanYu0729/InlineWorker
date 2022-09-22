"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineWorker = void 0;
const Thread = __importStar(require("worker_threads"));
class InlineWorker {
    constructor(func) {
        if (typeof func !== "function") {
            throw new Error(`Expect receive a function`);
        }
        let functionBody = func.toString();
        let worker;
        if (typeof Worker === "function") {
            functionBody = `
				onmessage = async function (e) {
					const result = await (${functionBody})(postMessage, e.data);
					postMessage(result);
				};
			`;
            const blob = new Blob([functionBody], {
                type: "text/javascript"
            });
            const url = URL.createObjectURL(blob);
            worker = new Worker(url);
            worker.onmessage = (event) => {
                if (typeof this.onmessage === "function") {
                    this.onmessage(event.data);
                }
            };
            worker.onerror = (event) => {
                if (typeof this.onerror === "function") {
                    this.onerror(new Error(event.message));
                }
            };
        }
        else {
            const threadBody = `
				const { parentPort } = require('worker_threads');
				parentPort.on("message", async function(data) {
					const result = await (${functionBody})(data);
					parentPort.postMessage(result);
				});
			`;
            worker = new Thread.Worker(threadBody, { eval: true });
            worker.on('message', (data) => {
                if (typeof this.onmessage === "function") {
                    this.onmessage(data);
                }
            });
            worker.on('error', (error) => {
                if (typeof this.onerror === "function") {
                    this.onerror(error);
                }
            });
        }
        this.postMessage = (data) => {
            worker.postMessage(data);
        };
        this.terminate = function () {
            worker.terminate();
        };
    }
}
exports.InlineWorker = InlineWorker;
