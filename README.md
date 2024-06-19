# 5LOG - Bug Tracking & Error Logging Service

### Disclaimer

- ⚠️ The project is under **very active** development.
- ⚠️ Expect bugs and breaking changes.

### ENV Example

```sh
# mongodb connection string
DATABASE_URL="mongodb://user:password@host:27017/<dbname>?retryWrites=true&authSource=admin&directConnection=true"
# Environment variables for 5log
NODE_ENVIRONMENT=''
SERVICE_LOCAL_PORT=3000

# RabbitMQ Config
MESSAGE_BROKER_SERVICE='amqp://user:password@host:5672'
DEFAULT_5LOG_EXCHANGE='5log-exchange'
DEFAULT_5LOG_QUEUE='5log-queue'
DEFAULT_5LOG_ROUTING_KEY='5log-routekey'
DEFAULT_5LOG_REPLY_QUEUE='5log-responder'
DEFAULT_5LOG_REPLY_ROUTE='5log-responder-route'
# Redis Config
REDIS_URL='redis://host:6379'
USE_CACHING='yes' # valid value:: yes | no
# Webhook Config
WEBHOOK_RETRY_MAX_ATTEMPT = 3
# For Swagger
APP_BASE_URL='http(s)://hostname<:port>'
```

### Installation

```sh
npm install
```
Build Model
```sh
npm run build:model
```
Run Dev
```sh
npm run dev
```