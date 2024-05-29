import { Router } from 'express';
import { PathNotFound, errHandler } from '@/v1/middlewares/errHandler';
import { challengeAuthentication } from '@/v1/middlewares/authHandler';
import { handleHttpRequest} from '@/v1/worker/requestHandler';
import { validateRequest } from '../middlewares/requestValidators';

export const router = Router();

/**
 * @param (logsid) only use at delete method
 * @query (/api/v1/logs?): (query-props) = logtype, take 
 */
router.use('/logs/:logsid?', challengeAuthentication, validateRequest, handleHttpRequest);
/**
 * Error Handling Middleware
 */
router.use(PathNotFound);
router.use(errHandler);