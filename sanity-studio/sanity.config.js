import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index.js'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'lezgayc8'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'mycomputerengr',
  title: 'myComputerENGR CMS',
  projectId,
  dataset,
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
