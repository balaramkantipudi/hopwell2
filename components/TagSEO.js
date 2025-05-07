// import Head from "next/head";
// import PropTypes from "prop-types";
// import config from "@/config";

// // Predefined SEO tags — prefilled with default values but you can customize them for each page
// // This let you add default SEO tags to all pages, like /terms, /privacy, without rewrtting them all
// const defaults = {
//   title: `up to 50 characters | ${config.appName}`,
//   description: "60 to 180 characters",
//   keywords: `${config.appName}, some other keywords if needed`,
//   og: {
//     title: `up to 50 characters | ${config.appName}`,
//     description: "60 to 180 characters",
//     image: `https://${config.domainName}/shareMain.png`,
//     url: `https://${config.domainName}/`,
//   },
// };

// // This components should be added to every pages you want to rank on Google (in /pages directory).
// // It prefills data with default title/description/OG but you can cusotmize it for each page.
// // REQUIRED: The canonicalSlug is required for each page (it's the slug of the page, without the domain name and without the trailing slash)
// const TagSEO = ({
//   children,
//   title,
//   description,
//   keywords,
//   og,
//   canonicalSlug,
// }) => {
//   return (
//     <Head>
//       {/* TITLE */}
//       <title key="title">{title || defaults.title}</title>

//       {/* METAS */}
//       <meta
//         name="description"
//         key="description"
//         content={description || defaults.description}
//       />
//       <meta
//         name="keywords"
//         key="keywords"
//         content={keywords || defaults.keywords}
//       />

//       {/* OG METAS */}
//       <meta property="og:type" content="website" />
//       <meta property="og:title" content={og?.title || defaults.og.title} />
//       <meta
//         property="og:description"
//         key="og:description"
//         content={og?.description || defaults.og.description}
//       />
//       <meta
//         property="og:image"
//         key="og:image"
//         content={og?.image || defaults.og.image}
//       />
//       <meta property="og:url" content={og?.url || defaults.og.url} />
//       <meta name="twitter:card" content="summary_large_image" />
//       <meta name="twitter:creator" content="@marc_louvion" />

//       {/* CANONICAL TAG */}
//       <link
//         rel="canonical"
//         href={`https://${config.domainName}/${canonicalSlug}`}
//       />

//       {/* CHILDREN TAGS */}
//       {children}
//     </Head>
//   );
// };

// export default TagSEO;

// TagSEO.propTypes = {
//   canonicalSlug: PropTypes.string.isRequired,
// };
import Head from "next/head";
import PropTypes from "prop-types";
import config from "@/config";

// Enhanced SEO tags for travel itinerary platform
const defaults = {
  // Keep titles under 60 characters for optimal display in search results
  title: `AI Travel Itinerary Generator | ${config.appName}`,
  // Descriptive meta description between 120-158 characters
  description: "Create personalized travel itineraries with AI that match your preferences. Get tailored recommendations for destinations, accommodations, and activities while saving time and money.",
  // Travel-specific keywords
  keywords: `${config.appName}, travel planner, AI itinerary, personalized travel, trip planner, vacation planner, travel recommendations`,
  og: {
    title: `Create Custom Travel Itineraries with AI | ${config.appName}`,
    description: "Plan your perfect trip in minutes with our AI travel assistant. Get personalized itineraries based on your interests, budget, and travel style.",
    image: `https://${config.domainName}/og-travel-planner.png`,
    url: `https://${config.domainName}/`,
  },
  // Schema markup for travel website - will be stringified when added to the page
  schema: {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": config.appName,
    "url": `https://${config.domainName}/`,
    "logo": `https://${config.domainName}/logo.png`,
    "description": "AI-powered travel itinerary planning platform",
    "sameAs": [
      `https://twitter.com/${config.socialHandles?.twitter || ''}`,
      `https://facebook.com/${config.socialHandles?.facebook || ''}`,
      `https://instagram.com/${config.socialHandles?.instagram || ''}`
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": `https://${config.domainName}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }
};

// Enhanced TagSEO component with travel-specific optimizations
const TagSEO = ({
  children,
  title,
  description,
  keywords,
  og,
  canonicalSlug,
  schema,
  noIndex = false,
  articleInfo = null, // For blog/content pages
  location = null // For location-specific pages
}) => {
  // Combine default schema with page-specific schema
  const pageSchema = schema ? { ...defaults.schema, ...schema } : defaults.schema;
  
  // Add article schema if provided
  if (articleInfo) {
    pageSchema["@type"] = "Article";
    pageSchema.headline = articleInfo.headline || title;
    pageSchema.author = {
      "@type": "Person",
      "name": articleInfo.author
    };
    pageSchema.datePublished = articleInfo.datePublished;
    pageSchema.dateModified = articleInfo.dateModified || articleInfo.datePublished;
    pageSchema.image = articleInfo.image || og?.image || defaults.og.image;
  }
  
  // Add location schema if provided
  if (location) {
    pageSchema.contentLocation = {
      "@type": "Place",
      "name": location.name,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": location.country
      }
    };
  }

  return (
    <Head>
      {/* Basic SEO */}
      <title key="title">{title || defaults.title}</title>
      <meta
        name="description"
        key="description"
        content={description || defaults.description}
      />
      <meta
        name="keywords"
        key="keywords"
        content={keywords || defaults.keywords}
      />
      
      {/* Robots control - useful for staging environments or non-indexable pages */}
      {noIndex && (
        <meta name="robots" content="noindex, nofollow" />
      )}
      
      {/* OpenGraph tags for social sharing */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={og?.title || defaults.og.title} />
      <meta
        property="og:description"
        key="og:description"
        content={og?.description || defaults.og.description}
      />
      <meta
        property="og:image"
        key="og:image"
        content={og?.image || defaults.og.image}
      />
      <meta property="og:url" content={og?.url || `https://${config.domainName}/${canonicalSlug}`} />
      <meta property="og:site_name" content={config.appName} />
      
      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={`@${config.socialHandles?.twitter || ''}`} />
      <meta name="twitter:creator" content={`@${config.socialHandles?.twitter || ''}`} />
      <meta name="twitter:title" content={og?.title || defaults.og.title} />
      <meta name="twitter:description" content={og?.description || defaults.og.description} />
      <meta name="twitter:image" content={og?.image || defaults.og.image} />
      
      {/* Canonical URL - essential for SEO to prevent duplicate content issues */}
      <link
        rel="canonical"
        href={`https://${config.domainName}/${canonicalSlug}`}
      />
      
      {/* Structured data for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      
      {/* Favicon and Apple touch icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {children}
    </Head>
  );
};

export default TagSEO;

TagSEO.propTypes = {
  canonicalSlug: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  og: PropTypes.object,
  schema: PropTypes.object,
  noIndex: PropTypes.bool,
  articleInfo: PropTypes.shape({
    headline: PropTypes.string,
    author: PropTypes.string,
    datePublished: PropTypes.string,
    dateModified: PropTypes.string,
    image: PropTypes.string
  }),
  location: PropTypes.shape({
    name: PropTypes.string,
    country: PropTypes.string
  }),
  children: PropTypes.node
};

// Example usage:
/*
import TagSEO from '@/components/TagSEO';

export default function DestinationPage({ destination }) {
  return (
    <>
      <TagSEO
        canonicalSlug={`destinations/${destination.slug}`}
        title={`${destination.name} Travel Guide & Itineraries | YourApp`}
        description={`Discover the best attractions, accommodation, and food in ${destination.name}. Create your personalized ${destination.name} itinerary with our AI travel planner.`}
        og={{
          title: `Explore ${destination.name} - AI Travel Guide & Itinerary Planner`,
          image: destination.featuredImage,
        }}
        location={{
          name: destination.name,
          country: destination.country
        }}
      />
      <main>
        {/* Page content */}
      </main>
    </>
  );
}
*/