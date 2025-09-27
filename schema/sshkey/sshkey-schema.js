function main() {
    // Name property (required)
    const nameProp = new PropBuilder()
        .setName("name")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().required().max(255))
        .setDocumentation("A human-readable display name for this key, used to easily identify the SSH keys when they are displayed.")
        .build();

    // Public key property (required, create-only)
    const publicKeyProp = new PropBuilder()
        .setName("public_key")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("textArea")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().pattern(/^(ssh-rsa|ssh-dss|ssh-ed25519|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521)\s+[A-Za-z0-9+\/]+[=]{0,2}(\s+.*)?$/))
        .setDocumentation("The entire public key string that was uploaded. Embedded into the root user's `authorized_keys` file if you include this key during Droplet creation.")
        .build();

    // ID property (read-only, computed)
    const idProp = new PropBuilder()
        .setName("id")
        .setKind("float")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setReadOnly()
            .build())
        .setValidationFormat(Joi.number().integer().min(1))
        .setDocumentation("A unique identification number for this key. Can be used to embed a specific SSH key into a Droplet.")
        .build();

    // Fingerprint property (read-only, computed)
    const fingerprintProp = new PropBuilder()
        .setName("fingerprint")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setReadOnly()
            .build())
        .setValidationFormat(Joi.string().pattern(/^([0-9a-f]{2}:){15}[0-9a-f]{2}$/))
        .setDocumentation("A unique identifier that differentiates this key from other keys using a format that SSH recognizes. The fingerprint is created when the key is added to your account.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(publicKeyProp)
        .addProp(idProp)
        .addProp(fingerprintProp)
        .build();

    return asset;
}