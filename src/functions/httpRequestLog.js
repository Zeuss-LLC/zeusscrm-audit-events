require('../init');
const { httpLog, handleHttpError } = require('../models/httpLog');
const { app } = require('@azure/functions');

app.serviceBusQueue('httpRequestLog', {
  connection: 'zeusscrm_SERVICEBUS',
  queueName: 'http-request-log',
  handler: async (message, context) => {
    context.log('Service bus queue function processed message:', message);
    message.type = message.type || 'external';

    if (message.type === 'external') {
      message.exception
        ? await handleHttpError(
            message.type,
            message.filename,
            message.methodName,
            message.exception
          )
        : await httpLog(message.type, {
            path: message.filename,
            methodName: message.methodName,
            request: message.request,
            response: message.response,
          });
    }

    if (message.type === 'internal') {
      await httpLog(message.type, message);
    }
  },
});
