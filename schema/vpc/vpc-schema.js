function main() {
    // Name property
    const nameProp = new PropBuilder()
        .setName("name")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .build())
        .setValidationFormat(Joi.string().required().max(255).pattern(/^[a-zA-Z0-9\-\.]+$/))
        .setDocumentation("The name of the VPC. Must be unique and may only contain alphanumeric characters, dashes, and periods.")
        .build();

    // Region property
    const regionProp = new PropBuilder()
        .setName("region")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("nyc1", "New York 1")
            .addOption("nyc3", "New York 3")
            .addOption("ams3", "Amsterdam 3")
            .addOption("sfo3", "San Francisco 3")
            .addOption("sgp1", "Singapore 1")
            .addOption("lon1", "London 1")
            .addOption("fra1", "Frankfurt 1")
            .addOption("tor1", "Toronto 1")
            .addOption("blr1", "Bangalore 1")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required())
        .setDocumentation("The slug identifier for the region where the VPC will be created.")
        .build();

    // IP Range property
    const ipRangeProp = new PropBuilder()
        .setName("ip_range")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().pattern(/^(10\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]))|(172\.(?:1[6-9]|2[0-9]|3[01])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]))|(192\.168\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9]))\/(1[6-9]|2[0-8])$/))
        .setDocumentation("The range of IP addresses in the VPC in CIDR notation. Network ranges cannot overlap with other networks in the same account and must be in range of private addresses as defined in RFC1918. It may not be smaller than /28 nor larger than /16. If no IP range is specified, a /20 network range is generated that won't conflict with other VPC networks in your account.")
        .build();

    // Description property
    const descriptionProp = new PropBuilder()
        .setName("description")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("textArea")
            .build())
        .setValidationFormat(Joi.string().max(255))
        .setDocumentation("A free-form text field for describing the VPC's purpose. It may be a maximum of 255 characters.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(regionProp)
        .addProp(ipRangeProp)
        .addProp(descriptionProp)
        .build();

    return asset;
}