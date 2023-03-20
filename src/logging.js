import config from "./environment.js";
import winston from "winston";

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	activity: 3,
	debug: 4,
};

const logger = winston.createLogger({
	levels,
	transports: [
		new winston.transports.File({
			filename: "./logs/error.log",
			level: "error",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			),
		}),
		new winston.transports.File({
			filename: "./logs/activity.log",
			level: "activity",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			),
		}),
		new winston.transports.File({
			filename: "./logs/info.log",
			level: "info",
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			),
		}),
	],
});
let consoleTransport = new winston.transports.Console({
	prettyPrint: true,
	colorize: true,
	level: "info",
	format: winston.format.simple(),
});

if (config.NODE_ENV !== "production" && config.NODE_ENV !== "test") {
	consoleTransport.level = "debug";
} else if (config.NODE_ENV == "test") {
	logger.transports.forEach((t) => (t.silent = true));
}

logger.add(consoleTransport);
export default logger;
