# PharmaSys Database

MySQL schema, relationships, and seed data for PharmaSys.

## Files

| Path | Purpose |
|------|---------|
| `schema/pharma_sys.sql` | Main database schema |
| `schema/relationships.sql` | Foreign keys & relationships |
| `seeders/*.sql` | Sample data |
| `backups/` | Database backup exports |

## Setup

```bash
mysql -u root -p < schema/pharma_sys.sql
mysql -u root -p pharmasys < schema/relationships.sql
mysql -u root -p pharmasys < seeders/users.sql
# ... run remaining seeders
```

Full instructions: [../docs/INSTALLATION_GUIDE.md](../docs/INSTALLATION_GUIDE.md)
