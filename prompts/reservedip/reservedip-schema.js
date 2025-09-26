function main() {
    // IP Version property - required to specify if creating IPv4 or IPv6 reserved IP
    const ipVersionProp = new PropBuilder()
        .setName("ip_version")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("ipv4", "IPv4 Reserved IP")
            .addOption("ipv6", "IPv6 Reserved IP")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().valid("ipv4", "ipv6"))
        .setDocumentation("The IP version to create - IPv4 or IPv6 reserved IP.")
        .build();

    // Type property - required to specify if assigning to droplet or reserving to region (IPv4 only)
    const typeProp = new PropBuilder()
        .setName("type")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("assign", "Assign to Droplet")
            .addOption("reserve", "Reserve to Region")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().when('ip_version', {
            is: 'ipv4',
            then: Joi.required().valid("assign", "reserve"),
            otherwise: Joi.forbidden()
        }))
        .setDocumentation("The type of reserved IP allocation - either assign to a specific droplet or reserve to a region for later assignment. Only applicable for IPv4 reserved IPs.")
        .build();

    // Droplet ID property - required when type is "assign" (IPv4 only)
    const dropletIdProp = new PropBuilder()
        .setName("droplet_id")
        .setKind("float")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.number().integer().min(1).when('ip_version', {
            is: 'ipv4',
            then: Joi.when('type', {
                is: 'assign',
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
            otherwise: Joi.forbidden()
        }))
        .setDocumentation("The ID of the Droplet that the reserved IP will be assigned to. Required when type is 'assign' for IPv4 reserved IPs.")
        .build();

    // Region property - required when type is "reserve" for IPv4, or always for IPv6
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
        .setValidationFormat(Joi.string().when('ip_version', {
            is: 'ipv4',
            then: Joi.when('type', {
                is: 'reserve',
                then: Joi.required(),
                otherwise: Joi.forbidden()
            }),
            otherwise: Joi.required() // Always required for IPv6
        }))
        .setDocumentation("The slug identifier for the region the reserved IP will be reserved to. Required when type is 'reserve' for IPv4, or always for IPv6 reserved IPs.")
        .build();

    // Region Slug property - used specifically for IPv6 API calls
    const regionSlugProp = new PropBuilder()
        .setName("region_slug")
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
        .setValidationFormat(Joi.string().when('ip_version', {
            is: 'ipv6',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }))
        .setDocumentation("The slug identifier for the region the reserved IPv6 will be reserved to. Used for IPv6 API calls.")
        .build();

    // Project ID property - optional for IPv4 when reserving to region, not used for IPv6
    const projectIdProp = new PropBuilder()
        .setName("project_id")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().uuid().when('ip_version', {
            is: 'ipv4',
            then: Joi.when('type', {
                is: 'reserve',
                then: Joi.optional(),
                otherwise: Joi.forbidden()
            }),
            otherwise: Joi.forbidden()
        }))
        .setDocumentation("The UUID of the project to which the reserved IP will be assigned. Optional for IPv4 when reserving to region. If not specified, the reserved IP will be assigned to your default project.")
        .build();

    // Tags property - array of strings for organizing resources (not mentioned in spec but common pattern)
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
            .setValidationFormat(Joi.string().max(255))
            .setDocumentation("A tag name")
            .build()
        )
        .setValidationFormat(Joi.array().items(Joi.string().max(255)).max(50))
        .setDocumentation("An array of tags to apply to the reserved IP. Tag names can contain letters, numbers, colons, dashes, and underscores.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(ipVersionProp)
        .addProp(typeProp)
        .addProp(dropletIdProp)
        .addProp(regionProp)
        .addProp(regionSlugProp)
        .addProp(projectIdProp)
        .addProp(tagsProp)
        .build();

    return asset;
}