import { createClient } from '@sanity/client';


export const createSanityClient = (dataset: string) => {
  return createClient({
    dataset: dataset || process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN,
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    useCdn: true,
    apiVersion: '2022-03-13',
  });
};
