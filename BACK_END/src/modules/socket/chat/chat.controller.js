import {Router} from 'express'
const router = Router();


import * as chatServices from './services/chat.services.js';
import { authentication } from '../../../middleWare/auth.middleware.js';


router.get('/:destId',authentication(),chatServices.findOneChat);
// router.get('/roomMessages/:roomId',authentication(),chatServices.findRoomChat);


//________________________________
export default router;