import { complianceTestsAsync } from "@konceiver/kv-test-suite";

import { StoreAsync } from "./index";

complianceTestsAsync(
	() =>
		StoreAsync.new<string, string>({
			connection: {
				host: process.env.POSTGRES_HOST || "localhost",
				port: process.env.POSTGRES_PORT || 5432,
				user: process.env.POSTGRES_USER || "kv",
				password: process.env.POSTGRES_PASSWORD || "",
				database: process.env.POSTGRES_DB || "kv",
			},
		}),
	{
		key1: "value1",
		key2: "value2",
		key3: "value3",
		key4: "value4",
		key5: "value5",
	}
);
