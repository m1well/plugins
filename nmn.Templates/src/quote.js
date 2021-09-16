// @flow

import axios from 'axios'
import { showMessage } from '../../helpers/userInput'
import { getOrMakeConfigurationSection } from '../../nmn.Templates/src/configuration'

export async function getDailyQuote(
  quoteParams: string,
  config: { [string]: ?mixed },
): Promise<string> {
  console.log(`getDailyQuote():`)
  const availableModes = [
    'today', // Zenquotes
    'random', // Zenquotes
    'author', // Zenquotes (premium account required)
    'readwise' // Readwise (account required)
  ]
  if (quoteParams !== '') {
    // TODO: Eventually support API options
    await showMessage(
      "Info: {{quote()}} tag parameters are not currently supported",
    )
  }
  
  const DEFAULT_QUOTE_OPTIONS = `
  quote: {
    mode: 'random', // Available modes: [random (default), today, author, readwise]
    author: '', // API key required for this, available authors: https://premium.zenquotes.io/available-authors/
    zenquotesAPIKey: '<secret!>', // Required for mode: 'zen-author' (from https://premium.zenquotes.io/)
    readwiseAPIKey: '<secret!>', // Required for mode: 'readwise' (from https://readwise.io/access_token)
  },
`
  // Get settings
  const quoteConfig = await getOrMakeConfigurationSection(
    'quote',
    DEFAULT_QUOTE_OPTIONS,
    // not including a minimum required configuration list, as can just run on default
  )
  if (quoteConfig == null) {
    console.log(`\tInfo: No 'quote' settings in Templates/_configuration note`)
    await showMessage(`Couldn't find 'quote' settings in _configuration note.`)
  } else {
    console.log(`\tConfig for 'quote': ${JSON.stringify(quoteConfig)}`)
  }

  const pref_mode = (quoteConfig?.mode && availableModes.includes(quoteConfig?.mode))
    ? quoteConfig?.mode
    : 'random'

  let API: string
  let URL: string
  if (pref_mode === 'readwise') {
    const pref_readwiseAPIKey = quoteConfig?.readwiseAPIKey ?? ''
    // as token is mandatory, don't proceed if we don't have one
    if (pref_readwiseAPIKey !== '') {
      console.log(`\tError: no valid Readwise API Key found. Stopping. Please check your _configuration note.`)
      return `Error: no valid Readwise API Key found. Please check your _configuration note.`
    }
    API = `"https://readwise.io/api/v2/`
    URL = `${API}highlights`
    /**
     * [API Details](https://readwise.io/api_deets)
     * But in private correspondence Tadek adds:
     * This is not documented but I think you should actually be able to hit
     * `https://readwise.io/api/v2/books/<book id>` and get a response :)
     */
    console.log(`\tBefore API call: ${URL}`)
    const response = await axios.get(URL, { 
      method: 'get', 
      headers: {
        'Authorization': `Token ${pref_readwiseAPIKey}`,
      },
      params: {
        "page_size": 1,
        "page": 1,
      }
    })

    if (response.status === 200) {
      const data = response.data.results[0] // only use first item returned
      const highlight = data.text
      const highlightSource = data.book_id
      const quoteLine = ```${highlight} - *${highlightSource}*`
      console.log(`\t${quoteLine}`)
      return quoteLine
    } else {
      console.log(`\tError in Quote lookup to ${API}. Please check your _configuration note.`)
      return `Error in Quote lookup to ${API}. Please check your _configuration note.`
    }
  }
  else {
    const pref_author = String(quoteConfig?.author) ?? '' // Available authors: https://premium.zenquotes.io/available-authors/
    const pref_zenquotes_key = String(quoteConfig?.zenquotesAPIKey) ?? '' // https://premium.zenquotes.io/
    API = `https://zenquotes.io/api/`
    URL = (pref_mode === 'author' && pref_author && pref_zenquotes_key)
      ? `${API}quotes/${pref_mode}/${pref_author}/${pref_zenquotes_key}`
      : `${API}${pref_mode}`
    console.log(`\tBefore API call: ${URL}`)

    // const response = await fetch(URL)
    const response = await axios.get(URL, { 
      method: 'get',
    })

    if (response === 200) {
      const data = response.data
      console.log(data)
      const quoteLine = `${data.q} - *${data.a}*`
      console.log(`\t${quoteLine}`)
      return quoteLine
    } else {
      console.log(`\tError in Quote lookup to ${API}. Please check your _configuration note.`)
      return `Error in Quote lookup to ${API}. Please check your _configuration note.`
    }
  }
}
