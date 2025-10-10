import { startMetrika } from './services/metrika';
import { withInstallApp } from './helpers/withInstallApp';
import { App } from './components/app/app';
import { initI18n } from './i18n/init';

startMetrika();

initI18n();

withInstallApp();

new App();

