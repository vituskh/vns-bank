import { hashSync, hash as _hash, compare } from "bcrypt";
import fileManager from "./fileManager.js";
// Calculate salt rounds for 200ms hashing
export let saltRounds = 10;
{
	const start = performance.now();
	hashSync("password", saltRounds);
	const end = performance.now();

	let duration = end - start;
	while (duration < 200) {
		saltRounds++;
		duration *= 2;
	}
}

export async function hashPassword(password) {
	return await _hash(password, saltRounds);
}

export async function comparePassword(password, hash) {
	return await compare(password, hash);
}

export function sanitizeUsername(username) {
	//trim whitespace
	username = username.trim();
	username = username.toLowerCase();

	return username;
}

export async function checkPassword(username, password) {
	if (!(await fileManager.Models.User.exists({ username: username }))) {
		return { success: false, message: "Wrong password or username" };
	}

	let user = await fileManager.Models.User.findOne({ username: username });

	if (!(await comparePassword(password, user.password))) {
		return { success: false, message: "Wrong password or username" };
	}

	return { success: true };
}

export async function checkPasswordStaff(username, password) {
	if (!(await fileManager.Models.Staff.exists({ username: username }))) {
		return {
			success: false,
			message: "Wrong password or username",
			admin: false,
		};
	}

	let staff = await fileManager.Models.Staff.findOne({ username: username });
	if (staff.password === "") {
		staff.password = await hashPassword(password);
		staff.save();
		return { success: true, admin: staff.admin || false };
	}

	if (!(await comparePassword(password, staff.password))) {
		return {
			success: false,
			message: "Wrong password or username",
			admin: false,
		};
	}

	return { success: true, admin: staff.admin || false };
}

export default {
	hashPassword,
	sanitizeUsername,
	checkPassword,
	checkPasswordStaff,
};
