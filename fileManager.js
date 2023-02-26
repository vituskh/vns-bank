//Make sure /data/personer.json, /data/staff.json and /data/aktier.log exists
{
	const fs = require("fs");

	if (!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}
	if (!fs.existsSync("./data/personer.json")) {
		fs.writeFileSync("./data/personer.json", "{}");
	}
	if (!fs.existsSync("./data/staff.json")) {
		fs.writeFileSync("./data/staff.json", "{}");
	}
	if (!fs.existsSync("./data/aktier.log")) {
		fs.writeFileSync("./data/aktier.log", "");
	}
}

const dotenv = require("dotenv");
