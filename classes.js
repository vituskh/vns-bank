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
	constructor (password) {
		this.password = password;
		this.aktier = {};
	}
}

module.exports = {
	Aktie, Person
}