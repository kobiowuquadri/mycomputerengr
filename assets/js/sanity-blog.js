import {sanityFetch, isSanityConfigured} from "./sanity-client.js";
import {allPostsQuery, categoriesQuery, singlePostQuery} from "./sanity-queries.js";
import {
  authorName,
  blogUrl,
  categoryTitle,
  escapeHtml,
  formatDate,
  optimizedImage,
  postMeta,
  postUrl,
  renderImage,
  renderPortableText,
  updatePostSeo
} from "./blog-utils.js";

var postsPromise;
var categoriesPromise;

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function getPosts() {
  if (!postsPromise) {
    postsPromise = sanityFetch(allPostsQuery);
  }
  return postsPromise;
}

function getCategories() {
  if (!categoriesPromise) {
    categoriesPromise = sanityFetch(categoriesQuery);
  }
  return categoriesPromise;
}

function getSinglePost(slug) {
  return sanityFetch(singlePostQuery, {slug});
}

function skeletonCards(count) {
  return Array.from({length: count}).map(function () {
    return [
      '<article class="mc-blog-card mc-skeleton-card" aria-hidden="true">',
      '<span class="mc-skeleton-media"></span>',
      '<div>',
      '<span class="mc-skeleton-line mc-skeleton-line--short"></span>',
      '<span class="mc-skeleton-line"></span>',
      '<span class="mc-skeleton-line"></span>',
      '<span class="mc-skeleton-line mc-skeleton-line--tiny"></span>',
      '</div>',
      '</article>'
    ].join("");
  }).join("");
}

function stateMarkup(title, message, kind) {
  return [
    '<div class="mc-blog-state mc-blog-state--' + escapeHtml(kind || "empty") + '">',
    '<h2>' + escapeHtml(title) + '</h2>',
    '<p>' + escapeHtml(message) + '</p>',
    '</div>'
  ].join("");
}

function imageLink(post, size) {
  return [
    '<a class="mc-blog-image-link" href="' + escapeHtml(postUrl(post)) + '" aria-label="' + escapeHtml(post.title) + '">',
    renderImage(post.featuredImage, size, ""),
    '</a>'
  ].join("");
}

function postCard(post) {
  return [
    '<article class="mc-blog-card">',
    imageLink(post, {width: 520, height: 320, quality: 82}),
    '<div>',
    '<p class="mc-blog-meta">' + escapeHtml(postMeta(post)) + '</p>',
    '<h2><a href="' + escapeHtml(postUrl(post)) + '">' + escapeHtml(post.title) + '</a></h2>',
    '<p>' + escapeHtml(post.excerpt) + '</p>',
    '<a class="mc-blog-link" href="' + escapeHtml(postUrl(post)) + '">Read More</a>',
    '</div>',
    '</article>'
  ].join("");
}

function featuredCard(post) {
  return [
    '<article class="mc-blog-featured-card">',
    imageLink(post, {width: 760, height: 460, quality: 84}),
    '<div class="mc-blog-featured-copy">',
    '<p class="mc-blog-meta">' + escapeHtml(postMeta(post)) + '</p>',
    '<h2><a href="' + escapeHtml(postUrl(post)) + '">' + escapeHtml(post.title) + '</a></h2>',
    '<p>' + escapeHtml(post.excerpt) + '</p>',
    '<a class="mc-blog-link" href="' + escapeHtml(postUrl(post)) + '">Read More</a>',
    '</div>',
    '</article>'
  ].join("");
}

function filterPosts(posts, search, category, sort) {
  var term = (search || "").trim().toLowerCase();
  var filtered = posts.filter(function (post) {
    var tags = (post.tags || []).join(" ").toLowerCase();
    var categoryMatch = !category || (post.category && post.category.slug === category);
    var searchMatch = !term ||
      String(post.title || "").toLowerCase().indexOf(term) !== -1 ||
      categoryTitle(post).toLowerCase().indexOf(term) !== -1 ||
      tags.indexOf(term) !== -1;
    return categoryMatch && searchMatch;
  });

  filtered.sort(function (a, b) {
    var aTime = new Date(a.publishedAt || 0).getTime();
    var bTime = new Date(b.publishedAt || 0).getTime();
    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });

  return filtered;
}

function renderBlogIndex(posts) {
  var featured = document.querySelector("[data-blog-featured]");
  var grid = document.querySelector("[data-blog-list]");
  var search = document.querySelector("[data-blog-search]");
  var category = document.querySelector("[data-blog-category-filter]");
  var sort = document.querySelector("[data-blog-sort]");
  var count = document.querySelector("[data-blog-count]");
  if (!featured || !grid) {
    return;
  }

  var filtered = filterPosts(
    posts,
    search && search.value,
    category && category.value,
    sort && sort.value
  );

  if (count) {
    count.textContent = filtered.length + (filtered.length === 1 ? " article" : " articles");
  }

  if (!filtered.length) {
    featured.innerHTML = "";
    grid.innerHTML = stateMarkup("No articles found", "Try another search term or category.", "empty");
    return;
  }

  var lead = filtered.filter(function (post) { return post.featuredPost; })[0] || filtered[0];
  featured.innerHTML = featuredCard(lead);
  grid.innerHTML = filtered.filter(function (post) {
    return post._id !== lead._id;
  }).map(postCard).join("") || stateMarkup("No more articles", "The featured article is the only match right now.", "empty");
}

function populateCategoryFilter(categories) {
  var select = document.querySelector("[data-blog-category-filter]");
  if (!select) {
    return;
  }
  select.innerHTML = '<option value="">All Categories</option>' + categories.map(function (category) {
    return '<option value="' + escapeHtml(category.slug) + '">' + escapeHtml(category.title) + '</option>';
  }).join("");
}

async function initBlogIndex() {
  var featured = document.querySelector("[data-blog-featured]");
  var grid = document.querySelector("[data-blog-list]");
  if (!featured || !grid) {
    return;
  }

  featured.innerHTML = skeletonCards(1);
  grid.innerHTML = skeletonCards(3);

  if (!isSanityConfigured()) {
    featured.innerHTML = "";
    grid.innerHTML = stateMarkup("Connect Sanity to load articles", "Set your project ID in assets/js/sanity-config.js after creating the Sanity project.", "error");
    return;
  }

  try {
    var results = await Promise.all([getPosts(), getCategories()]);
    var posts = results[0] || [];
    var categories = results[1] || [];
    populateCategoryFilter(categories);

    if (!posts.length) {
      featured.innerHTML = "";
      grid.innerHTML = stateMarkup("No published articles yet", "Publish a blog post in Sanity Studio and it will appear here automatically.", "empty");
      return;
    }

    renderBlogIndex(posts);
    ["input", "change"].forEach(function (eventName) {
      document.querySelectorAll("[data-blog-search], [data-blog-category-filter], [data-blog-sort]").forEach(function (control) {
        control.addEventListener(eventName, function () { renderBlogIndex(posts); });
      });
    });
  } catch (error) {
    featured.innerHTML = "";
    grid.innerHTML = stateMarkup("Blog could not load", error.message || "Please try again later.", "error");
  }
}

function findSiblingPosts(posts, current) {
  var ordered = posts.slice().sort(function (a, b) {
    return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
  });
  var index = ordered.findIndex(function (post) { return post.slug === current.slug; });
  return {
    newer: index > 0 ? ordered[index - 1] : null,
    older: index !== -1 && index < ordered.length - 1 ? ordered[index + 1] : null
  };
}

function relatedPosts(posts, current) {
  var tags = current.tags || [];
  return posts.filter(function (post) {
    if (post.slug === current.slug) {
      return false;
    }
    var sameCategory = post.category && current.category && post.category._id === current.category._id;
    var sameTag = (post.tags || []).some(function (tag) { return tags.indexOf(tag) !== -1; });
    return sameCategory || sameTag;
  }).slice(0, 3);
}

function navArticle(label, post) {
  if (!post) {
    return '<span class="mc-blog-nav-disabled">' + escapeHtml(label) + '</span>';
  }
  return [
    '<a href="' + escapeHtml(postUrl(post)) + '">',
    '<span>' + escapeHtml(label) + '</span>',
    '<strong>' + escapeHtml(post.title) + '</strong>',
    '</a>'
  ].join("");
}

function shareButtons(post) {
  var url = encodeURIComponent(window.location.href);
  var title = encodeURIComponent(post.title || "myComputerENGR Blog");
  return [
    '<div class="mc-blog-share" aria-label="Share this article">',
    '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + url + '" target="_blank" rel="noreferrer noopener">LinkedIn</a>',
    '<a href="https://twitter.com/intent/tweet?url=' + url + '&text=' + title + '" target="_blank" rel="noreferrer noopener">X</a>',
    '<a href="https://wa.me/?text=' + title + '%20' + url + '" target="_blank" rel="noreferrer noopener">WhatsApp</a>',
    '</div>'
  ].join("");
}

function renderSinglePost(post, posts) {
  var root = document.querySelector("[data-blog-post]");
  if (!root) {
    return;
  }

  updatePostSeo(post);
  var siblings = findSiblingPosts(posts, post);
  var related = relatedPosts(posts, post);

  root.innerHTML = [
    '<section class="mc-blog-post-hero mc-reveal">',
    '<div class="mc-container">',
    '<p class="mc-services-eyebrow">' + escapeHtml(categoryTitle(post)) + '</p>',
    '<h1>' + escapeHtml(post.title) + '</h1>',
    '<p>' + escapeHtml(post.excerpt) + '</p>',
    '<div class="mc-blog-post-meta">' + escapeHtml(authorName(post)) + ' - ' + escapeHtml(formatDate(post.publishedAt)) + ' - ' + escapeHtml(post.readingTime || "") + '</div>',
    '</div>',
    '</section>',
    '<section class="mc-blog-post-shell mc-container mc-reveal">',
    '<article class="mc-blog-post">',
    renderImage(post.featuredImage, {width: 1180, height: 640, quality: 85}, "mc-blog-post-image"),
    '<div class="mc-blog-post-body">',
    renderPortableText(post.body),
    shareButtons(post),
    '<div class="mc-blog-post-actions">',
    '<a class="mc-repair-btn" href="' + escapeHtml(blogUrl()) + '">Back to Blog</a>',
    '</div>',
    '</div>',
    '</article>',
    '<aside class="mc-blog-sidebar" aria-label="Blog sidebar">',
    '<section><h2>Recent Posts</h2><div data-recent-posts="sidebar"></div></section>',
    '</aside>',
    '</section>',
    '<section class="mc-blog-neighbors mc-container mc-reveal" aria-label="Previous and next articles">',
    navArticle("Newer Article", siblings.newer),
    navArticle("Older Article", siblings.older),
    '</section>',
    '<section class="mc-blog-related mc-container mc-reveal">',
    '<h2>Related Posts</h2>',
    '<div class="mc-blog-grid">' + (related.length ? related.map(postCard).join("") : stateMarkup("No related posts yet", "More related articles will appear as the blog grows.", "empty")) + '</div>',
    '</section>'
  ].join("");
}

async function initSinglePost() {
  var root = document.querySelector("[data-blog-post]");
  if (!root) {
    return;
  }

  root.innerHTML = '<section class="mc-blog-grid-section mc-container">' + skeletonCards(1) + '</section>';

  if (!isSanityConfigured()) {
    root.innerHTML = stateMarkup("Connect Sanity to load this article", "Set your project ID in assets/js/sanity-config.js after creating the Sanity project.", "error");
    return;
  }

  try {
    var slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug) {
      root.innerHTML = stateMarkup("Article not found", "The article URL is missing a slug.", "error");
      return;
    }

    var results = await Promise.all([getPosts(), getSinglePost(slug)]);
    var posts = results[0] || [];
    var post = results[1];
    if (!post) {
      root.innerHTML = stateMarkup("Article not found", "The requested article is not available or has not been published.", "empty");
      return;
    }
    renderSinglePost(post, posts);
    initRecentPosts();
  } catch (error) {
    root.innerHTML = stateMarkup("Article could not load", error.message || "Please try again later.", "error");
  }
}

function recentPostLink(post, mode) {
  if (mode === "footer") {
    return '<a class="mc-recent-footer-link" href="' + escapeHtml(postUrl(post)) + '">' + escapeHtml(post.title) + '</a>';
  }
  if (mode === "sidebar") {
    return [
      '<a class="mc-recent-sidebar-link" href="' + escapeHtml(postUrl(post)) + '">',
      '<span>' + escapeHtml(formatDate(post.publishedAt)) + '</span>',
      '<strong>' + escapeHtml(post.title) + '</strong>',
      '</a>'
    ].join("");
  }
  return postCard(post);
}

async function initRecentPosts() {
  var targets = Array.prototype.slice.call(document.querySelectorAll("[data-recent-posts]"));
  if (!targets.length) {
    return;
  }

  if (!isSanityConfigured()) {
    targets.forEach(function (target) { target.innerHTML = ""; });
    return;
  }

  try {
    var posts = (await getPosts()).slice().sort(function (a, b) {
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    }).slice(0, 4);

    targets.forEach(function (target) {
      var mode = target.getAttribute("data-recent-posts") || "home";
      if (!posts.length) {
        target.innerHTML = "";
        return;
      }
      target.innerHTML = posts.map(function (post) {
        return recentPostLink(post, mode);
      }).join("");
    });
  } catch (error) {
    targets.forEach(function (target) { target.innerHTML = ""; });
  }
}

ready(function () {
  initBlogIndex();
  initSinglePost();
  initRecentPosts();
});
