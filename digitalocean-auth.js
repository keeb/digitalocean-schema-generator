async function main(secret: Input): Promise<Output> {
    // Store the DO API token in request storage for use by other functions
    requestStorage.setEnv("DO_API_TOKEN", secret.ApiToken);
}