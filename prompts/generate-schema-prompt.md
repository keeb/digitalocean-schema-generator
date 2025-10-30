# DigitalOcean Asset Schema Generator Prompt

## Context
You are generating SI asset schemas for DigitalOcean resources following the upstream `si-conduit` format.
Reference the sshkey example at `/home/keeb/git/si/bin/si-conduit/sshkey/` to understand the directory structure and file organization.

## Schema Directory Naming Convention

**IMPORTANT**: The `<schema-name>` directory must be normalized using the `normalizeFsName` function from si-conduit.

The normalization rules are:
- Replace any character that isn't alphanumeric (A-Z, a-z, 0-9), period (`.`), underscore (`_`), or hyphen (`-`) with a hyphen (`-`)
- Preserve: letters, digits, `.`, `_`, `-`
- Replace: all other characters (including spaces) become hyphens

**Examples:**
- `"DigitalOcean SSH Key"` → `"DigitalOcean-SSH-Key"`
- `"DigitalOcean App Platform"` → `"DigitalOcean-App-Platform"`
- `"DigitalOcean CDN Endpoint"` → `"DigitalOcean-CDN-Endpoint"`
- `"User/Admin"` → `"User-Admin"`
- `"test@example.com"` → `"test-example.com"`

The directory name is derived from the `name` property in `schema.metadata.json`, normalized with this function.

## Function File Naming Convention

**CRITICAL**: All function files (actions, codeGenerators, management, qualifications) must also follow the `normalizeFsName` convention.

The file naming rules are:
1. The `name` property in each function's `.metadata.json` file is the source of truth
2. The filename prefix is `normalizeFsName(metadata.name)`
3. Both the `.metadata.json` and `.ts` files share the same normalized prefix

**Example**: If a qualification function has:
```json
{
  "name": "Fields Are Valid",
  ...
}
```

Then the files should be named:
- `Fields-Are-Valid.metadata.json`
- `Fields-Are-Valid.ts`

**Common Examples:**
- `name: "app-create"` → files: `app-create.metadata.json`, `app-create.ts`
- `name: "droplet-qualification"` → files: `droplet-qualification.metadata.json`, `droplet-qualification.ts`
- `name: "sshkey-import"` → files: `sshkey-import.metadata.json`, `sshkey-import.ts`
- `name: "vpc codegen"` → files: `vpc-codegen.metadata.json`, `vpc-codegen.ts` (space becomes hyphen)

**Note**: The same `normalizeFsName` normalization function applies to both schema directories AND function filenames.

## Asset Structure Overview
Each DigitalOcean resource creates an asset following the si-conduit standardized project structure:

```
├── .conduitroot                       # Marker file identifying the project root
└── schemas/
    └── <schema-name>/                  # Normalized directory name (see naming convention above)
        ├── .format-version            # Format version (0)
        ├── schema.ts                  # Main schema definition (PropBuilder)
        ├── schema.metadata.json       # Asset metadata
        ├── actions/
        │   ├── <name>.ts              # Create action implementation (filename = normalizeFsName(metadata.name))
        │   ├── <name>.metadata.json   # Create action metadata (contains the "name" property)
        │   ├── <name>.ts              # Destroy/delete action implementation
        │   ├── <name>.metadata.json   # Destroy action metadata
        │   ├── <name>.ts              # Refresh/read action implementation
        │   ├── <name>.metadata.json   # Refresh action metadata
        │   ├── <name>.ts              # Update action implementation
        │   └── <name>.metadata.json   # Update action metadata
        ├── codeGenerators/
        │   ├── <name>.ts              # Code generation function (filename = normalizeFsName(metadata.name))
        │   └── <name>.metadata.json   # Code generator metadata (contains the "name" property)
        ├── management/
        │   ├── <name>.ts              # Resource discovery/import function (filename = normalizeFsName(metadata.name))
        │   └── <name>.metadata.json   # Management metadata (contains the "name" property)
        └── qualifications/
            ├── <name>.ts              # Qualification/validation function (filename = normalizeFsName(metadata.name))
            └── <name>.metadata.json   # Qualification metadata (contains the "name" property)

## Instructions

Generate a complete SI asset for the DigitalOcean resource: `{RESOURCE_NAME}`

**CRITICAL**: The schema directory name must be normalized using `normalizeFsName()` - see "Schema Directory Naming Convention" above.

### Required Steps:
1. **Extract Schema Definition**: Search for the creation schema in `digitalocean-api-spec.yaml` using patterns like:
   - `{resource_name}_create:`
   - `{resource_name}_single_create:`
   - `{resource_name}:` (for base schemas)

2. **Identify Resource Properties**: Find the full resource schema to identify API-generated output properties:
   - Look for `readOnly: true` properties
   - Compare creation schema vs full resource schema
   - Common patterns: `id`, `fingerprint`, `created_at`, `status`

3. **Generate PropBuilder Schema** in `index.ts` following these patterns:

### Property Type Mappings:
- **String properties** → `setKind("string")`
- **Integer properties** → `setKind("float")` + `setValidationFormat(Joi.number().integer())`
- **Boolean properties** → `setKind("boolean")`
- **Array properties** → `setKind("array")` + `setEntry()` for items
- **Object properties** → `setKind("object")` + `addChild()` for nested props

### UI Display Limitations for Complex Objects:
**IMPORTANT**: The UI cannot properly display complex nested objects. Follow these rules:

✅ **WORKS - Simple arrays:**
- Arrays of strings: `["item1", "item2"]`
- Arrays of numbers: `[1, 2, 3]`
- Arrays of booleans: `[true, false]`

❌ **DOESN'T WORK - Complex nested structures:**
- Objects with multiple `.addChild()` calls
- Arrays containing objects with nested properties
- Deep nesting (object → array → object → properties)

**Rule**: For resource properties (read-only API outputs), only include simple types:
- Simple strings, numbers, booleans
- Arrays of simple types (strings/numbers only)
- Avoid any objects with `.addChild()` calls in resource properties

### Widget Type Mappings:
- **Enums/Limited Options** → `setKind("comboBox")` + `addOption(value, label)`
- **Text input** → `setKind("text")`
- **Boolean** → `setKind("checkbox")`
- **Arrays** → `setKind("array")`
- **Objects** → `setKind("header")`
- **Code/Scripts** → `setKind("codeEditor")`
- **Large text** → `setKind("textArea")`

### Validation Patterns:
- **Required fields** → `setValidationFormat(Joi.string().required())`
- **String length** → `Joi.string().max(255)`
- **Patterns** → `Joi.string().pattern(/regex/)`
- **UUIDs** → `Joi.string().uuid()`
- **Numbers** → `Joi.number().integer().min(0).max(100)`
- **Arrays** → Apply validation to entry items

### Common DigitalOcean Property Patterns:

#### Regions:
```javascript
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
```

#### Names with DO Pattern:
```javascript
.setValidationFormat(Joi.string().required().max(255).pattern(/^[a-zA-Z0-9]?[a-z0-9A-Z.\-]*[a-z0-9A-Z]$/))
```

#### Tags Array:
```javascript
.setKind("array")
.setEntry(
    new PropBuilder()
    .setName("tags_item")
    .setKind("string")
    .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
    .build()
)
```

#### SSH Keys Array:
```javascript
.setKind("array")
.setValidationFormat(Joi.alternatives().try(Joi.number().integer(), Joi.string()))
.setEntry(
    new PropBuilder()
    .setName("ssh_keys_item")
    .setKind("string")
    .setWidget(new PropWidgetDefinitionBuilder().setKind("text").build())
    .setDocumentation("SSH key ID (integer) or fingerprint (string)")
    .build()
)
```

### Schema Structure Template (`index.ts`):
```typescript
function main() {
    // DigitalOcean API Token secret (ALWAYS REQUIRED)
    const DOCredentialSecretProp = new SecretPropBuilder()
        .setName("DigitalOcean Credential")
        .setSecretKind("DigitalOcean Credential")
        .build();

    // Props - Generate one for each property
    const {propertyName}Prop = new PropBuilder()
        .setName("{property_name}")
        .setKind("{data_type}")
        .setHidden(false)
        .setWidget(new PropWidgetDefinitionBuilder()
            .setKind("{widget_type}")
            .setCreateOnly() // For creation-only properties
            .build())
        .setValidationFormat({validation_rules})
        .setDocumentation("{property_description_from_api_spec}")
        .build();

    // For objects with nested properties:
    const nestedProp = new PropBuilder()
        .setName("nested_object")
        .setKind("object")
        .setWidget(new PropWidgetDefinitionBuilder().setKind("header").build())
        .addChild(/* child props */)
        .build();

    // Create the asset
    const asset = new AssetBuilder()
        .addProp(/* all input props */)
        .addResourceProp(/* all output props */)  // Properties returned by API
        .addSecretProp(DOCredentialSecretProp)  // ALWAYS INCLUDE THIS
        .build();

    return asset;
}
```

### Resource Properties (Output Properties):
Some DigitalOcean resources have properties that are **generated by the API** after creation and cannot be set by the user. These are read-only properties that appear in API responses but not in creation requests.

#### How to Identify Resource Properties:
1. Look at the full resource schema in the API spec (e.g., `sshKeys` schema)
2. Compare input properties (used in POST requests) vs output properties (returned in responses)
3. Properties marked as `readOnly: true` in the API spec are resource properties
4. Common examples: `id`, `fingerprint`, `created_at`, `updated_at`, `status`

#### Resource Property Implementation:
```javascript
// Example: SSH Key fingerprint is generated by API
const fingerprintProp = new PropBuilder()
    .setName("fingerprint")
    .setKind("string")
    .setDocumentation("A unique identifier that differentiates this key from other keys using a format that SSH recognizes. Generated automatically when the key is added.")
    .build();

// Add to asset using addResourceProp (not addProp)
const asset = new AssetBuilder()
    .addProp(nameProp)        // User input
    .addProp(publicKeyProp)   // User input
    .addResourceProp(fingerprintProp)  // API generated
    .addSecretProp(DOCredentialSecretProp)
    .build();
```

#### Common DigitalOcean Resource Properties:
- **`id`**: Unique identifier for the resource (integer or UUID)
- **`fingerprint`**: Generated hash/fingerprint (SSH keys, certificates)
- **`created_at`**: ISO 8601 timestamp of creation
- **`updated_at`**: ISO 8601 timestamp of last update
- **`status`**: Current state of the resource (droplets, volumes, etc.)
- **`ip_address`**: Assigned IP addresses (droplets, load balancers)
- **`urn`**: Uniform Resource Name for the resource

### Specific Requirements:
- **Secret Props**: ALWAYS include the DigitalOcean Credential secret prop using `addSecretProp(DOCredentialSecretProp)`
- **CreateOnly**: Mark creation-only properties with `.setCreateOnly()`
- **Required Properties**: Use `Joi.string().required()` for mandatory fields
- **Documentation**: Extract description from API spec and use exact text
- **Naming**: Use DigitalOcean's native property names (no AWS-style conversion)
- **Resource Props**: Use `addResourceProp()` for API-generated output-only properties

### Output Format:
Create a new directory structure following the si-conduit pattern:

**IMPORTANT**: The directory name `<schema-name>` must be the normalized version of the schema's `name` field using the `normalizeFsName` convention described above.

```
schemas/<schema-name>/                  # Directory name = normalizeFsName(metadata.name)
  ├── .format-version
  ├── schema.ts
  ├── schema.metadata.json
  ├── actions/
  ├── codeGenerators/
  ├── management/
  └── qualifications/
```

### Core Files to Generate:

#### 1. `.format-version`
Single line containing: `0`

#### 2. `schema.metadata.json` - Asset Metadata
```json
{
  "name": "{resource-name}",
  "category": "",
  "description": "optional",
  "documentation": "optional, should be a link"
}
```

**Note**: The directory name is the normalized version of the `name` field. For example, if the name is "DigitalOcean SSH Key", the directory would be `schemas/DigitalOcean-SSH-Key/`.

Example for DigitalOcean SSH Key:
```json
{
  "name": "DigitalOcean SSH Key",
  "category": "",
  "description": "SSH keys are used to provide secure access to Droplets and other resources. They are embedded into the root user's authorized_keys file when included during resource creation.",
  "documentation": "https://docs.digitalocean.com/reference/api/api-reference/#tag/SSH-Keys"
}
```

#### 3. `schema.ts` - PropBuilder Schema
Main schema definition file containing the AssetBuilder configuration.

#### 4. Actions Directory (`actions/`)
Each action has two files: a TypeScript implementation (`.ts`) and JSON metadata (`.metadata.json`).

**Action Files Template (`{action}.ts`):**
```typescript
function main(input: Input) {
  return {
    status: "error",
    message: "{action} Action not implemented"
  }
}
```

**Action Metadata Template (`<name>.metadata.json`):**
```json
{
  "name": "{resource-name}-{action}",
  "displayName": "{Resource Name} {Action}",
  "description": "optional"
}
```

**IMPORTANT**: The filename prefix is `normalizeFsName(metadata.name)`. For example:
- If `name: "droplet-create"`, files are `droplet-create.metadata.json` and `droplet-create.ts`
- If `name: "app create"`, files are `app-create.metadata.json` and `app-create.ts`

**Required Actions:**
- **{normalized-name}.ts / {normalized-name}.metadata.json** - Creates a new resource (e.g., `droplet-create.ts`)
- **{normalized-name}.ts / {normalized-name}.metadata.json** - Deletes/destroys a resource (e.g., `droplet-destroy.ts`)
- **{normalized-name}.ts / {normalized-name}.metadata.json** - Reads/refreshes resource state (e.g., `droplet-refresh.ts`)
- **{normalized-name}.ts / {normalized-name}.metadata.json** - Updates an existing resource (e.g., `droplet-update.ts`)

Reference implementations from current schema structure:
- Use the patterns from `/home/keeb/git/schema-generator/schema/sshkey/actions/` as guides
- Actions receive component input with properties including resource data and secrets

#### 5. Code Generators Directory (`codeGenerators/`)
Generates code (typically JSON payloads) for API interactions.

**Code Generator Template (`<codegen-name>.ts`):**
```typescript
function main() {
  const code = {};
  return {
    format: "json",
    code: JSON.stringify(code, null, 2),
  };
}
```

**Code Generator Metadata (`<name>.metadata.json`):**
```json
{
  "name": "{resource-name}-codegen",
  "displayName": "Generate JSON Code",
  "description": "optional"
}
```

**IMPORTANT**: The filename prefix is `normalizeFsName(metadata.name)`. For example:
- If `name: "droplet-codegen"`, files are `droplet-codegen.metadata.json` and `droplet-codegen.ts`
- If `name: "app codegen"`, files are `app-codegen.metadata.json` and `app-codegen.ts`

#### 6. Management Directory (`management/`)
Handles resource discovery and import operations.

**Management Template (`<management-name>.ts`):**
```typescript
function main() {
  const ops = {
    update: {},
    actions: {
      self: {
        remove: [] as string[],
        add: [] as string[],
      },
    },
  };

  return {
    status: "ok",
    message: "Imported Resource",
    ops,
  };
}
```

**Management Metadata (`<name>.metadata.json`):**
```json
{
  "name": "{resource-name}-import",
  "displayName": "Import Empty Resource",
  "description": "optional"
}
```

**IMPORTANT**: The filename prefix is `normalizeFsName(metadata.name)`. For example:
- If `name: "droplet-import"`, files are `droplet-import.metadata.json` and `droplet-import.ts`
- If `name: "app import"`, files are `app-import.metadata.json` and `app-import.ts`

#### 7. Qualifications Directory (`qualifications/`)
Contains validation/qualification functions.

**Qualification Template (`<qualification-name>.ts`):**
```typescript
function main(input: Input) {
  return {
    status: "ok"
  }
}
```

**Qualification Metadata (`<name>.metadata.json`):**
```json
{
  "name": "{resource-name}-qualification",
  "displayName": "Qualification",
  "description": "optional"
}
```

**IMPORTANT**: The filename prefix is `normalizeFsName(metadata.name)`. For example:
- If `name: "droplet-qualification"`, files are `droplet-qualification.metadata.json` and `droplet-qualification.ts`
- If `name: "app qualification"`, files are `app-qualification.metadata.json` and `app-qualification.ts`

### Resource-Specific Notes:
- **Droplets**: Include size options, image options, region options
- **Volumes**: Include filesystem types, size constraints
- **LoadBalancers**: Include algorithm options, health check configs
- **Databases**: Include engine versions, node sizes, backup configs
- **VPCs**: Include IP range validation
- **Firewalls**: Include port ranges, protocol options

### Implementation Guidelines:

#### Property Mapping for Actions
Actions receive `component.properties` with structure:
```typescript
{
  si: { resourceId: string },
  domain: { /* user-input properties */ },
  resource: { payload: { /* API response data */ } },
  code: { /* generated code payloads */ }
}
```

#### Code Generation Best Practices
- Use `code.sshkeyCreate` or similar pattern for action code lookups
- Handle optional properties using the `PropUsageMap` from component.domain.extra
- Clean empty values before sending to API

#### Resource ID Determination
- Use API response field that uniquely identifies the resource (typically `id` or `name`)
- Return `resourceId` in action responses for tracking

#### Error Handling Pattern
- Return `{ status: "error", message: "..." }` for failures
- Return `{ status: "ok", ... }` for successes
- Include detailed error context from API responses

### DigitalOcean API Access Example:

Use this fetch function to access the DigitalOcean API with the `DO_API_TOKEN` environment variable:

```typescript
// Simple DigitalOcean API fetch function using environment variable
async function doApiFetch(endpoint: string, options: RequestInit = {}) {
  const token = requestStorage.getEnv("DO_API_TOKEN");
  if (!token) {
    throw new Error('DO_API_TOKEN not found (hint: you may need a secret)');
  }

  const response = await fetch(`https://api.digitalocean.com/v2${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Example usages:
const droplets = await doApiFetch('/droplets');
const regions = await doApiFetch('/regions');
const newDroplet = await doApiFetch('/droplets', {
  method: 'POST',
  body: JSON.stringify({
    name: 'my-droplet',
    region: 'nyc3',
    size: 's-1vcpu-1gb',
    image: 'ubuntu-20-04-x64'
  })
});
```

## Summary of Files to Generate

For resource `{RESOURCE_NAME}`, create all files in the structure:

**Remember**: The `<schema-name>` directory must use the normalized name: `normalizeFsName(metadata.name)`.

```
schemas/<schema-name>/              # Directory name = normalizeFsName(metadata.name)
├── .format-version                # Contains: 0
├── schema.ts                      # PropBuilder schema definition
├── schema.metadata.json           # Asset metadata (contains the human-readable name)
├── actions/
│   ├── <name>.ts                  # Create action stub (filename = normalizeFsName(metadata.name))
│   ├── <name>.metadata.json       # Create action metadata
│   ├── <name>.ts                  # Destroy action stub (filename = normalizeFsName(metadata.name))
│   ├── <name>.metadata.json       # Destroy action metadata
│   ├── <name>.ts                  # Refresh action stub (filename = normalizeFsName(metadata.name))
│   ├── <name>.metadata.json       # Refresh action metadata
│   ├── <name>.ts                  # Update action stub (filename = normalizeFsName(metadata.name))
│   └── <name>.metadata.json       # Update action metadata
├── codeGenerators/
│   ├── <name>.ts                  # Code generation stub (filename = normalizeFsName(metadata.name))
│   └── <name>.metadata.json       # Code generator metadata
├── management/
│   ├── <name>.ts                  # Import/discovery stub (filename = normalizeFsName(metadata.name))
│   └── <name>.metadata.json       # Management metadata
└── qualifications/
    ├── <name>.ts                  # Qualification stub (filename = normalizeFsName(metadata.name))
    └── <name>.metadata.json       # Qualification metadata
```

**Examples**:
- For a schema with `name: "DigitalOcean SSH Key"`, create the directory `schemas/DigitalOcean-SSH-Key/`
- For an action with `name: "sshkey-create"`, create files `sshkey-create.ts` and `sshkey-create.metadata.json`
- For a qualification with `name: "app qualification"`, create files `app-qualification.ts` and `app-qualification.metadata.json`

Generate the complete asset now for: `{RESOURCE_NAME}`
