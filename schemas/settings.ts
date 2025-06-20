import { CogIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    {
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: 'Blog.',
      validation: (rule) => rule.required(),
    },
    {
      name: 'description',
      description: 'This field is the description of your blog.',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    },
  ],
})
