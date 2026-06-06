"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'scraping_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('keyword', sa.String(length=500), nullable=False),
        sa.Column('industry', sa.String(length=255), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('company_size', sa.String(length=100), nullable=True),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('apify_run_id', sa.String(length=255), nullable=True),
        sa.Column('total_results', sa.Integer(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_scraping_jobs_status', 'scraping_jobs', ['status'], if_not_exists=True)
    op.create_index('ix_scraping_jobs_created_at', 'scraping_jobs', ['created_at'], if_not_exists=True)

    op.create_table(
        'leads',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('website', sa.String(length=500), nullable=True),
        sa.Column('linkedin_url', sa.String(length=500), nullable=True),
        sa.Column('industry', sa.String(length=255), nullable=True),
        sa.Column('employee_count', sa.String(length=100), nullable=True),
        sa.Column('contact_name', sa.String(length=255), nullable=True),
        sa.Column('contact_title', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('source', sa.String(length=100), nullable=True),
        sa.Column('source_url', sa.String(length=500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['scraping_jobs.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        if_not_exists=True,
    )
    op.create_index('ix_leads_company_name', 'leads', ['company_name'], if_not_exists=True)
    op.create_index('ix_leads_industry', 'leads', ['industry'], if_not_exists=True)
    op.create_index('ix_leads_email', 'leads', ['email'], if_not_exists=True)
    op.create_index('ix_leads_location', 'leads', ['location'], if_not_exists=True)
    op.create_index('ix_leads_source', 'leads', ['source'], if_not_exists=True)
    op.create_index('ix_leads_created_at', 'leads', ['created_at'], if_not_exists=True)


def downgrade() -> None:
    op.drop_table('leads')
    op.drop_table('scraping_jobs')
