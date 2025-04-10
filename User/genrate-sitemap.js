import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
console.log('process.env.VITE_SUPABASE_URL', process.env.VITE_SUPABASE_URL);
console.log('process.env.VITE_SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY);


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = 'https://russelco.vercel.app';

async function generateSitemap() {
  const staticUrls = [
    '/',
    '/products',
    '/offers',
    '/cart',
    '/checkout',
  ];

  // Fetch dynamic data from Supabase
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('id');

  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select('id');

  if (productError || categoryError) {
    console.error('Error fetching from Supabase:', productError || categoryError);
    return;
  }

  const staticXml = staticUrls.map((path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <priority>0.8</priority>
    </url>
  `).join('');

  const productXml = products.map((product) => `
    <url>
      <loc>${baseUrl}/product/${product.id}</loc>
      <priority>0.9</priority>
    </url>
  `).join('');

  const categoryXml = categories.map((cat) => `
    <url>
      <loc>${baseUrl}/product/category/${cat.id}</loc>
      <priority>0.7</priority>
    </url>
  `).join('');

  const fullXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${productXml}
${categoryXml}
</urlset>`;

  writeFileSync('./public/sitemap.xml', fullXml.trim());
  console.log('✅ Sitemap generated successfully!');
}

generateSitemap();
