async function main(component: Input): Promise<Output> {
  // 1. Check if resource ID is provided
  const resourceId = component.properties.resource?.id;
  if (!resourceId) {
    return {
      status: "error",
      message: "Resource ID not found",
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

  // 3. Execute DigitalOcean REST API call to fetch droplet
  const response = await fetch(`https://api.digitalocean.com/v2/droplets/${resourceId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // 4. Handle 404 not found cases gracefully
  if (response.status === 404) {
    return {
      status: "error",
      message: `Droplet with ID ${resourceId} not found`,
    };
  }

  // 5. Handle other errors
  if (!response.ok) {
    const errorText = await response.text();
    return {
      status: "error",
      message: `Unable to read droplet; API returned ${response.status} ${response.statusText}: ${errorText}`,
    };
  }

  // 6. Parse response and return droplet data
  const responseJson = await response.json();
  
  if (responseJson.droplet) {
    return {
      status: "ok",
      payload: responseJson.droplet,
    };
  } else {
    return {
      status: "error",
      message: "Failed to extract droplet data from response",
    };
  }
}