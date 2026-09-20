import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SITE_NAME = 'Government Ashram School, Pathraj';
const SITE_URL = 'https://ashram-shala-pathraj.onrender.com';
const distPath = resolve(process.cwd(), 'dist');
const baseDocument = await readFile(resolve(distPath, 'index.html'), 'utf8');

const routes = {
  about: {
    title: `About | ${SITE_NAME}`,
    description: 'Learn about Ashram School Pathraj, its mission, history, campus, and commitment to tribal education.',
  },
  academics: {
    title: `Academics | ${SITE_NAME}`,
    description: 'Explore standards, subjects, teaching staff, and academic programmes at Ashram School Pathraj.',
  },
  admission: {
    title: `Admissions | ${SITE_NAME}`,
    description: 'View admission eligibility, required documents, the application process, and submit an admission enquiry.',
  },
  hostel: {
    title: `Hostel Facilities | ${SITE_NAME}`,
    description: 'Discover residential facilities, meals, supervision, and the daily routine at Ashram School Pathraj.',
  },
  gallery: {
    title: `Photo Gallery | ${SITE_NAME}`,
    description: 'See school life, campus activities, events, and student achievements at Ashram School Pathraj.',
  },
  contact: {
    title: `Contact | ${SITE_NAME}`,
    description: 'Contact Government Ashram School Pathraj by phone, email, WhatsApp, or get directions to the campus.',
  },
  privacy: {
    title: `Privacy Notice | ${SITE_NAME}`,
    description: 'Read how Ashram School Pathraj collects, uses, protects, and retains information submitted through this website.',
  },
  login: {
    title: `Staff and Parent Login | ${SITE_NAME}`,
    description: 'Secure sign-in for authorised parents and school staff.',
    noIndex: true,
  },
  register: {
    title: `Parent Registration | ${SITE_NAME}`,
    description: 'Create a verified parent account for Ashram School Pathraj.',
    noIndex: true,
  },
  'forgot-password': {
    title: `Password Recovery | ${SITE_NAME}`,
    description: 'Recover access to your Ashram School Pathraj account.',
    noIndex: true,
  },
  portal: {
    title: `Secure Portal | ${SITE_NAME}`,
    description: 'Authorised school services for parents and staff.',
    noIndex: true,
  },
  404: {
    title: `Page Not Found | ${SITE_NAME}`,
    description: 'The requested page could not be found on the Ashram School Pathraj website.',
    noIndex: true,
  },
};

function attributePattern(tag, attribute, value) {
  return new RegExp(`<${tag}([^>]*${attribute}=["']${value}["'][^>]*)>`, 'i');
}

function setContent(document, pattern, content) {
  return document.replace(pattern, (tag) => tag.replace(/content=["'][^"']*["']/i, `content="${content}"`));
}

function createDocument(path, metadata) {
  const canonicalUrl = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
  let document = baseDocument.replace(/<title>[^<]*<\/title>/i, `<title>${metadata.title}</title>`);
  document = setContent(document, attributePattern('meta', 'name', 'description'), metadata.description);
  document = setContent(document, attributePattern('meta', 'name', 'robots'), metadata.noIndex ? 'noindex, nofollow' : 'index, follow');
  document = setContent(document, attributePattern('meta', 'property', 'og:title'), metadata.title);
  document = setContent(document, attributePattern('meta', 'property', 'og:description'), metadata.description);
  document = setContent(document, attributePattern('meta', 'property', 'og:url'), canonicalUrl);
  document = document.replace(/<link([^>]*rel=["']canonical["'][^>]*)>/i, (tag) => tag.replace(/href=["'][^"']*["']/i, `href="${canonicalUrl}"`));
  return document;
}

for (const [slug, metadata] of Object.entries(routes)) {
  const path = slug === '404' ? '/404' : `/${slug}`;
  await writeFile(resolve(distPath, `${slug}.html`), createDocument(path, metadata));
}

console.log(`Generated metadata documents for ${Object.keys(routes).length} routes.`);
