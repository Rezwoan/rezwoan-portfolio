"""
cms/serializers.py — Django REST Framework serializers.
Each serializer maps a model to the JSON shape documented in CONTENT_SCHEMA.md.
"""
from rest_framework import serializers
from .models import (
    SiteSettings, Project, Experience, Skill,
    BlogPost, Testimonial, ContactSubmission, TechTag, CustomImage,
)


# ---------------------------------------------------------------------------
# Primitives
# ---------------------------------------------------------------------------

class ImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        request = self.context.get("request")
        try:
            rendition = obj.get_rendition("original")
            url = rendition.url
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return ""

    class Meta:
        model = CustomImage
        fields = ["id", "url", "width", "height", "alt_text"]


class TechTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechTag
        fields = ["name", "color"]


# ---------------------------------------------------------------------------
# Site Settings
# ---------------------------------------------------------------------------

class SiteSettingsSerializer(serializers.ModelSerializer):
    og_image = ImageSerializer(read_only=True)
    resume_pdf_url = serializers.SerializerMethodField()

    def get_resume_pdf_url(self, obj):
        if not obj.resume_pdf:
            return None
        request = self.context.get("request")
        url = obj.resume_pdf.url
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = SiteSettings
        fields = [
            "full_name", "short_name", "tagline",
            "bio_short", "bio_long",
            "available_for_work",
            "email", "github_url", "linkedin_url", "twitter_url", "fiverr_url",
            "resume_pdf_url", "og_image",
            "google_analytics_id", "meta_title_suffix",
        ]


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------

class ProjectListSerializer(serializers.ModelSerializer):
    cover_image = ImageSerializer(read_only=True)
    tech_stack = TechTagSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "short_description",
            "cover_image", "live_url", "github_url",
            "tech_stack", "category", "featured", "order", "created_at",
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    cover_image = ImageSerializer(read_only=True)
    seo_og_image = ImageSerializer(read_only=True)
    tech_stack = TechTagSerializer(many=True, read_only=True)
    body = serializers.SerializerMethodField()

    def get_body(self, obj):
        # Return the StreamField JSON directly
        return obj.body.get_prep_value() if obj.body else []

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "short_description", "body",
            "cover_image", "live_url", "github_url",
            "tech_stack", "category", "featured", "order", "created_at",
            "seo_title", "seo_description", "seo_og_image",
        ]


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------

class ExperienceSerializer(serializers.ModelSerializer):
    company_logo = ImageSerializer(read_only=True)
    tech_used = TechTagSerializer(many=True, read_only=True)
    date_range = serializers.SerializerMethodField()

    def get_date_range(self, obj):
        start = obj.start_date.strftime("%b %Y") if obj.start_date else ""
        if obj.is_current or not obj.end_date:
            return f"{start} – Present"
        end = obj.end_date.strftime("%b %Y")
        return f"{start} – {end}"

    class Meta:
        model = Experience
        fields = [
            "id", "company_name", "role", "employment_type",
            "company_logo", "company_url", "location",
            "start_date", "end_date", "is_current", "date_range",
            "description", "tech_used", "order",
        ]


# ---------------------------------------------------------------------------
# Skill
# ---------------------------------------------------------------------------

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "proficiency", "icon_name", "show_on_hero", "order"]


# ---------------------------------------------------------------------------
# Blog
# ---------------------------------------------------------------------------

class BlogPostListSerializer(serializers.ModelSerializer):
    cover_image = ImageSerializer(read_only=True)
    tags = serializers.SerializerMethodField()
    meta_description = serializers.CharField(source="search_description", read_only=True)

    def get_tags(self, obj):
        return list(obj.tags.names())

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt",
            "cover_image", "tags", "reading_time",
            "published_date", "meta_description",
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    cover_image = ImageSerializer(read_only=True)
    tags = serializers.SerializerMethodField()
    meta_description = serializers.CharField(source="search_description", read_only=True)
    body = serializers.SerializerMethodField()

    def get_tags(self, obj):
        return list(obj.tags.names())

    def get_body(self, obj):
        return obj.body.get_prep_value() if obj.body else []

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "body",
            "cover_image", "tags", "reading_time",
            "published_date", "meta_description",
        ]


# ---------------------------------------------------------------------------
# Testimonial
# ---------------------------------------------------------------------------

class TestimonialSerializer(serializers.ModelSerializer):
    avatar = ImageSerializer(read_only=True)

    class Meta:
        model = Testimonial
        fields = [
            "id", "client_name", "client_title", "client_company",
            "avatar", "quote", "rating", "source", "source_url",
        ]


# ---------------------------------------------------------------------------
# Contact Form
# ---------------------------------------------------------------------------

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ["name", "email", "subject", "message"]
