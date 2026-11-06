import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const isLocal = /localhost|127\.0\.0\.1/.test(url);

function create() {
  return postgres(url!, {
    max: 5,
    onnotice: () => {},
    ssl: isLocal ? false : "require",
    // Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Date objects.
    types: {
      date: {
        to: 1082,
        from: [1082],
        serialize: (x: string) => x,
        parse: (x: string) => x,
      },
    },
  });
}

const g = globalThis as unknown as { __spuSql?: ReturnType<typeof create> };
export const sql = g.__spuSql ?? create();
if (process.env.NODE_ENV !== "production") g.__spuSql = sql;
