import { config } from "dotenv";
config();
let aktieTypes;
if (process.env.aktieTypes) {
	aktieTypes = JSON.parse(process.env.aktieTypes);
} else {
	aktieTypes = [
		{ name: "Test 1", id: "test1" },
		{ name: "Test 2", id: "test2" },
		{ name: "Test 3", id: "test3" },
	];
}
let env = {
	env: process.env.NODE_ENV || "development",
	port: process.env.PORT || 3000,
	dbURI: process.env.dbURI,
	secret: process.env.SECRET,
	aktieTypes,
};
export default env;

export function setVariable(key, value) {
	process.env[key] = value;
	env[key] = value;
}
