import { BellIcon } from '@sanity/icons'
import { defineType } from 'sanity'

import languages from './languages'

export default defineType({
  name: 'notification',
  title: 'Notification',
  icon: BellIcon,
  type: 'document',
  fields: [
    {
      name: 'Title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'Description',
      title: 'Description',
      type: 'string',
      validation: (rule) => rule.required(),
    },
    {
      name: 'Image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'LearnMoreURL',
      title: 'Learn More URL',
      type: 'url',
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ['http', 'https'],
          allowRelative: false,
        }),
    },
    {
      name: 'language',
      title: 'Language',
      type: 'reference',
      to: [{ type: languages.name }],
      validation: (rule) => rule.required(),
    },
    {
      name: 'allowOnRegistering',
      title: 'Allow Notification While Registering',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle to allow notification during registration',
      validation: (rule) => rule.required(),
    },
    {
      name: 'allowOnMobileView',
      title: 'Allow Notification on Mobile View',
      type: 'boolean',
      initialValue: false,
      description: 'Toggle to allow notification on mobile view',
      validation: (rule) => rule.required(),
    }
  ],
  preview: {
    select: {
      title: 'language.language',
      subtitle: 'Title',
      media: 'Image',
    },
  },
})
