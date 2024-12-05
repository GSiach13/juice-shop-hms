import frisby = require('frisby')
import { expect } from '@jest/globals'

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
    return frisby.get(`${REST_URL}/products/search?q=orange`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
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

  it('GET product search with empty query string returns all products', () => {
    return frisby.get(`${REST_URL}/products/search?q=`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
      })
  })

  it('GET product search with null query string returns all products', () => {
    return frisby.get(`${REST_URL}/products/search`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
      })
  })

  it('GET product search with undefined query string returns all products', () => {
    return frisby.get(`${REST_URL}/products/search?q=undefined`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBeGreaterThan(0)
      })
  })

  it('GET product search with unionSqlInjectionChallenge query returns no products', () => {
    const user = { email: 'test@example.com', password: 'password' }
    return frisby.get(`${REST_URL}/products/search?q=${user.email}%${user.password}%`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with dbSchemaChallenge query returns no products', () => {
    const tableDefinition = 'SELECT sql FROM sqlite_master'
    return frisby.get(`${REST_URL}/products/search?q=${tableDefinition}%`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })
})
