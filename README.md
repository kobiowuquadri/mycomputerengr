# Modules Website and Sanity Blog CMS

This repository contains the static Modules website and a Sanity Studio for managing blog content without editing website code.

## 1. Install Sanity Studio

From the project root:

```bash
cd sanity-studio
npm install
```

Create a Sanity project in your Sanity account, then copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Update `.env`:

```bash
SANITY_STUDIO_PROJECT_ID=lezgayc8
SANITY_STUDIO_DATASET=production
SANITY_WRITE_TOKEN=your_sanity_write_token
```

Also update the public website config in `assets/js/sanity-config.js`:

```js
export const sanityConfig = {
  projectId: "lezgayc8",
  dataset: "production",
  apiVersion: "2026-07-08",
  useCdn: true,
  siteUrl: "https://modules.ng",
  studioUrl: "https://modules.sanity.studio",
  cacheSeconds: 300
};
```

In Sanity Manage, open `API` > `CORS origins` and add:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `https://modules.ng`

Allow credentials can stay off for the public website because it only reads published content from the CDN.

## 2. Run Sanity Studio

```bash
cd sanity-studio
npm run dev
```

The Studio opens locally at the URL shown in the terminal, usually `http://localhost:3333`.

## 3. Deploy Sanity Studio

```bash
cd sanity-studio
npm run login
npm run deploy
```

Follow the Sanity CLI prompts to choose the hosted Studio hostname. After deployment, update `studioUrl` in `assets/js/sanity-config.js` if needed.

## 4. Create Blog Posts

In Sanity Studio:

1. Create at least one `Author`.
2. Create categories such as Technology, Software, Cyber Security, AI, Cloud, Business, and Company News.
3. Create a `Blog Post`.
4. Add title, slug, featured image, excerpt, rich text body, author, category, tags, publish date, reading time, SEO fields, and status.
5. Set `Status` to `Published` when the article should appear on the website.
6. Turn on `Featured Post` for posts that should appear at the top of the Blog page.

Draft posts are ignored by the public website.

## Seed a Test Blog Post

To quickly create a test author, category, image asset, and published blog post:

1. In Sanity Manage, open the project `lezgayc8`.
2. Go to `API` > `Tokens`.
3. Create a token with write access, such as `Editor`.
4. Open `sanity-studio/.env`.
5. Replace `replace_with_sanity_write_token` with the token value.
6. Run:

```bash
cd sanity-studio
npm install
npm run seed:test
```

The script creates a published post titled `How to Reduce Business Device Downtime`.

## 5. Edit Blog Posts

Open the post in Sanity Studio, make changes, and publish the document. The website fetches published content from Sanity's CDN and caches responses briefly in the visitor's browser, so updates may take a few minutes to appear.

## 6. How Images Work

Upload images directly in Sanity Studio. The website uses Sanity Image URLs to generate optimized image sizes for:

- Thumbnails
- Blog cards
- Hero/article images
- Open Graph social images

All blog images are lazy-loaded on the public website.

## 7. Connect Another Website

To connect another static website to the same Sanity project:

1. Copy the frontend modules from `assets/js/sanity-config.js`, `sanity-client.js`, `sanity-queries.js`, `blog-utils.js`, and `sanity-blog.js`.
2. Use the same `projectId`, `dataset`, `apiVersion`, and `useCdn` settings.
3. Add the new website domain to the Sanity project's CORS origins in Sanity Manage.
4. Add containers using the same data attributes:
   - `data-blog-featured`
   - `data-blog-list`
   - `data-blog-post`
   - `data-blog-search`
   - `data-blog-category-filter`
   - `data-blog-sort`
   - `data-recent-posts`

## Frontend Notes

The website is still a plain HTML, CSS, and JavaScript site. Sanity content is loaded through ES modules and GROQ queries. No frontend build step is required for the public website.

The public site uses `useCdn: true` for fast published-content delivery. If you need instant preview of drafts, use a separate preview configuration with `useCdn: false` and authenticated requests.
