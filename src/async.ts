import { IKeyValueStoreAsync } from "@keeveestore/keeveestore";
import pgPromise from "pg-promise";
import sql from "sql";

export class StoreAsync<K, T> implements IKeyValueStoreAsync<K, T> {
	private readonly store;
	private readonly opts;
	private readonly table;

	public constructor(opts?: Record<string, any>) {
		this.opts = {
			keySize: 255,
			table: "keeveestore",
			...opts,
		};

		sql.setDialect("postgres");

		this.table = sql.define({
			columns: [
				{
					dataType: `VARCHAR(${Number(this.opts.keySize)})`,
					// @ts-ignore
					name: "key",
					primaryKey: true,
				},
				{
					dataType: "TEXT",
					// @ts-ignore
					name: "value",
				},
			],
			name: this.opts.table,
		});

		this.store = pgPromise()(this.opts.connection);

		Promise.resolve().then(() =>
			this.store.none(
				this.table
					.create()
					.ifNotExists()
					.toString(),
			),
		);
	}

	public async all(): Promise<Array<[K, T]>> {
		return (await this.store.manyOrNone(this.table.select().toString())).map(row => [row.key, row.value]);
	}

	public async keys(): Promise<K[]> {
		return (await this.all()).map(row => row[0]);
	}

	public async values(): Promise<T[]> {
		return (await this.all()).map(row => row[1]);
	}

	public async get(key: K): Promise<T | undefined> {
		const row = await this.store.oneOrNone(
			this.table
				.select(this.table.value)
				.where({ key })
				.toString(),
		);

		return row ? row.value : undefined;
	}

	public async getMany(keys: K[]): Promise<Array<T | undefined>> {
		return Promise.all([...keys].map(async (key: K) => this.get(key)));
	}

	public async pull(key: K): Promise<T | undefined> {
		const item: T | undefined = await this.get(key);

		await this.forget(key);

		return item;
	}

	public async pullMany(keys: K[]): Promise<Array<T | undefined>> {
		const items: Array<T | undefined> = await this.getMany(keys);

		await this.forgetMany(keys);

		return items;
	}

	public async put(key: K, value: T): Promise<boolean> {
		await this.store.none(
			this.table
				.insert({ key, value })
				.onConflict({ columns: ["key"], update: ["value"] })
				.toString(),
		);

		return this.has(key);
	}

	public async putMany(values: Array<[K, T]>): Promise<boolean[]> {
		return Promise.all(values.map(async (value: [K, T]) => this.put(value[0], value[1])));
	}

	public async has(key: K): Promise<boolean> {
		return (await this.get(key)) !== undefined;
	}

	public async hasMany(keys: K[]): Promise<boolean[]> {
		return Promise.all([...keys].map(async (key: K) => this.has(key)));
	}

	public async missing(key: K): Promise<boolean> {
		return !(await this.has(key));
	}

	public async missingMany(keys: K[]): Promise<boolean[]> {
		return Promise.all([...keys].map(async (key: K) => this.missing(key)));
	}

	public async forget(key: K): Promise<boolean> {
		if (await this.missing(key)) {
			return false;
		}

		const row = await this.store.oneOrNone(
			this.table
				.select()
				.where({ key })
				.toString(),
		);

		if (!row) {
			return false;
		}

		await this.store.none(
			this.table
				.delete()
				.where({ key })
				.toString(),
		);

		return this.missing(key);
	}

	public async forgetMany(keys: K[]): Promise<boolean[]> {
		return Promise.all([...keys].map((key: K) => this.forget(key)));
	}

	public async flush(): Promise<boolean> {
		await this.store.none(this.table.truncate().toString());

		return this.isEmpty();
	}

	public async count(): Promise<number> {
		const { count } = await this.store.one(this.table.select(this.table.count("count")).toString());

		return +count;
	}

	public async isEmpty(): Promise<boolean> {
		return (await this.count()) === 0;
	}

	public async isNotEmpty(): Promise<boolean> {
		return !(await this.isEmpty());
	}
}
