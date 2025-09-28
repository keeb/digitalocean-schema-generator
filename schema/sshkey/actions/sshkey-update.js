async function main(component: Input): Promise<Output> {
  // 1. Check if resource exists
  const resource = component.properties.resource;
  if (!resource?.payload?.id && !resource?.payload?.fingerprint) {
    return {
      status: "error",
      message: "No SSH key ID or fingerprint found to update",
    };
  }

  // 2. Extract update payload
  const codeString = component.properties.code?.["sshkeyCreate"]?.code;
  if (!codeString) {
    return {
      status: "error",
      message: "Could not find update code for SSH key",
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

  // 4. Use ID if available, otherwise use fingerprint
  const identifier = resource.payload.id || resource.payload.fingerprint;

  // 5. Execute update API call (only name can be updated for SSH keys)
  const response = await fetch(`https://api.digitalocean.com/v2/account/keys/${identifier}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: codeString,
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
      message: `Unable to update SSH key; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 7. Parse response and return updated SSH key data
  const responseJson = await response.json();
  
  return {
    status: "ok",
    payload: responseJson.ssh_key,
  };
}