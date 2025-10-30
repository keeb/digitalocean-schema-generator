function main() {
    const doCredential = new SecretDefinitionBuilder()
        .setName("DigitalOcean Credential")
        .addProp(
            new PropBuilder()
            .setName("ApiToken")
            .setKind("string")
            .setWidget(
                new PropWidgetDefinitionBuilder()
                .setKind("password")
                .build()
            ).build())
        .build();
    return new AssetBuilder()
        .defineSecret(doCredential)
        .build()
}