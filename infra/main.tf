# One Azure Container App per environment. The pipeline (aep-governance deploy.yml)
# fills the empty azurerm backend and passes the variables; there are no credentials here.

terraform {
  required_version = ">= 1.9"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.8"
    }
  }

  # Filled by the pipeline: -backend-config=storage_account_name/container_name/key.
  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  # Authentication comes from the pipeline (ARM_USE_OIDC, ARM_CLIENT_ID, ...).
}

# The factory tags each project resource group with project, environment, owner, managed-by.
data "azurerm_resource_group" "this" {
  name = var.resource_group_name
}

locals {
  tags = {
    project      = var.project_slug
    environment  = var.environment
    owner        = try(data.azurerm_resource_group.this.tags["owner"], var.owner)
    "managed-by" = "aep"
  }

  image = "${var.acr_login_server}/${var.project_slug}@${var.image_digest}"
}

resource "azurerm_container_app" "app" {
  name                         = "ca-${var.project_slug}-${var.environment}"
  resource_group_name          = data.azurerm_resource_group.this.name
  container_app_environment_id = var.container_app_environment_id
  revision_mode                = "Single"
  tags                         = local.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [var.app_identity_id]
  }

  registry {
    server   = var.acr_login_server
    identity = var.app_identity_id
  }

  ingress {
    external_enabled = true
    target_port      = var.port

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    container {
      name   = "app"
      image  = local.image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "PORT"
        value = tostring(var.port)
      }

      env {
        name  = "APP_VERSION"
        value = var.image_digest
      }

      liveness_probe {
        transport = "HTTP"
        port      = var.port
        path      = "/healthz"
      }
    }
  }
}
