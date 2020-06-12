import bodyParser from 'body-parser'
import e2e, { expect } from '../support/helpers/e2e'
import Fixtures from '../support/helpers/fixtures'

const onServer = function (app) {
  app.use(bodyParser.json())

  return app.get('/response', (req, res) => res.json({ ok: true }))
}

const verifyPassedAndFailedAreSame = (expectedFailures) => {
  return ({ stdout }) => {
    const passes = stdout.match(/✓ ✓ VERIFY/g)

    expect(passes.length, 'number of passes should equal the number of failures').to.equal(expectedFailures)
  }
}

describe('e2e error ui', function () {
  e2e.setup({
    port: 1919,
    onServer,
  })

  // these tests are broken up so they don't take too long and time out
  const VARIOUS_ERRORS = [21, 22, 20]

  VARIOUS_ERRORS.forEach((expectedFailures, index) => {
    const testNum = index + 1

    e2e.it(`displays correct UI for errors (${testNum})`, {
      spec: `various_failures_spec_${testNum}.js`,
      expectedExitCode: expectedFailures,
      noTypeScript: true,
      onRun (exec) {
        return exec().then(verifyPassedAndFailedAreSame(expectedFailures))
      },
    })

    e2e.it(`displays correct UI for errors in custom commands (${testNum})`, {
      spec: `various_failures_custom_commands_spec_${testNum}.js`,
      expectedExitCode: expectedFailures,
      noTypeScript: true,
      onRun (exec) {
        return exec().then(verifyPassedAndFailedAreSame(expectedFailures))
      },
    })
  })

  e2e.it('displays correct UI for typescript errors', {
    spec: 'various_failures_spec.ts',
    expectedExitCode: 2,
    onRun (exec) {
      return exec().then(verifyPassedAndFailedAreSame(2))
    },
  })

  const WEBPACK_PREPROCESSOR_PROJECTS = [
    'webpack-preprocessor',
    'webpack-preprocessor-ts-loader',
    'webpack-preprocessor-ts-loader-compiler-options',
    'webpack-preprocessor-awesome-typescript-loader',
  ]

  WEBPACK_PREPROCESSOR_PROJECTS.forEach((project) => {
    e2e.it(`handles sourcemaps in webpack for project: ${project}`, {
      project: Fixtures.projectPath(project),
      spec: 'failing_spec.*',
      expectedExitCode: 1,
      onRun (exec) {
        return exec().then(verifyPassedAndFailedAreSame(1))
      },
    })
  })
})
