function main() {
    // DigitalOcean API Token secret (ALWAYS REQUIRED)
    const DOCredentialSecretProp = new SecretPropBuilder()
        .setName("DigitalOcean Credential")
        .setSecretKind("DigitalOcean Credential")
        .build();

    // Main app properties from apps_create_app_request
    
    // Project ID property (optional)
    const projectIdProp = new PropBuilder()
        .setName("project_id")
        .setKind("string")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("text")
            .setCreateOnly()
            .build())
        .setValidationFormat(Joi.string().uuid())
        .setDocumentation("The ID of the project the app should be assigned to. If omitted, it will be assigned to your default project. Requires `project:update` scope.")
        .build();

    // App Spec - this is the main configuration object
    const specProp = new PropBuilder()
        .setName("spec")
        .setKind("object")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("header")
            .build())
        .setDocumentation("The desired configuration of an application.")
        
        // App name property (required)
        .addChild(
            new PropBuilder()
                .setName("name")
                .setKind("string")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("text")
                    .setCreateOnly()
                    .build())
                .setValidationFormat(Joi.string().required().min(2).max(32).pattern(/^[a-z][a-z0-9-]{0,30}[a-z0-9]$/))
                .setDocumentation("The name of the app. Must be unique across all apps in the same account.")
                .build()
        )
        
        // Region property
        .addChild(
            new PropBuilder()
                .setName("region")
                .setKind("string")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("atl", "Atlanta")
                    .addOption("nyc", "New York")
                    .addOption("sfo", "San Francisco")
                    .addOption("tor", "Toronto")
                    .addOption("ams", "Amsterdam")
                    .addOption("fra", "Frankfurt")
                    .addOption("lon", "London")
                    .addOption("blr", "Bangalore")
                    .addOption("sgp", "Singapore")
                    .addOption("syd", "Sydney")
                    .build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The slug form of the geographical origin of the app. Default: `nearest available`")
                .build()
        )
        
        // Disable edge cache property
        .addChild(
            new PropBuilder()
                .setName("disable_edge_cache")
                .setKind("boolean")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("checkbox")
                    .build())
                .setValidationFormat(Joi.boolean().default(false))
                .setDocumentation("If set to `true`, the app will **not** be cached at the edge (CDN). Enable this option if you want to manage CDN configuration yourself—whether by using an external CDN provider or by handling static content and caching within your app.")
                .build()
        )
        
        // Disable email obfuscation property
        .addChild(
            new PropBuilder()
                .setName("disable_email_obfuscation")
                .setKind("boolean")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("checkbox")
                    .build())
                .setValidationFormat(Joi.boolean().default(false))
                .setDocumentation("If set to `true`, email addresses in the app will not be obfuscated. This is useful for apps that require email addresses to be visible (in the HTML markup).")
                .build()
        )
        
        // Enhanced threat control enabled property
        .addChild(
            new PropBuilder()
                .setName("enhanced_threat_control_enabled")
                .setKind("boolean")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("checkbox")
                    .build())
                .setValidationFormat(Joi.boolean().default(false))
                .setDocumentation("If set to `true`, suspicious requests will go through additional security checks to help mitigate layer 7 DDoS attacks.")
                .build()
        )
        
        // Domains array
        .addChild(
            new PropBuilder()
                .setName("domains")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(
                    new PropBuilder()
                        .setName("domains_item")
                        .setKind("object")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
                        .addChild(
                            new PropBuilder()
                                .setName("domain")
                                .setKind("string")
                                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                                .setValidationFormat(Joi.string().min(4).max(253).pattern(/^((xn--)?[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}\.?$/))
                                .setDocumentation("The hostname for the domain")
                                .build()
                        )
                        .addChild(
                            new PropBuilder()
                                .setName("type")
                                .setKind("string")
                                .setWidget(new PropWidgetDefinitionBuilder()
                                    .setKind("comboBox")
                                    .addOption("UNSPECIFIED", "Unspecified")
                                    .addOption("DEFAULT", "Default (.ondigitalocean.app)")
                                    .addOption("PRIMARY", "Primary domain")
                                    .addOption("ALIAS", "Alias domain")
                                    .build())
                                .setValidationFormat(Joi.string().default("UNSPECIFIED"))
                                .setDocumentation("The type of domain - DEFAULT: The default `.ondigitalocean.app` domain, PRIMARY: The primary domain for this app, ALIAS: A non-primary domain")
                                .build()
                        )
                        .addChild(
                            new PropBuilder()
                                .setName("wildcard")
                                .setKind("boolean")
                                .setWidget(new PropWidgetDefinitionBuilder().setKind("checkbox").build())
                                .setValidationFormat(Joi.boolean().default(false))
                                .setDocumentation("Whether this is a wildcard domain")
                                .build()
                        )
                        .build()
                )
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("A set of hostnames where the application will be available.")
                .build()
        )
        
        // Services array
        .addChild(
            new PropBuilder()
                .setName("services")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(createServiceSpec())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("Workloads which expose publicly-accessible HTTP services.")
                .build()
        )
        
        // Static sites array
        .addChild(
            new PropBuilder()
                .setName("static_sites")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(createStaticSiteSpec())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("Content which can be rendered to static web assets.")
                .build()
        )
        
        // Workers array
        .addChild(
            new PropBuilder()
                .setName("workers")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(createWorkerSpec())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("Workloads which do not expose publicly-accessible HTTP services.")
                .build()
        )
        
        // Jobs array
        .addChild(
            new PropBuilder()
                .setName("jobs")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(createJobSpec())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("Pre and post deployment workloads which do not expose publicly-accessible HTTP routes.")
                .build()
        )
        
        // Functions array
        .addChild(
            new PropBuilder()
                .setName("functions")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(createFunctionSpec())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("Workloads which expose publicly-accessible HTTP services via Functions Components.")
                .build()
        )
        
        // Databases array
        .addChild(
            new PropBuilder()
                .setName("databases")
                .setKind("array")
                .setHidden(false)
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("array")
                    .build())
                .setEntry(createDatabaseSpec())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("Database instances which can provide persistence to workloads within the application.")
                .build()
        )
        
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(projectIdProp)
        .addProp(specProp)
        .addSecretProp(DOCredentialSecretProp)  // ALWAYS INCLUDE THIS
        .build();

    return asset;
}

// Helper function to create service component spec
function createServiceSpec() {
    return new PropBuilder()
        .setName("services_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        // Component base properties
        .addChild(createComponentBaseProp())
        
        // Service-specific properties
        .addChild(
            new PropBuilder()
                .setName("http_port")
                .setKind("float")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.number().integer().min(1).max(65535).default(8080))
                .setDocumentation("The internal port on which this service's run command will listen. Default: 8080")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("protocol")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("HTTP", "HTTP")
                    .addOption("HTTP2", "HTTP/2")
                    .build())
                .setValidationFormat(Joi.string().default("HTTP"))
                .setDocumentation("The protocol which the service uses to serve traffic on the http_port.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("internal_ports")
                .setKind("array")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("array").build())
                .setEntry(
                    new PropBuilder()
                        .setName("internal_ports_item")
                        .setKind("float")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.number().integer().min(1).max(65535))
                        .build()
                )
                .setValidationFormat(Joi.array().items(Joi.number().integer()).default([]))
                .setDocumentation("The ports on which this service will listen for internal traffic.")
                .build()
        )
        
        // Instance configuration
        .addChild(createInstanceConfigProp())
        
        .build();
}

// Helper function to create static site component spec
function createStaticSiteSpec() {
    return new PropBuilder()
        .setName("static_sites_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        // Component base properties
        .addChild(createComponentBaseProp())
        
        // Static site-specific properties
        .addChild(
            new PropBuilder()
                .setName("index_document")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string().default("index.html"))
                .setDocumentation("The name of the index document to use when serving this static site. Default: index.html")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("error_document")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string().default("404.html"))
                .setDocumentation("The name of the error document to use when serving this static site. Default: 404.html")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("catchall_document")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The name of the document to use as the fallback for any requests to documents that are not found when serving this static site. Only 1 of `catchall_document` or `error_document` can be set.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("output_dir")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("An optional path to where the built assets will be located, relative to the build context. If not set, App Platform will automatically scan for these directory names: `_static`, `dist`, `public`, `build`.")
                .build()
        )
        
        .build();
}

// Helper function to create worker component spec
function createWorkerSpec() {
    return new PropBuilder()
        .setName("workers_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        // Component base properties
        .addChild(createComponentBaseProp())
        
        // Instance configuration
        .addChild(createInstanceConfigProp())
        
        .build();
}

// Helper function to create job component spec
function createJobSpec() {
    return new PropBuilder()
        .setName("jobs_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        // Component base properties
        .addChild(createComponentBaseProp())
        
        // Job-specific properties
        .addChild(
            new PropBuilder()
                .setName("kind")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("UNSPECIFIED", "Unspecified")
                    .addOption("PRE_DEPLOY", "Pre-deploy")
                    .addOption("POST_DEPLOY", "Post-deploy")
                    .build())
                .setValidationFormat(Joi.string().default("UNSPECIFIED"))
                .setDocumentation("The type of job - PRE_DEPLOY: Runs before deployment, POST_DEPLOY: Runs after deployment")
                .build()
        )
        
        // Instance configuration
        .addChild(createInstanceConfigProp())
        
        .build();
}

// Helper function to create function component spec
function createFunctionSpec() {
    return new PropBuilder()
        .setName("functions_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        // Component base properties
        .addChild(createComponentBaseProp())
        
        .build();
}

// Helper function to create database spec
function createDatabaseSpec() {
    return new PropBuilder()
        .setName("databases_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        .addChild(
            new PropBuilder()
                .setName("cluster_name")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The name of the underlying DigitalOcean DBaaS cluster. This is required for production databases. For dev databases, if cluster_name is not set, a new cluster will be provisioned.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("db_name")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The name of the MySQL or PostgreSQL database to configure.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("db_user")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The name of the MySQL or PostgreSQL user to configure.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("engine")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("UNSET", "Unset")
                    .addOption("MYSQL", "MySQL")
                    .addOption("PG", "PostgreSQL")
                    .addOption("REDIS", "Redis")
                    .addOption("MONGODB", "MongoDB")
                    .addOption("KAFKA", "Kafka")
                    .addOption("OPENSEARCH", "OpenSearch")
                    .addOption("VALKEY", "Valkey")
                    .build())
                .setValidationFormat(Joi.string().default("UNSET"))
                .setDocumentation("The database engine type.")
                .build()
        )
        
        .build();
}

// Helper function to create component base properties
function createComponentBaseProp() {
    return new PropBuilder()
        .setName("component_base")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        // Name (required)
        .addChild(
            new PropBuilder()
                .setName("name")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string().required().min(2).max(32).pattern(/^[a-z][a-z0-9-]{0,30}[a-z0-9]$/))
                .setDocumentation("The name. Must be unique across all components within the same app.")
                .build()
        )
        
        // Source configuration - Git
        .addChild(
            new PropBuilder()
                .setName("git")
                .setKind("object")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
                .addChild(
                    new PropBuilder()
                        .setName("branch")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The name of the branch to use")
                        .build()
                )
                .addChild(
                    new PropBuilder()
                        .setName("repo_clone_url")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string().uri())
                        .setDocumentation("The clone URL of the repo. Example: `https://github.com/digitalocean/sample-golang.git`")
                        .build()
                )
                .build()
        )
        
        // Source configuration - GitHub
        .addChild(
            new PropBuilder()
                .setName("github")
                .setKind("object")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
                .addChild(
                    new PropBuilder()
                        .setName("branch")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The name of the branch to use")
                        .build()
                )
                .addChild(
                    new PropBuilder()
                        .setName("repo")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The name of the repo in the format owner/repo. Example: `digitalocean/sample-golang`")
                        .build()
                )
                .addChild(
                    new PropBuilder()
                        .setName("deploy_on_push")
                        .setKind("boolean")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("checkbox").build())
                        .setValidationFormat(Joi.boolean().default(true))
                        .setDocumentation("Whether to automatically deploy new commits made to the repo")
                        .build()
                )
                .build()
        )
        
        // Source configuration - Image
        .addChild(
            new PropBuilder()
                .setName("image")
                .setKind("object")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
                .addChild(
                    new PropBuilder()
                        .setName("registry")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The registry name. Must be left empty for the `DOCR` registry type.")
                        .build()
                )
                .addChild(
                    new PropBuilder()
                        .setName("registry_type")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder()
                            .setKind("comboBox")
                            .addOption("DOCKER_HUB", "Docker Hub")
                            .addOption("DOCR", "DigitalOcean Container Registry")
                            .addOption("GHCR", "GitHub Container Registry")
                            .build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The container registry type.")
                        .build()
                )
                .addChild(
                    new PropBuilder()
                        .setName("repository")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The repository name.")
                        .build()
                )
                .addChild(
                    new PropBuilder()
                        .setName("tag")
                        .setKind("string")
                        .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                        .setValidationFormat(Joi.string())
                        .setDocumentation("The repository tag. Defaults to `latest` if not provided.")
                        .build()
                )
                .build()
        )
        
        // Build configuration
        .addChild(
            new PropBuilder()
                .setName("dockerfile_path")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The path to the Dockerfile relative to the root of the repo. If set, it will be used to build this component. Otherwise, App Platform will attempt to build it using buildpacks.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("build_command")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("An optional build command to run while building this component from source.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("run_command")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("An optional run command to override the component's default.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("source_dir")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("An optional path to the working directory to use for the build. For Dockerfile builds, this will be used as the build context. Must be relative to the root of the repo.")
                .build()
        )
        
        // Environment variables
        .addChild(
            new PropBuilder()
                .setName("envs")
                .setKind("array")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("array").build())
                .setEntry(createEnvironmentVariable())
                .setValidationFormat(Joi.array().items(Joi.object()).default([]))
                .setDocumentation("A list of environment variables made available to the component.")
                .build()
        )
        
        // Environment slug
        .addChild(
            new PropBuilder()
                .setName("environment_slug")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("An environment slug describing the type of this app. For a full list, please refer to the product documentation.")
                .build()
        )
        
        .build();
}

// Helper function to create instance configuration
function createInstanceConfigProp() {
    return new PropBuilder()
        .setName("instance_config")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        .addChild(
            new PropBuilder()
                .setName("instance_count")
                .setKind("float")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.number().integer().min(1).default(1))
                .setDocumentation("The amount of instances that this component should be scaled to. Default: 1. Must not be set if autoscaling is used.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("instance_size_slug")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("apps-s-1vcpu-0.5gb", "Basic (1 vCPU, 0.5GB RAM)")
                    .addOption("apps-s-1vcpu-1gb-fixed", "Basic Fixed (1 vCPU, 1GB RAM)")
                    .addOption("apps-s-1vcpu-1gb", "Basic (1 vCPU, 1GB RAM)")
                    .addOption("apps-s-1vcpu-2gb", "Basic (1 vCPU, 2GB RAM)")
                    .addOption("apps-s-2vcpu-4gb", "Basic (2 vCPU, 4GB RAM)")
                    .addOption("apps-d-1vcpu-0.5gb", "Dedicated (1 vCPU, 0.5GB RAM)")
                    .addOption("apps-d-1vcpu-1gb", "Dedicated (1 vCPU, 1GB RAM)")
                    .addOption("apps-d-1vcpu-2gb", "Dedicated (1 vCPU, 2GB RAM)")
                    .addOption("apps-d-1vcpu-4gb", "Dedicated (1 vCPU, 4GB RAM)")
                    .addOption("apps-d-2vcpu-4gb", "Dedicated (2 vCPU, 4GB RAM)")
                    .addOption("apps-d-2vcpu-8gb", "Dedicated (2 vCPU, 8GB RAM)")
                    .addOption("apps-d-4vcpu-8gb", "Dedicated (4 vCPU, 8GB RAM)")
                    .addOption("apps-d-4vcpu-16gb", "Dedicated (4 vCPU, 16GB RAM)")
                    .addOption("apps-d-8vcpu-32gb", "Dedicated (8 vCPU, 32GB RAM)")
                    .build())
                .setValidationFormat(Joi.string().default("apps-s-1vcpu-0.5gb"))
                .setDocumentation("The instance size to use for this component. Default: `apps-s-1vcpu-0.5gb`")
                .build()
        )
        
        .build();
}

// Helper function to create environment variable spec
function createEnvironmentVariable() {
    return new PropBuilder()
        .setName("envs_item")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        
        .addChild(
            new PropBuilder()
                .setName("key")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string().required().pattern(/^[_A-Za-z][_A-Za-z0-9]*$/))
                .setDocumentation("The variable name")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("value")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
                .setValidationFormat(Joi.string())
                .setDocumentation("The value. If the type is `SECRET`, the value will be encrypted on first submission.")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("scope")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("UNSET", "Unset")
                    .addOption("RUN_TIME", "Runtime only")
                    .addOption("BUILD_TIME", "Build time only")
                    .addOption("RUN_AND_BUILD_TIME", "Both runtime and build time")
                    .build())
                .setValidationFormat(Joi.string().default("RUN_AND_BUILD_TIME"))
                .setDocumentation("When the environment variable is available: RUN_TIME - Made available only at run-time, BUILD_TIME - Made available only at build-time, RUN_AND_BUILD_TIME - Made available at both build and run-time")
                .build()
        )
        .addChild(
            new PropBuilder()
                .setName("type")
                .setKind("string")
                .setWidget(new PropWidgetDefinitionBuilder()
                    .setKind("comboBox")
                    .addOption("GENERAL", "General (plain-text)")
                    .addOption("SECRET", "Secret (encrypted)")
                    .build())
                .setValidationFormat(Joi.string().default("GENERAL"))
                .setDocumentation("The type of environment variable: GENERAL - A plain-text environment variable, SECRET - A secret encrypted environment variable")
                .build()
        )
        
        .build();
}