const fs = require('fs');

function setJson(file, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, JSON.stringify(data), (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		})
	})
};

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
function randomId(length) {
	let id = ''
	for (let i = 0; i < length; i++) {
		id += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return id;
}

function log(file, message) {
	return new Promise((resolve, reject) => {
		fs.appendFile(file, new Date().toISOString().slice(0,19) + ' ' + message + '\n', (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		})
	})
}


module.exports = {
	setJson,
	randomId,
	log
}