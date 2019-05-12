import { complianceTestsAsync } from "@keeveestore/test-suite";
import { StoreAsync } from "../src/async";

complianceTestsAsync(
	new StoreAsync<string, string>({
		connection: {
			database: process.env.POSTGRES_DB || "keeveestore",
			user: process.env.POSTGRES_PASSWORD || "keeveestore",
			password: process.env.POSTGRES_USER || "",
		},
	}),
	{
		key1: "value1",
		key2: "value2",
		key3: "value3",
		key4: "value4",
		key5: "value5",
	},
);
