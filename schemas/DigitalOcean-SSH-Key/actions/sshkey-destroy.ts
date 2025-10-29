async function main(component: Input): Promise<Output> {
  // 1. Check if resource exists
  if (!component.properties.resource) {
    return {
      status: "error",
      message: "No resource found to delete",
    };
  }

  // 2. Extract resource ID or fingerprint
  const resource = component.properties.resource;
  if (!resource.payload?.id && !resource.payload?.fingerprint) {
    return {
      status: "error",
      message: "SSH key ID or fingerprint not found",
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

  // 4. Use ID if available, otherwise use fingerprint
  const identifier = resource.payload.id || resource.payload.fingerprint;

  // 5. Execute delete API call
  const response = await fetch(`https://api.digitalocean.com/v2/account/keys/${identifier}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 6. Handle errors
  if (!response.ok) {
    if (response.status === 404) {
      return {
        status: "error",
        message: "SSH key not found",
      };
    }
    const errorText = await response.text();
    return {
      status: "error",
      message: `Unable to delete SSH key; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 7. Return success (DELETE returns 204 No Content)
  return {
    status: "ok",
  };
}