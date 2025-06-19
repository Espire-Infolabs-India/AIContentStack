import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import axios from "axios";
import Prompt from "../../prompts.json";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

async function readPDFContent(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      let lastY,
        text = "";
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += "\n" + item.str;
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const templateName = fields?.template;
    const url = fields?.url;
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if ((!file && !url) || (file && url)) {
      return res
        .status(400)
        .json({ error: "Provide either a PDF or a URL, not both" });
    }

    try {
      const templateConfig = {
        method: "GET",
        url: `https://api.contentstack.io/v3/content_types/${templateName}`,
        headers: {
          authorization: process.env.AUTHORIZATION,
          api_key: process.env.API_KEY,
        },
      };

      const response = await axios(templateConfig);
      let schemas = response?.data?.content_type?.schema;

      let templateFields = [];
      let tempTemplateFields = [];

      schemas?.forEach((field) => {
        if (field?.field_metadata?.instruction) {
          templateFields.push({
            [field.uid]: field.field_metadata?.instruction,
          });
          tempTemplateFields.push({
            key: field.uid,
            value: field.display_name,
          });
        }
      });

      let truncatedContent = "";

      if (file && file.mimetype === "application/pdf") {
        const filePath = file.filepath;
        const pdfContent = await readPDFContent(filePath);
        truncatedContent = pdfContent.slice(0, 30000);
        fs.unlink(filePath, () => {}); // Clean up
      } else if (url) {
        try {
          truncatedContent = url;
        } catch (urlErr) {
          return res.status(400).json({
            error: "Failed to fetch or parse content from the provided URL",
          });
        }
      }

      const instructions = Prompt?.instructions;
      const promptText = Prompt?.promptText;

      const prompt = `
         ${promptText}

         Instructions:
         ${instructions.join("\n")}

         Fields to generate:
         ${JSON.stringify(templateFields, null, 2)}

         Document:
         ${truncatedContent}
       `;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const rawOutput = result.response
        .text()
        .replace(/^```json\n|```$/g, "")
        .trim();

      let parsedTemp;
      let parsed;
      try {
        parsedTemp = JSON.parse(rawOutput);
        const keyMap = Object.fromEntries(
          tempTemplateFields.map(({ key, value }) => [key, value])
        );
        parsed = parsedTemp.map((obj) => {
          const [oldKey] = Object.keys(obj);
          const newKey = keyMap[oldKey] || oldKey;
          return {
            [newKey]: obj[oldKey],
            actual_key: oldKey,
            key: newKey,
            value: obj[oldKey],
          };
        });
      } catch (jsonErr) {
        console.error("Failed to parse model output:", jsonErr);
        throw new Error("Model returned invalid JSON");
      }

      return res.status(200).json({ summary: JSON.stringify(parsed, null, 2) });
    } catch (error) {
      console.error("Handler error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Unexpected server error" });
    }
  });
}
