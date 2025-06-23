import Joi from 'joi';
import papaparse from 'papaparse';

import { createSanityClient } from '../../lib/createSanityClient';
import { mapDataToDefinedSchema } from '../../services/add-posts';
import { sendAddPostaReportMail } from '../../services/email.service';
import { ErrorDetails,ReqBody} from '../../types';
import { postQueue } from '../../lib/queue';
import { de } from 'date-fns/locale';

import { Worker, ConnectionOptions } from 'bullmq';

const redis: ConnectionOptions = {
  username: 'default',
  password: 'AemuQzk2F4gkVyZTvZKBbMgsQvaAJDOR',
  host: 'redis-19125.c81.us-east-1-2.ec2.redns.redis-cloud.com',
  port: 19125
};

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

  async function deleteAllPosts(dataset: string) {
    const posts = await createSanityClient(dataset).fetch(`*[_type == "post"]{_id}`);
    console.log("\nlogger-------> ~ add-posts.tsx:60 ~ deleteAllPosts ~ posts:", posts);
    const deletions = posts.map(post => createSanityClient(dataset).delete(post._id));
    await Promise.all(deletions);
    console.log(`${posts.length} posts deleted.`);
  }

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

      // await deleteAllPosts(dataset);

      postQueue.add('postQueue', {
        item,
        dataset,
        authorDetails,
        languageDetails,
        categoryDetails,
        imageDetails,
        sanityClient,
      }, {
        attempts: 3, // Retry up to 3 times in case of failure
        backoff: {
          type: 'exponential', // Exponential backoff for retries
          delay: 5000, // Initial delay of 5 seconds
        },
      }).then(() => {
        console.log(`Post creation job added to the queue for slug: ${slug}`);
      }).catch((err) => {
        console.error(`Failed to add post creation job to the queue for slug: ${slug}`, err);
        errorDetailsObj.push({ slug, errorDescription: `Queue Error - ${err.message}` });
      });

      // Mapping CSV data according to the predefined post schema
      // const postDetailsObj = await mapDataToDefinedSchema(item, sanityClient, { authorDetails, languageDetails, categoryDetails, imageDetails });
      // // Creating post in sanity
      // await sanityClient.create(postDetailsObj);
      // console.log("🚀 ~ handlePostCreation ~ create:")

      // // Adding a delay of 10 seconds to avoid rate limiting issues
      await new Promise((resolve) => setTimeout(resolve, 5000)); 
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
  // sendAddPostaReportMail(csvString);

  // Completion time log
  console.log(`(Log) Completed - Add posts via CSV upload - ${new Date()}`);
};

const queue = new Worker(
  'postQueue',
  async (job) => {
    try {
      const data = job.data;
      console.log("\nlogger-------> ~ add-posts.tsx:449 ~ data:", data);
  
      const { item, sanityClient, authorDetails, languageDetails, categoryDetails, imageDetails } = data;
  
      // Mapping CSV data according to the predefined post schema
        const postDetailsObj = await mapDataToDefinedSchema(item, sanityClient, { authorDetails, languageDetails, categoryDetails, imageDetails });
        // Creating post in sanity
        await createSanityClient("staging").create(postDetailsObj);
        console.log("🚀 ~ handlePostCreation ~ create:")
  
      console.log(`Processed post: ${data.item['URL Slug']}`);
    
      
    } catch (error) {
      console.log("\nlogger-------> ~ add-posts.tsx:160 ~ error:", error);
      
    }
  },
  { connection: redis }
);

queue.on("active", () => {
  console.error("Queue active:");
});

// Job completed event
queue.on("completed", (job) => {
  console.log(`doc upload completed: ${job.id}`);
});

// Job failed event
queue.on("failed", (job, err) => {
  console.error(`Appointment reminder job failed: ${job?.id}`, err);
});


export default function handler(req: any, res: any) {
  return new Promise(async (resolve, reject) => {
    const data = req.body;
    try {
      // Starting time log
      console.log(`(Log) Started - Add posts via CSV upload - ${new Date()}`);
      await handlePostCreation(data as ReqBody);
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
