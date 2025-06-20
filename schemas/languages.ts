import { EarthGlobeIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
  name: 'languages',
  title: 'Languages',
  icon: EarthGlobeIcon,
  type: 'document',
  fields: [
    {
      name: 'language',
      title: 'Language',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'iso',
      title: 'ISO Code',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
  ],
})
