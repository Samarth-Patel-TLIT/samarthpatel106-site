resource "azurerm_resource_group" "site" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

resource "azurerm_static_web_app" "site" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.site.name
  location            = azurerm_resource_group.site.location
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags

  # GitHub Actions deploys the content with the app's deployment token,
  # so Terraform owns the infrastructure and the pipeline owns the files.
  lifecycle {
    ignore_changes = [repository_url, repository_branch]
  }
}

# www.samarthpatel106.com  ->  CNAME at Namecheap pointing to the default hostname.
# Azure validates by checking that CNAME, then issues a free managed certificate.
resource "azurerm_static_web_app_custom_domain" "www" {
  count             = var.enable_www_domain ? 1 : 0
  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = "www.${var.domain}"
  validation_type   = "cname-delegation"
}

# samarthpatel106.com  ->  TXT validation, then an ALIAS record at Namecheap.
resource "azurerm_static_web_app_custom_domain" "apex" {
  count             = var.enable_apex_domain ? 1 : 0
  static_web_app_id = azurerm_static_web_app.site.id
  domain_name       = var.domain
  validation_type   = "dns-txt-token"
}
