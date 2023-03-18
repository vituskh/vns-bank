import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
mongoose.set("strictQuery", false);
import { setSaltRounds } from "../passwordManager.js";

import config, { setVariable } from "../environment.js";
setVariable("NODE_ENV", "test");

let mongoServer;
before(async function () {
	setSaltRounds(1);
	if (config.NODE_ENV != "test") {
		throw new Error("NODE_ENV is not set to test");
	}
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = await mongoServer.getUri();
	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	return;
});

after(async function () {
	await mongoose.disconnect();
	await mongoServer.stop();
	return;
});

export default mongoose;
