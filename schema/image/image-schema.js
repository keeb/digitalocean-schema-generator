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
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().max(255).pattern(/^[a-zA-Z0-9]?[a-z0-9A-Z.\-]*[a-z0-9A-Z]$/))
        .setDocumentation("The display name that has been given to an image. This is what is shown in the control panel and is generally a descriptive title for the image in question.")
        .build();

    // URL property (required)
    const urlProp = new PropBuilder()
        .setName("url")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().uri())
        .setDocumentation("A URL from which the custom Linux virtual machine image may be retrieved. The image it points to must be in the raw, qcow2, vhdx, vdi, or vmdk format. It may be compressed using gzip or bzip2 and must be smaller than 100 GB after being decompressed.")
        .build();

    // Region property (required)
    const regionProp = new PropBuilder()
        .setName("region")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("New York 1", "nyc1")
            .addOption("New York 3", "nyc3")
            .addOption("Amsterdam 3", "ams3")
            .addOption("San Francisco 3", "sfo3")
            .addOption("Singapore 1", "sgp1")
            .addOption("London 1", "lon1")
            .addOption("Frankfurt 1", "fra1")
            .addOption("Toronto 1", "tor1")
            .addOption("Bangalore 1", "blr1")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required())
        .setDocumentation("The slug identifier for the region where the resource will initially be available.")
        .build();

    // Distribution property
    const distributionProp = new PropBuilder()
        .setName("distribution")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("Arch Linux", "Arch Linux")
            .addOption("CentOS", "CentOS")
            .addOption("CoreOS", "CoreOS")
            .addOption("Debian", "Debian")
            .addOption("Fedora", "Fedora")
            .addOption("Fedora Atomic", "Fedora Atomic")
            .addOption("FreeBSD", "FreeBSD")
            .addOption("Gentoo", "Gentoo")
            .addOption("openSUSE", "openSUSE")
            .addOption("RancherOS", "RancherOS")
            .addOption("Rocky Linux", "Rocky Linux")
            .addOption("Ubuntu", "Ubuntu")
            .addOption("Unknown", "Unknown")
            .build())
        .setValidationFormat(Joi.string())
        .setDocumentation("The name of a custom image's distribution. Currently, the valid values are 'Arch Linux', 'CentOS', 'CoreOS', 'Debian', 'Fedora', 'Fedora Atomic', 'FreeBSD', 'Gentoo', 'openSUSE', 'RancherOS', 'Rocky Linux', 'Ubuntu', and 'Unknown'. Any other value will be accepted but ignored, and 'Unknown' will be used in its place.")
        .build();

    // Description property
    const descriptionProp = new PropBuilder()
        .setName("description")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("textArea")
            .build())
        .setValidationFormat(Joi.string().allow(''))
        .setDocumentation("An optional free-form text field to describe an image.")
        .build();

    // Tags property
    const tagsProp = new PropBuilder()
        .setName("tags")
        .setKind("array")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("array")
            .build())
        .setEntry(
            new PropBuilder()
                .setName("tags_item")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .build()
        )
        .setValidationFormat(Joi.array().items(Joi.string()).allow(null))
        .setDocumentation("A flat array of tag names as strings to be applied to the resource. Tag names can contain letters, numbers, colons, dashes, and underscores; there is a limit of 255 characters per tag.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(urlProp)
        .addProp(regionProp)
        .addProp(distributionProp)
        .addProp(descriptionProp)
        .addProp(tagsProp)
        .addSecretProp(DOCredentialSecretProp)
        .build();

    return asset;
}