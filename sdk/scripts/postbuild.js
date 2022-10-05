const { readFileSync, writeFileSync } = require('fs');
const glob = require('glob');
const PATH = require('path');

const outDir = '/build/cjs';
const hashconnectESM = 'hashconnect/dist/esm';
const hashconnectCJS = 'hashconnect/dist/cjs';
const patternJS = '/**/*.js';
const patternDT = '/**/*.d.ts';
const path = PATH.join(__dirname, '..', outDir);

replaceInFiles(path + patternJS);
replaceInFiles(path + patternDT);

const replaceHashconnect = (path) => {
	let data = readFileSync(path).toString();
	if (data.includes(hashconnectESM)) {
		data = data.replace(new RegExp(hashconnectESM, 'g'), hashconnectCJS);
		writeFileSync(path, data);
	}
};
function replaceInFiles(path) {
	glob(path, function (er, files) {
		if (er) throw er;
		files.map((file) => {
			replaceHashconnect(file);
		});
	});
}
