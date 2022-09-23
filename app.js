import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import cluster from 'cluster'
import os from 'os'
import compression from 'compression'
import logger from './config/logger.js'
import cron from 'node-cron'

dotenv.config()

const app = express()

const cpuCount = os.cpus().length

app.use(compression())
app.use(cors())
app.options('*', cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev'))

import tokenRouter from './routes/tokensRoute.js'
import addressRouter from './routes/addressRoute.js'

app.use('/api/erc20', tokenRouter)
app.use('/api/address', addressRouter)

import syncERC20 from './controllers/syncERC20.js'
import syncBEP20 from './controllers/syncBEP20.js'
import erc20Reverse from './controllers/erc20Reverse.js'
import bep20Reverse from './controllers/bep20Reverse.js'
import erc20DailyRec from './controllers/erc20DailyRec.js'
import bep20DailyRec from './controllers/bep20DailyRec.js'

syncERC20()
syncBEP20()

setTimeout(() => {
  erc20Reverse()
  bep20Reverse()
}, 30000)


cron.schedule('30 0 * * *', () => {
    erc20DailyRec()
    bep20DailyRec()
  }, {
    scheduled: true,
    timezone: "Asia/Colombo"
  });

const port = process.env.PORT || 5000

// if(cluster.isPrimary) {
//     for(let i = 0; i < cpuCount; i++) {
//         cluster.fork()
//     }
//     cluster.on('exit', (worker, code, signal) => {
//         cluster.fork()
//     })
// }else {
//     app.listen(5000, logger.info(`Server running on port ${port} - pid: ${process.pid}`))
// }

app.listen(5000, logger.info(`Server running on port ${port} - pid: ${process.pid}`))
