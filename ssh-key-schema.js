function main() {
    const nameProp = new PropBuilder()
        .setName("name")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().max(255))
        .setDocumentation("A human-readable display name for this key, used to easily identify the SSH keys when they are displayed.")
        .build();

    const publicKeyProp = new PropBuilder()
        .setName("public_key")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("textArea")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required())
        .setDocumentation("The entire public key string that was uploaded. Embedded into the root user's authorized_keys file if you include this key during Droplet creation.")
        .build();

    const idProp = new PropBuilder()
        .setName("id")
        .setKind("float")
        .setHidden(true)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.number().integer())
        .setDocumentation("A unique identification number for this key. Can be used to embed a specific SSH key into a Droplet.")
        .build();

    const fingerprintProp = new PropBuilder()
        .setName("fingerprint")
        .setKind("string")
        .setHidden(true)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string())
        .setDocumentation("A unique identifier that differentiates this key from other keys using a format that SSH recognizes. The fingerprint is created when the key is added to your account.")
        .build();

    const assetFunc = new AssetFunctionBuilder()
        .setName("DigitalOcean::Security::SSHKey")
        .setDescription("Creates a DigitalOcean SSH key instance")
        .addProp(nameProp)
        .addProp(publicKeyProp)
        .addProp(idProp)
        .addProp(fingerprintProp)
        .build();

    return assetFunc;
}