async function main({
    thisComponent
}: Input): Promise < Output > {
    console.log("[DEBUG] Starting DigitalOcean droplet import");
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

    // Fetch all droplets
    try {
        let page = 1;
        let hasNextPage = true;
        while (hasNextPage) {
            console.log(`[DEBUG] Fetching droplet page ${page}`);
            const listResponse = await doApiFetch(`/droplets?per_page=200&page=${page}`);

            if (Array.isArray(listResponse?.droplets) && listResponse.droplets.length > 0) {
                console.log(`[DEBUG] Found ${listResponse.droplets.length} droplets on page ${page}`);
                resourceList = _.union(resourceList, listResponse.droplets);
            }

            hasNextPage = Boolean(listResponse?.links?.pages?.next);
            console.log(`[DEBUG] hasNextPage = ${hasNextPage}`);
            if (hasNextPage) page++;
        }
    } catch (error: any) {
        console.error("[DEBUG] Failed to list DigitalOcean droplets:", error);
        return {
            status: "error",
            message: `Droplet list error: ${error.message}`
        };
    }

    console.log(`[DEBUG] Total droplets collected: ${resourceList.length}`);

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
        region: 'region.slug', 
        size: 'size.slug',
        image: 'image.slug',
        ssh_keys: 'ssh_keys',
        backups: 'backup_ids',
        ipv6: 'networks.v6',
        monitoring: 'features',
        tags: 'tags',
        volumes: 'volume_ids',
        vpc_uuid: 'vpc_uuid',
        with_droplet_agent: 'features'
    };

    // Build output
    let importCount = 0;
    for (const droplet of resourceList) {
        const resourceId = droplet.name;
        console.log(`[DEBUG] Importing droplet ${resourceId} (ID: ${droplet.id})`);

        // Map API fields to domain properties
        const domainFields = mapApiFieldToDomain(droplet, fieldMappings);
        
        // Post-process specific fields that need transformation
        if (droplet.image?.slug) {
            domainFields.image = droplet.image.slug;
        } else if (droplet.image?.distribution && droplet.image?.name) {
            // Fallback for images without slug - create a reasonable identifier
            domainFields.image = `${droplet.image.distribution.toLowerCase()}-${droplet.image.name.replace(/\s+/g, '-').toLowerCase()}`;
        }
        
        // Transform backup_ids array to boolean
        if (Array.isArray(droplet.backup_ids)) {
            domainFields.backups = droplet.backup_ids.length > 0;
        }
        
        // Transform features array to monitoring boolean
        if (Array.isArray(droplet.features)) {
            domainFields.monitoring = droplet.features.includes('monitoring');
            domainFields.with_droplet_agent = droplet.features.includes('droplet_agent');
        }
        
        // Transform IPv6 networks to boolean
        if (droplet.networks?.v6) {
            domainFields.ipv6 = Array.isArray(droplet.networks.v6) && droplet.networks.v6.length > 0;
        }

        const properties = {
            si: {
                resourceId
            },
            domain: domainFields,
            resource: droplet,
        };

        const newAttributes: Output["ops"]["create"][string]["attributes"] = {};
        for (const [skey, svalue] of Object.entries(thisComponent.sources || {})) {
            newAttributes[skey] = {
                $source: svalue,
            };
        }

        console.log(`[DEBUG] Final attributes for droplet ${resourceId}:`, newAttributes);

        create[resourceId] = {
            kind: "DigitalOcean Droplet",
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
        message: `Discovered ${importCount} Droplets`,
        ops: {
            create,
            actions
        },
    };
}
