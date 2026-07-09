import {imageUrl, sanityConfig} from "./sanity-client.js";

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function rootPrefix() {
  var pathname = window.location.pathname.replace(/\/+$/, "");
  var parts = pathname.split("/").filter(Boolean);
  if (!parts.length) {
    return "";
  }
  var last = parts[parts.length - 1];
  var depth = last.indexOf(".") !== -1 ? parts.length - 1 : parts.length;
  return depth ? new Array(depth + 1).join("../") : "";
}

export function pathFromRoot(path) {
  return rootPrefix() + path;
}

export function postUrl(post) {
  return pathFromRoot("pages/single-blog.html") + "?slug=" + encodeURIComponent(post.slug || "");
}

export function blogUrl() {
  return pathFromRoot("pages/blog.html");
}

export function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function categoryTitle(post) {
  return post && post.category && post.category.title ? post.category.title : "Blog";
}

export function authorName(post) {
  return post && post.author && post.author.name ? post.author.name : "myComputerENGR";
}

export function postMeta(post) {
  return [
    categoryTitle(post),
    formatDate(post.publishedAt),
    post.readingTime,
    authorName(post)
  ].filter(Boolean).join(" - ");
}

export function optimizedImage(image, size) {
  return imageUrl(image, size) || pathFromRoot("assets/images/laptop-repair-workbench.jpg");
}

export function renderImage(image, size, className) {
  return '<img' +
    (className ? ' class="' + escapeHtml(className) + '"' : "") +
    ' src="' + escapeHtml(optimizedImage(image, size)) + '"' +
    ' alt="' + escapeHtml((image && image.alt) || "Blog image") + '"' +
    ' loading="lazy" decoding="async">';
}

export function setMeta(nameOrProperty, content, isProperty) {
  if (!content) {
    return;
  }
  var selector = isProperty ? 'meta[property="' + nameOrProperty + '"]' : 'meta[name="' + nameOrProperty + '"]';
  var meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(isProperty ? "property" : "name", nameOrProperty);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function setCanonical(url) {
  var canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);
}

export function updatePostSeo(post) {
  var title = post.seoTitle || post.title || "Blog Article";
  var description = post.seoDescription || post.excerpt || "Read practical business device support guidance from myComputerENGR.";
  var url = sanityConfig.siteUrl.replace(/\/+$/, "") + "/pages/single-blog.html?slug=" + encodeURIComponent(post.slug);
  var socialImage = optimizedImage(post.openGraphImage || post.featuredImage, {width: 1200, height: 630, quality: 85});

  document.title = title + " | myComputerENGR";
  setMeta("description", description);
  setCanonical(url);
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:url", url, true);
  setMeta("og:type", "article", true);
  setMeta("og:image", socialImage, true);
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", socialImage);
}

function marksForBlock(block) {
  return (block.markDefs || []).reduce(function (lookup, mark) {
    lookup[mark._key] = mark;
    return lookup;
  }, {});
}

function renderSpan(span, markDefs) {
  var text = escapeHtml(span.text || "");
  (span.marks || []).forEach(function (mark) {
    var definition = markDefs[mark];
    if (mark === "strong") {
      text = "<strong>" + text + "</strong>";
    } else if (mark === "em") {
      text = "<em>" + text + "</em>";
    } else if (mark === "code") {
      text = "<code>" + text + "</code>";
    } else if (mark === "underline") {
      text = "<u>" + text + "</u>";
    } else if (definition && definition._type === "link" && definition.href) {
      text = '<a href="' + escapeHtml(definition.href) + '" target="_blank" rel="noreferrer noopener">' + text + "</a>";
    }
  });
  return text;
}

function renderBlock(block) {
  if (block._type === "image") {
    return [
      '<figure class="mc-rich-image">',
      renderImage(block, {width: 920, quality: 82}, ""),
      block.caption ? '<figcaption>' + escapeHtml(block.caption) + '</figcaption>' : "",
      '</figure>'
    ].join("");
  }

  var markDefs = marksForBlock(block);
  var content = (block.children || []).map(function (span) {
    return renderSpan(span, markDefs);
  }).join("");
  var style = block.style || "normal";
  if (style === "h2" || style === "h3") {
    return "<" + style + ">" + content + "</" + style + ">";
  }
  if (style === "blockquote") {
    return "<blockquote>" + content + "</blockquote>";
  }
  return "<p>" + content + "</p>";
}

export function renderPortableText(blocks) {
  var html = [];
  var listBuffer = [];
  var listType = "";

  function flushList() {
    if (!listBuffer.length) {
      return;
    }
    var tag = listType === "number" ? "ol" : "ul";
    html.push("<" + tag + ">" + listBuffer.join("") + "</" + tag + ">");
    listBuffer = [];
    listType = "";
  }

  (blocks || []).forEach(function (block) {
    if (block.listItem) {
      var nextType = block.listItem === "number" ? "number" : "bullet";
      if (listType && listType !== nextType) {
        flushList();
      }
      listType = nextType;
      var markDefs = marksForBlock(block);
      listBuffer.push("<li>" + (block.children || []).map(function (span) {
        return renderSpan(span, markDefs);
      }).join("") + "</li>");
      return;
    }

    flushList();
    html.push(renderBlock(block));
  });
  flushList();
  return html.join("");
}
