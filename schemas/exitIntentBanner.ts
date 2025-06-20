import { ImageIcon } from '@sanity/icons'
import { defineType } from 'sanity'

import languages from './languages'

export default defineType({
  name: 'exitIntentPopup',
  title: 'Exit Intent Popup',
  icon: ImageIcon,
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Exit Intent Popup',
    },
    {
      name: 'active',
      title: 'Display Exit Intent Popup',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to Display Exit Intent Popup',
      validation: (rule) => rule.required(),
    },
    {
      name: 'desktopTitle',
      title: 'Desktop Title',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'desktopSubHeadline',
      title: 'Desktop Sub Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'mobileSubHeadline',
      title: 'Mobile Sub Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [
        {
          type: 'string',
          validation: (rule) => rule.required(),
        },
      ],
    },
    {
      name: 'desktopImage',
      title: 'Desktop Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'desktopImgAltText',
      title: 'Desktop Image Alt Text',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'mobileImage',
      title: 'Mobile Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'mobileImgAltText',
      title: 'Mobile Image Alt Text',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'buttonText',
      title: 'Destination Button Text',
      type: 'string',
      validation: (Rule) => Rule.required().max(20),
    },
    {
      name: 'destinationUrl',
      title: 'Destination URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({
        scheme: ['http', 'https'],
        allowRelative: false,
      }),
    },
    {
      name: 'note',
      title: 'Note',
      type: 'string',
    },
    {
      name: 'language',
      title: 'Language',
      type: 'reference',
      to: [{ type: languages.name }],
      validation: (rule) => rule.required(),
    },
  ],
})
