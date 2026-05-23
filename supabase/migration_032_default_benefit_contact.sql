-- Migration 032: Set laura@ecommerce.hr as default contact person on all
-- benefits that currently have no assigned contact

UPDATE sponsor_benefits
SET assigned_to = 'laura@ecommerce.hr'
WHERE assigned_to IS NULL OR assigned_to = '';
