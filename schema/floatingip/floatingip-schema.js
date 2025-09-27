function main() {
    // Type property - required to specify if assigning to droplet or reserving to region
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
        .setValidationFormat(Joi.string().required().valid("assign", "reserve"))
        .setDocumentation("The type of floating IP allocation - either assign to a specific droplet or reserve to a region for later assignment.")
        .build();

    // Droplet ID property - required when type is "assign"
    const dropletIdProp = new PropBuilder()
        .setName("droplet_id")
        .setKind("float")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.number().integer().min(1).when('type', {
            is: 'assign',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }))
        .setDocumentation("The ID of the Droplet that the floating IP will be assigned to. Required when type is 'assign'.")
        .build();

    // Region property - required when type is "reserve"
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
        .setValidationFormat(Joi.string().when('type', {
            is: 'reserve',
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }))
        .setDocumentation("The slug identifier for the region the floating IP will be reserved to. Required when type is 'reserve'.")
        .build();

    // Project ID property - optional, for assigning to a specific project
    const projectIdProp = new PropBuilder()
        .setName("project_id")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().uuid())
        .setDocumentation("The UUID of the project to which the floating IP will be assigned. If not specified, the floating IP will be assigned to your default project.")
        .build();

    // Tags property - array of strings for organizing resources
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
        .setDocumentation("An array of tags to apply to the floating IP. Tag names can contain letters, numbers, colons, dashes, and underscores.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(typeProp)
        .addProp(dropletIdProp)
        .addProp(regionProp)
        .addProp(projectIdProp)
        .addProp(tagsProp)
        .build();

    return asset;
}