const { test, expect } = require("@playwright/test");

const baseURL = "http://localhost:3000";
const pages = [
  "/",
  "/pages/about-me.html",
  "/pages/services.html",
  "/pages/blog.html",
  "/pages/single-blog.html?slug=reduce-laptop-downtime",
  "/executive-support/",
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

    await page.locator('select[name="industry"]').selectOption("Education / School");
    await expect(page.locator('select[name="industry"]')).toHaveValue("Education / School");

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
      "mailto:support@mycomputerengr.ng"
    );
    await expect(page.locator('[data-hook="submit-button"]').first()).toHaveAttribute("type", "submit");
    await page.locator('input[name="company_name"]').fill("Test Company");
    await page.locator('input[name="contact_person"]').fill("Test Visitor");
    await page.locator('input[name="email"]').fill("visitor@example.com");
    await page.locator('input[name="phone"]').fill("08012345678");
    await page.locator('select[name="industry"]').selectOption("Professional Services");
    await page.locator('textarea[name="message"]').fill("Testing the local email form.");
    await expect(page.locator('input[name="email"]')).toHaveValue("visitor@example.com");
  });

  test("executive support form shows thank-you and redirects to WhatsApp", async ({ page }) => {
    await page.goto(`${baseURL}/executive-support/`, { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toContainText("Executive Device Care");
    await expect(page.locator(".mc-hero-section")).toHaveCount(0);
    await page.locator('input[name="full_name"]').fill("Ada Executive");
    await page.locator('input[name="company"]').fill("Executive Co");
    await page.locator('input[name="position"]').fill("CEO");
    await page.locator('input[name="business_email"]').fill("ada@example.com");
    await page.locator('input[name="phone"]').fill("07078817981");
    await page.locator('input[name="location"]').fill("Lagos");
    await page.locator('select[name="device"]').selectOption(["MacBook", "iPhone"]);
    await page.locator('textarea[name="support_need"]').fill("My laptop needs priority support.");
    await page.locator('select[name="preferred_appointment"]').selectOption("Immediately");
    await page.locator('select[name="preferred_time"]').selectOption("Morning");

    await page.locator('[data-hook="submit-button"]').click();
    await expect(page.locator(".mc-form-success")).toBeVisible();
    await expect(page.locator(".mc-form-success")).toContainText("An Executive Support Coordinator");
    await page.waitForURL(/(wa\.me|api\.whatsapp\.com).*2347078817981/);
    expect(page.url()).toContain("Ada%20Executive");
  });

  test("blog index renders dynamic posts and links to the single blog template", async ({ page }) => {
    await page.goto(`${baseURL}/pages/blog.html`, { waitUntil: "networkidle" });

    await expect(page.locator("[data-blog-featured] .mc-blog-featured-card")).toBeVisible();
    await expect(page.locator("[data-blog-list] .mc-blog-card")).toHaveCount(3);
    await expect(page.locator(".mc-blog-featured-copy h2")).toContainText("How to Reduce Laptop Downtime");

    const articleHref = await page.locator(".mc-blog-featured-copy h2 a").getAttribute("href");
    expect(articleHref).toBe("single-blog.html?slug=reduce-laptop-downtime");
  });

  test("single blog page renders the selected post", async ({ page }) => {
    await page.goto(`${baseURL}/pages/single-blog.html?slug=executive-priority-device-care`, { waitUntil: "networkidle" });

    await expect(page.locator("h1")).toContainText("Why Executives Need Priority Device Care");
    await expect(page.locator(".mc-blog-post-body p")).toHaveCount(5);
    await expect(page.locator(".mc-blog-post-actions .mc-repair-btn")).toHaveAttribute("href", "../executive-support/index.html");
  });

  test("navigation links resolve locally and omit Contact Me", async ({ page }) => {
    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });

    await expect(page.locator(".mc-primary-nav")).not.toContainText("Contact Me");
    await expect(page.locator(".mc-footer")).not.toContainText("Contact Me");
    await expect(page.locator(".mc-primary-nav")).toContainText("Blog");
    await expect(page.locator(".mc-header-actions .mc-repair-btn")).toHaveAttribute("href", "pages/contact-me.html");
    await expect(page.locator(".mc-home-executive .mc-repair-btn")).toHaveAttribute("href", "executive-support/index.html");

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
