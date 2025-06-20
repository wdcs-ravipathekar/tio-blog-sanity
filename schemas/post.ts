import { BookIcon } from '@sanity/icons'
import { BsTextCenter, BsTextLeft, BsTextRight } from 'react-icons/bs'
import { defineType } from 'sanity'

import authorType from './author'
import categoryType from './categoryType'
import languages from './languages'
import tag from './tag'
/**
 * This file is the schema definition for a post.
 *
 * Here you'll be able to edit the different fields that appear when you 
 * create or edit a post in the studio.
 * 
 * Here you can see the different schema types that are available:

  https://www.sanity.io/docs/schema-types

 */

export default defineType({
  name: 'post',
  title: 'Post',
  icon: BookIcon,
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',

          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strikethrough', value: 'strike-through' },
              { title: 'Code', value: 'code' },
              { title: 'LeftText', value: 'left-text', icon: BsTextLeft },
              { title: 'CenterText', value: 'center-text', icon: BsTextCenter },
              { title: 'RightText', value: 'right-text', icon: BsTextRight },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                  },
                ],
              },

              {
                name: 'internalLink',
                type: 'object',
                title: 'Internal link',
                fields: [
                  {
                    name: 'reference',
                    type: 'reference',
                    to: [
                      { type: 'post' },
                      // other types you may want to link to
                    ],
                    options: {
                      slug: 'slug',
                    },
                  },
                ],
              },
            ],
          },
        },

        {
          name: 'table',
          title: 'Table',
          type: 'table',
          icon: BookIcon,
        },
        {
          type: 'image',
          options: {
            hotspot: true, // Enable hotspot to crop the image if needed
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Alternative text for the image (for accessibility)',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'textBelowImage',
              type: 'text',
              title: 'Text Below Image',
              description: 'Add text to display below the image',
            },
          ],
        },
        {
          name: 'Banner',
          type: 'image',
          fields: [
            {
              name: 'link',
              type: 'url',
              options: {},
            },
          ],
        },
        {
          type: 'object',
          name: 'youtube',
          title: 'YouTube Video',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'YouTube Video URL',
            },
          ],
        },
        {
          name: 'Banners',
          type: 'object',
          title: 'Banners',
          fields: [
            {
              name: 'DesktopImage',
              title: 'Desktop Image',
              type: 'image',
              options: {},
            },
            {
              name: 'MobileImage',
              title: 'Mobile Image',
              type: 'image',
              options: {},
            },
            {
              name: 'link',
              type: 'url',
              options: {},
            },
          ],
        },
      ],
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: categoryType.name }],
      validation: (rule) => rule.required(),
    },
    {
      name: 'tag',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: tag.name },
        },
      ],
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: authorType.name }],
      validation: (rule) => rule.required(),
    },
    {
      name: 'isPopular',
      title: 'Is Popular',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'language',
      title: 'Language',
      type: 'reference',
      to: [{ type: languages.name }],
      validation: (rule) => rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    },
    {
      name: 'emailAnnouncement',
      title: 'Send Email',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'riskDisclaimer',
      title: 'Risk Disclaimer',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to show risk disclaimer',
    },
    {
      name: 'displayRightColumn',
      title: 'Display Right Column',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to display or hide the right column'
    },
    {
      name: 'blogPostBanner',
      title: 'Blog Post Banner',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle to show blog post banner',
    },
  ],
  //
  //:dims:
  // preview: {
  //   select: {
  //     title: 'title',
  //     author: 'author.name',
  //     media: 'coverImage',
  //   },
  //   prepare(selection) {
  //     const { author } = selection
  //     return { ...selection, subtitle: author && `by ${author}` }
  //   },
  // },
})
