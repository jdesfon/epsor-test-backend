import 'reflect-metadata';

import Logger from './libs/logger';
import { ApplicationServiceProvider } from './providers/ApplicationServiceProvider';
import { ApplicationProcess } from './processes/ApplicationProcess';

import config from './config';

async function main() {
  const applicationServiceProvider = new ApplicationServiceProvider(config.services, Logger);
  const applicationProcess = new ApplicationProcess(applicationServiceProvider, {
    process: config.applicationProcess.process,
    web: config.applicationProcess.web,
  });

  await applicationProcess.spawn();
}

main().catch(err => {
  console.error(err);
});
