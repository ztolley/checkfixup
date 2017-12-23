describe('log', () => {
  beforeEach(() => {
    process.env.SLACK_ID = 'slack'

    this.sandbox = sinon.sandbox.create()
    this.axiosPostStub = this.sandbox.stub()

    this.log = proxyquire(`${__dirname}/log`, {
      'axios': {
        post: this.axiosPostStub
      }
    })
  })

  afterEach(() => {
    this.sandbox.restore()
  })

  context('when called with a network error object', () => {
    beforeEach(async () => {
      const error = {
        message: 'test message',
        stack: 'test stack',
        config: {
          url: 'test config'
        }
      }

      await this.log({ error })
    })

    it('should call slack with formatted error data', () => {
      expect(this.axiosPostStub).to.be.calledWith('https://hooks.slack.com/services/slack', {
        attachments: [{
          color: '#D00000',
          title: 'Checkfixup',
          fallback: 'test message',
          pretext: 'test message',
          text: '{\n\t"config": {\n\t\t"url": "test config"\n\t},\n\t"stack": "test stack",\n\t"message": "test message"\n}',
          fields: []
        }]
      })
    })
  })

  context('when called with a non network error ojbect', () => {
    beforeEach(async () => {
      const error = {
        message: 'test message',
        stack: 'test stack'
      }

      await this.log({ error })
    })

    it('should call slack with formatted error data', () => {
      expect(this.axiosPostStub).to.be.calledWith('https://hooks.slack.com/services/slack', {
        attachments: [{
          color: '#D00000',
          title: 'Checkfixup',
          fallback: 'test message',
          pretext: 'test message',
          text: '{\n\t"stack": "test stack",\n\t"message": "test message"\n}',
          fields: []
        }]
      })
    })
  })

  context('when called with a non error', () => {
    beforeEach(async () => {
      await this.log({
        text: 'test text',
        status: 'success',
        fields: {
          repo: 'test repo'
        }
      })
    })

    it('should call slack with formatted error data', () => {
      expect(this.axiosPostStub).to.be.calledWith('https://hooks.slack.com/services/slack', {
        attachments: [{
          color: '#36a64f',
          title: 'Checkfixup',
          text: 'test text',
          fields: [{
            title: 'repo',
            value: 'test repo',
            short: true
          }]
        }]
      })
    })
  })

  context('when called with hide from slack', () => {
    beforeEach(async () => {
      await this.log({
        text: 'test text',
        status: 'success',
        fields: {
          repo: 'test repo'
        },
        slack: false
      })
    })

    it('should not call slack with formatted error data', () => {
      expect(this.axiosPostStub).to.not.be.called
    })
  })

  context('when called with no slack setting', () => {
    beforeEach(async () => {
      delete process.env.SLACK_ID

      await this.log({
        text: 'test text',
        status: 'success',
        fields: {
          repo: 'test repo'
        }
      })
    })

    it('should not call slack with formatted error data', () => {
      expect(this.axiosPostStub).to.not.be.called
    })
  })
})
