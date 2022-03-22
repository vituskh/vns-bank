const { Aktie } = require('./classes.js');
const misc = require('./misc.js');
var personer = require('./personer.json');
const bcrypt = require('bcrypt');

//If not running as a module
if (require.main === module) {
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
				udbetal(data[1], data[2], data[3], data[4])
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


			default:
				break;
		}
	})
} else {
	console.log('Running nedskriv as a module');
}
function createPerson(name, klasse, password) {
	return new Promise((resolve, reject) => {
		if (personer[name + klasse]) {
			resolve('Personen eksisterer allerede');
		} else {
			personer[name + klasse] = {
				password: bcrypt.hashSync(password, 10)
			};
			misc.setJson('./personer.json', personer)
				.then(() => {
					resolve("Personen er oprettet");
				})
		}
	})
}

function personExists(name, klasse) {
	return personer[name + klasse] !== undefined;
}
function checkPass(name,klasse, password) {
	name = name.trim().toLowerCase();
	klasse = klasse.trim().toLowerCase().replaceAll('.', '');
	password = password.trim();
	return new Promise((resolve, reject) => {
		if (personExists(name, klasse)) {
			if (bcrypt.compareSync(password, personer[name + klasse].password)) {
				resolve();
			} else {
				reject();
			}
		} else {
			reject();
		}
	})
}

/**
 * 
 * @param {String} name 
 * @param {String} klasse 
 * @param {String} investedIn 
 * @returns 
 */
function fixParams(name,klasse,investedIn) {
	
	name = name.trim();
	klasse = klasse.trim();
	investedIn = investedIn.trim();

	name = name.toLowerCase();
	klasse = klasse.toLowerCase().replaceAll('.', '')
	investedIn = investedIn.toLowerCase().replaceAll(' ', '_');
	
	return {
		name,
		klasse,
		investedIn
	}
}

function indtast(name, klasse, investedIn, amount) {
	
	({name, klasse, investedIn} = fixParams(name,klasse,investedIn));

	return new Promise((resolve, reject) => {
		if (personExists(name, klasse)) {
			let aktieId
			do {
				aktieId = misc.randomId(6);
			} while (personer[name+klasse][aktieId]);
			let aktie = new Aktie(investedIn, amount, aktieId);
			personer[name + klasse][aktieId] = aktie;

			misc.setJson('./personer.json', personer)
				.then(() => {
					resolve();
				})
		} else {
			reject('Personen eksisterer ikke');
		}

	})
}

function udbetal(name, klasse, password, id) {
	return new Promise((resolve, reject) => {
		if (personExists(name, klasse)) {
			if (personer[name + klasse].hasOwnProperty(id)) {
				if (bcrypt.compareSync(password, personer[name + klasse].password)) {
					let worth = personer[name + klasse][id].amount;
					delete personer[name + klasse][id]
					misc.setJson('./personer.json', personer)
						.then(() => {
							resolve('Aktien er udbetalt, værdien er ' + worth);
						})
				} else {
					reject('Forkert kodeord')
				}
			} else {
				reject('Aktien eksisterer ikke')
			}
		} else {
			reject('Personen eksisterer ikke')
		}
	})
		
}


module.exports = {
	indtast,
	udbetal,
	createPerson,
	personExists,
	checkPass
}
