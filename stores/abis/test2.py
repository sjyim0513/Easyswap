import base64
from io import BytesIO
from PIL import Image

base64_encoded_svg = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAzNTAgMzUwIj48c3R5bGU+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPnRva2VuIDc8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjQwIiBjbGFzcz0iYmFzZSI+YmFsYW5jZU9mIDIyMzQ5MzM4ODUwODM3MTAxMDMzPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI2MCIgY2xhc3M9ImJhc2UiPmxvY2tlZF9lbmQgMTY5MjIzMDQwMDwvdGV4dD48dGV4dCB4PSIxMCIgeT0iODAiIGNsYXNzPSJiYXNlIj52YWx1ZSAxNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDwvdGV4dD48L3N2Zz4=+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPnRva2VuIDM8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjQwIiBjbGFzcz0iYmFzZSI+YmFsYW5jZU9mIDE2MTQ5NDI0NDY3Mjc1NDgxMTc0NDI8L3RleHQ+PHRleHQgeD0iMTAiIHk9IjYwIiBjbGFzcz0iYmFzZSI+bG9ja2VkX2VuZCAxNjk0MDQ0ODAwPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI4MCIgY2xhc3M9ImJhc2UiPnZhbHVlIDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDwvdGV4dD48L3N2Zz4="

# Decode the Base64 SVG data
decoded_svg = base64.b64decode(base64_encoded_svg)

# Convert the decoded data to a string
decoded_svg_str = decoded_svg.decode('utf-8')

print(decoded_svg_str)