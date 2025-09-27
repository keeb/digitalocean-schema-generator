async function main(_component: Input): Promise < Output > {
    const token = requestStorage.getEnv("DO_API_TOKEN");
    if (!token) {
        return {
            result: "failure",
            message: 'Credentials are empty'
        };
    }

    const response = await fetch(`https://api.digitalocean.com/v2/account`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        return {
            result: "failure",
            message: `API call failed: ${response.status} ${response.statusText}`
        };
    }

    return {
        result: "success",
        message: 'Credentials are Valid'
    };
}
