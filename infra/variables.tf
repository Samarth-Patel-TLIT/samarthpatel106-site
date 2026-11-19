variable "subscription_id" {
  description = "Your personal Azure subscription ID (az account show --query id -o tsv)."
  type        = string
}

variable "domain" {
  description = "Apex domain registered at Namecheap."
  type        = string
  default     = "samarthpatel106.com"
}

variable "location" {
  description = "Static Web Apps region for the app's metadata. Content is served globally either way."
  type        = string
  default     = "centralus"
}

variable "resource_group_name" {
  type    = string
  default = "rg-portfolio"
}

variable "app_name" {
  type    = string
  default = "swa-samarthpatel106"
}

variable "enable_www_domain" {
  description = "Turn on after the www CNAME exists at Namecheap (Step 3 in the README)."
  type        = bool
  default     = false
}

variable "enable_apex_domain" {
  description = "Turn on to start apex validation; Terraform prints the TXT token to add at Namecheap."
  type        = bool
  default     = false
}

variable "tags" {
  type = map(string)
  default = {
    project    = "portfolio"
    managed_by = "terraform"
  }
}
