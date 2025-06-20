/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { crossDatasetDuplicator } from '@sanity/cross-dataset-duplicator'
import { table } from '@sanity/table'
import { visionTool } from '@sanity/vision'
import { defineConfig, definePlugin,Slug } from 'sanity'
import { deskTool } from 'sanity/desk'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'

import CSVUpload from './components/CSVUpload/CSVUpload';
import { PostsPreview } from './components/Posts/PostsPreview'
import authorType from './schemas/author'
import bannersType from './schemas/banners'
import blogPostBanner from './schemas/blogPostBanner'
import categoryType from './schemas/categoryType'
import exitIntentType from './schemas/exitIntentBanner'
import languages from './schemas/languages'
import notification from './schemas/notification'
import postType from './schemas/post'
import riskDisclaimer from './schemas/riskDisclaimer'
import settingsType from './schemas/settings'
import tag from './schemas/tag'

// @TODO: update next-sanity/studio to automatically set this when needed
const basePath = '/studio'

const sharedConfig = definePlugin({
  name: 'sharedConfig',
  schema: {
    // If you want more content types, you can add them to this array
    types: [settingsType, postType, authorType, categoryType, tag, languages, riskDisclaimer, bannersType, exitIntentType, notification, blogPostBanner],
  },
  plugins: [
    deskTool({
      structure: (S) => {
        // The `Settings` root list item
        const settingsListItem = // A singleton not using `documentListItem`, eg no built-in preview
          S.listItem()
            .title(settingsType.title)
            .icon(settingsType.icon)
            .child(
              S.editor()
                .id(settingsType.name)
                .schemaType(settingsType.name)
                .documentId(settingsType.name)
            )

        // The default root list items (except custom ones)
        const defaultListItems = S.documentTypeListItems().filter(
          (listItem) => listItem.getId() !== settingsType.name
        )

        return S.list()
          .title('Content')
          .items([settingsListItem, S.divider(), ...defaultListItems])
      },

      // `defaultDocumentNode is responsible for adding a “Preview” tab to the document pane
      // You can add any React component to `S.view.component` and it will be rendered in the pane
      // and have access to content in the form in real-time.
      // It's part of the Studio's “Structure Builder API” and is documented here:
      // https://www.sanity.io/docs/structure-builder-reference
      defaultDocumentNode: (S, { schemaType }) => {
        if (schemaType === 'post') {
          return S.document().views([
            S.view.form(),
            S.view.component(PostsPreview).title('Preview'),

            // This component will only display when creating new posts
            window.location.href.includes("template") && S.view.component(CSVUpload).title('CSV Upload'),
          ])
        }

        return null
      },
    }),
    crossDatasetDuplicator({
      // Required settings to show document action
      types: ['author'],
      // Optional settings
      tool: true,

      follow: ['inbound'],
    }),
    table(),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({
      defaultApiVersion: '2022-08-08',
    }),
  ],
  document: {
    productionUrl: async (prev, { document }) => {
      const url = new URL('/api/preview', location.origin)
      const secret = process.env.NEXT_PUBLIC_PREVIEW_SECRET
      if (secret) {
        url.searchParams.set('secret', secret)
      }

      try {
        switch (document._type) {
          case settingsType.name:
            break
          case postType.name:
            url.searchParams.set('slug', (document.slug as Slug).current!)
            break
          default:
            return prev
        }
        return url.toString()
      } catch {
        return prev
      }
    },
    // Hide 'Settings' from new document options
    // https://user-images.githubusercontent.com/81981/195728798-e0c6cf7e-d442-4e58-af3a-8cd99d7fcc28.png
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (templateItem) => templateItem.templateId !== settingsType.name
        )
      }

      return prev
    },
    // Removes the "duplicate" action on the "settings" singleton
    actions: (prev, { schemaType }) => {
      if (schemaType === settingsType.name) {
        return prev.filter(({ action }) => action !== 'duplicate')
      }

      return prev
    },
  },
})

export default defineConfig([
  {
    name: 'staging',
    basePath: '/studio/staging',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'staging',
    title: 'Staging',
    plugins: [sharedConfig()],
  },
  {
    name: 'Production',
    basePath: '/studio/production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production',
    title: 'Production',
    plugins: [sharedConfig()],
  },
])
