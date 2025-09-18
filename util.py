import requests
import os

API_TOKEN = os.getenv("SI_API_KEY")
if not API_TOKEN:
    print("Set SI_API_KEY")
    exit(1)

BASE_URL = os.getenv("SI_BASE_URL")
if not BASE_URL:
    BASE_URL = "https://api.systeminit.com"

DEBUG = False

headers = {"Authorization": f"Bearer {API_TOKEN}"}


class Session:
    def __init__(self, user_id=None, user_email=None, workspace_id=None, role=None):
        self.user_id = user_id
        self.user_email = user_email
        self.workspace_id = workspace_id
        self.role = role

    @classmethod
    def from_ret(cls, ret):
        if ret.ok:
            data = ret.json()
            return cls(
                user_id=data["userId"],
                user_email=data["userEmail"],
                workspace_id=data["workspaceId"],
                role=data["token"]["role"],
            )
        else:
            raise Exception(f"Authentication failed: {ret.status_code} - {ret.text}")

    def __str__(self):
        return f"User ID: {self.user_id}\nUser Email: {self.user_email}\nWorkspace ID: {self.workspace_id}\nRole: {self.role}"


def create_session(base_url) -> Session:
    ret = requests.get(f"{base_url}/whoami", headers=headers)
    session_data = Session.from_ret(ret)
    return session_data


class SI:
    def __init__(self, base_url="https://api.systeminit.com"):
        self.base_url = base_url
        self.session = create_session(base_url)
        if self.session is None:
            raise Exception("failed to create session")

        self.change_set_id = None

    def create_change_set(self, name):
        post_data = {"changeSetName": name}
        data = requests.post(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets",
            headers=headers,
            json=post_data,
        )
        change_set_data = data.json()
        change_set_id = change_set_data["changeSet"]["id"]
        self.change_set_id = change_set_id
        return change_set_id

    def list_change_sets(self):
        ret = requests.get(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets",
            headers=headers,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(
                f"Failed to list change sets: {ret.status_code} - {ret.text}"
            )

    def find_change_set_by_name(self, name):
        change_sets_data = self.list_change_sets()
        for change_set in change_sets_data.get("changeSets", []):
            if change_set.get("name") == name:
                return change_set.get("id")
        return None

    def create_component(self, component_data):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        ret = requests.post(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/components",
            headers=headers,
            json=component_data,
        )

        if DEBUG:
            print(ret.text)

        if not ret.ok:
            raise Exception(
                f"Failed to create component: {ret.status_code} - {ret.text}"
            )

        return ret.json()

    def execute_management_function(self, component_id, management_function_name):
        mgmt_function_req = {
            "managementFunction": {"function": management_function_name},
        }
        ret = requests.post(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/components/{component_id}/execute-management-function",
            headers=headers,
            json=mgmt_function_req,
        )

        data = ret.json()
        if DEBUG:
            print(ret.text)
            print(data)

        return data["managementFuncJobStateId"]

    def delete_change_set(self, change_set_id):
        ret = requests.delete(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{change_set_id}",
            headers=headers,
        )

        if DEBUG:
            print(ret.text)

    def get_logs(self, management_func_id):
        ret = requests.get(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/management-funcs/{management_func_id}",
            headers=headers,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(f"Failed to get logs")

    def create_or_use_change_set(self, name):
        existing_change_set_id = self.find_change_set_by_name(name)
        if existing_change_set_id:
            self.change_set_id = existing_change_set_id
            return existing_change_set_id
        else:
            return self.create_change_set(name)

    def abandon_change_set(self, name=None):
        if not self.change_set_id and not name:
            raise Exception("no change set created and also no name provided.")

        if self.change_set_id:
            self.delete_change_set(self.change_set_id)

    def search_schemas(self, category=None):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        post_data = {}
        if category is not None:
            post_data["category"] = category

        ret = requests.post(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/schemas/search",
            headers=headers,
            json=post_data,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(f"Failed to search schemas: {ret.status_code} - {ret.text}")

    def get_schema(self, schema_id):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        ret = requests.get(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/schemas/{schema_id}",
            headers=headers,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        elif ret.status_code == 202:
            return {
                "status": "generating",
                "message": "Schema data is being generated from cached modules",
            }
        else:
            raise Exception(f"Failed to get schema: {ret.status_code} - {ret.text}")

    def get_schema_variant_default(self, schema_id):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        ret = requests.get(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/schemas/{schema_id}/variant/default",
            headers=headers,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(
                f"Failed to get schema variant default: {ret.status_code} - {ret.text}"
            )

    def get_func(self, func_id):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        ret = requests.get(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/funcs/{func_id}",
            headers=headers,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(f"Failed to get func: {ret.status_code} - {ret.text}")

    def create_schema(
        self, category, code, name, description, color="#3B82F6", link=""
    ):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        schema_data = {
            "category": category,
            "code": code,
            "color": color,
            "description": description,
            "link": link,
            "name": name,
        }

        if DEBUG:
            print(schema_data)

        ret = requests.post(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/schemas",
            headers=headers,
            json=schema_data,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(f"Failed to create schema: {ret.status_code} - {ret.text}")

    def update_schema_variant(
        self,
        schema_id,
        schema_variant_id,
        name,
        description,
        link,
        category,
        color,
        code,
    ):
        if not self.change_set_id:
            raise Exception("change set must be created first")

        schema_variant_data = {
            "name": name,
            "description": description,
            "link": link,
            "category": category,
            "color": color,
            "code": code,
        }

        ret = requests.put(
            f"{self.base_url}/v1/w/{self.session.workspace_id}/change-sets/{self.change_set_id}/schemas/{schema_id}/variant/{schema_variant_id}",
            headers=headers,
            json=schema_variant_data,
        )

        if DEBUG:
            print(ret.text)

        if ret.ok:
            return ret.json()
        else:
            raise Exception(
                f"Failed to update schema variant: {ret.status_code} - {ret.text}"
            )
