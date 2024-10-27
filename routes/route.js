import express from 'express'
const router = express.Router()

import {fileUpload, upload} from '../middleWare/multer.js'
import {highest_volume, average_close, average_vwap} from '../controller/controller.js'
router.get('/highest_volume', upload.single('file'),fileUpload, highest_volume)
router.get('/average_close', average_close)
router.get('/average_vwap', average_vwap)
router.post('/upload', upload.single('file'), fileUpload);


export default router