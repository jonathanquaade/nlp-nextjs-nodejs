import { Configuration, OpenAIApi } from "openai";
import express from 'express';
import cors from 'cors'
// import fs from 'fs'
import wrap from 'word-wrap'
import prompts from './prompts.js'

const app = express();
app.use(express.json())
app.use(cors({
  // origin: ['https://transcript-to-summarychunks-frontend-alpha.jonathanquaade.repl.co',
  //   'https://1b79ea9f-797c-467e-939d-3800963212b4.id.repl.co']
  origin: "*"
}));

app.get('/', (req, res) => {
  res.send(`I'm listening`);
})

app.get('/v1', (req, res) => {
  res.send(`I'm listening`);
})

app.post("/v1", async (req, res) => {
  const { transcript } = req.body

  if (!transcript) {
    res.status(418).send({ message: "Missing transcript" })
  }

  // if (!title) {
  //   res.status(418).send({ message: "Missing title" })
  // }

  try {
    let summaryResult = await transcriptToSummaryChunks(transcript)
    res.status(200).send({
      // title: title,
      request: req.body,
      result: ['200', 'times', 'over'],
      summary: summaryResult
    })
  } catch (e) {
    // catch errors and send error status
    console.log(e);
    res.sendStatus(500);
  }

})

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
})

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function summariseChunk(input) {
  const completion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: input,
    temperature: 0.6,
    max_tokens: 2000,
    top_p: 1,
    frequency_penalty: 0.25,
    presence_penalty: 0.0,
    stop: ["<<END>>"],
  });
  return completion.data.choices[0].text;
}

// Get the latest prompt
const summaryPrompt = prompts.summarisePrompt_20221016
console.log('Prompt used \n\n', summaryPrompt)

// Get the transcript
const sampleTranscript = `We're a management consultancy based in the UK. Most of our work is on behalf of investors, looking at investing in businesses in a range of different markets. So we've in the past, we've done a fair amount of work as a firm in wealth management space broadly. But in this particular case, we're interested in a sort of sub-segment, a niche within that, which is wealth management services provided to individuals that have some connection with the U.S. We're calling them U.S.-connected individuals, which is a little bit vague and abstract, but effectively what it means is individuals in the UK who for whatever reason have some sort of tax complication or reporting complication with respect to the U.S., that makes their wealth management needs slightly more complicated than the typical individual.`

const transcriptToSummaryChunks = async (transcript) => {
  let allTranscript = transcript.replace(/\n/g, " ")
  let chunks = wrap(allTranscript, { width: 2000 })
  let arrayOfChunks = chunks.split(/\r?\n|\r|\n/g)
  arrayOfChunks = arrayOfChunks.map(element => element.trim());
  console.log(arrayOfChunks)

  let result = [];
  let count = 0;

  for (let chunk of arrayOfChunks) {
    count = count + 1;
    let prompt = summaryPrompt.replace('<<TRANSCRIPT>>', chunk);
    const summary = await summariseChunk(prompt);
    console.log('\n\n', count, 'of', arrayOfChunks.length, ' - ', summary, '\n\n --- \n\n')
    result.push(summary)
  }
  console.log(result)
  return result
}

// transcriptToSummaryChunks(sampleTranscript)