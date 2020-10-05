import config from './config';
import Logger from './libs/utils/logger';

import messageHandler from './libs/core/messageHandler';
import { ApplicationServiceProvider } from './providers/ApplicationServiceProvider';
import { ApplicationProcess } from './processes/ApplicationProcess';

async function main(applicationConfig, Logger) {
  const applicationServiceProvider = new ApplicationServiceProvider(applicationConfig.services, Logger);
  const applicationProcess = new ApplicationProcess(
    {
      process: applicationConfig.process,
      handler: messageHandler,
    },
    applicationServiceProvider,
    Logger,
  );
  await applicationProcess.spawn();
}

main(config, Logger);
