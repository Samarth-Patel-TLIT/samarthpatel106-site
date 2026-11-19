# samarthpatel106.com

My portfolio site. It's a static page hosted on Azure Static Web Apps (Free plan), defined in Terraform, and deployed by GitHub Actions.

```
site/                       the website (served as-is, no build step)
  index.html  app.js  Samarth_Patel_Resume.pdf
  staticwebapp.config.json  security headers (CSP, HSTS, frame blocking)
infra/                      Terraform: resource group, Static Web App, custom domains
.github/workflows/
  terraform.yml             fmt + validate on every pull request
  deploy.yml                preview environment per pull request, production on merge
```

Costs: $0 on the Free plan. The domain is billed by Namecheap.

---

## One-time setup

### 0. Tools

- A **personal** Azure subscription. Sign up at <https://azure.microsoft.com/free>. Don't use an employer's tenant.
- Azure CLI, Terraform 1.6 or later, Git, and the GitHub CLI (`gh`)

```bash
az login
az account show --query id -o tsv     # copy this subscription ID
```

### 1. Push this repo to GitHub (public)

The site says the repo is public, so make sure it is.

```bash
git init && git add . && git commit -m "Portfolio site"
gh repo create samarthpatel106-site --public --source . --push
```

### 2. Create the Azure resources

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars     # paste your subscription ID
terraform init
terraform apply                                   # creates rg-portfolio + swa-samarthpatel106
```

Give GitHub the deployment token, then deploy:

```bash
terraform output -raw deployment_token | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN
gh workflow run "Deploy site"
terraform output default_hostname                 # e.g. happy-rock-0a1b2c3d4.6.azurestaticapps.net
```

Open that `*.azurestaticapps.net` address. The site is live.

### 3. Point www at Azure (Namecheap)

Namecheap → **Domain List** → samarthpatel106.com → **Manage** → **Advanced DNS**.

1. **Delete** Namecheap's parking records: the `CNAME www → parkingpage.namecheap.com` and the `URL Redirect @` record.
2. **Add** a record:

   | Type  | Host | Value                                      | TTL       |
   |-------|------|--------------------------------------------|-----------|
   | CNAME | www  | your `default_hostname` (no `https://`)    | Automatic |

3. Wait about 5 to 10 minutes. Then set `enable_www_domain = true` in `terraform.tfvars` and run `terraform apply`. Azure validates the CNAME and issues a free TLS certificate.

### 4. Bare domain (samarthpatel106.com)

1. Set `enable_apex_domain = true` and run `terraform apply`.
2. Run `terraform output apex_txt_token`, then add these records at Namecheap:

   | Type  | Host       | Value                                   |
   |-------|------------|-----------------------------------------|
   | TXT   | `_dnsauth` | the token from the output               |
   | ALIAS | `@`        | your `default_hostname` (no `https://`) |

   If the Azure portal (Static Web App → **Custom domains**) shows a different TXT host, use the one it shows.
3. Validation runs on its own. It's often under an hour but can take up to 72. The Custom domains blade shows it go from *Validating* to *Ready*.

### 5. Check it

```bash
curl -sI https://www.samarthpatel106.com | grep -iE "strict-transport|content-security|x-frame"
```

---

## Day to day

- **Edit the site:** change files in `site/`, open a pull request, and the workflow comments a preview URL. Merge to publish.
- **Change infrastructure:** edit `infra/`, open a PR (fmt + validate run), then `terraform apply` locally.
- **Never commit** `terraform.tfvars`, `*.tfstate`, or the deployment token. `.gitignore` already excludes the first two.

### Next steps (optional)
- Move Terraform state to an Azure Storage backend so it isn't only on one laptop.
- Run `terraform plan` in CI with GitHub OIDC (a federated credential on an app registration, so no secrets are stored).
