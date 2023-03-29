import config from "./src/environment.js";
import readline from "readline";
import { User, Staff, connection } from "./src/dbManager.js";
import { readFile } from "fs/promises";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function readLineAsync(message) {
	return new Promise((resolve, reject) => {
		rl.question(message, (answer) => {
			resolve(answer);
		});
	});
}

async function main() {
	let exit = false;
	while (!exit) {
		let input = (await readLineAsync("Command: ")).split(" ");

		switch (input[0]) {
			case "exit":
				exit = true;
				break;
			case "updateAktier":
				await updateAktier();
				break;
			case "toggleAdmin":
				await toggleAdmin();
				break;
			case "resetPass":
				await resetPass();
				break;
			case "start":
				await startServer();
				break;
			case "countAktier":
				await countAktieTypes();
				break;
			case "getCheaters":
				await getCheaters();
				break;
			case "userInfo":
				await userInfo();
				break;
			case "help":
				console.log(
					"Commands:\n" +
						"exit: Exits the program\n" +
						"updateAktier: Updates the aktier\n" +
						"toggleAdmin: Toggles admin status\n" +
						"resetPass: Resets a user's password\n" +
						"start: Starts the server\n" +
						"countAktier: Counts the amount of each aktie type\n" +
						"getCheaters: Gets the users with more than 500 aktier\n" +
						"userInfo: Gets info about a user\n" +
						"help: Shows this message"
				);
				break;
			default:
				console.log("Unknown command");
				break;
		}
	}
}
main();

async function updateAktier() {
	let aktieTypes = [];
	let totalIncome = 0;
	let manualOrFile = await readLineAsync("Manual or file (m/f): ");
	if (manualOrFile == "f") {
		let fileName = new URL("./income.json", import.meta.url);
		let file = JSON.parse(await readFile(fileName));
		file.forEach((type) => {
			aktieTypes.push({
				id: type.id,
				income: type.income,
				amountInvested: 0,
			});
			totalIncome += type.income;
		});
	} else {
		for (let i = 0; i < config.aktieTypes.length; i++) {
			const type = config.aktieTypes[i];
			let total = Number(await readLineAsync(`Total ${type.name}: `));
			aktieTypes.push({
				id: type.id,
				income: total,
				amountInvested: 0,
			});
			totalIncome += total;
		}
	}

	console.log(JSON.stringify(aktieTypes, null, 2));
	if ((await readLineAsync("Is this correct? (y/n): ")) != "y") {
		updateAktier();
		return;
	}

	let method = await readLineAsync("Method (std, redistribute, original): ");

	let users = await User.model.find({});
	let totalInvested = 0;
	for (let i = 0; i < users.length; i++) {
		let aktier = users[i].aktier;
		for (let j = 0; j < aktier.length; j++) {
			const aktie = aktier[j];
			let aktieType = aktieTypes.find((type) => type.id == aktie.investedIn);
			aktieType.amountInvested += aktie.amount;
			totalInvested += aktie.amount;
		}
	}
	let totalInflation = 0;
	let creditCards = 0;

	for (let i = 0; i < users.length; i++) {
		let aktier = users[i].aktier;
		let earned = 0;
		for (let j = 0; j < aktier.length; j++) {
			let aktie = aktier[j];
			let aktieType = aktieTypes.find((type) => type.id == aktie.investedIn);
			let oldAmount = aktie.amount;
			calculateNewAmount(aktie, aktieType, totalIncome, totalInvested, method);
			if (aktie.amount < 0) aktie.amount = 0;
			if (aktie.amount > 500) {
				console.warn("Aktie value too high, setting to 500");
				console.warn(users[i]);
				console.warn(aktie);
				throw new Error("Too much money");
			}
			earned += aktie.amount;
			totalInflation += aktie.amount - oldAmount;
		}
		creditCards += Math.ceil(earned / 10);
	}
	console.log("Total inflation: " + totalInflation);
	console.log("Total credit cards: " + creditCards);

	//estimates
	aktieTypes.forEach((aktieType) => {
		let testAktie = {
			amount: 1,
			investedIn: aktieType.id,
		};
		if (aktieType.amountInvested == 0) return;
		let oldAmount = testAktie.amount;
		calculateNewAmount(
			testAktie,
			aktieType,
			totalIncome,
			totalInvested,
			method,
			false
		);
		console.log(
			`Estimate for ${aktieType.id}: ${oldAmount} = ${testAktie.amount}`
		);
	});

	//5 richest
	let richest = users.sort((a, b) => {
		return (
			b.aktier.reduce((a, b) => a + b.amount, 0) -
			a.aktier.reduce((a, b) => a + b.amount, 0)
		);
	});
	console.log("Richest:");
	for (let i = 0; i < 5; i++) {
		console.log(
			`${richest[i].username}: ${richest[i].aktier.reduce(
				(a, b) => a + b.amount,
				0
			)}`
		);
	}

	let confirm = await readLineAsync("Confirm? (y/n): ");
	if (confirm != "y") {
		updateAktier();
		return;
	}

	for (let i = 0; i < users.length; i++) {
		await users[i].save();
	}
}

async function userInfo() {
	let username = await readLineAsync("Username: ");

	let user = await User.model.findOne({ username });

	console.log(user);
}

async function toggleAdmin() {
	let username = await readLineAsync("Username: ");

	let staff = await Staff.model.findOne({ username });

	staff.admin = !staff.admin;
	console.log(staff);
	let confirm = await readLineAsync("Confirm? (y/n): ");
	if (confirm != "y") {
		return;
	}
	await staff.save();
}

async function resetPass() {
	let username = await readLineAsync("Username: ");

	let user = await User.model.findOne({ username });

	let password = await readLineAsync("Password: ");
}

async function startServer() {
	import("./index.js");
}

async function countAktieTypes() {
	let aktieTypes = config.aktieTypes.map((type) => ({
		id: type.id,
		amountInvested: 0,
	}));

	let users = await User.model.find({});
	for (let i = 0; i < users.length; i++) {
		let aktier = users[i].aktier;
		for (let j = 0; j < aktier.length; j++) {
			const aktie = aktier[j];
			let aktieType = aktieTypes.find((type) => type.id == aktie.investedIn);
			aktieType.amountInvested += aktie.amount;
		}
	}

	//show percentage
	let total = 0;
	for (let i = 0; i < aktieTypes.length; i++) {
		const aktieType = aktieTypes[i];
		total += aktieType.amountInvested;
	}
	for (let i = 0; i < aktieTypes.length; i++) {
		const aktieType = aktieTypes[i];
		aktieType.amountInvestedPercentage = (
			(aktieType.amountInvested / total) *
			100
		).toFixed(2);
	}
	console.log(aktieTypes);
	console.log("total: " + total);
	console.log("users: " + users.length);
	console.log("avg. " + total / users.length);
}

async function getCheaters() {
	let users = await User.model.find({});
	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		let aktieSum = 0;
		for (let j = 0; j < user.aktier.length; j++) {
			const aktie = user.aktier[j];
			aktieSum += aktie.amount;
		}
		if (aktieSum > 5) {
			console.log(user.username + ": " + aktieSum + " (aktieSum)");
		}
	}
}

function calculateNewAmount(
	aktie,
	aktieType,
	totalIncome,
	totalInvested,
	method,
	round
) {
	if (typeof round == "undefined") round = true;
	if (method == "std") {
		aktie.amount +=
			(aktie.amount / aktieType.amountInvested) * aktieType.income;
		aktie.amount *= config.aktieValueMultiplier;
	} else if (method == "redistribute") {
		aktie.amount =
			(aktieType.income / totalIncome) *
			(aktie.amount / aktieType.amountInvested) *
			totalInvested;
	} else if (method == "original") {
		aktie.amount = (aktieType.income / aktieType.amountInvested) * aktie.amount;
	} else if (method == "recombo") {
		let add = (aktie.amount / aktieType.amountInvested) * aktieType.income;
		aktie.amount =
			(aktieType.income / totalIncome) *
			(aktie.amount / aktieType.amountInvested) *
			totalInvested;
		aktie.amount += add * 0.1;
	} else {
		throw new Error("Unknown method");
	}
	if (round) {
		aktie.amount = Math.round(aktie.amount - config.aktieRoundThreshold + 0.5);
	}
}
