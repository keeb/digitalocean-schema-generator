function main() {
    // DigitalOcean API Token secret
    const DOCredentialSecretProp = new SecretPropBuilder()
        .setName("DigitalOcean Credential")
        .setSecretKind("DigitalOcean Credential")
        .build();

    // Domain name property
    const nameProp = new PropBuilder()
        .setName("name")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().max(253).min(4).pattern(/^((xn--)?[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}\.?$/))
        .setDocumentation("The name of the domain itself. This should follow the standard domain format of domain.TLD. For instance, `example.com` is a valid domain name.")
        .build();

    // Optional IP address property (write-only, creates A record)
    const ipAddressProp = new PropBuilder()
        .setName("ip_address")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().ip({ version: ['ipv4'] }))
        .setDocumentation("This optional attribute may contain an IP address. When provided, an A record will be automatically created pointing to the apex domain.")
        .build();

    // TTL property (read-only)
    const ttlProp = new PropBuilder()
        .setName("ttl")
        .setKind("float")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.number().integer().allow(null))
        .setDocumentation("This value is the time to live for the records on this domain, in seconds. This defines the time frame that clients can cache queried information before a refresh should be requested.")
        .build();

    // Zone file property (read-only)
    const zoneFileProp = new PropBuilder()
        .setName("zone_file")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("textArea")
            .build())
        .setValidationFormat(Joi.string().allow(null))
        .setDocumentation("This attribute contains the complete contents of the zone file for the selected domain. Individual domain record resources should be used to get more granular control over records. However, this attribute can also be used to get information about the SOA record, which is created automatically and is not accessible as an individual record resource.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(ipAddressProp)
        .addProp(ttlProp)
        .addProp(zoneFileProp)
        .addSecretProp(DOCredentialSecretProp)
        .build();

    return asset;
}