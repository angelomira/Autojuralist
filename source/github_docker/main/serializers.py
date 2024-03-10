from rest_framework import serializers


class CapitalSerializer(serializers.ModelSerializer):
    class Meta:
        pass
# class CapitalSerializer(serializers.Serializer):
#     id = serializers.IntegerField()
#     title = serializers.CharField(max_length=100)
#     description = serializers.CharField(max_length=1000)
#     link = serializers.CharField(max_length=1000)
#     link_name = serializers.CharField(max_length=100)
