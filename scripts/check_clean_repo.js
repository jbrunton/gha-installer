const shell = require('shelljs')

if (shell.exec('git diff --exit-code HEAD', { silent: true }).code != 0) {
  console.log('Code changes found, commit your changes')
  process.exit(1)
}
