async function main({
    thisComponent
}: Input): Promise < Output > {
    console.log("[DEBUG] Starting DigitalOcean SSH key import");
    console.log("[DEBUG] thisComponent:", JSON.stringify(thisComponent, null, 2));

    const create: Output["ops"]["create"] = {};
    const actions: Record < string, any > = {};
    let resourceList: any[] = [];

    // DigitalOcean API fetch
    async function doApiFetch(endpoint: string, options: RequestInit = {}) {
        console.log("[DEBUG] Fetching endpoint:", endpoint);
        const token = requestStorage.getEnv("DO_API_TOKEN");
        if (!token) throw new Error("DO_API_TOKEN not found (hint: you may need a secret)");

        const response = await fetch(`https://api.digitalocean.com/v2${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(options.headers ?? {}),
            },
            ...options,
        });

        console.log("[DEBUG] Response status:", response.status, response.statusText);

        if (!response.ok) {
            const text = await response.text();
            console.error("[DEBUG] API Error Body:", text);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        console.log("[DEBUG] Response JSON keys:", Object.keys(json));
        return json;
    }

    // Fetch all SSH keys
    try {
        let page = 1;
        let hasNextPage = true;
        while (hasNextPage) {
            console.log(`[DEBUG] Fetching SSH key page ${page}`);
            const listResponse = await doApiFetch(`/account/keys?per_page=200&page=${page}`);

            if (Array.isArray(listResponse?.ssh_keys) && listResponse.ssh_keys.length > 0) {
                console.log(`[DEBUG] Found ${listResponse.ssh_keys.length} SSH keys on page ${page}`);
                resourceList = _.union(resourceList, listResponse.ssh_keys);
            }

            hasNextPage = Boolean(listResponse?.links?.pages?.next);
            console.log(`[DEBUG] hasNextPage = ${hasNextPage}`);
            if (hasNextPage) page++;
        }
    } catch (error: any) {
        console.error("[DEBUG] Failed to list DigitalOcean SSH keys:", error);
        return {
            status: "error",
            message: `SSH key list error: ${error.message}`
        };
    }

    console.log(`[DEBUG] Total SSH keys collected: ${resourceList.length}`);

    // Generic field mapping function
    function mapApiFieldToDomain(apiData, fieldMappings) {
        const domainData = {};
        
        for (const [domainField, apiPath] of Object.entries(fieldMappings)) {
            const value = getNestedValue(apiData, apiPath);
            if (value !== undefined && value !== null) {
                domainData[domainField] = value;
            }
        }
        
        return domainData;
    }

    // Helper to get nested values from API response
    function getNestedValue(obj, path) {
        if (typeof path === 'string') {
            return path.split('.').reduce((current, key) => current?.[key], obj);
        }
        return obj?.[path];
    }

    // Field mappings from API response to domain properties
    const fieldMappings = {
        name: 'name',
        public_key: 'public_key',
        id: 'id',
        fingerprint: 'fingerprint'
    };

    // Build output
    let importCount = 0;
    for (const sshKey of resourceList) {
        const resourceId = sshKey.name;
        console.log(`[DEBUG] Importing SSH key ${resourceId} (ID: ${sshKey.id})`);

        // Map API fields to domain properties
        const domainFields = mapApiFieldToDomain(sshKey, fieldMappings);

        const properties = {
            si: {
                resourceId
            },
            domain: domainFields,
            resource: sshKey,
        };

        const newAttributes: Output["ops"]["create"][string]["attributes"] = {};
        for (const [skey, svalue] of Object.entries(thisComponent.sources || {})) {
            newAttributes[skey] = {
                $source: svalue,
            };
        }

        console.log(`[DEBUG] Final attributes for SSH key ${resourceId}:`, newAttributes);

        create[resourceId] = {
            kind: "DigitalOcean SSH Key",
            properties,
            attributes: newAttributes,
        };
        actions[resourceId] = {
            remove: ["create"]
        };
        importCount++;
    }

    console.log(`[DEBUG] Import complete. Total imported=${importCount}`);

    return {
        status: "ok",
        message: `Discovered ${importCount} SSH Keys`,
        ops: {
            create,
            actions
        },
    };
}