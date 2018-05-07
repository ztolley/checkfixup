describe('log event', () => {
  beforeEach(() => {
    this.axiosGetStub = sinon.stub()

    this.logEvent = proxyquire(`${__dirname}/log_event`, {
      'axios': {
        get: this.axiosGetStub
      },
      'uuid': sinon.stub().returns('4444')
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  context('when there is a GA key', () => {
    beforeEach(() => {
      process.env.GA = '1234'
    })

    context('when called with a success', () => {
      beforeEach(async () => {
        await this.logEvent('success')
      })

      it('should log a success event with GA', () => {
        expect(this.axiosGetStub).to.be.calledWith('https://ga-dev-tools.appspot.com/hit-builder/', {
          params: {
            v: 1,
            t: 'event',
            tid: '1234',
            cid: '4444',
            ec: 'checkfixup',
            ea: 'setStatus',
            ev: 1
          }
        })
      })
    })

    context('when called with a failure', () => {
      beforeEach(async () => {
        await this.logEvent('failure')
      })

      it('should log a success event with GA', () => {
        expect(this.axiosGetStub).to.be.calledWith('https://ga-dev-tools.appspot.com/hit-builder/', {
          params: {
            v: 1,
            t: 'event',
            tid: '1234',
            cid: '4444',
            ec: 'checkfixup',
            ea: 'setStatus',
            ev: 0
          }
        })
      })
    })
  })

  context('when there is no GA key', () => {
    beforeEach(() => {
      delete process.env.GA
    })

    context('when called with a success', () => {
      beforeEach(async () => {
        await this.logEvent('success')
      })

      it('should not log a success event with GA', () => {
        expect(this.axiosGetStub).to.not.be.called
      })
    })

    context('when called with a failure', () => {
      beforeEach(async () => {
        await this.logEvent('failure')
      })

      it('should not log a success event with GA', () => {
        expect(this.axiosGetStub).to.not.be.called
      })
    })
  })
})
