output "app_url" {
  description = "Public HTTPS address of the app."
  value       = "https://${azurerm_container_app.app.ingress[0].fqdn}"
}

output "image" {
  description = "Image reference (by digest) that is deployed."
  value       = local.image
}
