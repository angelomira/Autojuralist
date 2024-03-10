from django.db import models
from django.conf import settings


class Project(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    creation_date = models.DateTimeField(auto_now_add=True)
    local_path = models.TextField()
    repository_url = models.URLField()
    config_file_path = models.TextField()
    license_type = models.CharField(max_length=50)
    is_public = models.BooleanField()

    def __str__(self):
        return self.title


class License(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField()

    def __str__(self):
        return self.title


class RepositoryTemplate(models.Model):
    title = models.CharField(max_length=50)
    source_url = models.URLField(blank=True, null=True)  # Допускается пустое значение и отсутствие значения

    def __str__(self):
        return self.title


class Documentation(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    type = models.CharField(max_length=100)  # Тип документации (например, open-source или legal)
    content = models.TextField()

    def __str__(self):
        return f"{self.type} documentation for {self.project.title}"


class UserSetting(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)  # OneToOneField для связи "один к одному"
    settings = models.JSONField()  # JSONField для хранения настроек в формате JSON

    def __str__(self):
        return f"Settings for {self.user.username}"
