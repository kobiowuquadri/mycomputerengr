import {createReadStream, existsSync, readFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createClient} from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const studioRoot = resolve(__dirname, '..')
const repoRoot = resolve(studioRoot, '..')

function loadEnv() {
  const envPath = resolve(studioRoot, '.env')
  if (!existsSync(envPath)) return

  const env = readFileSync(envPath, 'utf8')
  env.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return
    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim()
    if (!process.env[key]) process.env[key] = value
  })
}

loadEnv()

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'lezgayc8'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!token || token === 'replace_with_sanity_write_token' || token === 'your_sanity_write_token') {
  throw new Error('Add a Sanity write token to sanity-studio/.env as SANITY_WRITE_TOKEN before running this script.')
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-07-08',
  useCdn: false,
  token,
})

const block = (text, style = 'normal') => ({
  _type: 'block',
  _key: Math.random().toString(36).slice(2, 10),
  style,
  markDefs: [],
  children: [
    {
      _type: 'span',
      _key: Math.random().toString(36).slice(2, 10),
      text,
      marks: [],
    },
  ],
})

async function uploadFeaturedImage() {
  const imagePath = resolve(repoRoot, 'assets/images/laptop-repair-workbench.jpg')
  if (!existsSync(imagePath)) return null

  return client.assets.upload('image', createReadStream(imagePath), {
    filename: 'laptop-repair-workbench.jpg',
    title: 'Laptop repair workbench',
  })
}

async function seed() {
  const author = await client.createIfNotExists({
    _id: 'author-mycomputerengr',
    _type: 'author',
    name: 'myComputerENGR Team',
    role: 'Business Device Support Team',
    bio: 'Practical technology support insights from the myComputerENGR team.',
  })

  const category = await client.createIfNotExists({
    _id: 'category-technology',
    _type: 'category',
    title: 'Technology',
    slug: {_type: 'slug', current: 'technology'},
    description: 'Technology support, repairs, and business device care.',
  })

  const imageAsset = await uploadFeaturedImage()
  const featuredImage = imageAsset
    ? {
        _type: 'image',
        asset: {_type: 'reference', _ref: imageAsset._id},
        alt: 'Laptop repair workbench at myComputerENGR',
        caption: 'Preventive business device support keeps teams productive.',
      }
    : undefined

  await client.createOrReplace({
    _id: 'blogPost-test-business-device-downtime',
    _type: 'blogPost',
    title: 'How to Reduce Business Device Downtime',
    slug: {_type: 'slug', current: 'reduce-business-device-downtime'},
    featuredImage,
    excerpt: 'A practical guide to reducing laptop and smartphone downtime across a growing business.',
    body: [
      block('Business devices fail at the worst time when there is no clear support process. A few simple checks can reduce avoidable disruption.'),
      block('Start with preventive checks', 'h2'),
      block('Review battery health, storage space, backup status, charger condition, operating system updates, and signs of overheating before they become emergencies.'),
      block('Create a fast response path', 'h2'),
      block('Your team should know who to contact, what information to share, and how quickly an engineer can inspect the device. This shortens downtime and protects productivity.'),
    ],
    author: {_type: 'reference', _ref: author._id},
    category: {_type: 'reference', _ref: category._id},
    tags: ['business devices', 'maintenance', 'productivity'],
    publishedAt: new Date().toISOString(),
    readingTime: '4 min read',
    featuredPost: true,
    seoTitle: 'How to Reduce Business Device Downtime',
    seoDescription: 'Learn practical ways to reduce laptop and smartphone downtime across your business.',
    openGraphImage: featuredImage,
    status: 'published',
  })

  console.log('Seed complete: published test blog post "How to Reduce Business Device Downtime".')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
