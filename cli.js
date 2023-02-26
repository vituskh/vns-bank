import { start } from "repl";
import fileManager from "./fileManager.js";

const r = start({ useGlobal: true });

import("./fileManager.js").then((fileManager) => {
	r.context.fileManager = fileManager;
});
