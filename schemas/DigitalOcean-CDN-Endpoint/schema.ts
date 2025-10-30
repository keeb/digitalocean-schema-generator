function main() {
    // DigitalOcean API Token secret
    const DOCredentialSecretProp = new SecretPropBuilder()
        .setName("DigitalOcean Credential")
        .setSecretKind("DigitalOcean Credential")
        .build();

    // Origin property (required) - the source domain for the CDN
    const originProp = new PropBuilder()
        .setName("origin")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().hostname())
        .setDocumentation("The fully qualified domain name (FQDN) for the origin server which provides the content for the CDN. This is currently restricted to a Space.")
        .build();

    // TTL property - Time To Live for cache
    const ttlProp = new PropBuilder()
        .setName("ttl")
        .setKind("float")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("60", "1 minute")
            .addOption("600", "10 minutes")
            .addOption("3600", "1 hour")
            .addOption("86400", "1 day")
            .addOption("604800", "1 week")
            .build())
        .setValidationFormat(Joi.number().integer().valid(60, 600, 3600, 86400, 604800).default(3600))
        .setDocumentation("The amount of time the content is cached by the CDN's edge servers in seconds. TTL must be one of 60, 600, 3600, 86400, or 604800. Defaults to 3600 (one hour) when excluded.")
        .build();

    // Certificate ID property - for SSL/TLS certificates
    const certificateIdProp = new PropBuilder()
        .setName("certificate_id")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().uuid())
        .setDocumentation("The ID of a DigitalOcean managed TLS certificate used for SSL when a custom subdomain is provided.")
        .build();

    // Custom Domain property - for custom subdomain
    const customDomainProp = new PropBuilder()
        .setName("custom_domain")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().hostname())
        .setDocumentation("The fully qualified domain name (FQDN) of the custom subdomain used with the CDN endpoint.")
        .build();

    // ID property (read-only)
    const idProp = new PropBuilder()
        .setName("id")
        .setKind("string")
        .setHidden(true)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().uuid())
        .setDocumentation("A unique ID that can be used to identify and reference a CDN endpoint.")
        .build();

    // Endpoint property (read-only) - the CDN endpoint URL
    const endpointProp = new PropBuilder()
        .setName("endpoint")
        .setKind("string")
        .setHidden(true)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().hostname())
        .setDocumentation("The fully qualified domain name (FQDN) from which the CDN-backed content is served.")
        .build();

    // Created At property (read-only)
    const createdAtProp = new PropBuilder()
        .setName("created_at")
        .setKind("string")
        .setHidden(true)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().isoDate())
        .setDocumentation("A time value given in ISO8601 combined date and time format that represents when the CDN endpoint was created.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(originProp)
        .addProp(ttlProp)
        .addProp(certificateIdProp)
        .addProp(customDomainProp)
        .addProp(idProp)
        .addProp(endpointProp)
        .addProp(createdAtProp)
        .addSecretProp(DOCredentialSecretProp)
        .build();

    return asset;
}