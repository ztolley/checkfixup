const nock = require('nock')
const jwt = require('jsonwebtoken')

const masterpush = require('../../test/data/pushmaster.json')
const branchpush = require('../../test/data/pushbranch.json')
const commitsWithoutFixup = require('../../test/data/commitswithoutfixup.json')
const commitsWithFixup = require('../../test/data/commitswithfixup.json')
const commitDeleteBranch = require('../../test/data/commitdeletebranch.json')

const { postHook } = require('./controller')

describe('webhook controller', () => {
  beforeEach(async () => {
    process.env.Key = '"test"'
    this.sandbox = sinon.sandbox.create()

    this.reqMock = {
      body: {},
      headers: {}
    }

    this.resMock = {
      send: this.sandbox.stub(),
      sendStatus: this.sandbox.stub(),
      status: this.sandbox.stub().returnsThis()
    }
  })

  afterEach(() => {
    this.sandbox.restore()
    nock.cleanAll()
  })

  context('when a webhook is not for a push event', () => {
    beforeEach(async () => {
      this.reqMock.headers['x-github-event'] = 'status'
      this.reqMock.body = masterpush
      await postHook(this.reqMock, this.resMock)
    })

    it('should return a message to say it\'s not a supported event', () => {
      expect(this.resMock.status).to.be.calledWith(202)
      expect(this.resMock.send).to.be.calledWith('Invalid event, ignoring')
    })
  })

  context('when a webhook is for a push event', () => {
    beforeEach(() => {
      this.reqMock.headers['x-github-event'] = 'push'
      this.sandbox.stub(jwt, 'sign').returns('1234')
    })

    context('when a hook is triggered for the default branch', () => {
      beforeEach(async () => {
        this.reqMock.body = masterpush
        await postHook(this.reqMock, this.resMock)
      })

      it('should return a message to say it\'s the default branch', () => {
        expect(this.resMock.status).to.be.calledWith(202)
        expect(this.resMock.send).to.be.calledWith('Ignoring event, default branch')
      })
    })

    context('when a hook is triggered for a branch delete', () => {
      beforeEach(async () => {
        this.reqMock.body = commitDeleteBranch
        await postHook(this.reqMock, this.resMock)
      })

      it('should return a message to say it\'s the default branch', () => {
        expect(this.resMock.status).to.be.calledWith(202)
        expect(this.resMock.send).to.be.calledWith('Ignoring event, no commits to analyse')
      })
    })

    context('when a hook is triggered and there are no fixup commits', () => {
      beforeEach(async () => {
        this.nocks = nock('https://api.github.com')
          .post('/installations/74193/access_tokens')
          .matchHeader('Authorization', 'Bearer 1234')
          .reply(200, { token: '443322' })
          .get('/repos/ztolley/checkfixup/compare/master...ztolley-patch-1?access_token=443322')
          .reply(200, commitsWithoutFixup)
          .post('/repos/ztolley/checkfixup/statuses/fe508425a4fd4327bdaef85846e9a06f22420895?access_token=443322', {
            state: 'success',
            description: 'No fixups found',
            context: 'CheckFixup'
          })
          .reply(200)

        this.reqMock.body = branchpush
        await postHook(this.reqMock, this.resMock)
      })

      it('should tell github it was processed successfully', () => {
        expect(this.resMock.status).to.be.calledWith(200)
      })

      it('should call github to set the commit status', () => {
        expect(this.nocks.isDone()).to.be.true
      })
    })

    context('when a hook is triggered and there are fixup commits', () => {
      beforeEach(async () => {
        this.nocks = nock('https://api.github.com')
          .post('/installations/74193/access_tokens')
          .matchHeader('Authorization', 'Bearer 1234')
          .reply(200, { token: '443322' })
          .get('/repos/ztolley/checkfixup/compare/master...ztolley-patch-1?access_token=443322')
          .reply(200, commitsWithFixup)
          .post('/repos/ztolley/checkfixup/statuses/fe508425a4fd4327bdaef85846e9a06f22420895?access_token=443322', {
            state: 'failure',
            description: 'Branch contains fixup!',
            context: 'CheckFixup'
          })
          .reply(200)

        this.reqMock.body = branchpush
        await postHook(this.reqMock, this.resMock)
      })

      it('should tell github it was processed successfully', () => {
        expect(this.resMock.status).to.be.calledWith(200)
      })

      it('should call github to set the commit status', () => {
        expect(this.nocks.isDone()).to.be.true
      })
    })

    context('when a hook is called but the api will not return a token', () => {
      beforeEach(async () => {
        this.nocks = nock('https://api.github.com')
          .post('/installations/74193/access_tokens')
          .matchHeader('Authorization', 'Bearer 1234')
          .reply(401)

        this.reqMock.body = branchpush
        await postHook(this.reqMock, this.resMock)
      })

      it('should return an error', () => {
        expect(this.resMock.status).to.be.calledWith(500)
      })
    })

    context('when github refuses access to the repo commit history', () => {
      beforeEach(async () => {
        this.nocks = nock('https://api.github.com')
          .post('/installations/74193/access_tokens')
          .matchHeader('Authorization', 'Bearer 1234')
          .reply(200, { token: '443322' })
          .get('/repos/ztolley/checkfixup/compare/master...ztolley-patch-1?access_token=443322')
          .reply(401)

        this.reqMock.body = branchpush
        await postHook(this.reqMock, this.resMock)
      })

      it('should return an error', () => {
        expect(this.resMock.status).to.be.calledWith(500)
      })
    })

    context('when github refuses access to set the commit status', () => {
      beforeEach(async () => {
        this.nocks = nock('https://api.github.com')
          .post('/installations/74193/access_tokens')
          .matchHeader('Authorization', 'Bearer 1234')
          .reply(200, { token: '443322' })
          .get('/repos/ztolley/checkfixup/compare/master...ztolley-patch-1?access_token=443322')
          .reply(200, commitsWithFixup)
          .post('/repos/ztolley/checkfixup/statuses/fe508425a4fd4327bdaef85846e9a06f22420895?access_token=443322', {
            state: 'failure',
            description: 'Branch contains fixup!'
          })
          .reply(401)

        this.reqMock.body = branchpush
        await postHook(this.reqMock, this.resMock)
      })

      it('should return an error', () => {
        expect(this.resMock.status).to.be.calledWith(500)
      })
    })
  })
})
