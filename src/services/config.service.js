const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { AppConfigurationClient } = require('@azure/app-configuration');

const configCache = {};

const getEnvVar = async (key) => {
  if (process.env[key]) {
    console.log(`Process Env ${key}`, process.env[key]);
    return process.env[key];
  }

  if (configCache[key]) {
    console.log(`Config Cache ${key}`, configCache[key]);
    return configCache[key];
  }

  const appConfigEndpoint = process.env.AZURE_APP_CONFIG_CONNECTIONSTRING;

  const client = new AppConfigurationClient(appConfigEndpoint);

  try {
    const configurationSettings = { key };
    if (process.env.AZURE_APP_CONFIG_LABEL) {
      configurationSettings.label = process.env.AZURE_APP_CONFIG_LABEL;
    }

    const setting = await client.getConfigurationSetting(configurationSettings);
    console.log('Value:', setting.value);
    configCache[key] = setting.value;

    return setting.value;
  } catch (err) {
    console.error('ERROR:', err);
    return null;
  }
};

const getEnvSecret = async (key) => {
  if (process.env[key]) {
    return process.env[key];
  }

  if (configCache[key]) {
    return configCache[key];
  }

  const keyVaultName = process.env.AZURE_KEY_VAULT_NAME;
  const keyVaultUri = `https://${keyVaultName}.vault.azure.net`;

  const client = new SecretClient(keyVaultUri, new DefaultAzureCredential());

  try {
    const secret = await client.getSecret(key);
    console.log('Value:', secret.value);
    configCache[key] = secret.value;
    return secret.value;
  } catch (err) {
    console.error('ERROR:', err);
    return null;
  }
};

const renewCache = async () => {
  const keys = Object.keys(configCache);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    await getEnvVar(key);
  }
};

module.exports = {
  getEnvVar,
  getEnvSecret,
  renewCache,
};
