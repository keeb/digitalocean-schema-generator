function main() {
    // Name property (required)
    const nameProp = new PropBuilder()
        .setName("name")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().max(63).pattern(/^[a-z0-9-]{1,63}$/))
        .setDocumentation("A globally unique name for the container registry. Must be lowercase and be composed only of numbers, letters and `-`, up to a limit of 63 characters.")
        .build();

    // Subscription tier property (required)
    const subscriptionTierSlugProp = new PropBuilder()
        .setName("subscription_tier_slug")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("starter", "Starter - 500MB storage, 500MB transfer")
            .addOption("basic", "Basic - 5GB storage, 5GB transfer")
            .addOption("professional", "Professional - 100GB storage, 100GB transfer")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().valid("starter", "basic", "professional"))
        .setDocumentation("The slug of the subscription tier to sign up for. Valid values can be retrieved using the options endpoint.")
        .build();

    // Region property (optional)
    const regionProp = new PropBuilder()
        .setName("region")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("nyc3", "New York 3")
            .addOption("sfo3", "San Francisco 3")
            .addOption("sfo2", "San Francisco 2")
            .addOption("ams3", "Amsterdam 3")
            .addOption("sgp1", "Singapore 1")
            .addOption("fra1", "Frankfurt 1")
            .addOption("blr1", "Bangalore 1")
            .addOption("syd1", "Sydney 1")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().valid("nyc3", "sfo3", "sfo2", "ams3", "sgp1", "fra1", "blr1", "syd1"))
        .setDocumentation("Slug of the region where registry data is stored. When not provided, a region will be selected.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(subscriptionTierSlugProp)
        .addProp(regionProp)
        .build();

    return asset;
}