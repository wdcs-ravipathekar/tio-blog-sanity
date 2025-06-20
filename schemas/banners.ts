import { ImageIcon } from '@sanity/icons'
import { defineType } from 'sanity'

import languages from './languages'

export default defineType({
  name: 'banners',
  title: 'Banners',
  icon: ImageIcon,
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Banners',
    },
    {
      name: 'firstBanner',
      type: 'image',
      fields: [
        {
          name: 'destinationUrl',
          title: 'Destination URL',
          type: 'url',
          validation: (Rule) => Rule.required().uri({
            scheme: ['http', 'https'],
            allowRelative: false,
          }),
          options: {},
        },
        {
          name: 'active',
          title: 'Display First Banner',
          type: 'boolean',
          initialValue: true,
          description: 'Toggle to Display First Banner',
        },
      ],
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('First Banner image is required'),
    },
    {
      name: 'secondBanner',
      type: 'image',
      fields: [
        {
          name: 'destinationUrl',
          title: 'Destination URL',
          type: 'url',
          validation: (Rule) => Rule.required().uri({
            scheme: ['http', 'https'],
            allowRelative: false,
          }),
          options: {},
        },
        {
          name: 'active',
          title: 'Display Second Banner',
          type: 'boolean',
          initialValue: true,
          description: 'Toggle to Display Second Banner',
        },
      ],
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('Second Banner image is required'),
    },
    {
      name: 'thirdBanner',
      type: 'image',
      fields: [
        {
          name: 'destinationUrl',
          title: 'Destination URL',
          type: 'url',
          validation: (Rule) => Rule.required().uri({
            scheme: ['http', 'https'],
            allowRelative: false,
          }),
          options: {},
        },
        {
          name: 'active',
          title: 'Display Third Banner',
          type: 'boolean',
          initialValue: true,
          description: 'Toggle to Display Third Banner',
        },
      ],
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error('Third Banner image is required'),
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
