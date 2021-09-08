import * as pd from '../src/paragraphDetail'
const _ = require('lodash')
/* eslint-disable */
// see matching MD at bottom of file
const noteWithTasks = {
  title: 'TestTitle',
  paragraphs: [
    //NOTE: USING INDEXED VALUES FOR TESTS SO DON'T CHANGE. ADD TO THE END IF NECESSARY
    { type: 'title', indents: 0, heading: '', headingLevel: 1, content: 'TestTitle' },
    { type: 'open', indents: 0, heading: 'TestTitle', headingLevel: 1, content: 'open1' },
    { type: 'list', indents: 0, heading: 'TestTitle', headingLevel: 1, content: 'bullet' },
    { type: 'title', indents: 0, heading: '', headingLevel: 2, content: 'heading2' },
    { type: 'scheduled', indents: 0, heading: 'heading2', headingLevel: 2, content: 'sked >2021-09-11' },
    { type: 'open', indents: 1, heading: 'heading2', headingLevel: 2, content: 'open2' },
    { type: 'text', indents: 0, heading: 'heading2', headingLevel: 2, content: '	text under bullet' },
    { type: 'text', indents: 0, heading: 'heading2', headingLevel: 2, content: '---' },
    { type: 'title', indents: 0, heading: '', headingLevel: 1, content: 'heading1again' },
    { type: 'open', indents: 0, heading: 'heading2again', headingLevel: 1, content: 'not indented' },
    { type: 'open', indents: 1, heading: 'heading2again', headingLevel: 1, content: 'indented' },
    { type: 'open', indents: 2, heading: 'heading2again', headingLevel: 1, content: 'bullet under' },
    { type: 'text', indents: 0, heading: 'heading2again', headingLevel: 1, content: '		text under indented' },
    { type: 'text', indents: 0, heading: 'heading2again', headingLevel: 1, content: '	text outside' },
    { type: 'text', indents: 0, heading: 'heading2again', headingLevel: 1, content: '#aTag' },
    { type: 'open', indents: 0, heading: 'heading2again', headingLevel: 1, content: 'something under a tag' },
    { type: 'empty', indents: 0, heading: 'heading2again', headingLevel: 1, content: '' },
  ],
}
const noteWithOutTasks = {
  paragraphs: [
    { type: 'title', content: 'test' },
    { type: 'list', content: 'test' },
  ],
}

// Jest suite
describe('paragraphDetail', () => {
  test('dwertheimer.TaskAutomations - paragraphDetail.noteHasOpenTasks', () => {
    expect(pd.noteHasOpenTasks(noteWithTasks)).toBe(true)
    expect(pd.noteHasOpenTasks(noteWithOutTasks)).toBe(false)
  })
  test('dwertheimer.TaskAutomations - paragraphDetail.isOpenTask', () => {
    expect(pd.isOpenTask(noteWithTasks.paragraphs[1])).toBe(true)
    expect(pd.isOpenTask(noteWithOutTasks.paragraphs[0])).toBe(false)
  })
  test('dwertheimer.TaskAutomations - paragraphDetail.noteHasTasks', () => {
    expect(pd.noteHasTasks(noteWithTasks)).toBe(true)
    expect(pd.noteHasTasks(noteWithOutTasks)).toBe(false)
  })
  test('dwertheimer.TaskAutomations - paragraphDetail.isTask', () => {
    expect(pd.isTask(noteWithTasks.paragraphs[1])).toBe(true)
    expect(pd.isTask(noteWithOutTasks.paragraphs[1])).toBe(false)
  })

  test('dwertheimer.TaskAutomations - paragraphDetail.initializeMetadata set metadata', () => {
    let meta = pd.initializeMetaData(noteWithTasks.paragraphs)
    expect(meta.length).toEqual(noteWithTasks.paragraphs.length)
  })

  test('dwertheimer.TaskAutomations - paragraphDetail.setHeadings sets heading of top-most parent', () => {
    // setHeadings writing heading value to the original object, so use cloneDeep to work on a new copy
    let meta = pd.initializeMetaData(noteWithTasks.paragraphs)
    const metaAfterHeadingSet = pd.setHeadings(_.cloneDeep(noteWithTasks).paragraphs, meta)
    expect(metaAfterHeadingSet[1].heading).toEqual(noteWithTasks.paragraphs[0].content)
  })
  test('dwertheimer.TaskAutomations - paragraphDetail.flagParagraphsForSweeping', () => {
    const metaAfterSweeping = pd.flagParagraphsForSweeping(_.cloneDeep(noteWithTasks).paragraphs)
    expect(metaAfterSweeping[0].sweep).toBe(false)
    expect(metaAfterSweeping[15].sweep).toBe(true)
    expect(metaAfterSweeping[3].heading).toBe('TestTitle')
  })

  test('dwertheimer.TaskAutomations - paragraphDetail.flagParagraphsForSweeping do not include Note Title', () => {
    let meta = pd.initializeMetaData(noteWithTasks.paragraphs)
    const afterSweeping2 = pd.flagParagraphsForSweeping(_.cloneDeep(noteWithTasks).paragraphs, { includeTitle: false })
    expect(afterSweeping2[0].sweep).toBe(false)
    expect(afterSweeping2[15].sweep).toBe(true)
    console.log(afterSweeping2[3])
    expect(afterSweeping2[3].heading).toBe('')
  })
  test('dwertheimer.TaskAutomations - paragraphDetail.setTextIndents index count is correct', () => {
    const textCheckText = {
      paragraphs: [
        { type: 'title', content: 'test', indents: 0 },
        { type: 'list', content: '\t\t\ttest', indents: 1 },
        { type: 'text', content: 'zero', indents: 0 },
        { type: 'text', content: '\t\t\t\t\tfive', indents: 0 },
      ],
    }
    let meta = pd.initializeMetaData(textCheckText.paragraphs)
    const testResults = pd.setTextIndents(textCheckText.paragraphs, meta)
    expect(testResults[0].indents).toBe(0)
    expect(testResults[1].indents).toBe(1)
    expect(testResults[2].indents).toBe(0)
    expect(testResults[3].indents).toBe(5)
  })
})

// MARKDOWN FOR noteWithTasks
const noteWithTasksMD = `# TestTitle
* open1
- bullet
## heading2
* [>] sked >2021-09-11
	* open2
	text under bullet
---
# heading2again
* not indented
	* indented
		* bullet under
		text under indented
	text outside
#aTag
* something under a tag`
