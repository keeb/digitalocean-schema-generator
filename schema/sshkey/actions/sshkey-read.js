async function main(component: Input): Promise<Output> {
  // 1. Extract SSH key ID or fingerprint from resource
  const resource = component.properties.resource;
  if (!resource?.payload?.id && !resource?.payload?.fingerprint) {
    return {
      status: "error",
      message: "No SSH key ID or fingerprint found to read",
    };
  }

  // 2. Get API token for authentication
  const token = requestStorage.getEnv("DO_API_TOKEN");
  if (!token) {
    return {
      status: "error", 
      message: "DO_API_TOKEN not found (hint: you may need a secret)",
    };
  }

  // 3. Use ID if available, otherwise use fingerprint
  const identifier = resource.payload.id || resource.payload.fingerprint;
  
  // 4. Execute read API call
  const response = await fetch(`https://api.digitalocean.com/v2/account/keys/${identifier}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 5. Handle errors
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
      message: `Unable to read SSH key; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 6. Parse response and return SSH key data
  const responseJson = await response.json();
  
  return {
    status: "ok",
    payload: responseJson.ssh_key,
  };
}