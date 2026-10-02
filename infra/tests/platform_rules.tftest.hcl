# Offline check of the platform rules (tags, scale, image by digest) with a mocked
# azurerm provider: `terraform -chdir=infra init -backend=false && terraform -chdir=infra test`.
# The binding check is the `policy` job (Rego on the real plan).

mock_provider "azurerm" {
  override_data {
    target = data.azurerm_resource_group.this
    values = {
      name     = "rg-demo1-dev"
      location = "swedencentral"
      tags = {
        project      = "demo1"
        environment  = "dev"
        owner        = "octocat"
        "managed-by" = "aep"
      }
    }
  }
}

variables {
  project_slug                 = "demo1"
  resource_group_name          = "rg-demo1-dev"
  container_app_environment_id = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-demo1-dev/providers/Microsoft.App/managedEnvironments/cae-demo1-dev"
  app_identity_id              = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-demo1-dev/providers/Microsoft.ManagedIdentity/userAssignedIdentities/id-demo1-dev-app"
  acr_login_server             = "acraep.azurecr.io"
  image_digest                 = "sha256:0000000000000000000000000000000000000000000000000000000000000000"
}

run "dev_follows_platform_rules" {
  command = plan

  variables {
    environment  = "dev"
    min_replicas = 0
    max_replicas = 1
  }

  assert {
    condition     = alltrue([for t in ["project", "environment", "owner", "managed-by"] : try(azurerm_container_app.app.tags[t], "") != ""])
    error_message = "every required tag must be set from local.tags"
  }

  assert {
    condition     = azurerm_container_app.app.tags["owner"] == "octocat"
    error_message = "owner tag must come from the resource group"
  }

  assert {
    condition     = azurerm_container_app.app.template[0].max_replicas <= 2 && azurerm_container_app.app.template[0].min_replicas == 0
    error_message = "the app must scale between 0 and at most 2 replicas"
  }

  assert {
    condition     = azurerm_container_app.app.ingress[0].external_enabled
    error_message = "the app must have external ingress"
  }

  assert {
    condition     = azurerm_container_app.app.template[0].container[0].image == "acraep.azurecr.io/demo1@sha256:0000000000000000000000000000000000000000000000000000000000000000"
    error_message = "the image must be referenced by digest"
  }

  assert {
    condition     = azurerm_container_app.app.registry[0].identity == var.app_identity_id
    error_message = "the registry must be accessed with the app identity"
  }
}

run "prod_tfvars_stay_within_limit" {
  command = plan

  variables {
    environment  = "prod"
    max_replicas = 2
  }

  assert {
    condition     = azurerm_container_app.app.template[0].max_replicas <= 2
    error_message = "prod must not exceed 2 replicas"
  }
}

run "rejects_tag_instead_of_digest" {
  command = plan

  variables {
    environment  = "dev"
    image_digest = "latest"
  }

  expect_failures = [var.image_digest]
}
