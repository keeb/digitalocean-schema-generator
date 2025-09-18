function main() {
    const awsCredential = new SecretDefinitionBuilder()
        .setName("AWS Credential")
        .addProp(
            new PropBuilder()
            .setName("SessionToken")
            .setKind("string")
            .setWidget(
                new PropWidgetDefinitionBuilder()
                .setKind("password")
                .build()
            ).build())
        .addProp(
            new PropBuilder()
            .setName("AccessKeyId")
            .setKind("string")
            .setWidget(
                new PropWidgetDefinitionBuilder()
                .setKind("password")
                .build()
            ).build())
        .addProp(
            new PropBuilder()
            .setName("SecretAccessKey")
            .setKind("string")
            .setWidget(
                new PropWidgetDefinitionBuilder()
                .setKind("password")
                .build()
            ).build())
        .addProp(
            new PropBuilder()
            .setName("AssumeRole")
            .setKind("string")
            .setWidget(
                new PropWidgetDefinitionBuilder()
                .setKind("text")
                .build()
            ).build())
        .addProp(
            new PropBuilder()
            .setName("Endpoint")
            .setKind("string")
            .setWidget(
                new PropWidgetDefinitionBuilder()
                .setKind("text")
                .build()
            ).build())
        .build();
    return new AssetBuilder()
        .defineSecret(awsCredential)
        .build()
}
