import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const DEFAULT_FIELDS = {
  Title: "(Clear, descriptive title)",
  ShortTitle: "(Abbreviated but meaningful title)",
  Summary: "(Concise teaser text, max 200 chars)",
  Introduction: "(Engaging introduction paragraph that sets context)",
  Description: "(Detailed content, well-structured with proper paragraphs)",
  KeyContentTakeaways: "(Array of key points and takeaways from the content)",
  AuthorLink: "(URL format - should start with http:// or https://)",
  BannerImage: "(URL format for a relevant banner image)",
  BannerLabel: "(Short, impactful label for the banner)",
  Image: "(URL format for main content image)",
  BaseLink: "(URL format for the main content link)",
  FormHide: "(boolean - true or false)",
  ButtonText: "(Clear call-to-action text)",
  RelatedDocument: "(URL or reference to related content)",
  Category: "(Appropriate content category)",
  PressReleaseDate: "(Current date in YYYY-MM-DD format)",
  BrowserTitle: "(SEO-optimized title)",
  MetaKeywords: "(Relevant, comma-separated keywords)",
  MetaDescription: "(SEO-optimized description)",
  NavigationTitle: "(Clear navigation menu text)",
  LinkCaptionInNavigation: "(Descriptive navigation link text)",
  Topic: "(Main topic or theme)",
  PostedBy: "(Extract actual author or fallback to 'Espire Infolabs Team')",
  CategoryType: "(Content type classification)",
  Posts: "(Related posts or content)",
  DateBlog: "(Publication date in YYYY-MM-DD format)",
  PostDescription: "(Engaging blog excerpt)",
  BlogMinutesReading: "(Realistic reading time in minutes)",
  IncludeInSearchResults: "(boolean - true or false)",
  SliderImage: "(URL format for slider image)"
};

async function readPDFContent(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      let lastY, text = '';
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += '\n' + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    },
  };
  const data = await pdfParse(dataBuffer, options);
  return data.text;
}

async function fetchTemplateFields(templateName) {
  const config = {
    method: 'GET',
    url: `https://api.contentstack.io/v3/content_types/${templateName}`,
    headers: {
      authorization: process.env.AUTHORIZATION,
      api_key: process.env.API_KEY,
    },
  };

  const response = await axios(config);
  const heading = response?.data?.content_type?.title;
  // You can extract dynamic fields from response.data.content_type.schema if needed

  return { heading, fields: DEFAULT_FIELDS };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({ uploadDir: uploadsDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }

    const templateName = fields?.template;
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if (!file || file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Invalid or missing PDF file' });
    }

    const filePath = file.filepath;

    try {
      const { heading, fields: templateFields } = await fetchTemplateFields(templateName);
      const pdfContent = await readPDFContent(filePath);
      const truncatedContent = pdfContent.slice(0, 30000); // Limit for LLM input

      const instructions = [
        "1. Each field must be meaningful and well-formatted",
        "2. Content must be professional and business-appropriate",
        "3. Use correct URL structures and date format (YYYY-MM-DD)",
        "4. Booleans must be true/false only",
        "5. Use proper capitalization and punctuation"
      ];

      const prompt = `
          Analyze the document below and generate a structured JSON for a "${heading}" template.

          Instructions:
          ${instructions.join('\n')}

          Fields to generate:
          ${JSON.stringify(templateFields, null, 2)}

          Document:
          ${truncatedContent}
      `;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const rawOutput = result.response.text().replace(/^```json\n|```$/g, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(rawOutput);
      } catch (jsonErr) {
        console.error('Failed to parse model output:', rawOutput);
        throw new Error('Model returned invalid JSON');
      }

      // Normalize author field
      if (!parsed.PostedBy || parsed.PostedBy.includes('(') || parsed.PostedBy === 'John Doe') {
        parsed.PostedBy = 'Espire Infolabs Team';
      }

      res.status(200).json({ summary: JSON.stringify(parsed, null, 2) });

    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: error.message || 'Unexpected server error' });
    } finally {
      fs.unlink(filePath, () => {}); // Cleanup
    }
  });
}