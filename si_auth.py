#!/usr/bin/env python3

import os

DEBUG=False

def read_api_key_from_file(filename="key"):
    """Read the API key from the specified file."""
    try:
        with open(filename, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"Error: Key file '{filename}' not found.")
        return None
    except Exception as e:
        print(f"Error reading key file: {e}")
        return None

def main(schema_name="AWS::EC2::Instance"):
    # Read API key from file
    api_key = read_api_key_from_file("key")
    if not api_key:
        exit(1)

    # Set the API token directly in util module
    import util
    util.API_TOKEN = api_key
    util.headers = {"Authorization": f"Bearer {api_key}"}

    # Initialize SI client using util.py
    try:
        from util import SI
        si = SI()
        if DEBUG:
            print("Authentication successful!")
            print(f"Session info:\n{si.session}")

        # Example usage: list change sets
        change_sets = si.list_change_sets()

        # Create or find a change set to work with
        change_set_name = "test-schema-lookup"
        existing_change_set_id = si.find_change_set_by_name(change_set_name)

        if existing_change_set_id:
            si.change_set_id = existing_change_set_id
            print(f"\nUsing existing change set: {change_set_name}")
        else:
            change_set_id = si.create_change_set(change_set_name)
            print(f"\nCreated new change set: {change_set_name} (ID: {change_set_id})")

        # Search for schemas based on the category from schema_name
        category = "::".join(schema_name.split("::")[:2]) if "::" in schema_name else schema_name
        print(f"\nSearching for {category} schemas...")
        schemas = si.search_schemas(category=category)

        # Find specified schema
        target_schema = None
        for schema in schemas.get("schemas", []):
            if schema.get("schemaName") == schema_name:
                target_schema = schema
                break

        if target_schema:
            schema_id = target_schema.get("schemaId")
            if DEBUG:
                print(f"\nFound {schema_name} schema (ID: {schema_id})")
                print("\nFetching detailed schema...")

            detailed_schema = si.get_schema(schema_id)

            if DEBUG:
                print(f"\n=== {schema_name} Schema Details ===")
                import json
                print(json.dumps(detailed_schema, indent=2))
                print("\nFetching schema default variant...")
            try:
                default_variant = si.get_schema_variant_default(schema_id)

                # Extract and print the code from variant functions
                if DEBUG:
                    print(f"\n=== {schema_name} Default Variant Code ===")

                # Get function IDs from the variant
                variant_func_ids = default_variant.get("variantFuncIds", [])
                asset_func_id = default_variant.get("assetFuncId")

                if variant_func_ids:
                    if DEBUG:
                        print(f"\nFound {len(variant_func_ids)} variant functions:")
                    for func_id in variant_func_ids:
                        try:
                            func_details = si.get_func(func_id)
                            func_name = func_details.get("name", f"Function {func_id}")
                            func_code = func_details.get("code", "")

                            if DEBUG:
                                print(f"\n--- {func_name} ({func_id}) ---")
                                if func_code:
                                    print(func_code)
                                else:
                                    print("No code found in this function")
                        except Exception as func_e:
                            print(f"Failed to get function {func_id}: {func_e}")

                if asset_func_id:
                    if DEBUG:
                        print(f"\nFound asset function: {asset_func_id}")
                    try:
                        asset_func_details = si.get_func(asset_func_id)
                        asset_func_name = asset_func_details.get("name", f"Asset Function {asset_func_id}")
                        asset_func_code = asset_func_details.get("code", "")

                        print(f"\n--- {asset_func_name} (Asset Function) --- POOP")
                        if asset_func_code:
                            print(asset_func_code)
                        else:
                            print("No code found in asset function")
                    except Exception as asset_e:
                        print(f"Failed to get asset function {asset_func_id}: {asset_e}")

                if not variant_func_ids and not asset_func_id:
                    print("No function IDs found in default variant")

            except Exception as e:
                print(f"Failed to get default variant: {e}")
        else:
            print(f"\n{schema_name} schema not found in search results")
            print("Available schemas:")
            for schema in schemas.get("schemas", []):
                print(f"  - {schema.get('schemaName')} (ID: {schema.get('schemaId')})")

    except Exception as e:
        print(f"Authentication failed: {e}")
        exit(1)

if __name__ == "__main__":
    import sys

    # Default schema if no argument provided
    schema_name = "AWS::EC2::Instance"

    # Check for command line argument
    if len(sys.argv) > 1:
        schema_name = sys.argv[1]

    main(schema_name)
