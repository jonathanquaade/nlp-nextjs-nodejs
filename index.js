import { Configuration, OpenAIApi } from "openai";
// import fs from 'fs'
// const time = require('time');
import wrap from 'word-wrap'
// const re = require('re');


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function summariseChunk() {
  const completion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: generatePrompt(transcript),
    temperature: 0.6,
    max_tokens: 200,
    temperature: 1,
    max_tokens: 500,
    top_p: 1,
    frequency_penalty: 0.25,
    presence_penalty: 0.0,
    stop: ["<<END>>"],
  });
  return completion.data.choices[0].text;
}

const summaryPrompt = `Write a concise summary of the following including all key commercial concepts and quantitative information in your summary: <<TRANSCRIPT>>

CONCISE SUMMARY:`

const transcript = `So the main one is the one that you mentioned. It's literally expats that have gone from the U.S. to the UK to set up a new life and they have investments back home. They're still U.S. citizens, which means the FOIA and FATCA and all the other assorted regulations, and they have decided to make UK their home.`


const transcriptToSummaryChunks = async () => {
  let allTranscript = transcript
  let chunks = wrap(allTranscript, 20)
  let arrayOfChunks = chunks.split(/\r?\n|\r|\n/g)
  arrayOfChunks = arrayOfChunks.map(element => element.trim());
  console.log(arrayOfChunks)
  let result = [];
  let count = 0;
  for (let chunk of arrayOfChunks) {
    count = count + 1;
    let prompt = summaryPrompt.replace('<<TRANSCRIPT>>', chunk);
    console.log(prompt)
    const summary = await summariseChunk(prompt);
    console.log('\n\n', count, 'of', arrayOfChunks.length, ' - ', summary, '\n\n --- \n\n')
    result.push(summary)
  }
  console.log(result)
}

transcriptToSummaryChunks()


// const response = await transcriptToChunks(generatePrompt())
// console.log(response);

