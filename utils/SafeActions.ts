import { Locator, Page } from "@playwright/test";

/**
 * Safe click / find helpers, ported from the Java SafeActions.
 * Each action waits until the element is visible and enabled, tries again if that fails, and refreshes the page
 * between the later attempts. When all attempts fail, an error is thrown (the Java version returned false / null).
 */
class SafeActions {

    private page: Page;
    private timeout: number;
    private attempts: number;

    constructor(page: Page, timeoutMs: number = 20000, attempts: number = 3) {
        this.page = page;
        this.timeout = timeoutMs;
        this.attempts = attempts;
    }

    /** Visible and enabled. */
    private async isReady(locator: Locator): Promise<boolean> {
        try {
            return (await locator.isVisible()) && (await locator.isEnabled());
        } catch {
            return false;
        }
    }

    /** Refreshes the page after the 2nd failed attempt, and later ones, as long as there is another attempt left. */
    private async refreshIfNeeded(attempt: number): Promise<void> {
        if (attempt < 2 || attempt >= this.attempts) {
            return;
        }
        console.log("Attempt " + attempt + " failed, refreshing the page to recover, url: " + this.page.url());
        try {
            await this.page.reload({ waitUntil: "domcontentloaded" });
            await this.page.waitForLoadState("load", { timeout: 8000 });
        } catch (e) {
            console.log("Refresh or page load wait failed (not fatal): " + String(e).split("\n")[0]);
        }
    }

    /** Waits for the element to be visible and enabled, then returns it. */
    public async safeFindElement(locator: Locator): Promise<Locator> {
        console.log("Trying to find element: " + locator);
        for (let attempt = 1; attempt <= this.attempts; attempt++) {
            try {
                await locator.first().waitFor({ state: "visible", timeout: this.timeout });
                if (await this.isReady(locator.first())) {
                    return locator.first();
                }
                console.log("Element found but not ready (attempt " + attempt + "): " + locator);
            } catch (e) {
                console.log("Could not find element (attempt " + attempt + "): " + locator + " -> " + String(e).split("\n")[0]);
            }
            await this.refreshIfNeeded(attempt);
        }
        throw new Error("Element not found after " + this.attempts + " attempts: " + locator);
    }

    /** Waits for the first match to be visible, then returns every match that is visible and enabled. */
    public async safeFindElements(locator: Locator): Promise<Locator[]> {
        console.log("Finding elements list: " + locator);
        for (let attempt = 1; attempt <= this.attempts; attempt++) {
            try {
                await locator.first().waitFor({ state: "visible", timeout: this.timeout });
                const readyElements: Locator[] = [];
                for (const element of await locator.all()) {
                    if (await this.isReady(element)) {
                        readyElements.push(element);
                    }
                }
                if (readyElements.length > 0) {
                    return readyElements;
                }
                console.log("No ready elements (attempt " + attempt + "): " + locator);
            } catch (e) {
                console.log("Could not find elements (attempt " + attempt + "): " + locator + " -> " + String(e).split("\n")[0]);
            }
            await this.refreshIfNeeded(attempt);
        }
        throw new Error("No elements ready after " + this.attempts + " attempts: " + locator);
    }

    /** Native click first; if that fails, a DOM click (covers overlays and clicks whose navigation takes too long). */
    public async safeClick(locator: Locator): Promise<void> {
        console.log("Trying to click element: " + locator);
        for (let attempt = 1; attempt <= this.attempts; attempt++) {
            try {
                await locator.first().waitFor({ state: "visible", timeout: this.timeout });
                if (await this.isReady(locator.first())) {
                    try {
                        await locator.first().click({ timeout: this.timeout });
                        return;
                    } catch (e) {
                        console.log("Native click failed (attempt " + attempt + "), trying a DOM click: " + locator + " -> " + String(e).split("\n")[0]);
                        await locator.first().evaluate(element => (element as HTMLElement).click());
                        return;
                    }
                }
                console.log("Element not ready to click (attempt " + attempt + "): " + locator);
            } catch (e) {
                console.log("Click failed (attempt " + attempt + "): " + locator + " -> " + String(e).split("\n")[0]);
            }
            await this.refreshIfNeeded(attempt);
        }
        throw new Error("Failed to click element after " + this.attempts + " attempts: " + locator);
    }
}

export default SafeActions;
