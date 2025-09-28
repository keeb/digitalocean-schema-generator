function main() {
    // DigitalOcean API Token secret
    const DOCredentialSecretProp = new SecretPropBuilder()
        .setName("DigitalOcean Credential")
        .setSecretKind("DigitalOcean Credential")
        .build();

    // Name property (required for single droplet)
    const nameProp = new PropBuilder()
        .setName("name")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required().max(255).pattern(/^[a-zA-Z0-9]?[a-z0-9A-Z.\-]*[a-z0-9A-Z]$/))
        .setDocumentation("The human-readable string you wish to use when displaying the Droplet name. The name, if set to a domain name managed in the DigitalOcean DNS management system, will configure a PTR record for the Droplet. The name set during creation will also determine the hostname for the Droplet in its internal configuration.")
        .build();

    // Region property
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
        .setDocumentation("The slug identifier for the region that you wish to deploy the Droplet in. If the specific datacenter is not not important, a slug prefix (e.g. `nyc`) can be used to deploy the Droplet in any of the that region's locations (`nyc1`, `nyc2`, or `nyc3`). If the region is omitted from the create request completely, the Droplet may deploy in any region.")
        .build();

    // Size property
    const sizeProp = new PropBuilder()
        .setName("size")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("Basic (1 vCPU, 1GB RAM)", "s-1vcpu-1gb")
            .addOption("Basic (1 vCPU, 2GB RAM)", "s-1vcpu-2gb")
            .addOption("Basic (2 vCPU, 2GB RAM)", "s-2vcpu-2gb")
            .addOption("Basic (2 vCPU, 4GB RAM)", "s-2vcpu-4gb")
            .addOption("Basic (4 vCPU, 8GB RAM)", "s-4vcpu-8gb")
            .addOption("CPU Optimized (2 vCPU)", "c-2")
            .addOption("CPU Optimized (4 vCPU)", "c-4")
            .addOption("CPU Optimized (8 vCPU)", "c-8")
            .addOption("Memory Optimized (2 vCPU, 16GB RAM)", "m-2vcpu-16gb")
            .addOption("Memory Optimized (4 vCPU, 32GB RAM)", "m-4vcpu-32gb")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().required())
        .setDocumentation("The slug identifier for the size that you wish to select for this Droplet.")
        .build();

    // Image property
    const imageProp = new PropBuilder()
        .setName("image")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("comboBox")
            .addOption("Ubuntu 22.04 x64", "ubuntu-22-04-x64")
            .addOption("Ubuntu 20.04 x64", "ubuntu-20-04-x64")
            .addOption("Ubuntu 18.04 x64", "ubuntu-18-04-x64")
            .addOption("Debian 11 x64", "debian-11-x64")
            .addOption("Debian 10 x64", "debian-10-x64")
            .addOption("CentOS 8 x64", "centos-8-x64")
            .addOption("Fedora 37 x64", "fedora-37-x64")
            .addOption("Rocky Linux 9 x64", "rocky-9-x64")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.alternatives().try(Joi.string(), Joi.number().integer()).required())
        .setDocumentation("The image ID of a public or private image or the slug identifier for a public image. This image will be the base image for your Droplet. Requires `image:read` scope.")
        .build();

    // SSH Keys property
    const sshKeysProp = new PropBuilder()
        .setName("ssh_keys")
        .setKind("array")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("array")
            .setCreateOnly()
            .build())
        .setEntry(
            new PropBuilder()
                .setName("ssh_keys_item")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.alternatives().try(Joi.number().integer(), Joi.string()))
                .setDocumentation("SSH key ID (integer) or fingerprint (string)")
                .build()
        )
        .setValidationFormat(Joi.array().items(Joi.alternatives().try(Joi.number().integer(), Joi.string())).default([]))
        .setDocumentation("An array containing the IDs or fingerprints of the SSH keys that you wish to embed in the Droplet's root account upon creation. You must add the keys to your team before they can be embedded on a Droplet. Requires `ssh_key:read` scope.")
        .build();

    // Backups property
    const backupsProp = new PropBuilder()
        .setName("backups")
        .setKind("boolean")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("checkbox")
            .build())
        .setValidationFormat(Joi.boolean().default(false))
        .setDocumentation("A boolean indicating whether automated backups should be enabled for the Droplet.")
        .build();

    // IPv6 property
    const ipv6Prop = new PropBuilder()
        .setName("ipv6")
        .setKind("boolean")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("checkbox")
            .build())
        .setValidationFormat(Joi.boolean().default(false))
        .setDocumentation("A boolean indicating whether to enable IPv6 on the Droplet.")
        .build();

    // Monitoring property
    const monitoringProp = new PropBuilder()
        .setName("monitoring")
        .setKind("boolean")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("checkbox")
            .build())
        .setValidationFormat(Joi.boolean().default(false))
        .setDocumentation("A boolean indicating whether to install the DigitalOcean agent for monitoring.")
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
                .setValidationFormat(Joi.string())
                .build()
        )
        .setValidationFormat(Joi.array().items(Joi.string()).default([]))
        .setDocumentation("A flat array of tag names as strings to apply to the Droplet after it is created. Tag names can either be existing or new tags. Requires `tag:create` scope.")
        .build();

    // User data property
    const userDataProp = new PropBuilder()
        .setName("user_data")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("codeEditor")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().max(65536))
        .setDocumentation("A string containing 'user data' which may be used to configure the Droplet on first boot, often a 'cloud-config' file or Bash script. It must be plain text and may not exceed 64 KiB in size.")
        .build();

    // Volumes property
    const volumesProp = new PropBuilder()
        .setName("volumes")
        .setKind("array")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("array")
            .build())
        .setEntry(
            new PropBuilder()
                .setName("volumes_item")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("Volume ID")
                .build()
        )
        .setValidationFormat(Joi.array().items(Joi.string()).default([]))
        .setDocumentation("An array of IDs for block storage volumes that will be attached to the Droplet once created. The volumes must not already be attached to an existing Droplet. Requires `block_storage:read` scope.")
        .build();

    // VPC UUID property
    const vpcUuidProp = new PropBuilder()
        .setName("vpc_uuid")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().uuid())
        .setDocumentation("A string specifying the UUID of the VPC to which the Droplet will be assigned. If excluded, the Droplet will be assigned to your account's default VPC for the region. Requires `vpc:read` scope.")
        .build();

    // With Droplet Agent property
    const withDropletAgentProp = new PropBuilder()
        .setName("with_droplet_agent")
        .setKind("boolean")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("checkbox")
            .build())
        .setValidationFormat(Joi.boolean().default(true))
        .setDocumentation("A boolean indicating whether to install the DigitalOcean agent used for providing access to the Droplet web console in the control panel. By default, the agent is installed on new Droplets if supported for the image. Otherwise, it isn't. To prevent it from being installed, set to `false`. To make installation errors fatal, explicitly set it to `true`.")
        .build();

    // Resource Properties (API-generated output properties)
    const idProp = new PropBuilder()
        .setName("id")
        .setKind("float")
        .setValidationFormat(Joi.number().integer())
        .setDocumentation("A unique identifier for each Droplet instance. This is automatically generated upon Droplet creation.")
        .build();

    const statusProp = new PropBuilder()
        .setName("status")
        .setKind("string")
        .setDocumentation("A status string indicating the state of a Droplet. This may be 'new', 'active', 'off', or 'archive'.")
        .build();

    const createdAtProp = new PropBuilder()
        .setName("created_at")
        .setKind("string")
        .setDocumentation("A time value given in ISO8601 combined date and time format that represents when the Droplet was created.")
        .build();

    const memoryProp = new PropBuilder()
        .setName("memory")
        .setKind("float")
        .setValidationFormat(Joi.number().integer())
        .setDocumentation("Memory of the Droplet in megabytes.")
        .build();

    const vcpusProp = new PropBuilder()
        .setName("vcpus")
        .setKind("float")
        .setValidationFormat(Joi.number().integer())
        .setDocumentation("The number of virtual CPUs in a Droplet.")
        .build();

    const diskProp = new PropBuilder()
        .setName("disk")
        .setKind("float")
        .setValidationFormat(Joi.number().integer())
        .setDocumentation("The size of the Droplet's disk in gigabytes.")
        .build();

    const lockedProp = new PropBuilder()
        .setName("locked")
        .setKind("boolean")
        .setDocumentation("A boolean value indicating whether the Droplet has been locked, preventing actions by users.")
        .build();







    const snapshotIdsProp = new PropBuilder()
        .setName("snapshot_ids")
        .setKind("array")
        .setEntry(
            new PropBuilder()
                .setName("snapshot_ids_item")
                .setKind("float")
                .setValidationFormat(Joi.number().integer())
                .build()
        )
        .setDocumentation("An array of snapshot IDs of any snapshots created from the Droplet instance.")
        .build();

    const featuresProp = new PropBuilder()
        .setName("features")
        .setKind("array")
        .setEntry(
            new PropBuilder()
                .setName("features_item")
                .setKind("string")
                .build()
        )
        .setDocumentation("An array of features enabled on this Droplet.")
        .build();

    const sizeSlugProp = new PropBuilder()
        .setName("size_slug")
        .setKind("string")
        .setDocumentation("The unique slug identifier for the size of this Droplet.")
        .build();



    const volumeIdsProp = new PropBuilder()
        .setName("volume_ids")
        .setKind("array")
        .setEntry(
            new PropBuilder()
                .setName("volume_ids_item")
                .setKind("string")
                .build()
        )
        .setDocumentation("A flat array including the unique identifier for each Block Storage volume attached to the Droplet.")
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(nameProp)
        .addProp(regionProp)
        .addProp(sizeProp)
        .addProp(imageProp)
        .addProp(sshKeysProp)
        .addProp(backupsProp)
        .addProp(ipv6Prop)
        .addProp(monitoringProp)
        .addProp(tagsProp)
        .addProp(userDataProp)
        .addProp(volumesProp)
        .addProp(vpcUuidProp)
        .addProp(withDropletAgentProp)
        .addResourceProp(idProp)
        .addResourceProp(statusProp)
        .addResourceProp(createdAtProp)
        .addResourceProp(memoryProp)
        .addResourceProp(vcpusProp)
        .addResourceProp(diskProp)
        .addResourceProp(lockedProp)
        .addResourceProp(snapshotIdsProp)
        .addResourceProp(featuresProp)
        .addResourceProp(sizeSlugProp)
        .addResourceProp(volumeIdsProp)
        .addSecretProp(DOCredentialSecretProp)
        .build();

    return asset;
}