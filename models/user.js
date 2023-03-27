import mongoose from "mongoose";
import { hashPassword } from "../src/passwordManager.js";
import passwordManager from "../src/passwordManager.js";

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	aktier: { type: [{ investedIn: String, amount: Number }], default: [] },
});
const User = mongoose.model("User", userSchema);

async function create(username, password) {
	if (await User.exists({ username: username })) {
		return { success: false, message: "User already exists" };
	}
	if (!username) {
		return { success: false, message: "Username cannot be empty" };
	}
	if (!password) {
		return { success: false, message: "Password cannot be empty" };
	}

	let hashedPassword = await hashPassword(password);
	let user = new User({
		username: username,
		password: hashedPassword,
		aktier: [],
	});
	await user.save();
	return { success: true };
}

async function addAktie(username, investedIn, amount) {
	if (!(await User.exists({ username: username }))) {
		return { success: false, message: "User does not exist" };
	}
	if (amount <= 0) {
		return { success: false, message: "Amount must be greater than 0" };
	}
	if (!investedIn) {
		return { success: false, message: "Invested in cannot be empty" };
	}
	if (isNaN(amount) || typeof amount != "number") {
		return { success: false, message: "Amount must be a number" };
	}

	let user = await User.findOne({ username: username });
	let aktie = user.aktier.find((aktie) => aktie.investedIn === investedIn);
	if (aktie) {
		aktie.amount += amount;
	} else {
		user.aktier.push({ investedIn: investedIn, amount: amount });
	}

	await user.save();
	return { success: true };
}

async function removeAktie(username, investedIn, amount) {
	if (!(await User.exists({ username: username }))) {
		return { success: false, message: "User does not exist" };
	}
	if (amount <= 0) {
		return { success: false, message: "Amount must be greater than 0" };
	}
	if (!investedIn) {
		return { success: false, message: "Invested in cannot be empty" };
	}
	if (isNaN(amount) || typeof amount != "number") {
		return { success: false, message: "Amount must be a number" };
	}

	let user = await User.findOne({ username: username });
	let aktie = user.aktier.find((aktie) => aktie.investedIn === investedIn);

	if (aktie) {
		if (aktie.amount < amount) {
			return { success: false, message: "Not enough aktier" };
		}
		if (aktie.amount === amount) {
			user.aktier.splice(user.aktier.indexOf(aktie), 1);
		} else {
			aktie.amount -= amount;
		}

		await user.save();
		return { success: true };
	}
	return {
		success: false,
		message: "User does not have any aktier in this company",
	};
}

async function checkPassword(username, password) {
	if (!(await User.exists({ username: username }))) {
		return { success: false, message: "Wrong password or username" };
	}

	let user = await User.findOne({ username: username });
	if (!(await passwordManager.comparePassword(password, user.password))) {
		return { success: false, message: "Wrong password or username" };
	}

	return { success: true };
}

export default { User, create, addAktie, removeAktie, checkPassword };
