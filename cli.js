import config from "./src/environment.js";
import readline from "readline";
import { User, Staff, connection } from "./src/dbManager.js";

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
			case "help":
				console.log(
					"Commands:\n" +
						"exit: Exits the program\n" +
						"updateAktier: Updates the aktier\n" +
						"toggleAdmin: Toggles admin status\n" +
						"resetPass: Resets a user's password\n" +
						"start: Starts the server\n" +
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
	for (let i = 0; i < config.aktieTypes.length; i++) {
		const type = config.aktieTypes[i];
		let total = Number(await readLineAsync(`Total ${type.name}: `));
		aktieTypes.push({
			id: type.id,
			income: total,
			amountInvested: 0,
		});
	}

	console.log(JSON.stringify(aktieTypes, null, 2));
	if ((await readLineAsync("Is this correct? (y/n): ")) != "y") {
		updateAktier();
		return;
	}

	let users = await User.model.find({});
	for (let i = 0; i < users.length; i++) {
		let aktier = users[i].aktier;
		for (let j = 0; j < aktier.length; j++) {
			const aktie = aktier[j];
			let aktieType = aktieTypes.find((type) => type.id == aktie.investedIn);
			aktieType.amountInvested += aktie.amount;
		}
	}
	let totalInflation = 0;

	for (let i = 0; i < users.length; i++) {
		let aktier = users[i].aktier;
		for (let j = 0; j < aktier.length; j++) {
			let aktie = aktier[j];
			let aktieType = aktieTypes.find((type) => type.id == aktie.investedIn);
			let oldAmount = aktie.amount;
			console.log({
				amount: aktie.amount,
				amountInvested: aktieType.amountInvested,
				income: aktieType.income,
			});
			aktie.amount +=
				(aktie.amount / aktieType.amountInvested) * aktieType.income;
			aktie.amount *= config.aktieValueMultiplier;
			console.log({
				amount: aktie.amount,
				aktieRoundThreshold: config.aktieRoundThreshold,
			});

			aktie.amount = Math.round(
				aktie.amount - config.aktieRoundThreshold + 0.5
			);
			console.log(aktie.amount);
			if (aktie.amount < 0) aktie.amount = 0;
			if (aktie.amount > 500) {
				console.warn("Aktie value too high, setting to 500");
				console.warn(users[i]);
				console.warn(aktie);
				throw new Error("Too much money");
			}
			totalInflation += aktie.amount - oldAmount;
		}
	}
	console.log("Total inflation: " + totalInflation);

	let confirm = await readLineAsync("Confirm? (y/n): ");
	if (confirm != "y") {
		updateAktier();
		return;
	}

	for (let i = 0; i < users.length; i++) {
		await users[i].save();
	}
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
