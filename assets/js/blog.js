(function () {
  var posts = window.mcBlogPosts || [];

  function isInPages() {
    return window.location.pathname.indexOf("/pages/") !== -1;
  }

  function assetPath(path) {
    return (isInPages() ? "../assets/" : "assets/") + path;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function postUrl(post) {
    return "single-blog.html?slug=" + encodeURIComponent(post.slug);
  }

  function postCard(post) {
    return [
      '<article class="mc-blog-card">',
      '<a class="mc-blog-image-link" href="' + postUrl(post) + '" aria-label="' + escapeHtml(post.title) + '">',
      '<img src="' + assetPath(post.image) + '" alt="' + escapeHtml(post.alt) + '" loading="lazy" decoding="async">',
      '</a>',
      '<div>',
      '<p class="mc-blog-meta">' + escapeHtml(post.category) + ' - ' + escapeHtml(post.readTime) + '</p>',
      '<h2><a href="' + postUrl(post) + '">' + escapeHtml(post.title) + '</a></h2>',
      '<p>' + escapeHtml(post.excerpt) + '</p>',
      '<a class="mc-blog-link" href="' + postUrl(post) + '">Read Article</a>',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderBlogIndex() {
    var featured = document.querySelector("[data-blog-featured]");
    var grid = document.querySelector("[data-blog-list]");
    if (!featured || !grid || !posts.length) {
      return;
    }

    var lead = posts[0];
    featured.innerHTML = [
      '<article class="mc-blog-featured-card">',
      '<a class="mc-blog-image-link" href="' + postUrl(lead) + '" aria-label="' + escapeHtml(lead.title) + '">',
      '<img src="' + assetPath(lead.image) + '" alt="' + escapeHtml(lead.alt) + '" loading="lazy" decoding="async">',
      '</a>',
      '<div class="mc-blog-featured-copy">',
      '<p class="mc-blog-meta">' + escapeHtml(lead.category) + ' - ' + escapeHtml(lead.readTime) + '</p>',
      '<h2><a href="' + postUrl(lead) + '">' + escapeHtml(lead.title) + '</a></h2>',
      '<p>' + escapeHtml(lead.excerpt) + '</p>',
      '<a class="mc-blog-link" href="' + postUrl(lead) + '">Read Article</a>',
      '</div>',
      '</article>'
    ].join("");

    grid.innerHTML = posts.slice(1).map(postCard).join("");
  }

  function findPost(slug) {
    return posts.filter(function (post) {
      return post.slug === slug;
    })[0];
  }

  function updateMeta(post) {
    document.title = post.title + " | myComputerENGR Blog";
    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", post.excerpt);
    }
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", "https://mycomputerengr.ng/pages/single-blog.html?slug=" + encodeURIComponent(post.slug));
    }
  }

  function renderSinglePost() {
    var root = document.querySelector("[data-blog-post]");
    if (!root) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var firstPost = posts.length ? posts[0].slug : "";
    var post = findPost(params.get("slug") || firstPost);
    if (!post) {
      root.innerHTML = [
        '<section class="mc-blog-post-hero mc-reveal">',
        '<div class="mc-container">',
        '<p class="mc-services-eyebrow">Blog</p>',
        '<h1>Article Not Found</h1>',
        '<p>The article you are looking for is not available.</p>',
        '<a class="mc-repair-btn" href="blog.html">Back to Blog</a>',
        '</div>',
        '</section>'
      ].join("");
      return;
    }

    updateMeta(post);
    root.innerHTML = [
      '<section class="mc-blog-post-hero mc-reveal">',
      '<div class="mc-container">',
      '<p class="mc-services-eyebrow">' + escapeHtml(post.category) + '</p>',
      '<h1>' + escapeHtml(post.title) + '</h1>',
      '<p>' + escapeHtml(post.excerpt) + '</p>',
      '<div class="mc-blog-post-meta">' + escapeHtml(post.date) + ' - ' + escapeHtml(post.readTime) + '</div>',
      '</div>',
      '</section>',
      '<article class="mc-blog-post mc-container mc-reveal">',
      '<img class="mc-blog-post-image" src="' + assetPath(post.image) + '" alt="' + escapeHtml(post.alt) + '" loading="lazy" decoding="async">',
      '<div class="mc-blog-post-body">',
      post.body.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join(""),
      '<div class="mc-blog-post-actions">',
      '<a class="mc-repair-btn" href="' + escapeHtml(post.ctaHref) + '">' + escapeHtml(post.ctaLabel) + '</a>',
      '<a class="mc-blog-link" href="blog.html">Back to Blog</a>',
      '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderBlogIndex();
    renderSinglePost();
  });
}());
