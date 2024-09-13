/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby from 'frisby'
import { config } from 'dotenv'

import { version } from '../../lib/utils'
const Joi = frisby.Joi

config() // Load environment variables from .env file

const REST_URL = process.env.REST_URL

describe('/rest/admin/application-version', () => {
  it('GET application version from package.json', () => {
    return frisby.get(`${REST_URL}/application-version`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', { version: version() })
  })
})

describe('/rest/admin/application-configuration', () => {
  it('GET application configuration', () => {
    return frisby.get(`${REST_URL}/application-configuration`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', { config: Joi.object() })
  })
})
