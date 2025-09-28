function main() {
    // DigitalOcean API Token secret
    const DOCredentialSecretProp = new SecretPropBuilder()
        .setName("DigitalOcean Credential")
        .setSecretKind("DigitalOcean Credential")
        .build();

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

    const fingerprintProp = new PropBuilder()
          .setName("fingerprint")
          .setKind("string")
          .build();


    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(publicKeyProp)
        .addSecretProp(DOCredentialSecretProp)
      .addResourceProp(fingerprintProp)
        .build();

    return asset;
}

