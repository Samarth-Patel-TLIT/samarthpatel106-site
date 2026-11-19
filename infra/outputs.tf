output "default_hostname" {
  description = "Point the www CNAME and the apex ALIAS record here."
  value       = azurerm_static_web_app.site.default_host_name
}

output "deployment_token" {
  description = "Save as the GitHub secret AZURE_STATIC_WEB_APPS_API_TOKEN: terraform output -raw deployment_token"
  value       = azurerm_static_web_app.site.api_key
  sensitive   = true
}

output "apex_txt_token" {
  description = "Add as a TXT record for host @ at Namecheap."
  value       = var.enable_apex_domain ? azurerm_static_web_app_custom_domain.apex[0].validation_token : null
}
