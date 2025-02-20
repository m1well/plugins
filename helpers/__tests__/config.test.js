/* globals describe, expect, it, test, jest */

import colors from 'chalk'
import * as c from '../config'

const FILE = `${colors.yellow('helpers/config')}`
const section = colors.blue

describe(`${FILE}`, () => {
  describe(section('validateConfigProperties'), () => {
    // create the return errors to match against
    const createConfigError = (errType, configPropValue, validType) => {
      switch (errType) {
        case 'missing':
          return `Config required field: "${configPropValue}" is missing;`
        case 'regex':
          return `Config field: "${configPropValue}" failed RegEx test "${String(validType)}";`
        case 'type':
          return `Config required field: "${configPropValue}" is not of type "${String(validType)}";`
        case 'noValidations':
          return 'No validations provided'
      }
    }
    describe('validation should work ', () => {
      test('for string ', () => {
        expect(c.validateConfigProperties({ test: 'foo' }, { test: 'string' })).toEqual({ test: 'foo' })
      })
      test('for string with optional: true and exists', () => {
        expect(c.validateConfigProperties({ test: 'foo' }, { test: { type: 'string', optional: true } })).toEqual({
          test: 'foo',
        })
      })
      test('for string with optional: true and does not exist', () => {
        expect(c.validateConfigProperties({ bar: 'foo' }, { test: { type: 'string', optional: true } })).toEqual({
          bar: 'foo',
        })
      })
      test('for regex ', () => {
        expect(c.validateConfigProperties({ test: 'foo' }, { test: /oo/ })).toEqual({ test: 'foo' })
      })
      test('for boolean ', () => {
        expect(c.validateConfigProperties({ test: true }, { test: 'boolean' })).toEqual({ test: true })
      })
      test('for number ', () => {
        expect(c.validateConfigProperties({ test: 5 }, { test: 'number' })).toEqual({ test: 5 })
      })
      test('for array ', () => {
        expect(c.validateConfigProperties({ test: ['foo'] }, { test: 'array' })).toEqual({ test: ['foo'] })
      })
      test('for array ', () => {
        expect(c.validateConfigProperties({ test: { testing: true } }, { test: 'object' })).toEqual({
          test: { testing: true },
        })
      })
    })
    describe('validation errors should fail', () => {
      test('no validations sent ', () => {
        expect(() => c.validateConfigProperties({}, {})).toThrow(createConfigError('noValidations', '', ''))
      })
      test('for required field missing ', () => {
        expect(() => c.validateConfigProperties({}, { test: 'string' })).toThrow(
          createConfigError('missing', 'test', 'string'),
        )
      })
      test('for required field missing marked as optional:false ', () => {
        expect(() => c.validateConfigProperties({}, { test: { type: 'string', optional: false } })).toThrow(
          createConfigError('missing', 'test', 'string'),
        )
      })
      test('for number ', () => {
        expect(() => c.validateConfigProperties({ test: true }, { test: 'string' })).toThrow(
          createConfigError('type', 'test', 'string'),
        )
      })
      test('for string ', () => {
        expect(() => c.validateConfigProperties({ test: true }, { test: 'string' })).toThrow(
          createConfigError('type', 'test', 'string'),
        )
      })
      test('for object ', () => {
        expect(() => c.validateConfigProperties({ test: true }, { test: 'object' })).toThrow(
          createConfigError('type', 'test', 'object'),
        )
      })
      test('for array ', () => {
        expect(() => c.validateConfigProperties({ test: true }, { test: 'array' })).toThrow(
          createConfigError('type', 'test', 'array'),
        )
      })
      test('for regex failed on string', () => {
        expect(() => c.validateConfigProperties({ test: 'foo' }, { test: /test/ })).toThrow(
          createConfigError('regex', 'test', /test/),
        )
      })
      test('for regex but config item wasnt string', () => {
        expect(() => c.validateConfigProperties({ test: true }, { test: /test/ })).toThrow(
          createConfigError('regex', 'test', /test/),
        )
      })
      test('for boolean ', () => {
        expect(() => c.validateConfigProperties({ test: 'string' }, { test: 'boolean' })).toThrow(
          createConfigError('type', 'test', 'boolean'),
        )
      })
    })
  })
})
