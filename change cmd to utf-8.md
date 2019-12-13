1. Save following content to file `f:\switch.bat`
```
@ECHO OFF
REM change CHCP to UTF-8
CHCP 65001
CLS
```
2. Create a shortcut for cmd, add ` /k f:\switch` to the end of target
3. You can also change the `start position`