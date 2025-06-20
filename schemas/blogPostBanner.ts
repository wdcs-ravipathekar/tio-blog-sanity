import { BookIcon,ImageIcon } from '@sanity/icons';
import { BsTextCenter, BsTextLeft, BsTextRight } from 'react-icons/bs'
import { defineType } from 'sanity';

export default defineType({
  name: 'blogPostBanner',
  title: 'Blog Post Banner',
  icon: ImageIcon,
  type: 'document',
  fields: [
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
      name: 'language',
      title: 'Language',
      type: 'reference',
      to: [{ type: 'languages' }],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'language.language',
    },
  },
});
