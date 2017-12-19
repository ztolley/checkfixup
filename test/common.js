const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

chai.use(require('sinon-chai'))

// mocha globals
global.expect = chai.expect
global.sinon = sinon
global.proxyquire = proxyquire
