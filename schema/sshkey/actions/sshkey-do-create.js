async function main(component: Input): Promise<Output> {
  // 1. Check if resource already exists
  if (component.properties.resource?.payload) {
    return {
      status: "error",
      message: "SSH Key already exists",
      payload: component.properties.resource.payload,
    };
  }

  // 2. Extract and validate required code/configuration
  const codeString = component.properties.code?.["sshkeyCreate"]?.code;
  if (!codeString) {
    return {
      status: "error",
      message: `Could not find sshkeyCreate code for resource`,
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
  const response = await fetch("https://api.digitalocean.com/v2/account/keys", {
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
      message: `Unable to create SSH key; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 6. Parse response and extract resource ID  
  const responseJson = await response.json();
  const sshKeyName = responseJson.ssh_key?.name;

  // 7. Return success result
  if (sshKeyName) {
    return {
      resourceId: sshKeyName,
      status: "ok",
      payload: responseJson.ssh_key,
    };
  } else {
    return {
      message: "Failed to extract SSH key name from response",
      status: "error",
    };
  }
}