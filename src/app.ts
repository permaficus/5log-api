import { 
    httpServer, 
    httpServerInit, 
    SERVICE_LOCAL_PORT, 
    NODE_ENVIRONMENT
} from "@/libs/service.init";
import {
  consumerInit,

} from '@/v1/consumer/rabbitmq'
import chalk from 'chalk'

const main = async (portNumber: number) => {
  await httpServerInit();
  httpServer.listen(portNumber, () => {
      console.log(
          `-----------------------------------------
          \n${chalk.black.bgGreenBright(`🚀 5Log HTTP Service is Up and Running\n`
          )}\nMode: ${chalk.blueBright(
            `${NODE_ENVIRONMENT}`
          )}\nURL: ${chalk.blueBright(
            `http://localhost:${portNumber}`
          )}\nTime: ${chalk.blueBright(
              `${new Date(Date.now())}`
          )}\n\n-----------------------------------------`
        );
  }).on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`${chalk.green('[http-server]')} ${chalk.redBright(`Port ${portNumber} already in use`)}. Retrying on port: ${portNumber++ + 1}`);
      main(portNumber);
      return;
    }
    console.error(`${chalk.redBright(error.message)}`)
  });
}

main(+SERVICE_LOCAL_PORT);

// STARTING RabbitClient for listening
(async() => {
  await consumerInit();
})();