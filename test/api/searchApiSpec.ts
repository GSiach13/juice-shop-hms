/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import { expect } from '@jest/globals'
import type { Product as ProductConfig } from '../../lib/config.types'
import config from 'config'
const security = require('../../lib/insecurity')

const christmasProduct = config.get<ProductConfig[]>('products').filter(({ useForChristmasSpecialChallenge }) => useForChristmasSpecialChallenge)[0]
const pastebinLeakProduct = config.get<ProductConfig[]>('products').filter(({ keywordsForPastebinDataLeakChallenge }) => keywordsForPastebinDataLeakChallenge)[0]

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/products/search', () => {
  it('GET product search with no matches returns no products', () => {
    return frisby.get(`${REST_URL}/products/search?q=nomatcheswhatsoever`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with one match returns found product', () => {
    return frisby.get(`${REST_URL}/products/search?q=o-saft`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(1)
      })
  })

  it('GET product search with SQL injection attempt returns no products', () => {
    return frisby.get(`${REST_URL}/products/search?q=Robert'); DROP TABLE Products; --`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with SQL injection attempt using UNION returns no products', () => {
    return frisby.get(`${REST_URL}/products/search?q=Robert' UNION SELECT * FROM Users; --`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with SQL injection attempt using OR returns no products', () => {
    return frisby.get(`${REST_URL}/products/search?q=Robert' OR 1=1; --`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with long query string returns no products', () => {
    const longQueryString = 'a'.repeat(201)
    return frisby.get(`${REST_URL}/products/search?q=${longQueryString}`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with query string containing special characters returns products', () => {
    return frisby.get(`${REST_URL}/products/search?q=*+?[]`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
      })
  })

  it('GET product search with query string containing non-ASCII characters returns products', () => {
    return frisby.get(`${REST_URL}/products/search?q=äöüß`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
      })
  })

  it('GET product search with query string containing whitespace returns products', () => {
    return frisby.get(`${REST_URL}/products/search?q=hello world`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
      })
  })
})
