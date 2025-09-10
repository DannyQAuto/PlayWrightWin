import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { WinforcePage } from '../pages/winforce';
import { DatabaseUtils } from '../utils/database-utils';

export const test = base.extend({
loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);

        // Limpiar cookies y almacenamiento después de cada test
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.evaluate(() => sessionStorage.clear());
    },
    winforcePage: async ({ page }, use) => {
        const winforcePage = new WinforcePage(page);
        await use(winforcePage);
    },
    dbUtils: async ({}, use) => {
        await use(DatabaseUtils);
    }
});

export { expect } from '@playwright/test';