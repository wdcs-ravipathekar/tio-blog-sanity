import { TagIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
  name: 'tag',
  title: 'Tags',
  icon: TagIcon,
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'market',
      title: 'Market',
      type: 'string'
    }
  ],
})
