const misc = require('./misc.js');

class Aktie {
	constructor (investedIn, amount, id) {
		this.investedIn = investedIn;
		this.amount = amount;
		this.id = id
	}
	doubled() {
		this.amount = this.amount * 2;
	}
	
}

class Person {
	constructor (name, klasse, password) {
		this.name = name;
		this.klasse = klasse;
		this.password = password;
	}
	aktier = [];
}

module.exports = {
	Aktie
}