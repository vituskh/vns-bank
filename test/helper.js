import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
mongoose.set("strictQuery", false);
import { setSaltRounds } from "../src/passwordManager.js";

let mongoServer;
before(async function () {
	setSaltRounds(1);

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
