import { htmlToBlocks } from '@sanity/block-tools';
import { SanityClient } from '@sanity/client';
import { Schema } from '@sanity/schema';
// import axios from 'axios';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

import { CsvData, PostDetails, ReferenceDetails } from '../types';
import { createSanityClient } from '../lib/createSanityClient';

/**
 * Function to map content, like, paragraph, headings, image of the post and modify the post details object
 * @param {Object} body content body
 * @param {Object} postDetailsObj post details object to add post in sanity
 */
const convertHtmlToBlocks = (body: string, postDetailsObj: PostDetails) => {
  // This schema is taken from the post schema defined in sanity
  // It only refers to the "content" field of the post schema
  // If anything changes in post schema then need to be updated here also and test to check if CSV upload doesn't get any issue
  const defaultSchema = Schema.compile({
    name: 'blog',
    types: [
      {
        type: 'object',
        name: 'post',
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
                    { title: 'LeftText', value: 'left-text' },
                    { title: 'CenterText', value: 'center-text' },
                    { title: 'RightText', value: 'right-text' },
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
              // {
              //   name: 'table',
              //   title: 'Table',
              //   type: 'table',
              //   icon: BookIcon,
              // },
              {
                type: 'image',
                options: {
                  hotspot: true,
                },
                fields: [
                  {
                    name: 'alt',
                    type: 'string',
                    title: 'Alternative Text',
                    description:
                      'Alternative text for the image (for accessibility)',
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
        ],
      },
    ],
  })

  // The compiled schema type for the content type that holds the block array
  const blockContentType = defaultSchema
    .get('post')
    .fields.find((field) => field.name === 'content').type;

  // Convert HTML to block array
  const blocks = htmlToBlocks(
    `<html><body>${body}</body></html>`,
    blockContentType,
    {
      parseHtml: (html) => new JSDOM(html).window.document,
    }
  );
  postDetailsObj['content'] = blocks;
}

/**
 * Function to update author details, if not fetched already then fetch and update in post details object
 * @param {Object} author author name
 * @param {Object} authorDetails contains author's sanity id
 * @param {Object} postDetailsObj post details object to add post in sanity
 * @param {Object} sanityClient Sanity client config object
 */
const fetchAndUpdateAuthorDetails = async (
  author: string,
  authorDetails: Record<string, string>,
  postDetailsObj: PostDetails,
  sanityClient: SanityClient
) => {
  console.log("🚀 ~ fetchAndUpdateAuthorDetails:")

  // Finding author's sanity id if already fetched author details before
  if (authorDetails[author]) {
    postDetailsObj['author'] = {
      _ref: authorDetails[author],
      _type: 'reference',
    };
    return postDetailsObj;
  }

  // Query to fetch author details
  const query = `*[_type == "author" && name == $author][0]{
    _id, name
  }`;

  // Fertching author details
  const res = await createSanityClient("staging").fetch(query, { author });

  // If author details not found then throwing error
  if (!res) throw { message: 'Author details not found' };

  // If author details found then adding the details in authorDetails obj
  authorDetails[author] = res._id;

  // Adding author reference details in post details
  postDetailsObj['author'] = {
    _ref: res._id,
    _type: 'reference',
  };
  return postDetailsObj;
}

/**
 * Function to update language details, if not fetched already then fetch and update in post details object
 * @param {Object} language language in which post is written
 * @param {Object} languageDetails contains language's sanity id
 * @param {Object} postDetailsObj post details object to add post in sanity
 * @param {Object} sanityClient Sanity client config object
 */
const fetchAndUpdateLanguageDetails = async (
  language: string,
  languageDetails: Record<string, string>,
  postDetailsObj: PostDetails,
  sanityClient: SanityClient
) => {
  console.log("🚀 ~ fetchAndUpdateLanguageDetails:")

  // Finding language's sanity id if already fetched language details before
  if (languageDetails[language]) {
    postDetailsObj['language'] = {
      _ref: languageDetails[language],
      _type: 'reference',
    };
    return postDetailsObj;
  }

  // Query to fetch language details
  const query = `*[_type == "languages" && language == $language][0]{
    _id, language
  }`;

  // Fertching language details
  const res = await createSanityClient("staging").fetch(query, { language });

  // If language details not found then throwing error
  if (!res) throw { message: 'Language details not found' };

  // If language details found then adding the details in languageDetails obj
  languageDetails[language] = res._id;

  // Adding language reference details in post details
  postDetailsObj['language'] = {
    _ref: res._id,
    _type: 'reference',
  };
  return postDetailsObj;
}

/**
 * Function to update category details, if not fetched already then fetch and update in post details object
 * @param {Object} category category name
 * @param {Object} categoryDetails contains category's sanity id
 * @param {Object} postDetailsObj post details object to add post in sanity
 * @param {Object} sanityClient Sanity client config object
 */
const fetchAndUpdateCategoryDetails = async (
  category: string,
  categoryDetails: Record<string, string>,
  postDetailsObj: PostDetails,
  sanityClient: SanityClient
) => {
  console.log("🚀 ~ fetchAndUpdateCategoryDetails:")

  // Finding category's sanity id if already fetched category details before
  if (categoryDetails[category]) {
    postDetailsObj['category'] = {
      _ref: categoryDetails[category],
      _type: 'reference',
    };
    return postDetailsObj;
  }

  // Query to fetch category details
  const query = `*[_type == "category" && name == $category][0]{
    _id, name
  }`;

  // Fertching category details
  const res = await createSanityClient("staging").fetch(query, { category });

  // If category details not found then throwing error
  if (!res) throw { messag: 'Category details not found' };

  // If category details found then adding the details in categoryDetails obj
  categoryDetails[category] = res._id;

  // Adding category reference details in post details
  postDetailsObj['category'] = {
    _ref: res._id,
    _type: 'reference',
  };
  return postDetailsObj;
}

/**
 * Function to upload images in sanity if already uploaded then return the image's sanity id
 * @param {Object} imageUrl author name
 * @param {Object} imageDetails contains author's sanity id
 * @param {Object} sanityClient Sanity client config object
 * @returns {Object} image's sanity id
 */
const uploadAndGetImageIdDetails = async (
  imageUrl: string,
  imageDetails: Record<string, string>,
  sanityClient: SanityClient

): Promise<string> => {
  console.log("🚀 ~ uploadAndGetImageIdDetails:")

  try {
    // Checking details if already uploaded to sanity
    if (imageDetails[imageUrl]) return imageDetails[imageUrl];

    // Getting image stream data from image url
    console.time("fetchImageData");
    const imageData = await fetch(imageUrl);
    const imageStream = imageData.body;
    console.timeEnd("fetchImageData");
    console.log();

    // Uploading the image to sanity to get sanity id
    const assetDocument = await createSanityClient("staging").assets.upload(
      'image',
      imageStream,
      {
        timeout: 60000, // 60 seconds timeout
      }
    );

    // Adding the details in imageDetails obj
    imageDetails[imageUrl] = assetDocument._id;

    // Returning the sanity image id
    return assetDocument._id;
  } catch (error) {
    console.log("error: (upload image error)", error)
    throw { message: 'Something went wrong while uploading image to Sanity' };
  }
}

/**
 * Function to map request data according to the sanity post schema
 * @param {Object} data request body
 * @param {Object} sanityClient Sanity client config object
 * @param {Object} referenceDetails contains objects for author, category, language, image reference id details
 * @returns {Object} postDetaulsObj - contains mapped data according to sanity schema
 */
export const mapDataToDefinedSchema = async (
  data: CsvData,
  sanityClient: SanityClient,
  referenceDetails: ReferenceDetails,
): Promise<PostDetails> => {
  console.log("🚀 ~ mapDataToDefinedSchema:")
  const {
    Body: body,
    Meta: description,
    Title: title,
    Author: author,
    Language: language,
    Category: category,
    'URL Slug': slug,
    'Image - Assets': coverImage,
    'Risk Disclaimer': riskDisclaimer,
    'Blog Post Banner': blogPostBanner,
  } = data;
  const { authorDetails, languageDetails, categoryDetails, imageDetails } = referenceDetails;

  const postDetailsObj: PostDetails = {
    _type: 'post',
    title,
    slug: {
      current: slug,
      _type: 'slug',
    },
    description,
    date: new Date(),
    riskDisclaimer,
    blogPostBanner
  };

  try {
    // Mapping post content
    console.time("convertHtmlToBlocks");
    convertHtmlToBlocks(body, postDetailsObj);
    console.timeEnd("convertHtmlToBlocks");
    console.log();

    // await Promise.all([
      // Fetching and updating author details
    console.time("fetchAndUpdateAuthorDetails");
    await fetchAndUpdateAuthorDetails(author, authorDetails, postDetailsObj, sanityClient);
    console.timeEnd("fetchAndUpdateAuthorDetails");
    console.log();

    // Fetching and updating category details
    console.time("fetchAndUpdateCategoryDetails");
    await fetchAndUpdateCategoryDetails(category, categoryDetails, postDetailsObj, sanityClient);
    console.timeEnd("fetchAndUpdateCategoryDetails");
    console.log();

    // Fetching and updating language details
    console.time("fetchAndUpdateLanguageDetails");
    await fetchAndUpdateLanguageDetails(language, languageDetails, postDetailsObj, sanityClient);
    console.timeEnd("fetchAndUpdateLanguageDetails");
    // ]);
    console.log();

    // uploading image to the sanity and getting sanity id of the image for reference
    console.time("uploadAndGetImageIdDetails");
    const imageId = await uploadAndGetImageIdDetails(coverImage, imageDetails, sanityClient);
    console.timeEnd("uploadAndGetImageIdDetails");
    console.log();

    postDetailsObj['coverImage'] = {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageId,
      },
    };
    return postDetailsObj;
  } catch (error) {
    throw { message: `${error.message || error || 'Something went wrong while adding post'}` };
  }
}
