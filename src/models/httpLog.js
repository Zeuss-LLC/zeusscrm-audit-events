const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { logger } = require('../services/logger');

const ExternalReqLogSchema = new Schema({
  path: String,
  methodName: String,
  request: Schema.Types.Mixed,
  response: Schema.Types.Mixed,
  exception: Schema.Types.Mixed,
  createdDate: { type: Date, default: () => new Date() },
});

const ExternalReqLogModel = mongoose.model(
  'external_request_log',
  ExternalReqLogSchema,
  'external_request_log'
);

const InternalReqLogSchema = new Schema({
  time: String,
  fromIP: String,
  method: String,
  originalUri: String,
  uri: String,
  requestData: Schema.Types.Mixed,
  responseData: Schema.Types.Mixed,
  referer: String,
  ua: String,
  app: String,
  createdDate: { type: Date, default: () => new Date() },
});

const InternalReqLogModel = mongoose.model(
  'internal_request_log',
  InternalReqLogSchema,
  'internal_request_log'
);

exports.httpLog = async (type, payload) => {
  try {
    type === 'external'
      ? await ExternalReqLogModel.create(payload)
      : await InternalReqLogModel.create(payload);
  } catch (error) {
    logger.error(error);
  }
};

exports.handleHttpError = async (type, path, methodName, error) => {
  if (error.isAxiosError) {
    let errorMessage = null;
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = ` - ${error.response.data.message.toString()}`;
    }

    await httpLog(type, {
      path,
      methodName,
      request: {
        url: `${error.response.config.method} ${error.response.config.url}`,
        headers: error.response.config.headers,
        data: error.response.config.data,
      },
      response: { stack: error.stack, status: error.response.status },
      exception: `${error.message}${errorMessage}`,
    });
  }
};
