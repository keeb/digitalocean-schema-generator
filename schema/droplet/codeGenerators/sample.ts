async function main(component: Input): Promise<Output> {
  interface DigitalOceanDropletPayload {
    name: string;
    region: string;
    size: string;
    image: string | number;
    ssh_keys?: (string | number)[];
    backups?: boolean;
    ipv6?: boolean;
    monitoring?: boolean;
    tags?: string[];
    user_data?: string;
    volumes?: string[];
    vpc_uuid?: string;
    with_droplet_agent?: boolean;
  }

  const payload = _.cloneDeep(component.domain);
  const cleaned = extLib.removeEmpty(payload);

  // Return direct DigitalOcean API payload (no wrapper needed)
  return {
    format: "json",
    code: JSON.stringify(cleaned, null, 2),
  };
}

