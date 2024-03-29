"""anim_params

Revision ID: 1621b2f4fa93
Revises: cf278f4d6e8f
Create Date: 2023-09-08 16:14:55.966457

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1621b2f4fa93'
down_revision = 'cf278f4d6e8f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('animation_types', sa.Column('animation_params', sa.JSON(), nullable=True))
    op.drop_column('animation_types', 'payload_shape')
    op.drop_column('animation_types', 'default_params')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('animation_types', sa.Column('default_params', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True))
    op.add_column('animation_types', sa.Column('payload_shape', postgresql.JSON(astext_type=sa.Text()), autoincrement=False, nullable=True))
    op.drop_column('animation_types', 'animation_params')
    # ### end Alembic commands ###
