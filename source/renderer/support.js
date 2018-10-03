// @flow
import { ipcRenderer } from 'electron';
import { SUPPORT_WINDOW } from '../common/ipc-api';

type ZendeskInfo = {
  locale: string,
  themeVars: {
    '--theme-support-widget-header-color': string
  }
};

type LogsInfo = {
  compressedLogsFileData: any,
  environment: any,
};

const locales = {
  'en-US': 'en-US',
  'ja-JP': 'ja',
};

const fields = {
  product: '114100735553',
  language: '360007051534',
  os: '360006970973',
  productVersion: '360007053414',
  productAttribute: '360007052714',
};

const loadFormHandlerWhenIframeIsReady = (logsInfo: LogsInfo) => {
  let count = 0;
  const check = () => {
    try {
      const iframeDocument = document.getElementById('webWidget').contentWindow.document;
      const fileInput = iframeDocument.getElementById('dropzone-input');

      if (fileInput) {
        formHandler(iframeDocument, fileInput, logsInfo);
        clearInterval(interval);
      }
    } catch (e) { // eslint-disable-line
      count++;
      if (count > 20) {
        clearInterval(interval);
      }
    }

  };
  const interval = setInterval(check, 500);
};

const formHandler = (
  iframeDocument, fileInput, { environment, compressedLogsFileData }: LogsInfo
) => {
  const dT = new DataTransfer();
  if (dT.items) {
    const file = new File([compressedLogsFileData], 'compressedLogs.zip');
    dT.items.add(file);
    fileInput.files = dT.files;
  }
  fields;
  environment;
};

const closeWindow = () => window.close();

ipcRenderer.on(
  SUPPORT_WINDOW.ZENDESK_INFO,
  (event, { locale, themeVars }: ZendeskInfo) => {
    window.zE(() => {
      // window.zE.hide();
      if (locale !== 'en-US') window.zE.setLocale(locales[locale]);
      window.zE.activate();
    });

    window.zESettings = {
      webWidget: {
        color: {
          theme: themeVars['--theme-support-widget-header-color'],
        }
      }
    };
  }
);

ipcRenderer.on(SUPPORT_WINDOW.CLOSE, () => closeWindow);

ipcRenderer.on(SUPPORT_WINDOW.LOGS_INFO, (event, logsInfo: LogsInfo) =>
  loadFormHandlerWhenIframeIsReady(logsInfo));
