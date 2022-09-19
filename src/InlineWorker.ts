import * as Thread from 'worker_threads';
export class InlineWorker {
	postMessage: (data: any) => void;
	terminate: () => void;
	onerror?: (error: Error) => void;
	onmessage?: (data: any) => void;
	constructor(func: Function) {
		if (typeof func !== "function") {
			throw new Error(`Expect receive a function`);
		}
		let functionBody = func.toString();
		let worker: Worker | Thread.Worker;
		if (typeof Worker === "function") {
			functionBody = `
				onmessage = async function (e) {
					const result = await (${functionBody})(e.data);
					postMessage(result);
				};
			`

			const blob = new Blob([functionBody], {
				type: "text/javascript"
			});
			const url = URL.createObjectURL(blob);
			worker = new Worker(url);
			worker.onmessage = (event: { data: any }) => {
				if (typeof this.onmessage === "function") {
					this.onmessage(event.data);
				}
			};
			worker.onerror = (event: ErrorEvent) => {
				if (typeof this.onerror === "function") {
					this.onerror(new Error(event.message));
				}
			}
		} else {

			const threadBody = `
				const { parentPort } = require('worker_threads');
				parentPort.on("message", async function(data) {
					const result = await (${functionBody})(data);
					parentPort.postMessage(result);
				});
			`;
			worker = new Thread.Worker(threadBody, { eval: true });

			worker.on('message', (data: any) => {
				if (typeof this.onmessage === "function") {
					this.onmessage(data);
				}
			})
			worker.on('error', (error: Error) => {
				if (typeof this.onerror === "function") {
					this.onerror(error);
				}
			});
		}

		this.postMessage = (data: any) => {
			worker.postMessage(data);
		};

		this.terminate = function () {
			worker.terminate();
		};
	}
}