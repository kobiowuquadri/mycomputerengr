const imageFields = `
  alt,
  caption,
  "assetRef": asset._ref,
  "lqip": asset->metadata.lqip
`;

const authorFields = `
  _id,
  name,
  role,
  bio,
  "image": image{
    ${imageFields}
  }
`;

export const postCardFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  readingTime,
  featuredPost,
  tags,
  seoTitle,
  seoDescription,
  "category": category->{
    _id,
    title,
    "slug": slug.current
  },
  "author": author->{
    ${authorFields}
  },
  "featuredImage": featuredImage{
    ${imageFields}
  },
  "openGraphImage": openGraphImage{
    ${imageFields}
  }
`;

export const allPostsQuery = `
  *[_type == "blogPost" && status == "published"]
  | order(featuredPost desc, publishedAt desc) {
    ${postCardFields}
  }
`;

export const categoriesQuery = `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`;

export const singlePostQuery = `
  *[_type == "blogPost" && status == "published" && (_id == $id || slug.current == $slug)][0] {
    ${postCardFields},
    body[]{
      ...,
      _type == "image" => {
        ${imageFields}
      }
    }
  }
`;
