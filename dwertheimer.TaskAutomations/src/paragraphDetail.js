// @flow
const _ = require('lodash')

export const isTask = (p) => ['open', 'scheduled', 'cancelled', 'done'].includes(p.type)
export const isOpenTask = (p) => p.type === 'open'
export const noteHasOpenTasks = (note) => note.paragraphs.some(isOpenTask)
export const noteHasTasks = (note) => note.paragraphs.some(isTask)

/**
 * @description Adds the heading of missing #h1 to items at the root level
 * @param {[TParagraph]} paragraphs
 * @param {[Metadata]} meta - extra paragraph metadata (b/c paragraphs is readonly) - tracks paragraphs
 * @returns {[Metadata]} meta
 */
export function setHeadings(paragraphs: [TParagraph], meta: [Metadata]): [Metadata] {
  const title = paragraphs[0].content
  const paras = paragraphs.forEach((p, i) => {
    if (i > 0 && p.heading === '') {
      meta[i].heading = title
    }
  })
  return meta
}

export function countLeadingTabs(contentStr: string): number {
  let numOfTabs = 0,
    start = 0
  const content = contentStr.replace(/	/g, '\t')
  while (content.charAt(start++) === '\t') numOfTabs++
  return numOfTabs
}

/**
 * @description Adds the indents of tabs to text items
 * @param {[TParagraph]} paragraphs
 * @param {[Metadata]} meta - extra paragraph metadata (b/c paragraphs is readonly) - tracks paragraphs
 * @returns {[Metadata]} meta
 */
export function setTextIndents(paragraphs: [TParagraph], meta: [Metadata]): Array<Metadata> {
  const newMeta = meta.slice()
  const paras = paragraphs.forEach((p, i) => {
    if (p.type === 'text' && p.content.length) {
      newMeta[i].indents = countLeadingTabs(p.content)
    }
  })
  return newMeta
}

// Look to find children (assumes we are going backwards from the last paragraph)
export function hasChildren(metaValue: Metadata, prevMetaValue: Metadata): boolean {
  if (prevMetaValue) {
    if (prevMetaValue.indents > metaValue.indents) {
      return true
    }
  }
  return false
}

/**
 * When going backwards from finding an open task, look for headings/context that goes with the task
 * @param {TParagraph} paragraph
 * @param {} lastSwept
 * @returns {Metadata} meta
 *
 */
export function comparePredecessor(paragraph: TParagraph, meta: [Metadata], metaIndex: number): [Metadata] {
  //TODO FIXME: need typing but need strategy even more. What are we doing here?
  const thisMeta = meta[metaIndex]
  const prevMetaValue = meta[metaIndex + 1] || null
  // console.log(`${metaValue.index}: indents: ${metaValue.indents} ${prevMetaValue?.indents} "${paragraph.content}"`)
  thisMeta.hasChildren = hasChildren(thisMeta, prevMetaValue)
  // if (paragraph.type === 'title') {
  //   if (paragraph.headingLevel < lastSwept.headingLevel) return 'heading'
  // } else {
  //   if (paragraph.headingLevel >= lastSwept.headingLevel) return 'reset'
  // }
  // if (paragraph.type === 'text' && p.content === '---') return 'separator'
  // if (paragraph.type === 'text' && p.content === '---') return 'text'
  return meta
}

type Metadata = {
  indents: number,
  headingLevel: number,
  heading: string,
  sweep: boolean,
  index: number,
  hasChildren: boolean,
}
export function initializeMetaData(paragraphs: [TParagraph]): [Metadata] {
  return paragraphs.map((p, i) => ({
    indents: p.indents,
    headingLevel: p.headingLevel,
    heading: p.heading,
    sweep: false,
    index: i,
  }))
}

/**
 * @description Set the .sweep flag on paragraphs to be swept
 * @param { [TParagraph]} paragraphs
 * @param { } options -- see defaults below
 */
export function flagParagraphsForSweeping(paragraphs: [TParagraph], options: { [string]: any } = {}) {
  const defaults = {
    sweepSeparators: true,
    includeTitle: true,
    ignore: ['scheduled', 'cancelled', 'done', 'empty'],
    setTextIndents: true,
  }
  const opts = { ...defaults, ...options }
  let meta = initializeMetaData(paragraphs) // tracks to .paragraphs and adds metadata
  if (opts.includeTitle) {
    meta = setHeadings(paragraphs, meta)
  }
  if (opts.setTextIndents) {
    meta = setTextIndents(paragraphs, meta)
  }
  //loop through paragraphs in reverse order
  let prevMeta = null
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i]
    // const lastSwept = { paragraph: null, indents: 0 }
    // if (opts.ignore.includes(p.type)) continue

    meta = comparePredecessor(p, meta, i)
    // if (isOpenTask(p) || sweepThis) {
    //   meta[i].sweep = true
    //   lastSwept.paragraph = p
    // }
  }
  return meta
}

// export function tbd(note) {
//   if (noteHasOpenTasks(note)) {
//     note.paragraphs = flagParagraphsForSweeping(note.paragraphs)
//   }
//   return note
// }

export async function getParagraphDetail(paragraph: TParagraph) {
  //   const { id, text, noteId, order } = paragraph
  //   const note = await getNoteDetail(noteId)
  //   return { id, text, noteId, order, note }
}

const noteWithTasks = {
  paragraphs: [{ type: 'open', content: 'test' }],
}
noteHasOpenTasks(noteWithTasks) //should return true

const noteWithOutTasks = {
  paragraphs: [{ type: 'heading', content: 'test' }],
}
noteHasOpenTasks(noteWithOutTasks) //should return false
