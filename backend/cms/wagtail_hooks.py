"""
cms/wagtail_hooks.py — Customises the Wagtail admin interface.
- Registers ContactSubmission as a read-only admin panel.
"""
from wagtail.snippets.models import register_snippet
from wagtail.snippets.views.snippets import SnippetViewSet, SnippetViewSetGroup
from wagtail.admin.panels import FieldPanel, MultiFieldPanel

from .models import ContactSubmission


class ContactSubmissionViewSet(SnippetViewSet):
    model = ContactSubmission
    icon = "mail"
    list_display = ["name", "email", "subject", "created_at", "read"]
    list_filter = ["read"]
    search_fields = ["name", "email", "subject"]
    panels = [
        MultiFieldPanel([
            FieldPanel("name"),
            FieldPanel("email"),
            FieldPanel("subject"),
        ], heading="Sender"),
        FieldPanel("message"),
        FieldPanel("read"),
    ]


register_snippet(ContactSubmissionViewSet)
