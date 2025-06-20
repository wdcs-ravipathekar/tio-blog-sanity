export interface AuthorProps {
  name: string
  picture: any
}

export interface PostProps {
  title: string
  coverImage: any
  date: string
  excerpt?: string
  author: AuthorProps
  slug?: string
  content?: any
}

export interface PostDetails {
  _type: 'post';
  title: string;
  slug: {
    current: string;
    _type: 'slug';
  };
  description: string;
  date: Date;
  content?: any[];
  author?: {
    _ref: string;
    _type: 'reference';
  };
  category?: {
    _ref: string;
    _type: 'reference';
  };
  language?: {
    _ref: string;
    _type: 'reference';
  };
  coverImage?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  };
  riskDisclaimer: boolean;
  blogPostBanner: boolean;
}

export interface CsvData {
  Body: string,
  Meta: string,
  Title: string,
  Author: string,
  Language: string,
  Category: string,
  'URL Slug': string,
  'Image - Assets': string,
  'Risk Disclaimer': boolean
  'Blog Post Banner': boolean,
}

export interface ReferenceDetails {
  authorDetails: Record<string, string>;
  languageDetails: Record<string, string>;
  categoryDetails: Record<string, string>;
  imageDetails: Record<string, string>;
}
export interface ErrorDetails {
  slug: string;
  errorDescription: string;
}

export interface ReqBody {
  data: CsvData[];
  dataset: string;
}
