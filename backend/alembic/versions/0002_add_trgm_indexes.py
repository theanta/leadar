"""add pg_trgm indexes for search

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-15
"""
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_leads_company_name_trgm "
        "ON leads USING gin (company_name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_leads_contact_name_trgm "
        "ON leads USING gin (contact_name gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_leads_email_trgm "
        "ON leads USING gin (email gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_leads_location_trgm "
        "ON leads USING gin (location gin_trgm_ops)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_leads_industry_trgm "
        "ON leads USING gin (industry gin_trgm_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_leads_company_name_trgm")
    op.execute("DROP INDEX IF EXISTS ix_leads_contact_name_trgm")
    op.execute("DROP INDEX IF EXISTS ix_leads_email_trgm")
    op.execute("DROP INDEX IF EXISTS ix_leads_location_trgm")
    op.execute("DROP INDEX IF EXISTS ix_leads_industry_trgm")
