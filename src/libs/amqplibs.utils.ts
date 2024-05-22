import amqplib from 'amqplib';
import {
    MESSAGE_BROKER_SERVICE,
    DEFAULT_5LOG_EXCHANGE,
    DEFAULT_5LOG_ROUTING_KEY
} from '@/constant/global.config';
import EventEmitter from 'events';