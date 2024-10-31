import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const topics = ['food', 'travel'];

async function generateBlogPost() {
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const prompt = topic === 'food' 
    ? "Write a detailed blog post about a unique local dish, including its history, ingredients, and cultural significance. Include a recipe."
    : "Write a detailed blog post about a fascinating travel destination, including local attractions, best time to visit, and cultural experiences.";

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional travel and food blogger. Write engaging, informative content with proper markdown formatting."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;
  const title = content.split('\n')[0].replace('# ', '');
  const description = content.split('\n')[2];

  const fileName = `${format(new Date(), 'yyyy-MM-dd')}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filePath = path.join(process.cwd(), 'src/content/blog', fileName);

  const frontmatter = `---
title: ${title}
description: ${description}
pubDate: ${new Date().toISOString()}
category: ${topic}
---

${content}`;

  await writeFile(filePath, frontmatter);
  console.log(`Generated blog post: ${fileName}`);
}

generateBlogPost().catch(console.error);