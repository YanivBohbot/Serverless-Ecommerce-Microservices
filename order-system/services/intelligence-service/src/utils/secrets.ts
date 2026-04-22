import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { config } from "../config/config";

const client = new SecretsManagerClient({
  region: config.aws.region,
  credentials: config.aws.credentials,
});

export const getAwsSecrets = async (secretName: string) => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName }),
    );
    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }
  } catch (error) {
    console.error("❌ Error retrieving secrets:", error);
    throw error;
  }
};
