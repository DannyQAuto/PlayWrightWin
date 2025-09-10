import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
readonly usernameInput: Locator;
readonly passwordInput: Locator;
readonly loginButton: Locator;
readonly errorMessage: Locator;
readonly car: Locator;
readonly car2: Locator;

constructor(page: Page) {
        super(page);
        this.usernameInput = page.locator('#user-name');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#login-button');
        this.errorMessage = page.locator('[data-test="error"]');
        this.car = page.locator('div.inventory_item:has-text("29.99") >> button.btn_primary');
        this.car2 = page.locator('div.inventory_item:has-text("49.99") >> button.btn_primary');
    }

    async login(username: string, password: string): Promise<void> {
        await this.fillField(this.usernameInput, username);
        await this.fillField(this.passwordInput, password);
        await this.waitAndClick(this.loginButton);
    }

    async addToCart(): Promise<void> {
        await this.waitAndClick(this.car);
        await this.waitAndClick(this.car2);
    }

    async getErrorMessage(): Promise<string> {
        return await this.getElementText(this.errorMessage);
    }
}