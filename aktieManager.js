const { Aktie, Person } = require('./classes.js');
const misc = require('./misc.js');
var personer = require('./data/personer.json');
const bcrypt = require('bcrypt');


function createPerson(name, klasse, password) {
	return new Promise((resolve, reject) => {
		name = name.trim().toLowerCase()
		klasse = klasse.trim().toLowerCase().replace(/\./g, '');
		password = password.trim();
		if (personer[name + klasse]) {
			resolve('Personen eksisterer allerede');
		} else {
			misc.log('Opretter person ' + name + klasse);
			let person = new Person(bcrypt.hashSync(password, 10), name, klasse);
			personer[name + klasse] = person;
			misc.setJson('./data/personer.json', personer)
				.then(() => {
					resolve("Personen er oprettet");
				})
		}
	})
}

function personExists(name, klasse) {
	name = name.trim().toLowerCase();
	klasse = klasse.trim().toLowerCase().replace(/\./g, '');
	return personer[name + klasse] !== undefined;
}
function checkPass(name, klasse, password) {
	name = name || '';
	klasse = klasse || '';
	password = password || '';


	name = name.trim().toLowerCase();
	klasse = klasse.trim().toLowerCase().replace(/\./g, '');
	password = password.trim();
	return new Promise((resolve, reject) => {
		if (personExists(name, klasse)) {
			bcrypt.compare(password, personer[name + klasse].password)
				.then((res) => {
					if (res) {
						resolve(true);
					}
					else {
						resolve(false);
					}
				})
				.catch((err) => {
					reject(err);
				})
		} else {
			reject("Personen eksisterer ikke");
		}
	})
}


function indtast(name, klasse, investedIn, amount) {

	name = name.trim();
	klasse = klasse.trim();
	investedIn = investedIn.trim();
	amount = amount.trim();

	console.log(name, klasse, investedIn, amount);
	return new Promise((resolve, reject) => {
		if (personExists(name, klasse)) {
			let aktieId
			do {
				aktieId = misc.randomId(6);
			} while (personer[name + klasse].aktier[aktieId]);
			let aktie = new Aktie(investedIn, amount, aktieId);
			personer[name + klasse].aktier[aktieId] = aktie;

			misc.setJson('./data/personer.json', personer)
				.then(() => {
					misc.log('Aktie lavet: ' + JSON.stringify(aktie) + ' for ' + name + klasse);
					resolve();
				})
				.catch((err) => {
					console.warn(err);
					reject(err);
				})
		} else {
			reject('Personen eksisterer ikke');
		}

	})
}

function udbetal(name, klasse, id) {
	return new Promise((resolve, reject) => {
		name = name.trim().toLowerCase();
		klasse = klasse.trim().toLowerCase().replace(/\./g, '');
		if (personExists(name, klasse)) {
			if (personer[name + klasse].aktier.hasOwnProperty(id)) {
				let worth = personer[name + klasse].aktier[id].amount;
				let aktie = JSON.stringify(personer[name + klasse].aktier[id]);
				delete personer[name + klasse].aktier[id]
				misc.setJson('./data/personer.json', personer)
					.then(() => {
						misc.log('Aktie udbetalt: ' + aktie + ' for ' + name + klasse);
						resolve('Aktien er udbetalt, værdien er ' + worth);
					})
			} else {
				reject('Aktien eksisterer ikke')
			}
		} else {
			reject('Personen eksisterer ikke')
		}

	})
}

function getAktier(name, klasse) {
	return new Promise((resolve, reject) => {
		name = name.trim().toLowerCase();
		klasse = klasse.trim().toLowerCase().replace(/\./g, '');
		if (personExists(name, klasse)) {
			let aktier = [];
			for (let key in personer[name + klasse].aktier) {
				aktier.push(personer[name + klasse].aktier[key]);
			}
			resolve(aktier);
		} else {
			reject('Personen eksisterer ikke');
		}
	})
}


module.exports = {
	indtast,
	udbetal,
	createPerson,
	personExists,
	checkPass,
	getAktier
}


process.stdin.on('data', (data) => {
	data = data.toString().trim().split(' ');
	console.log("data[0] = " + data[0]);
	switch (data[0]) {
		case "indtast":
			console.log("Indtaster aktie");
			indtast(data[1], data[2], data[3], data[4], data[5])
				.then(() => {
					console.log('Indtastningen er gennemført');
				})
				.catch((err) => {
					console.log(err);
				})

			break;
		case "udbetal":
			console.log("Udbetal aktie");
			udbetal(data[1], data[2], data[3],)
				.then(() => {
					console.log('Udbetalingen er gennemført');
				})
				.catch((err) => {
					console.log(err);
				})
			break;
		case "createPerson":
			console.log("Opretter person");
			createPerson(data[1], data[2], data[3])
				.then((res) => {
					console.log('Oprettelsen er gennemført', res);
				})
				.catch((err) => {
					console.log(err);
				})
			break;
		case "personExists":
			console.log(personExists(data[1], data[2]));
			break;
		case "resetPass":
			console.log("Resetter password");
			if (personExists(data[1], data[2])) {
				personer[data[1] + data[2]].password = bcrypt.hashSync(data[3], 10);
				misc.setJson('./data/personer.json', personer)
					.then(() => {
						console.log('Password reset');
					})
					.catch((err) => {
						console.log(err);
					})
			} else {
				console.log('Personen eksisterer ikke');
			}



		default:
			break;
	}
})