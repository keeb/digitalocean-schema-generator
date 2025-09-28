# Generate DigitalOcean CRUD Actions Prompt

You are an expert code generator that creates CRUD (Create, Read, Update, Delete) operations for DigitalOcean resources based on their schema definitions. Your task is to generate TypeScript functions that interact with the DigitalOcean API v2 to manage droplets and other resources.

## Context
You will be provided with a schema definition for a DigitalOcean resource (starting with droplets). Based on this schema, you need to generate the four fundamental CRUD operations that follow the established patterns in the codebase.

## Reference Implementation Pattern
Use this reference create function for the overall structure and error handling patterns:

```typescript
async function main(component: Input): Promise<Output> {
  // 1. Check if resource already exists
  if (component.properties.resource?.payload) {
    return {
      status: "error",
      message: "Resource already exists",
      payload: component.properties.resource.payload,
    };
  }

  // 2. Extract and validate required code/configuration
  const codeString = component.properties.code?.["doCreate"]?.code;
  if (!codeString) {
    return {
      status: "error",
      message: `Could not find doCreate code for resource`,
    };
  }

  // 3. Get API token for authentication
  const token = requestStorage.getEnv("DO_API_TOKEN");
  if (!token) {
    return {
      status: "error", 
      message: "DO_API_TOKEN not found (hint: you may need a secret)",
    };
  }

  // 4. Execute DigitalOcean REST API call
  const response = await fetch("https://api.digitalocean.com/v2/droplets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: codeString,
  });

  // 5. Handle immediate errors
  if (!response.ok) {
    const errorText = await response.text();
    return {
      status: "error",
      message: `Unable to create droplet; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 6. Parse response and extract resource ID  
  const responseJson = await response.json();
  const dropletName = responseJson.droplet?.name;

  // 7. Return success result
  if (dropletName) {
    return {
      resourceId: dropletName,
      status: "ok",
      payload: responseJson.droplet,
    };
  } else {
    return {
      message: "Failed to extract droplet name from response",
      status: "error",
    };
  }
}
```

## Delete Operation Reference Pattern

```typescript
async function main(component: Input): Promise<Output> {
  // 1. Check if resource exists
  if (!component.properties.resource) {
    return {
      status: "error",
      message: "No resource found to delete",
    };
  }

  // 2. Extract resource ID
  const resourceId = component.properties.resource.id;
  if (!resourceId) {
    return {
      status: "error",
      message: "Resource ID not found",
    };
  }

  // 3. Get API token
  const token = requestStorage.getEnv("DO_API_TOKEN");
  if (!token) {
    return {
      status: "error", 
      message: "DO_API_TOKEN not found (hint: you may need a secret)",
    };
  }

  // 4. Execute delete API call
  const response = await fetch(`https://api.digitalocean.com/v2/droplets/${resourceId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 5. Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    return {
      status: "error",
      message: `Unable to delete droplet; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 6. Return success
  return {
    status: "ok",
  };
}
```

## Requirements for Generated CRUD Operations

### 1. Create Operation
- Check if resource already exists
- Validate required parameters from schema
- Handle authentication/secrets properly
- Execute create API call using appropriate CLI or SDK
- Handle async operations with polling if needed
- Return resource name as resourceId, status, and full droplet payload

### 2. Read Operation  
- Accept droplet ID
- Use `GET https://api.digitalocean.com/v2/droplets/{id}` to fetch current state
- Return structured droplet data from response.droplet
- Handle 404 not found cases gracefully

### 3. Update Operation
- Accept droplet ID and update payload
- Use appropriate DigitalOcean API endpoints (resize: `POST /droplets/{id}/actions`, rename: `PUT /droplets/{id}`)
- Handle partial updates and action-based operations
- Return updated droplet state or action status

### 4. Delete Operation
- Check if resource exists in component.properties.resource
- Extract resource ID from component.properties.resource.id
- Use `DELETE https://api.digitalocean.com/v2/droplets/{id}`
- Handle 204 No Content success response  
- Return deletion status only (no payload needed)

## Output Format
For each CRUD operation, generate:
1. TypeScript function with proper typing
2. Input/Output interfaces  
3. Error handling for common failure modes
4. API token handling via requestStorage.getEnv("DO_API_TOKEN")
5. Direct REST API calls to DigitalOcean API v2 using fetch()
6. Use codeString directly as request body (already JSON formatted)

## Schema-Specific Adaptations
- Extract required and optional fields from the DigitalOcean schema
- Map schema properties to DigitalOcean API v2 JSON fields
- Generate appropriate validation logic
- Handle DigitalOcean authentication patterns (Bearer tokens via DO_API_TOKEN)
- Adapt to DigitalOcean API v2 patterns and resource types

## Error Handling Standards
- Always return structured error responses with status and message
- Handle network failures, authentication errors, and resource conflicts
- Provide meaningful error messages for debugging
- Include relevant DigitalOcean API error codes and messages

Generate clean, maintainable TypeScript code that follows the established patterns while being specifically tailored to the DigitalOcean schema.

## Code Generation Function Pattern

In addition to the CRUD operations, you also need to generate a code generation function that prepares the API payload. Here's the reference pattern adapted for DigitalOcean:

```typescript
async function main(component: Input): Promise<Output> {
  interface DigitalOceanDropletPayload {
    name: string;
    region: string;
    size: string;
    image: string;
    ssh_keys?: string[];
    backups?: boolean;
    ipv6?: boolean;
    monitoring?: boolean;
    tags?: string[];
    user_data?: string;
    vpc_uuid?: string;
  }

  const propUsageMap = JSON.parse(component.domain.extra.PropUsageMap);
  if (
    !Array.isArray(propUsageMap.createOnly) ||
    !Array.isArray(propUsageMap.updatable) ||
    !Array.isArray(propUsageMap.secrets)
  ) {
    throw Error("malformed propUsageMap on resource");
  }

  const payload = _.cloneDeep(component.domain);
  addSecretsToPayload(payload, propUsageMap);

  const propsToVisit = _.keys(payload).map((k: string) => [k]);

  // Visit the prop tree, deleting values that shouldn't be used
  while (propsToVisit.length > 0) {
    const key = propsToVisit.pop();

    let parent = payload;
    let keyOnParent = key[0];
    for (let i = 1; i < key.length; i++) {
      parent = parent[key[i - 1]];
      keyOnParent = key[i];
    }

    if (
      !propUsageMap.createOnly.includes(keyOnParent) &&
      !propUsageMap.updatable.includes(keyOnParent)
    ) {
      delete parent[keyOnParent];
      continue;
    }

    const prop = parent[keyOnParent];

    if (typeof prop !== "object" || Array.isArray(prop)) {
      continue;
    }

    for (const childKey in _.keys(prop)) {
      propsToVisit.unshift([...key, childKey]);
    }
  }

  const cleaned = extLib.removeEmpty(payload);

  // Return direct DigitalOcean API payload (no wrapper needed)
  return {
    format: "json",
    code: JSON.stringify(cleaned, null, 2),
  };
}
```

## Key Requirements for DigitalOcean Implementation

The `doCreate` function should follow the same pattern shown above, with these DigitalOcean-specific considerations:

### DigitalOcean API Specifics:
- **No wrapper structure** - Unlike other cloud providers, DO API uses direct JSON payloads
- **Required fields** - Ensure `name`, `region`, `size`, and `image` are always present
- **Authentication** - Handle DO API tokens through the secrets mechanism
- **Resource types** - Adapt interface for different DO resources (droplets, load balancers, databases, etc.)

### REST API Integration:
- Use direct HTTP calls to DigitalOcean API v2 endpoints
- Handle JSON request/response formatting  
- Include proper Authorization headers with Bearer token
- Parse DigitalOcean API response formats correctly

### Property Mapping:
- Map schema properties to DigitalOcean API field names
- Handle nested properties (networking, monitoring, etc.)
- Support optional features (backups, monitoring, IPv6, etc.)
- Validate region and size availability

### Error Handling:
- Parse DigitalOcean API error responses and HTTP status codes
- Handle common HTTP status codes (400, 401, 404, 429, etc.)
- Provide meaningful error messages for common issues (invalid regions, sizes, rate limits, etc.)
- Extract error details from response.errors or response.message when available