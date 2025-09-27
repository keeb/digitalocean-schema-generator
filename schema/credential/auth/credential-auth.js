async function main(secret: Input): Promise < Output > {
    requestStorage.setEnv("DO_API_TOKEN", secret.ApiToken);
}
