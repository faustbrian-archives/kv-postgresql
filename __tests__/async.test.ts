import { complianceTestsAsync } from "@konceiver/kv-test-suite";
import { StoreAsync } from "../src";

complianceTestsAsync(
	() =>
		StoreAsync.new<string, string>({
			connection: {
				database: process.env.POSTGRES_DB || "kv",
				password: process.env.POSTGRES_PASSWORD || "",
				user: process.env.POSTGRES_USER || "kv",
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
