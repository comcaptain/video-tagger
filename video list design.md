### Requirements

- Top-bottom flow
- Each section is a video
- A video section has two parts:
  - A line on the top that contains file path & tags
  - Images that have fixed height and flow left freely
- Each image has two parts:
  - Top part is tags & seek position
  - Bottom is the image


### JSON data structure

```json
[{
    "path": "xxx",
    "screenshots": [{
        "seekPosition": "xxxxx",
        "screenshotPath": "xxxx",
        "tagNames": ["aaa", "bbb", "ccc"]
    }]
}]
```