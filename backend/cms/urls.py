"""
cms/urls.py — URL routes for the custom DRF API.
Included by portfolio/urls.py under the /api/ prefix.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Site-wide settings
    path("site-settings/", views.site_settings_api, name="site-settings"),

    # Projects
    path("projects/", views.projects_list, name="projects-list"),
    path("projects/<slug:slug>/", views.project_detail, name="project-detail"),

    # Experience
    path("experiences/", views.experiences_list, name="experiences-list"),

    # Skills
    path("skills/", views.skills_list, name="skills-list"),

    # Blog
    path("blog/", views.blog_list, name="blog-list"),
    path("blog/<slug:slug>/", views.blog_detail, name="blog-detail"),

    # Testimonials
    path("testimonials/", views.testimonials_list, name="testimonials-list"),

    # Contact form
    path("contact/", views.contact_submit, name="contact-submit"),
]
