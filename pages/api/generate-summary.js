import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import axios from 'axios';
import Prompt from '../../prompts.json';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

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
        const templateConfig = {
          method: 'GET',
          url: `https://api.contentstack.io/v3/content_types/${templateName}`,
          headers: {
            authorization: process.env.AUTHORIZATION,
            api_key: process.env.API_KEY,
          },
        };

        const response = await axios(templateConfig);
        let schemas = response?.data?.content_type?.schema;
        
        let refrerenceFieldsList = [];
        let getReferenceFieldsAsync = (async(entryName, displayName) => {
            let getEntries = await fetch(`${process?.env?.BASE_URL}/api/get-content-entries/?content_name=${entryName}`);
            let getEntriesData = await getEntries.json();
            if(getEntriesData){
              refrerenceFieldsList.push({displayName: displayName, key: entryName, values: getEntriesData?.entries});
            }
        });
        
        await Promise.all(schemas?.map(async (field) => {
          if(field?.reference_to && field?.data_type == "reference"){
            let entryName = field?.reference_to[0];
            let displayName = field?.display_name;
            return await getReferenceFieldsAsync(entryName, displayName);
          }
        }));

        let fileFieldList = [];
        let templateFields = [];
        schemas?.forEach((field) => {
          if (field?.field_metadata?.instruction && field?.data_type == "text" && field?.display_type != "dropdown") {
            templateFields.push({
              [field.uid]: field.field_metadata?.instruction,
            });
          }else if(field?.data_type == "file"){
            fileFieldList.push({displayName: field?.display_name, actual_key: field?.uid});
          }
        });
        
        let tempTemplateFields = [];
        schemas?.forEach((field) => {
          if (field?.field_metadata?.instruction && field?.data_type == "text") {
            tempTemplateFields.push({
              key: field.uid,
              value: field.display_name,
            });
          }
        });

        const pdfContent = await readPDFContent(filePath);
        const truncatedContent = pdfContent.slice(0, 30000); // Limit for LLM input

        const instructions = Prompt?.instructions;
        const promptText = Prompt?.promptText;

        const prompt = `
          ${promptText}

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

        let parsedTemp;
        let parsed;

        try {
          parsedTemp = JSON.parse(rawOutput);
          const keyMap = Object.fromEntries(tempTemplateFields?.map(({ key, value }) => [key, value]));

          const transformedArray = parsedTemp?.map(obj => {
            const [oldKey] = Object.keys(obj);
            const newKey = keyMap[oldKey] || oldKey;
            return { [newKey]: obj[oldKey], actual_key: oldKey, "key": newKey ,"value": obj[oldKey]};
          });

          parsed = transformedArray;
        } catch (jsonErr) {
          console.error('Failed to parse model output:', jsonErr);
          throw new Error('Model returned invalid JSON');
        }

        // Normalize author field
        // if (!parsed.PostedBy || parsed.PostedBy.includes('(') || parsed.PostedBy === 'John Doe') {
        //   parsed.PostedBy = 'Espire Infolabs Team';
        // }

        res.status(200).json({"referenceFields": refrerenceFieldsList, "fileFieldList": fileFieldList, "summary": JSON.stringify(parsed, null, 2) });

    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: error.message || 'Unexpected server error' });
    } finally {
      fs.unlink(filePath, () => {}); // Cleanup
    }
  });
}