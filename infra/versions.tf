terraform {
  required_version = ">= 1.6"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # State stays local to start. When you're ready, move it to an Azure Storage
  # account with a `backend "azurerm" {}` block so it isn't only on your laptop.
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}
