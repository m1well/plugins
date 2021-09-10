import { isNullableTypeAnnotation } from '@babel/types'
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
    { type: 'text', indents: 0, heading: 'heading2', headingLevel: 2, content: '\ttext under bullet' },
    { type: 'text', indents: 0, heading: 'heading2', headingLevel: 2, content: '---' },
    { type: 'title', indents: 0, heading: '', headingLevel: 1, content: 'heading1again' },
    { type: 'open', indents: 0, heading: 'heading2again', headingLevel: 1, content: 'not indented' },
    { type: 'open', indents: 1, heading: 'heading2again', headingLevel: 1, content: 'indented' },
    { type: 'open', indents: 2, heading: 'heading2again', headingLevel: 1, content: 'bullet under' },
    { type: 'text', indents: 0, heading: 'heading2again', headingLevel: 1, content: '\t\t\ttext under indented' },
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

test('dwertheimer.TaskAutomations - paragraphDetail.countLeadingTabs test leading tab count', () => {
  expect(pd.countLeadingTabs(``)).toBe(0)
  expect(pd.countLeadingTabs(`\t`)).toBe(1)
  expect(pd.countLeadingTabs(`\t\t\tText here`)).toBe(3)
})

test('dwertheimer.TaskAutomations - paragraphDetail.hasChildren test with strings', () => {
  expect(pd.hasChildren({ indents: 0 }, { indents: 1 })).toBe(true)
  expect(pd.hasChildren({ indents: 1 }, { indents: 0 })).toBe(false)
  expect(pd.hasChildren({ indents: 0 }, { indents: 0 })).toBe(false)
  expect(pd.hasChildren({ indents: 2 }, { indents: 2 })).toBe(false)
  expect(pd.hasChildren({ indents: 4 }, { indents: 2 })).toBe(false)
})

test('dwertheimer.TaskAutomations - paragraphDetail.comparePredecessor meta.hasChildren test with strings', () => {
  expect(pd.comparePredecessor({}, [{ indents: 0 }, { indents: 1 }], 0)[0].hasChildren).toBe(true)
  expect(pd.comparePredecessor({}, [{ indents: 0 }, { indents: 1 }], 1)[1].hasChildren).toBe(false)
  expect(pd.comparePredecessor({}, [{ indents: 1 }, { indents: 0 }], 0)[0].hasChildren).toBe(false)
})

test('dwertheimer.TaskAutomations - paragraphDetail.comparePredecessor meta.hasChildren test with paragraph data', () => {
  let lastMeta = null
  let meta = pd.initializeMetaData(noteWithTasks.paragraphs)
  meta = pd.setTextIndents(noteWithTasks.paragraphs, meta)
  const eachPara = noteWithTasks.paragraphs.map((p, j) => pd.comparePredecessor(noteWithTasks.paragraphs[j], meta, j))
  // each run sends back the entire array of meta data
  expect(eachPara[3][3].hasChildren).toBe(false)
  expect(eachPara[4][4].hasChildren).toBe(true)
  expect(eachPara[9][9].hasChildren).toBe(true)
  expect(eachPara[10][10].hasChildren).toBe(true)
  expect(eachPara[11][11].hasChildren).toBe(true)
  expect(eachPara[eachPara.length - 1][eachPara.length - 1].hasChildren).toBe(false)
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
  expect(afterSweeping2[3].heading).toBe('')
})

// FOR REFERENCE:
// let output = ''
// noteWithTasks.paragraphs.forEach((n, i) => {
//   output += `noteWithTasks.paragraphs[${i}] = ${JSON.stringify(noteWithTasks.paragraphs[i])}\n`
// })
// console.log(output)
/*
noteWithTasks.paragraphs[0] = {"type":"title","indents":0,"heading":"","headingLevel":1,"content":"TestTitle"}
noteWithTasks.paragraphs[1] = {"type":"open","indents":0,"heading":"TestTitle","headingLevel":1,"content":"open1"}
noteWithTasks.paragraphs[2] = {"type":"list","indents":0,"heading":"TestTitle","headingLevel":1,"content":"bullet"}
noteWithTasks.paragraphs[3] = {"type":"title","indents":0,"heading":"","headingLevel":2,"content":"heading2"}
noteWithTasks.paragraphs[4] = {"type":"scheduled","indents":0,"heading":"heading2","headingLevel":2,"content":"sked >2021-09-11"}
noteWithTasks.paragraphs[5] = {"type":"open","indents":1,"heading":"heading2","headingLevel":2,"content":"open2"}
noteWithTasks.paragraphs[6] = {"type":"text","indents":0,"heading":"heading2","headingLevel":2,"content":"\ttext under bullet"}
noteWithTasks.paragraphs[7] = {"type":"text","indents":0,"heading":"heading2","headingLevel":2,"content":"---"}
noteWithTasks.paragraphs[8] = {"type":"title","indents":0,"heading":"","headingLevel":1,"content":"heading1again"}
noteWithTasks.paragraphs[9] = {"type":"open","indents":0,"heading":"heading2again","headingLevel":1,"content":"not indented"}
noteWithTasks.paragraphs[10] = {"type":"open","indents":1,"heading":"heading2again","headingLevel":1,"content":"indented"}
noteWithTasks.paragraphs[11] = {"type":"open","indents":2,"heading":"heading2again","headingLevel":1,"content":"bullet under"}
noteWithTasks.paragraphs[12] = {"type":"text","indents":0,"heading":"heading2again","headingLevel":1,"content":"\t\t  text under indented"}
noteWithTasks.paragraphs[13] = {"type":"text","indents":0,"heading":"heading2again","headingLevel":1,"content":"\ttext outside"}
noteWithTasks.paragraphs[14] = {"type":"text","indents":0,"heading":"heading2again","headingLevel":1,"content":"#aTag"}
noteWithTasks.paragraphs[15] = {"type":"open","indents":0,"heading":"heading2again","headingLevel":1,"content":"something under a tag"}
noteWithTasks.paragraphs[16] = {"type":"empty","indents":0,"heading":"heading2again","headingLevel":1,"content":""}
*/
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
* something under a tag
[empty]`
