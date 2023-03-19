import { hashSync, hash as _hash, compare } from "bcrypt";
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
export function setSaltRounds(newSaltRounds) {
	saltRounds = newSaltRounds;
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

export default {
	hashPassword,
	sanitizeUsername,
	comparePassword,
};
