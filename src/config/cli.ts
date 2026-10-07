import cli from 'yargs'
import { hideBin } from 'yargs/helpers'
import { } from './network.js'

const argv = cli(hideBin(process.argv)).parse()

export const options = () => {
    console.log('Options: ', argv)
}