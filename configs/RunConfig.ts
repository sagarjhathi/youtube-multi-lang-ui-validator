import * as fs from "fs";
import * as path from "path";

/**
 * Reads run settings from configs/runconfig.json.
 * An environment variable with the same name as the key wins over the file,
 * so CI can override any value without editing the file.
 */
class RunConfig {

    private static values: Record<string, unknown> | null = null;

    private static load(): Record<string, unknown> {
        if (RunConfig.values === null) {
            const filePath = path.resolve(__dirname, "runconfig.json");
            RunConfig.values = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
        return RunConfig.values as Record<string, unknown>;
    }

    /** Raw value for the key: environment variable first, then the file. Undefined if neither has it. */
    private static getRaw(key: string): string | undefined {
        const fromEnv = process.env[key];
        if (fromEnv !== undefined && fromEnv.trim() !== "") {
            return fromEnv.trim();
        }
        const fromFile = RunConfig.load()[key];
        if (fromFile === undefined || fromFile === null) {
            return undefined;
        }
        return String(fromFile).trim();
    }

    /** True when the run is a scheduled / CI (cron) run. Controlled by the IS_CRON environment variable. */
    static isCron(): boolean {
        return (process.env.IS_CRON ?? "").trim().toLowerCase() === "true";
    }

    /** "CI" on a cron run, otherwise "". Appended to keys that have a CI version. */
    static keySuffix(): string {
        return RunConfig.isCron() ? "CI" : "";
    }

    static getString(key: string, defaultValue = ""): string {
        return RunConfig.getRaw(key) ?? defaultValue;
    }

    static getBoolean(key: string, defaultValue = false): boolean {
        const raw = RunConfig.getRaw(key);
        if (raw === undefined) {
            return defaultValue;
        }
        return raw.toLowerCase() === "true";
    }

    static getInt(key: string, defaultValue = 0): number {
        const raw = RunConfig.getRaw(key);
        if (raw === undefined) {
            return defaultValue;
        }
        const number = parseInt(raw, 10);
        return Number.isNaN(number) ? defaultValue : number;
    }
}

export default RunConfig;
