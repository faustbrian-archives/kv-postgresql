import { complianceTestsAsync } from "@keeveestore/test-suite";
import { StoreAsync } from "../src";

complianceTestsAsync(
	() =>
		StoreAsync.new<string, string>({
			connection: {
				database: process.env.POSTGRES_DB || "keeveestore",
				password: process.env.POSTGRES_PASSWORD || "",
				user: process.env.POSTGRES_USER || "keeveestore",
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
