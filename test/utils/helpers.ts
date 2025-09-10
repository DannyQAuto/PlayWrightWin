import { Page } from '@playwright/test';

export class Helpers {
// Tomar screenshot
static async takeScreenshot(page: Page, testName: string): Promise<void> {
        await page.screenshot({
            path: `screenshots/${testName}-${Date.now()}.png`,
            fullPage: true
        });
    }

    // Generar email aleatorio
    static generateRandomEmail(): string {
        return `test${Math.random().toString(36).substring(2, 10)}@example.com`;
    }

    // Esperar un tiempo (útil para debugging)
    static async wait(seconds: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
}