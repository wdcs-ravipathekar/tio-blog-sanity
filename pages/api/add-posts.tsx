import { waitUntil } from "@vercel/functions";
import Joi from 'joi';
import papaparse from 'papaparse';

import { createSanityClient } from '../../lib/createSanityClient';
import { mapDataToDefinedSchema } from '../../services/add-posts';
import { sendAddPostaReportMail } from '../../services/email.service';
import { ErrorDetails,ReqBody} from '../../types';

// Validation schema
const userSchema = Joi.object({
  'Body (Markdown)': Joi.string().allow(null, ''),
  'Body (Plaintext)': Joi.string().allow(null, ''),
  'CTA': Joi.string().allow(null, ''),
  'Edited?': Joi.boolean().allow(null, ''),
  'Format': Joi.string().allow(null, ''),
  'Headings': Joi.string().allow(null, ''),
  'Image - Colour Scheme': Joi.string().allow(null, ''),
  'Image - Number': Joi.number().optional(),
  'Keyword': Joi.string().allow(null, ''),
  'Length - Target': Joi.number().optional(),
  'List Items': Joi.string().allow(null, ''),
  'Mode': Joi.string().allow(null, ''),
  'Project': Joi.string().allow(null, ''),
  'Prompts': Joi.string().allow(null, ''),
  'Regenerated': Joi.boolean().optional(),
  'Social - Facebook/IG': Joi.string().allow(null, ''),
  'Social - LinkedIn': Joi.string().allow(null, ''),
  'Table of Contents': Joi.string().allow(null, ''),
  'Tone of Voice': Joi.string().allow(null, ''),
  'Social - Twitter': Joi.string().allow(null, ''),
  'Undetectable': Joi.boolean().optional(),
  Body: Joi.string().trim().required(),
  Meta: Joi.string().trim().required(),
  Title: Joi.string().trim().required(),
  Author: Joi.string().trim().required(),
  Language: Joi.string().trim().required(),
  Category: Joi.string().trim().required(),
  'URL Slug': Joi.string().trim().max(96).required(),
  'Image - Assets': Joi.string().trim().required(),
  'Risk Disclaimer': Joi.boolean().required().default(true),
  'Blog Post Banner': Joi.boolean().required().default(true),
});

/**
 * Function to handle post creation
 * @param {Object} reqBody Array of object containing parsed CSV data
 */
const handlePostCreation = async (reqBody: ReqBody) => {
  const authorDetails: Record<string, string> = {};
  const languageDetails: Record<string, string> = {};
  const categoryDetails: Record<string, string> = {};
  const imageDetails: Record<string, string> = {};
  const errorDetailsObj: ErrorDetails[] = [];

  const { data, dataset } = reqBody;
  console.log("\nlogger-------> ~ add-posts.tsx:56 ~ handlePostCreation ~ dataset:", dataset);

  const sanityClient = await createSanityClient(dataset);

  for (const item of data) {
    const { 'URL Slug': slug } = item;
    console.log("🚀 ~ handlePostCreation ~ slug:", slug)
    try {
      // Validating CSV data
      const { error } = userSchema.validate(item);

      // If any error then saving that error for that slug and moving to the next iteration
      if (error?.details[0]?.message) {
        errorDetailsObj.push({ slug, errorDescription: `Validation Error - ${error.details[0].message}` });
        continue;
      }

      // Mapping CSV data according to the predefined post schema
      const postDetailsObj = await mapDataToDefinedSchema(item, sanityClient, { authorDetails, languageDetails, categoryDetails, imageDetails });
      // Creating post in sanity
      await sanityClient.create(postDetailsObj);
      console.log("🚀 ~ handlePostCreation ~ create:")

      // Adding a delay of 10 seconds to avoid rate limiting issues
      // await new Promise((resolve) => setTimeout(resolve, 10000)); 
    } catch (error: any) {
      errorDetailsObj.push({ slug, errorDescription: `${error.message || error || 'Something went wrong while adding post'}` });
      continue;
    }
  }

  console.log("🚀 ~ handlePostCreation ~ errorDetailsObj:", errorDetailsObj)

  let csvString = '';

  // If any error found then sending the error report attachment via email
  if (errorDetailsObj.length) {
    csvString = Buffer.from(papaparse.unparse(errorDetailsObj)).toString('base64');
  }

  // Sending the report via email
  sendAddPostaReportMail(csvString);

  // Completion time log
  console.log(`(Log) Completed - Add posts via CSV upload - ${new Date()}`);
};

export default function handler(req: any, res: any) {
  return new Promise(async (resolve, reject) => {
    const data = req.body;
    try {
      // Starting time log
      console.log(`(Log) Started - Add posts via CSV upload - ${new Date()}`);
      waitUntil(handlePostCreation(data as ReqBody).then(() => {
        console.log(`Log Completed - Add posts via CSV upload - ${new Date()}`);
      }));
      // await handlePostCreation(data as ReqBody);
      res.status(200).json({ message: 'Success' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });
}

// Setting custom body size limit to 20mb
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    }
  }
}
