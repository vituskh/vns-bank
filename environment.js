import { config } from "dotenv";
config();

export default {
	env: process.env.NODE_ENV || "development",
	port: process.env.PORT || 3000,
	dbURI: process.env.dbURI,
	secret: process.env.SECRET,
};
