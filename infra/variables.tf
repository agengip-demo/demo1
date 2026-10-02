# The pipeline sets these from the GitHub environment and repository variables
# (TF_VAR_*). Environment-specific sizing lives in env/<environment>.tfvars.

variable "project_slug" {
  description = "Project short name; also the image repository name in the registry."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9-]{3,20}$", var.project_slug))
    error_message = "project_slug must be 3 to 20 characters: lower-case letters, digits, hyphen."
  }
}

variable "environment" {
  description = "Target environment."
  type        = string

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "environment must be dev, test or prod."
  }
}

variable "resource_group_name" {
  description = "Resource group of this project and environment (rg-<slug>-<env>)."
  type        = string
}

variable "container_app_environment_id" {
  description = "Resource ID of the Container Apps environment (cae-<slug>-<env>)."
  type        = string
}

variable "app_identity_id" {
  description = "Resource ID of the user-assigned identity of the app (AcrPull on the registry)."
  type        = string
}

variable "acr_login_server" {
  description = "Login server of the container registry, e.g. myregistry.azurecr.io."
  type        = string
}

variable "image_digest" {
  description = "Digest of the image built once by the pipeline (sha256:...)."
  type        = string

  validation {
    condition     = can(regex("^sha256:[0-9a-f]{64}$", var.image_digest))
    error_message = "image_digest must look like sha256:<64 hex characters>."
  }
}

variable "owner" {
  description = "Fallback for the owner tag when the resource group has none."
  type        = string
  default     = ""
}

variable "port" {
  description = "Port the app listens on inside the container."
  type        = number
  default     = 3000
}

variable "min_replicas" {
  description = "Minimum replicas; 0 allows scale to zero."
  type        = number
  default     = 0
}

variable "max_replicas" {
  description = "Maximum replicas; the policy check enforces cloud.max_container_replicas."
  type        = number
  default     = 1
}
