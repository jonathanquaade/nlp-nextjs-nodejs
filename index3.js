const asyncUppercase = item =>
  new Promise(resolve =>
    setTimeout(
      () => resolve(item.toUpperCase()),
      Math.floor(Math.random() * 1000)
    )
  );

const uppercaseItems = async () => {
  const items = ['a', 'b', 'c'];
  for (item of items) {
    const uppercaseItem = await asyncUppercase(item);
    console.log(uppercaseItem);
  }

  console.log('Items processed');
};

uppercaseItems();
// LOGS: 'A', 'B', 'C', 'Items processed'

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

var openai = require('openai');
var fs = require('fs');
var time = require('time');
var textwrap = require('textwrap');
var re = require('re');


export default async function (req, res) {
  const completion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: generatePrompt(req.body.animal),
    temperature: 0.6,
  });
  res.status(200).json({ result: completion.data.choices[0].text });
}


openai.api_key = process.env.API_KEY

function gpt3_completion(prompt, engine = 'text-davinci-002', temp = 0.6, top_p = 1.0, tokens = 2000, freq_pen = 0.25, pres_pen = 0.0, stop = ['<<END>>']) {
  var max_retry = 5;
  var retry = 0;
  while (true) {
    try {
      var response = openai.completion.create(
        engine,
        prompt,
        {
          'temperature': temp,
          'max_tokens': tokens,
          'top_p': top_p,
          'frequency_penalty': freq_pen,
          'presence_penalty': pres_pen,
          'stop': stop
        }
      );
      var text = response.choices[0].text.trim();
      text = re.sub('\s+', ' ', text);
      var filename = time.now() + '_gpt3.txt';
      fs.writeFileSync('gpt3_logs/' + filename, 'PROMPT:\n\n' + prompt + '\n\n==========\n\nRESPONSE:\n\n' + text);
      return text;
    } catch (oops) {
      retry += 1;
      if (retry >= max_retry) {
        return "GPT3 error: " + oops;
      }
      console.log('Error communicating with OpenAI:', oops);
      time.sleep(1);
    }
  }
}

if (require.main === module) {
  var alltext = fs.readFileSync('input.txt', 'utf-8');
  var chunks = textwrap.wrap(alltext, 2000);
  var result = [];
  var count = 0;
  for (var chunk of chunks) {
    count = count + 1;
    var prompt = fs.readFileSync('prompt.txt', 'utf-8').replace('<<SUMMARY>>', chunk);
    prompt = prompt.encode(encoding = 'ASCII', errors = 'ignore').decode();
    var summary = gpt3_completion(prompt);
    console.log('\n\n\n', count, 'of', chunks.length, ' - ', summary);
    result.push(summary);
  }
  fs.writeFileSync('output_' + time.now() + '.txt', result.join('\n\n'));
}