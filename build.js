const browserify = require('browserify');
const GoogleClosure = require('google-closure-compiler');
const fs = require('fs');
const path = require("path");
const ROOT = __dirname;

const orgPath = path.join(ROOT, `dist/index.js`);
const exportPath = path.join(ROOT, 'dist/index.web.js');
const compressPath = path.join(ROOT, `dist/InlineWorker.min.js`);
const es5Path = path.join(ROOT, `dist/InlineWorker.min.es5.js`);

browserify()
	.add(orgPath)
	.ignore("worker_threads")
	.bundle()
	.pipe(fs.createWriteStream(exportPath));

new GoogleClosure.compiler({
	js: exportPath,
	js_output_file: compressPath,
}).run((exitCode, stdOut, stdErr) => {
	if (exitCode !== 0) {
		console.error(stdErr);
	} else {
		console.log(stdOut);
	}
});

new GoogleClosure.compiler({
	js: exportPath,
	js_output_file: es5Path,
	language_out: "ECMASCRIPT5"
}).run((exitCode, stdOut, stdErr) => {
	if (exitCode !== 0) {
		console.error(stdErr);
	} else {
		console.log(stdOut);
	}
});