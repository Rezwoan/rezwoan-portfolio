"""
cms/models.py — All Wagtail content models.
See CONTENT_SCHEMA.md for full field documentation.

Wagtail 6 compat fixes (from handoff manifest 2026-03-31):
- ImageChooserPanel deprecated → use FieldPanel for all image FKs
- auto_now_add fields (published_date) removed from content_panels
"""
from django.db import models
from django.utils.text import slugify
from modelcluster.fields import ParentalManyToManyField
from taggit.managers import TaggableManager
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseSiteSetting, register_setting
from wagtail.fields import RichTextField, StreamField
from wagtail.images.models import AbstractImage, AbstractRendition, Image
from wagtail.models import Page
from wagtail.search import index
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.snippets.models import register_snippet


# ---------------------------------------------------------------------------
# Custom Image model
# ---------------------------------------------------------------------------

class CustomImage(AbstractImage):
    alt_text = models.CharField(max_length=255, blank=True)
    admin_form_fields = Image.admin_form_fields + ("alt_text",)

    class Meta:
        verbose_name = "Image"
        verbose_name_plural = "Images"


class CustomRendition(AbstractRendition):
    image = models.ForeignKey(CustomImage, on_delete=models.CASCADE, related_name="renditions")

    class Meta:
        unique_together = (("image", "filter_spec", "focal_point_key"),)


# ---------------------------------------------------------------------------
# Site Settings (singleton)
# ---------------------------------------------------------------------------

@register_setting
class SiteSettings(BaseSiteSetting):
    full_name = models.CharField(max_length=100, default="Din Muhammad Rezwoan")
    short_name = models.CharField(max_length=50, default="Rezwoan")
    tagline = models.CharField(max_length=200, blank=True)
    bio_short = models.TextField(blank=True)
    bio_long = RichTextField(blank=True)
    available_for_work = models.BooleanField(default=True)
    email = models.EmailField(blank=True)
    github_url = models.URLField(blank=True, default="https://github.com/Rezwoan")
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    fiverr_url = models.URLField(blank=True)
    resume_pdf = models.ForeignKey(
        "wagtaildocs.Document", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    og_image = models.ForeignKey(
        CustomImage, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    google_analytics_id = models.CharField(max_length=30, blank=True)
    meta_title_suffix = models.CharField(max_length=60, default=" — Rezwoan")

    panels = [
        MultiFieldPanel([
            FieldPanel("full_name"), FieldPanel("short_name"),
            FieldPanel("tagline"), FieldPanel("available_for_work"),
        ], heading="Identity"),
        MultiFieldPanel([
            FieldPanel("bio_short"), FieldPanel("bio_long"),
        ], heading="Bio"),
        MultiFieldPanel([
            FieldPanel("email"), FieldPanel("github_url"),
            FieldPanel("linkedin_url"), FieldPanel("twitter_url"),
            FieldPanel("fiverr_url"),
        ], heading="Contact & Socials"),
        MultiFieldPanel([
            FieldPanel("resume_pdf"), FieldPanel("og_image"),
        ], heading="Media"),
        MultiFieldPanel([
            FieldPanel("google_analytics_id"), FieldPanel("meta_title_suffix"),
        ], heading="SEO & Analytics"),
    ]

    class Meta:
        verbose_name = "Site Settings"


# ---------------------------------------------------------------------------
# TechTag
# ---------------------------------------------------------------------------

@register_snippet
class TechTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default="#888888")
    panels = [FieldPanel("name"), FieldPanel("color")]

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Tech Tag"
        ordering = ["name"]


from modelcluster.models import ClusterableModel

# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------

@register_snippet
class Project(ClusterableModel):
    CATEGORY_CHOICES = [
        ("web", "Web App"), ("mobile", "Mobile App"),
        ("tool", "Tool / CLI"), ("open-source", "Open Source"), ("other", "Other"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    short_description = models.CharField(max_length=300)
    body = StreamField([
        ("text", blocks.RichTextBlock()),
        ("image", ImageChooserBlock()),
        ("code", blocks.StructBlock([
            ("language", blocks.CharBlock()),
            ("code", blocks.TextBlock()),
        ])),
        ("quote", blocks.BlockQuoteBlock()),
    ], use_json_field=True, blank=True)
    cover_image = models.ForeignKey(
        CustomImage, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    live_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    tech_stack = ParentalManyToManyField(TechTag, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="web")
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    published = models.BooleanField(default=True)
    created_at = models.DateField(auto_now_add=True)
    seo_title = models.CharField(max_length=70, blank=True)
    seo_description = models.CharField(max_length=160, blank=True)
    seo_og_image = models.ForeignKey(
        CustomImage, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )

    panels = [
        MultiFieldPanel([
            FieldPanel("title"), FieldPanel("slug"),
            FieldPanel("short_description"), FieldPanel("category"),
            FieldPanel("featured"), FieldPanel("order"), FieldPanel("published"),
        ], heading="Info"),
        FieldPanel("body"),
        MultiFieldPanel([
            FieldPanel("cover_image"), FieldPanel("live_url"),
            FieldPanel("github_url"), FieldPanel("tech_stack"),
        ], heading="Links & Media"),
        MultiFieldPanel([
            FieldPanel("seo_title"), FieldPanel("seo_description"),
            FieldPanel("seo_og_image"),
        ], heading="SEO"),
    ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Project"


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------

@register_snippet
class Experience(models.Model):
    EMPLOYMENT_CHOICES = [
        ("full-time", "Full Time"), ("part-time", "Part Time"),
        ("freelance", "Freelance"), ("internship", "Internship"),
        ("education", "Education"),
    ]

    company_name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES)
    company_logo = models.ForeignKey(
        CustomImage, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    company_url = models.URLField(blank=True)
    location = models.CharField(max_length=100, default="Remote")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = RichTextField(blank=True)
    tech_used = ParentalManyToManyField(TechTag, blank=True)
    order = models.PositiveIntegerField(default=0)

    panels = [
        FieldPanel("company_name"), FieldPanel("role"),
        FieldPanel("employment_type"), FieldPanel("company_logo"),
        FieldPanel("company_url"), FieldPanel("location"),
        MultiFieldPanel([
            FieldPanel("start_date"), FieldPanel("end_date"), FieldPanel("is_current"),
        ], heading="Duration"),
        FieldPanel("description"), FieldPanel("tech_used"), FieldPanel("order"),
    ]

    def __str__(self):
        return f"{self.role} at {self.company_name}"

    class Meta:
        ordering = ["order", "-start_date"]
        verbose_name = "Experience"
        verbose_name_plural = "Experiences"


# ---------------------------------------------------------------------------
# Skill
# ---------------------------------------------------------------------------

@register_snippet
class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("frontend", "Frontend"), ("backend", "Backend"),
        ("database", "Database"), ("devops", "DevOps"),
        ("design", "Design"), ("other", "Other"),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    proficiency = models.PositiveSmallIntegerField(default=3)
    icon_name = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    show_on_hero = models.BooleanField(default=False)

    panels = [
        FieldPanel("name"), FieldPanel("category"), FieldPanel("proficiency"),
        FieldPanel("icon_name"), FieldPanel("order"), FieldPanel("show_on_hero"),
    ]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

    class Meta:
        ordering = ["category", "order"]
        verbose_name = "Skill"


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------

class BlogIndexPage(Page):
    intro = RichTextField(blank=True)
    content_panels = Page.content_panels + [FieldPanel("intro")]
    subpage_types = ["cms.BlogPost"]
    max_count = 1

    class Meta:
        verbose_name = "Blog Index"


class BlogPost(Page):
    cover_image = models.ForeignKey(
        CustomImage, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    excerpt = models.TextField(max_length=300, blank=True)
    body = StreamField([
        ("text", blocks.RichTextBlock()),
        ("image", blocks.StructBlock([
            ("image", ImageChooserBlock()),
            ("caption", blocks.CharBlock(required=False)),
        ])),
        ("code", blocks.StructBlock([
            ("language", blocks.CharBlock()),
            ("code", blocks.TextBlock()),
        ])),
        ("quote", blocks.BlockQuoteBlock()),
        ("callout", blocks.StructBlock([
            ("type", blocks.ChoiceBlock(choices=[
                ("info", "Info"), ("warning", "Warning"), ("tip", "Tip")
            ])),
            ("text", blocks.RichTextBlock()),
        ])),
    ], use_json_field=True)
    tags = TaggableManager(blank=True)
    reading_time = models.PositiveIntegerField(default=0)
    published_date = models.DateField(auto_now_add=True)  # NOT in panels (auto_now_add)

    search_fields = Page.search_fields + [
        index.SearchField("excerpt"),
        index.SearchField("body"),
    ]

    content_panels = Page.content_panels + [
        FieldPanel("cover_image"),
        FieldPanel("excerpt"),
        FieldPanel("body"),
        FieldPanel("tags"),
        # published_date omitted — auto_now_add fields cannot be in panels
    ]

    parent_page_types = ["cms.BlogIndexPage"]

    def save(self, *args, **kwargs):
        word_count = len(str(self.body).split())
        self.reading_time = max(1, round(word_count / 200))
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Blog Post"
        ordering = ["-published_date"]


# ---------------------------------------------------------------------------
# Testimonial
# ---------------------------------------------------------------------------

@register_snippet
class Testimonial(models.Model):
    SOURCE_CHOICES = [
        ("fiverr", "Fiverr"), ("linkedin", "LinkedIn"),
        ("email", "Email"), ("direct", "Direct"),
    ]

    client_name = models.CharField(max_length=100)
    client_title = models.CharField(max_length=100, blank=True)
    client_company = models.CharField(max_length=100, blank=True)
    avatar = models.ForeignKey(
        CustomImage, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default="fiverr")
    source_url = models.URLField(blank=True)
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    panels = [
        FieldPanel("client_name"), FieldPanel("client_title"),
        FieldPanel("client_company"), FieldPanel("avatar"),
        FieldPanel("quote"), FieldPanel("rating"),
        FieldPanel("source"), FieldPanel("source_url"),
        FieldPanel("featured"), FieldPanel("order"),
    ]

    def __str__(self):
        return f"{self.client_name} ({self.source})"

    class Meta:
        ordering = ["order"]
        verbose_name = "Testimonial"


# ---------------------------------------------------------------------------
# Contact Submission
# ---------------------------------------------------------------------------

class ContactSubmission(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} — {self.subject} ({self.created_at.date()})"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Contact Submission"
