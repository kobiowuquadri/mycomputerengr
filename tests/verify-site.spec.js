const { test, expect } = require("@playwright/test");

const baseURL = "http://localhost:3000";
const pages = [
  "/",
  "/pages/about-me.html",
  "/pages/services.html",
  "/pages/portfolio.html",
  "/pages/contact-me.html",
  "/pages/blank.html",
];

test.describe("site polish verification", () => {
  for (const path of pages) {
    test(`loads without console errors: ${path}`, async ({ page }) => {
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });

      const response = await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle" });
      expect(response.status()).toBe(200);
      expect(errors).toEqual([]);

      await expect(page.locator(".mc-site-header")).toBeVisible();
      await expect(page.locator(".mc-site-footer")).toBeVisible();

      const imageSources = await page.evaluate(() =>
        Array.from(document.images)
          .map((image) => image.getAttribute("src"))
          .filter(Boolean)
      );

      for (const src of new Set(imageSources)) {
        const imageResponse = await page.request.get(new URL(src, page.url()).toString());
        expect(imageResponse.status(), src).toBeLessThan(400);
      }
    });
  }

  test("manual mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });

    const menu = page.locator(".mc-menu-toggle");
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.locator("body")).toHaveClass(/site-menu-open/);
    await expect(page.locator(".mc-primary-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/site-menu-open/);
  });

  test("contact select, FAQ accordion, and map are wired", async ({ page }) => {
    await page.goto(`${baseURL}/pages/contact-me.html`, { waitUntil: "networkidle" });

    await page.locator('select[name="device_type"]').selectOption("MacBook");
    await expect(page.locator('select[name="device_type"]')).toHaveValue("MacBook");

    const faq = page.locator("[data-faq-toggle]").nth(1);
    await expect(faq).toHaveAttribute("aria-expanded", "false");
    await faq.click();
    await expect(faq).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#faq-2")).toBeVisible();

    await expect(page.locator(".mc-map-wrap iframe")).toHaveAttribute("src", /google\.com\/maps\/embed/);
  });

  test("contact form is wired to email", async ({ page }) => {
    await page.goto(`${baseURL}/pages/contact-me.html`, { waitUntil: "networkidle" });

    await expect(page.locator('form[aria-label="Contact us"]')).toHaveAttribute(
      "action",
      "mailto:Adedayoandadetunji@gmail.com"
    );
    await expect(page.locator('[data-hook="submit-button"]').first()).toHaveAttribute("type", "submit");
    await page.locator('input[name="first_name"]').fill("Test Visitor");
    await page.locator('input[name="email"]').fill("visitor@example.com");
    await page.locator('input[name="service_type"]').first().check();
    await page.locator('select[name="device_type"]').selectOption("Laptop");
    await page.locator('textarea[name="message"]').fill("Testing the local email form.");
    await expect(page.locator('input[name="email"]')).toHaveValue("visitor@example.com");
  });

  test("navigation links resolve locally and omit Contact Me", async ({ page }) => {
    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });

    await expect(page.locator(".mc-primary-nav")).not.toContainText("Contact Me");
    await expect(page.locator(".mc-footer")).not.toContainText("Contact Me");
    await expect(page.locator(".mc-repair-btn")).toHaveAttribute("href", "pages/contact-me.html");

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".mc-site-header a[href], .mc-site-footer a[href]"))
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("#"))
        .filter((href) => !/^https?:\/\//i.test(href))
    );

    for (const href of new Set(hrefs)) {
      const response = await page.request.get(new URL(href, `${baseURL}/`).toString());
      expect(response.status(), href).toBeLessThan(400);
    }
  });
});
