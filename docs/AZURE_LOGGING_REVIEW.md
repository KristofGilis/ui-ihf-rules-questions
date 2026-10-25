# Azure logging review — 24 October 2026

Subscription: **IHF Rules Questions**. Resource group: `rg-ihf-rules-questions`.

| Resource                                          | Finding                                                                                                                                                                                            |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rulequestions` (frontend App Service)            | Application logging off for file system and blob storage; HTTP logging off for file system and blob storage; detailed errors and failed-request tracing off; no Azure Monitor diagnostic settings. |
| `api-ihf-rules-questions` (API App Service)       | Same logging settings as the frontend; no Azure Monitor diagnostic settings.                                                                                                                       |
| `sql-ihf-rules-questions` and `ihfrulesquestions` | SQL auditing disabled at server and database levels; no Azure Monitor diagnostic settings.                                                                                                         |
| Subscription Activity Log                         | No diagnostic export configured. Azure retains the built-in Activity Log for 90 days. This is a control-plane record of Azure resource operations, not a visitor request log.                      |

Neither App Service has an Application Insights or logging-related app setting. The resource group contains no Application Insights, Log Analytics, gateway, or storage resource. These checks found no configured application or HTTP request-log retention period because the corresponding logging paths are off. They do not describe Microsoft's internal platform telemetry or deployment/startup records.

## Read-only checks used

- `az webapp log show` for both apps
- `az monitor diagnostic-settings list` for both apps and the SQL server/database
- `az webapp config appsettings list` (setting names only) for both apps
- `az sql server audit-policy show` and `az sql db audit-policy show`
- `az monitor diagnostic-settings subscription list`

Recheck these settings before publishing the privacy policy or submitting a store release, and whenever logging or hosting changes. Update all four privacy-policy translations if request logging is enabled.

Microsoft documentation: [App Service diagnostic logs](https://learn.microsoft.com/azure/app-service/troubleshoot-diagnostic-logs), [Azure Activity Log retention](https://learn.microsoft.com/azure/azure-monitor/platform/activity-log).
